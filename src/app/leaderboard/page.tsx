"use client"

import { Crown, Trophy } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useAppState } from '@/components/providers/StateProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function LeaderboardPage() {
  const { user, hasProgress } = useAppState();
  const avatarFallback = (user.username || 'OP').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen pb-20 bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-12 max-w-5xl space-y-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 glow-accent">
            <Trophy className="text-accent h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold">Leaderboard</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Demo rankings have been removed. This board will populate once real competitive data is connected.
          </p>
        </div>

        <Card className="glass-card border-primary/20 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-primary">Your Current Standing</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="h-20 w-20 border border-white/10">
                <AvatarImage src={user.photoURL} alt={`${user.username} avatar`} className="object-cover" />
                <AvatarFallback className="bg-muted text-lg font-black">{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl md:text-3xl font-headline font-bold">{user.username}</h2>
                  <Badge className="bg-primary text-primary-foreground font-bold uppercase tracking-wider">
                    <Crown className="mr-1 h-3 w-3" /> You
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Level {user.level} | {user.xp} XP | {user.gamesPlayed} completed sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden border-white/10">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {hasProgress
                ? 'Your personal progress is live, but global rankings are intentionally blank until a real multiplayer leaderboard source is connected.'
                : 'You have a fresh profile with no seeded competitors. Finish a few sessions and this page will be ready for real ranking data later.'}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
