"use client"

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { generateDailyChallenge, type GenerateDailyChallengeOutput } from '@/ai/flows/generate-daily-challenge';
import { useAppState } from '@/components/providers/StateProvider';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export function DailyChallengeCard() {
  const { user, hasProgress } = useAppState();
  const [challenge, setChallenge] = useState<GenerateDailyChallengeOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const gamePreference = hasProgress
    ? 'Prefer recommendations based on actual performance history.'
    : 'No preference data yet.';

  useEffect(() => {
    async function loadChallenge() {
      try {
        const res = await generateDailyChallenge({
          userId: user.username,
          performanceHistory: `Memory: ${user.stats.memory}, Logic: ${user.stats.logic}, Speed: ${user.stats.speed}, Accuracy: ${user.stats.accuracy}`,
          gamePreferences: gamePreference,
          unlockedGames: user.unlockedGames
        });
        setChallenge(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadChallenge();
  }, [gamePreference, user.username, user.stats, user.unlockedGames]);

  if (loading) {
    return (
      <Card className="glass-card h-full">
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-2/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!challenge) return null;

  return (
    <Card className="glass-card overflow-hidden relative group border-primary/20">
      <div className="absolute top-0 right-0 p-4">
        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 flex items-center gap-1">
          <Sparkles size={12} />
          +{challenge.bonusXp} XP
        </Badge>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xs font-bold uppercase text-accent tracking-widest">Daily Objective</CardTitle>
        <h3 className="text-2xl font-headline font-bold mt-2">
          {hasProgress ? challenge.challengeTitle : 'First Contact Challenge'}
        </h3>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {hasProgress
            ? challenge.challengeDescription
            : 'Begin with a starter module to generate your first real performance baseline. From there, daily objectives will adapt to your actual play history.'}
        </p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="bg-white/5 rounded-lg p-3 flex-1 border border-white/5">
            <span className="text-[10px] uppercase text-muted-foreground font-bold">Goal</span>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="text-primary h-4 w-4" />
              <span className="text-sm font-medium">
                {challenge.targetAccuracy ? `${challenge.targetAccuracy}% Accuracy` : `${challenge.targetCount} Rounds`}
              </span>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 flex-1 border border-white/5">
            <span className="text-[10px] uppercase text-muted-foreground font-bold">Category</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium capitalize">{challenge.gameType}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
          <Link href={`/games/${challenge.gameType}`}>
            Initialize Challenge <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
