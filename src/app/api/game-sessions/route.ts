import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuthenticatedUser } from '@/lib/mongo-auth';
import { calculateNextProgress, createDefaultProfile, type BrainforgeProfile, type GameSessionPayload } from '@/lib/brainforge-profile';

function nowIso() {
  return new Date().toISOString();
}

function buildProgressHistoryDocument(firebaseUid: string, stats: BrainforgeProfile['stats']) {
  return {
    firebaseUid,
    memoryScore: stats.memory,
    logicScore: stats.logic,
    speedScore: stats.speed,
    accuracyScore: stats.accuracy,
    mathScore: stats.math,
    recordedAt: nowIso(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await requireAuthenticatedUser(request);
    const body = (await request.json()) as GameSessionPayload;
    const db = await getDatabase();
    const profiles = db.collection<BrainforgeProfile>('profiles');
    const sessions = db.collection('game_sessions');
    const progressHistory = db.collection('progress_history');
    const games = db.collection('games');

    const timestamp = nowIso();
    let profile = await profiles.findOne({ firebaseUid: decoded.uid });

    if (!profile) {
      const defaultProfile = createDefaultProfile({
        firebaseUid: decoded.uid,
        email: decoded.email,
      });

      await profiles.updateOne(
        { firebaseUid: decoded.uid },
        {
          $setOnInsert: {
            ...defaultProfile,
            createdAt: timestamp,
          },
          $set: {
            updatedAt: timestamp,
          },
        },
        { upsert: true }
      );

      profile = await profiles.findOne({ firebaseUid: decoded.uid });
    }

    if (!profile) {
      throw new Error('Profile not found.');
    }

    const progress = calculateNextProgress(profile, body);

    await sessions.insertOne({
      firebaseUid: decoded.uid,
      gameId: body.gameId,
      score: body.score,
      accuracy: body.accuracy,
      timeSpent: body.timeSpent,
      difficultyLevel: body.difficultyLevel,
      xpEarned: body.xpEarned,
      speed: body.speed,
      playedAt: timestamp,
    });

    await profiles.updateOne(
      { firebaseUid: decoded.uid },
      {
        $set: {
          email: decoded.email || '',
          xp: progress.xp,
          level: progress.level,
          streak: progress.streak,
          gamesPlayed: progress.gamesPlayed,
          stats: progress.stats,
          updatedAt: timestamp,
        },
      }
    );

    await progressHistory.insertOne(buildProgressHistoryDocument(decoded.uid, progress.stats));

    await games.updateOne(
      { gameId: body.gameId },
      {
        $setOnInsert: {
          gameId: body.gameId,
          isActive: true,
          createdAt: timestamp,
        },
        $set: {
          updatedAt: timestamp,
        },
      },
      { upsert: true }
    );

    const updatedProfile = await profiles.findOne({ firebaseUid: decoded.uid });
    return NextResponse.json({
      profile: updatedProfile,
      leveledUp: progress.leveledUp,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to record game session.' }, { status: 400 });
  }
}
