"use client"

import { Navbar } from '@/components/layout/Navbar';
import { useAppState } from '@/components/providers/StateProvider';
import { StatsRadar } from '@/components/dashboard/StatsRadar';
import { DailyChallengeCard } from '@/components/dashboard/DailyChallengeCard';
import { AIInsight } from '@/components/dashboard/AIInsight';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, Flame, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAppState();

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-8 space-y-8">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-headline font-bold tracking-tight">
                  Welcome back, <span className="text-primary">{user.username}</span>
                </h1>
                <p className="text-muted-foreground mt-1">Your neural pathways are ready for synchronization.</p>
              </div>
              <div className="flex gap-4">
                <StatBadge icon={<Flame className="text-orange-500" />} label="Streak" value={`${user.streak}d`} />
                <StatBadge icon={<Award className="text-accent" />} label="Rank" value="Novice" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DailyChallengeCard />
              <div className="space-y-6">
                <CardWrapper title="Training Progress">
                  <div className="space-y-4 pt-2">
                    <SkillProgress label="Memory" value={user.stats.memory} />
                    <SkillProgress label="Logic" value={user.stats.logic} />
                    <SkillProgress label="Speed" value={user.stats.speed} />
                    <SkillProgress label="Accuracy" value={user.stats.accuracy} />
                  </div>
                </CardWrapper>
                <CardWrapper title="Quick Actions">
                  <div className="grid grid-cols-2 gap-3">
                    <ActionButton href="/games" icon={<Target size={18} />} label="All Games" />
                    <ActionButton href="/leaderboard" icon={<Zap size={18} />} label="Leaderboard" />
                  </div>
                </CardWrapper>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <StatsRadar />
            <AIInsight />
          </div>
        </section>

        {/* Featured Games Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline font-bold">Recommended Modules</h2>
            <Link href="/games" className="text-sm text-primary flex items-center gap-1 hover:underline">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GameCard 
              title="Pattern Recall" 
              category="Memory" 
              difficulty="Medium" 
              description="Memorize and repeat complex spatial sequences."
              id="memory-pattern"
            />
            <GameCard 
              title="Number Matrix" 
              category="Logic" 
              difficulty="Hard" 
              description="Complete the logic sequence in the neural net."
              id="logic-sequence"
            />
             <GameCard 
              title="Chrono-Tap" 
              category="Speed" 
              difficulty="Easy" 
              description="React to shifting stimuli with lightning precision."
              id="speed-chrono"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card/40 border px-4 py-2 rounded-2xl flex items-center gap-3">
      {icon}
      <div>
        <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

function SkillProgress({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-primary">{value}%</span>
      </div>
      <Progress value={value} className="h-2 bg-muted/50" />
    </div>
  );
}

function CardWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <h3 className="text-xs font-bold uppercase text-primary tracking-widest">{title}</h3>
      {children}
    </div>
  );
}

function ActionButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-2 p-4 bg-muted/20 hover:bg-muted/40 border border-white/5 rounded-xl transition-all group">
      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all">
        {icon}
      </div>
      <span className="text-xs font-bold">{label}</span>
    </Link>
  );
}

function GameCard({ title, category, difficulty, description, id }: { title: string; category: string; difficulty: string; description: string; id: string }) {
  return (
    <Link href={`/games/${id}`} className="group h-full">
      <div className="glass-card p-6 rounded-2xl border-white/5 hover:border-primary/40 transition-all space-y-4 h-full flex flex-col">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="border-primary/20 text-primary-foreground bg-primary/10">{category}</Badge>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">{difficulty}</span>
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-bold font-headline group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
        </div>
        <div className="pt-4 flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all">
          INITIALIZE MODULE <ArrowRight size={14} className="ml-1" />
        </div>
      </div>
    </Link>
  );
}
