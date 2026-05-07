"use client"

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RANKINGS = [
  { rank: 1, name: "NeuralKnight", level: 54, score: "128,450", trend: 'up' },
  { rank: 2, name: "SynapseSurfer", level: 49, score: "115,200", trend: 'down' },
  { rank: 3, name: "LogicLord", level: 45, score: "102,150", trend: 'neutral' },
  { rank: 4, name: "MemoryMaster", level: 42, score: "98,400", trend: 'up' },
  { rank: 5, name: "BrainSoldier", level: 38, score: "91,200", trend: 'up' },
  { rank: 6, name: "SpeedDemon", level: 35, score: "88,100", trend: 'down' },
  { rank: 7, name: "PatternSeeker", level: 31, score: "82,500", trend: 'up' },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-12 max-w-5xl space-y-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 glow-accent">
            <Trophy className="text-accent h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold">Global Standings</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">The top performing neural networks across the world, verified via synchronization.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <PodiumCard rank={2} name="SynapseSurfer" score="115,200" level={49} color="text-slate-400" icon={<Medal />} />
          <PodiumCard rank={1} name="NeuralKnight" score="128,450" level={54} color="text-yellow-500" icon={<Crown />} isMain />
          <PodiumCard rank={3} name="LogicLord" score="102,150" level={45} color="text-orange-500" icon={<Medal />} />
        </div>

        <Card className="glass-card overflow-hidden border-white/10">
          <CardHeader className="bg-white/5 border-b border-white/5 px-6 md:px-8">
            <div className="flex items-center text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
              <span className="w-12">Rank</span>
              <span className="flex-1">Operative</span>
              <span className="w-20 text-center hidden sm:block">Level</span>
              <span className="w-32 text-right">Neural Score</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {RANKINGS.map((user, i) => (
              <div key={i} className={`flex items-center px-6 md:px-8 py-5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all duration-300 group ${user.name === 'BrainSoldier' ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}>
                <div className="w-12 font-bold text-base md:text-lg text-muted-foreground group-hover:text-foreground transition-colors">{user.rank}</div>
                <div className="flex-1 flex items-center gap-3 md:gap-4 overflow-hidden">
                  <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                    <AvatarFallback className="bg-muted text-[10px] font-black">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm md:text-base truncate">{user.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {user.name === 'BrainSoldier' && <Badge variant="secondary" className="text-[8px] h-4 bg-primary text-primary-foreground font-bold uppercase tracking-tighter">You</Badge>}
                      <span className="text-[9px] text-muted-foreground font-bold uppercase sm:hidden">LVL {user.level}</span>
                    </div>
                  </div>
                </div>
                <div className="w-20 text-center text-sm font-medium hidden sm:block">{user.level}</div>
                <div className="w-32 text-right space-y-1">
                  <p className="text-sm md:text-base font-black text-primary tracking-tighter">{user.score}</p>
                  <div className="flex items-center justify-end gap-1">
                    {user.trend === 'up' && <TrendingUp size={10} className="text-primary" />}
                    {user.trend === 'down' && <TrendingDown size={10} className="text-destructive" />}
                    {user.trend === 'neutral' && <Minus size={10} className="text-muted-foreground" />}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function PodiumCard({ rank, name, score, level, color, icon, isMain }: any) {
  return (
    <Card className={`glass-card p-6 md:p-8 text-center flex flex-col items-center gap-5 relative overflow-hidden transition-all duration-500 ${isMain ? 'border-primary/40 -translate-y-4 glow-primary z-20 md:scale-105' : 'mt-0 md:mt-8 z-10'}`}>
      <div className={`p-4 rounded-2xl bg-white/5 ${color} backdrop-blur-md`}>
        {icon}
      </div>
      <div className="space-y-1.5">
        <p className="text-xl md:text-2xl font-bold font-headline">{name}</p>
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Level {level}</p>
      </div>
      <div className="w-full h-px bg-white/5" />
      <p className="text-2xl md:text-3xl font-black text-primary tracking-tighter">{score}</p>
      <div className={`absolute -bottom-4 -right-4 text-9xl font-black opacity-[0.03] select-none pointer-events-none ${color}`}>
        {rank}
      </div>
    </Card>
  );
}
