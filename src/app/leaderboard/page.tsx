"use client"

import { useEffect, useState } from 'react';
import { Crown, Medal, Trophy } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useAppState } from '@/components/providers/StateProvider';
import { useUser } from '@/firebase';
import { authenticatedFetch } from '@/lib/client-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

type LeaderboardResponse = {
  entries: LeaderboardEntry[];
  currentUserRank: LeaderboardEntry | null;
  category: LeaderboardCategory;
  range: LeaderboardRange;
};

const CATEGORY_OPTIONS: Array<{ value: LeaderboardCategory; label: string }> = [
  { value: 'all', label: 'All Categories' },
  { value: 'memory', label: 'Memory' },
  { value: 'logic', label: 'Logic' },
  { value: 'speed', label: 'Speed' },
  { value: 'math', label: 'Math' },
  { value: 'verbal', label: 'Verbal' },
];

function avatarFallback(username: string) {
  return (username || 'OP').slice(0, 2).toUpperCase();
}

function podiumColor(rank: number) {
  if (rank === 1) return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
  if (rank === 2) return 'text-slate-300 border-slate-300/20 bg-slate-300/10';
  return 'text-orange-400 border-orange-400/20 bg-orange-400/10';
}

function rankAccent(rank: number) {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-slate-300';
  if (rank === 3) return 'text-orange-400';
  return 'text-muted-foreground';
}

function categorySummary(category: LeaderboardCategory) {
  return category === 'all' ? 'all modules' : `${category} modules`;
}

export default function LeaderboardPage() {
  const { user } = useAppState();
  const { user: authUser } = useUser();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<LeaderboardRange>('all-time');
  const [category, setCategory] = useState<LeaderboardCategory>('all');

  useEffect(() => {
    async function loadLeaderboard() {
      if (!authUser) {
        setLoading(false);
        return;
      }

      try {
        const response = await authenticatedFetch<LeaderboardResponse>(
          authUser,
          `/api/leaderboard?range=${range}&category=${category}`
        );
        setData(response);
      } catch (error) {
        console.error('Unable to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    loadLeaderboard();
  }, [authUser, category, range]);

  const currentStanding = data?.currentUserRank ?? {
    rank: 0,
    firebaseUid: authUser?.uid || '',
    username: user.username,
    photoURL: user.photoURL,
    level: user.level,
    xp: user.xp,
    streak: user.streak,
    totalScore: 0,
    totalXp: 0,
    sessionsPlayed: user.gamesPlayed,
    averageAccuracy: user.stats.accuracy,
    category,
    range,
  };

  const podium = data?.entries?.slice(0, 3) ?? [];
  const rest = data?.entries?.slice(3) ?? [];

  return (
    <div className="min-h-screen pb-20 bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-12 max-w-6xl space-y-10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 glow-accent">
            <Trophy className="text-accent h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold">Global Standings</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Registered operatives compete here across {categorySummary(category)} with live weekly and all-time rankings.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <Tabs value={range} onValueChange={(value) => setRange(value as LeaderboardRange)}>
            <TabsList className="bg-white/5 border border-white/10 rounded-2xl h-auto p-1">
              <TabsTrigger value="all-time" className="rounded-xl px-5 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                All-Time
              </TabsTrigger>
              <TabsTrigger value="weekly" className="rounded-xl px-5 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Weekly
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="w-full lg:w-72">
            <Select value={category} onValueChange={(value) => setCategory(value as LeaderboardCategory)}>
              <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5">
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="glass-card border-primary/20 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-primary">Your Current Standing</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="h-20 w-20 border border-white/10">
                <AvatarImage src={currentStanding.photoURL} alt={`${currentStanding.username} avatar`} className="object-cover" />
                <AvatarFallback className="bg-muted text-lg font-black">{avatarFallback(currentStanding.username)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl md:text-3xl font-headline font-bold">{currentStanding.username}</h2>
                  <Badge className="bg-primary text-primary-foreground font-bold uppercase tracking-wider">
                    <Crown className="mr-1 h-3 w-3" /> You
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Rank #{currentStanding.rank || '--'} | Score {currentStanding.totalScore} | Level {currentStanding.level} | {currentStanding.sessionsPlayed} sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-headline font-bold">Top 3 Podium</h2>
            <p className="text-sm text-muted-foreground">
              {range === 'weekly' ? 'Last 7 days' : 'Lifetime totals'} • {categorySummary(category)}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-72 rounded-3xl" />
              ))}
            </div>
          ) : podium.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {podium.map((entry) => (
                <Card key={entry.firebaseUid} className={`glass-card rounded-3xl border p-6 ${podiumColor(entry.rank)}`}>
                  <CardContent className="p-0 text-center space-y-5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-white/10 text-current border-none font-black">#{entry.rank}</Badge>
                      <Medal className="h-5 w-5" />
                    </div>
                    <Avatar className="h-24 w-24 mx-auto border border-white/10">
                      <AvatarImage src={entry.photoURL} alt={`${entry.username} avatar`} className="object-cover" />
                      <AvatarFallback className="bg-muted text-xl font-black">{avatarFallback(entry.username)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-headline font-bold text-foreground">{entry.username}</h3>
                      <p className="text-sm text-muted-foreground">Level {entry.level} • {entry.sessionsPlayed} sessions</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-left">
                      <MetricCard label="Score" value={entry.totalScore.toLocaleString()} />
                      <MetricCard label="Accuracy" value={`${entry.averageAccuracy}%`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card rounded-3xl border-white/10">
              <CardContent className="p-6 text-sm text-muted-foreground">
                No ranked players yet for this filter. Once registered users finish matching sessions, they will appear here.
              </CardContent>
            </Card>
          )}
        </section>

        <Card className="glass-card overflow-hidden border-white/10">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-4 p-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data?.entries?.length ? (
              rest.length ? (
                rest.map((entry) => {
                  const isCurrentUser = entry.firebaseUid === authUser?.uid;

                  return (
                    <div
                      key={entry.firebaseUid}
                      className={`flex items-center gap-4 px-6 py-5 border-b border-white/5 last:border-b-0 ${isCurrentUser ? 'bg-primary/5' : ''}`}
                    >
                      <div className={`w-14 text-lg font-black ${rankAccent(entry.rank)}`}>#{entry.rank}</div>
                      <Avatar className="h-12 w-12 border border-white/10">
                        <AvatarImage src={entry.photoURL} alt={`${entry.username} avatar`} className="object-cover" />
                        <AvatarFallback className="bg-muted text-sm font-black">{avatarFallback(entry.username)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-base">{entry.username}</p>
                          {isCurrentUser ? (
                            <Badge className="bg-primary text-primary-foreground font-bold uppercase tracking-wider">You</Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Score {entry.totalScore.toLocaleString()} | {entry.totalXp} XP | {entry.sessionsPlayed} sessions | {entry.averageAccuracy}% avg accuracy
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-sm text-muted-foreground">
                  Only the podium has entries for this filter right now.
                </div>
              )
            ) : (
              <div className="p-6 text-sm text-muted-foreground">
                No ranked players yet. Once registered users complete sessions, they will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
