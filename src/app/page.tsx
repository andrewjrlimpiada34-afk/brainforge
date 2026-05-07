"use client"

import { Navbar } from '@/components/layout/Navbar';
import { useAppState } from '@/components/providers/StateProvider';
import { StatsRadar } from '@/components/dashboard/StatsRadar';
import { DailyChallengeCard } from '@/components/dashboard/DailyChallengeCard';
import { AIInsight } from '@/components/dashboard/AIInsight';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, Flame, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAppState();

  return (
    <div className="min-h-screen pb-20 bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-8 space-y-10">
        {/* Hero Section */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold tracking-tight">
                  Welcome back, <span className="text-primary">{user.username}</span>
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">Your neural pathways are ready for synchronization.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <StatBadge icon={<Flame className="text-orange-500 w-4 h-4 md:w-5 md:h-5" />} label="Streak" value={`${user.streak}d`} />
                <StatBadge icon={<Award className="text-accent w-4 h-4 md:w-5 md:h-5" />} label="Rank" value="Novice" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-full">
                <DailyChallengeCard />
              </div>
              <div className="space-y-6">
                <CardWrapper title="Training Progress">
                  <div className="space-y-5 pt-2">
                    <SkillProgress label="Memory" value={user.stats.memory} />
                    <SkillProgress label="Logic" value={user.stats.logic} />
                    <SkillProgress label="Speed" value={user.stats.speed} />
                    <SkillProgress label="Accuracy" value={user.stats.accuracy} />
                  </div>
                </CardWrapper>
                <CardWrapper title="Quick Actions">
                  <div className="grid grid-cols-2 gap-4">
                    <ActionButton href="/games" icon={<Target size={20} />} label="All Games" />
                    <ActionButton href="/leaderboard" icon={<Zap size={20} />} label="Leaderboard" />
                  </div>
                </CardWrapper>
              </div>
            </div>
          </div>

          <div className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-8 xl:block xl:space-y-8">
            <StatsRadar />
            <AIInsight />
          </div>
        </section>

        {/* Recommended Games Section */}
        <section className="space-y-8 pb-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl md:text-2xl font-headline font-bold">Recommended Modules</h2>
            <Link href="/games" className="text-sm text-primary flex items-center gap-1 hover:underline font-bold transition-all">
              View Library <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="bg-card/40 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
      <div className="p-1.5 bg-white/5 rounded-lg">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-0.5 tracking-wider">{label}</p>
        <p className="text-base md:text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

function SkillProgress({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] md:text-[11px] font-bold uppercase tracking-widest">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-primary">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5 bg-muted/30" />
    </div>
  );
}

function CardWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <h3 className="text-[10px] font-bold uppercase text-primary tracking-[0.2em]">{title}</h3>
      {children}
    </div>
  );
}

function ActionButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-3 p-5 bg-white/5 hover:bg-primary/10 border border-white/10 rounded-2xl transition-all group overflow-hidden">
      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </Link>
  );
}

function GameCard({ title, category, difficulty, description, id }: { title: string; category: string; difficulty: string; description: string; id: string }) {
  return (
    <Link href={`/games/${id}`} className="group h-full">
      <div className="glass-card p-6 md:p-8 rounded-3xl border-white/10 hover:border-primary/50 transition-all duration-300 space-y-5 h-full flex flex-col hover:shadow-2xl hover:shadow-primary/5">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="border-primary/20 text-primary-foreground bg-primary/10 text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider">{category}</Badge>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">{difficulty}</span>
        </div>
        <div className="flex-1 space-y-3">
          <h4 className="text-xl md:text-2xl font-bold font-headline group-hover:text-primary transition-colors duration-300">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none">{description}</p>
        </div>
        <div className="pt-4 flex items-center text-xs font-black text-primary transition-all duration-300 group-hover:translate-x-1 uppercase tracking-widest">
          Initialize <ArrowRight size={14} className="ml-2" />
        </div>
      </div>
    </Link>
  );
}
