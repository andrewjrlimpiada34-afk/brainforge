import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuthenticatedUser } from '@/lib/mongo-auth';
import type { BrainforgeProfile } from '@/lib/brainforge-profile';

type LeaderboardCategory = 'all' | 'memory' | 'logic' | 'speed' | 'math' | 'verbal';
type LeaderboardRange = 'weekly' | 'all-time';

type LeaderboardEntry = {
  rank: number;
  firebaseUid: string;
  username: string;
  photoURL: string;
  level: number;
  xp: number;
  streak: number;
  totalScore: number;
  totalXp: number;
  sessionsPlayed: number;
  averageAccuracy: number;
  category: LeaderboardCategory;
  range: LeaderboardRange;
};

type AggregatedEntry = Omit<LeaderboardEntry, 'rank'>;

const VALID_CATEGORIES = new Set<LeaderboardCategory>(['all', 'memory', 'logic', 'speed', 'math', 'verbal']);
const VALID_RANGES = new Set<LeaderboardRange>(['weekly', 'all-time']);

function normalizeCategory(value: string | null): LeaderboardCategory {
  return VALID_CATEGORIES.has(value as LeaderboardCategory) ? (value as LeaderboardCategory) : 'all';
}

function normalizeRange(value: string | null): LeaderboardRange {
  return VALID_RANGES.has(value as LeaderboardRange) ? (value as LeaderboardRange) : 'all-time';
}

function roundAccuracy(value: number) {
  return Math.round((value || 0) * 10) / 10;
}

async function buildLeaderboardEntries(params: {
  category: LeaderboardCategory;
  range: LeaderboardRange;
}) {
  const db = await getDatabase();
  const sessions = db.collection('game_sessions');
  const rangeFilter =
    params.range === 'weekly'
      ? {
          playedAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        }
      : {};

  const categoryPipeline =
    params.category === 'all'
      ? []
      : [
          {
            $match: {
              'game.category': params.category,
            },
          },
        ];

  const results = await sessions
    .aggregate<AggregatedEntry>([
      { $match: rangeFilter },
      {
        $lookup: {
          from: 'games',
          localField: 'gameId',
          foreignField: 'gameId',
          as: 'game',
        },
      },
      {
        $unwind: {
          path: '$game',
          preserveNullAndEmptyArrays: true,
        },
      },
      ...categoryPipeline,
      {
        $group: {
          _id: '$firebaseUid',
          totalScore: { $sum: '$score' },
          totalXp: { $sum: '$xpEarned' },
          sessionsPlayed: { $sum: 1 },
          averageAccuracy: { $avg: '$accuracy' },
        },
      },
      {
        $lookup: {
          from: 'profiles',
          localField: '_id',
          foreignField: 'firebaseUid',
          as: 'profile',
        },
      },
      {
        $unwind: {
          path: '$profile',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          firebaseUid: '$_id',
          username: { $ifNull: ['$profile.username', 'Operative'] },
          photoURL: { $ifNull: ['$profile.photoURL', ''] },
          level: { $ifNull: ['$profile.level', 1] },
          xp: { $ifNull: ['$profile.xp', 0] },
          streak: { $ifNull: ['$profile.streak', 0] },
          totalScore: 1,
          totalXp: 1,
          sessionsPlayed: 1,
          averageAccuracy: 1,
        },
      },
      {
        $sort: {
          totalScore: -1,
          totalXp: -1,
          sessionsPlayed: -1,
          level: -1,
          xp: -1,
        },
      },
    ])
    .toArray();

  return results.map((entry, index) => ({
    rank: index + 1,
    firebaseUid: entry.firebaseUid,
    username: entry.username,
    photoURL: entry.photoURL,
    level: entry.level,
    xp: entry.xp,
    streak: entry.streak,
    totalScore: entry.totalScore || 0,
    totalXp: entry.totalXp || 0,
    sessionsPlayed: entry.sessionsPlayed || 0,
    averageAccuracy: roundAccuracy(entry.averageAccuracy || 0),
    category: params.category,
    range: params.range,
  }));
}

function buildFallbackStanding(profile: BrainforgeProfile | null, params: { category: LeaderboardCategory; range: LeaderboardRange }) {
  if (!profile) return null;

  return {
    rank: 0,
    firebaseUid: profile.firebaseUid,
    username: profile.username,
    photoURL: profile.photoURL,
    level: profile.level,
    xp: profile.xp,
    streak: profile.streak,
    totalScore: 0,
    totalXp: 0,
    sessionsPlayed: profile.gamesPlayed,
    averageAccuracy: profile.stats.accuracy,
    category: params.category,
    range: params.range,
  };
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await requireAuthenticatedUser(request);
    const category = normalizeCategory(request.nextUrl.searchParams.get('category'));
    const range = normalizeRange(request.nextUrl.searchParams.get('range'));
    const db = await getDatabase();
    const profiles = db.collection<BrainforgeProfile>('profiles');

    const entries = await buildLeaderboardEntries({ category, range });
    const currentProfile = await profiles.findOne({ firebaseUid: decoded.uid });
    const currentUserRank = entries.find((entry) => entry.firebaseUid === decoded.uid) ?? buildFallbackStanding(currentProfile, { category, range });

    return NextResponse.json({
      entries: entries.slice(0, 25),
      currentUserRank,
      category,
      range,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to load leaderboard.' }, { status: 401 });
  }
}
