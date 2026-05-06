"use client"

import { useState, useEffect } from 'react';
import { useAppState } from '@/components/providers/StateProvider';
import { analyzePerformanceFeedback, type AnalyzePerformanceFeedbackOutput } from '@/ai/flows/analyze-performance-feedback';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BrainCircuit, TrendingUp, Lightbulb } from 'lucide-react';
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

  if (loading) return <Skeleton className="h-64 w-full glass-card" />;
  if (!insight) return null;

  return (
    <Card className="glass-card border-accent/20">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="p-2 bg-accent/20 rounded-lg">
          <BrainCircuit className="text-accent h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-sm font-bold uppercase text-accent tracking-widest">Neural Analysis</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Personalized AI Feedback</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm italic text-muted-foreground leading-relaxed">
            "{insight.summaryFeedback}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase text-primary flex items-center gap-1">
              <TrendingUp size={12} /> Strengths
            </h4>
            <ul className="text-sm space-y-1">
              {insight.strengths.slice(0, 3).map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-1 text-xs">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase text-accent flex items-center gap-1">
              <Lightbulb size={12} /> Optimization
            </h4>
            <div className="text-xs bg-white/5 p-3 rounded-lg border border-white/5">
              <p className="font-bold text-accent mb-1">{insight.suggestionsForImprovement[0].category}</p>
              <p className="text-muted-foreground">{insight.suggestionsForImprovement[0].strategy}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
