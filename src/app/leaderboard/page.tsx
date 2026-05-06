"use client"

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown } from 'lucide-react';

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
    <div className="min-h-screen pb-20">
      <Navbar />
      <main className="container mx-auto px-4 pt-12 max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 glow-accent">
            <Trophy className="text-accent h-8 w-8" />
          </div>
          <h1 className="text-5xl font-headline font-bold">Global Standings</h1>
          <p className="text-muted-foreground text-lg">The top performing neural networks across the world.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <PodiumCard rank={2} name="SynapseSurfer" score="115,200" level={49} color="text-slate-400" icon={<Medal />} />
          <PodiumCard rank={1} name="NeuralKnight" score="128,450" level={54} color="text-yellow-500" icon={<Crown />} isMain />
          <PodiumCard rank={3} name="LogicLord" score="102,150" level={45} color="text-orange-500" icon={<Medal />} />
        </div>

        <Card className="glass-card overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 px-8">
            <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <div className="col-span-1">Rank</div>
              <div className="col-span-6">Operative</div>
              <div className="col-span-2 text-center">Level</div>
              <div className="col-span-3 text-right">Neural Score</div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {RANKINGS.map((user, i) => (
              <div key={i} className={`grid grid-cols-12 items-center px-8 py-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${user.name === 'BrainSoldier' ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}>
                <div className="col-span-1 font-bold text-lg">{user.rank}</div>
                <div className="col-span-6 flex items-center gap-4">
                  <Avatar className="h-10 w-10 border-2 border-white/5">
                    <AvatarFallback className="bg-muted text-xs">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm">{user.name}</p>
                    {user.name === 'BrainSoldier' && <Badge variant="secondary" className="text-[8px] h-4 bg-primary text-primary-foreground font-bold uppercase">You</Badge>}
                  </div>
                </div>
                <div className="col-span-2 text-center text-sm font-medium">{user.level}</div>
                <div className="col-span-3 text-right text-sm font-bold text-primary">{user.score}</div>
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
    <Card className={`glass-card p-8 text-center flex flex-col items-center gap-4 relative overflow-hidden ${isMain ? 'border-primary/40 -translate-y-4 glow-primary' : 'mt-8'}`}>
      <div className={`p-4 rounded-full bg-white/5 ${color}`}>
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold font-headline">{name}</p>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Level {level}</p>
      </div>
      <div className="w-full h-px bg-white/5" />
      <p className="text-2xl font-bold text-primary">{score}</p>
      <div className={`absolute -bottom-2 -right-2 text-8xl font-black opacity-5 ${color}`}>
        {rank}
      </div>
    </Card>
  );
}
