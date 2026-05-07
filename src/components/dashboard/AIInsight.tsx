"use client"

import { useState, useEffect } from 'react';
import { useAppState } from '@/components/providers/StateProvider';
import { analyzePerformanceFeedback, type AnalyzePerformanceFeedbackOutput } from '@/ai/flows/analyze-performance-feedback';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BrainCircuit, TrendingUp, Lightbulb, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function AIInsight() {
  const { user } = useAppState();
  const [insight, setInsight] = useState<AnalyzePerformanceFeedbackOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getInsight() {
      try {
        const res = await analyzePerformanceFeedback({
          username: user.username,
          gameResults: [
            {
              gameType: "Memory: Pattern Recall",
              score: 850,
              accuracy: 92,
              speed: 1.2,
              difficulty: "medium",
              cognitiveAreasImpacted: ["Memory", "Accuracy"]
            }
          ],
          overallStats: user.stats
        });
        setInsight(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    getInsight();
  }, [user.stats, user.username]);

  if (loading) return <Skeleton className="h-[280px] w-full glass-card rounded-2xl" />;
  if (!insight) return null;

  return (
    <Card className="glass-card border-accent/20 rounded-2xl overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center gap-4 bg-accent/5 border-b border-accent/10 py-5">
        <div className="p-3 bg-accent/20 rounded-xl glow-accent">
          <BrainCircuit className="text-accent h-6 w-6" />
        </div>
        <div className="space-y-0.5">
          <CardTitle className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Neural Analysis</CardTitle>
          <p className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
            <Sparkles size={12} className="text-accent" /> Personalized Intelligence
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="relative">
          <div className="absolute -left-2 top-0 bottom-0 w-1 bg-accent/30 rounded-full" />
          <p className="text-sm italic text-muted-foreground leading-relaxed pl-4 font-medium">
            "{insight.summaryFeedback}"
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-primary flex items-center gap-2 tracking-widest">
              <TrendingUp size={14} /> Core Strengths
            </h4>
            <div className="flex flex-wrap gap-2">
              {insight.strengths.slice(0, 3).map((s, i) => (
                <span key={i} className="text-[10px] font-bold px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full uppercase tracking-tighter">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-accent flex items-center gap-2 tracking-widest">
              <Lightbulb size={14} /> Critical Strategy
            </h4>
            <div className="text-xs bg-white/5 p-4 rounded-xl border border-white/10 group hover:border-accent/40 transition-colors">
              <p className="font-black text-accent mb-1.5 uppercase tracking-wider">{insight.suggestionsForImprovement[0].category}</p>
              <p className="text-muted-foreground leading-relaxed font-medium">{insight.suggestionsForImprovement[0].strategy}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
