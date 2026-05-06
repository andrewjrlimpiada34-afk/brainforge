"use client"

import { Navbar } from '@/components/layout/Navbar';
import { useAppState } from '@/components/providers/StateProvider';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, LogOut, Settings, Award, Shield, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAppState();
  const xpProgress = (user.xp / (user.level * 1000)) * 100;

  const handleSignOut = () => {
    localStorage.removeItem('brainforge_user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <main className="container mx-auto px-4 pt-12 max-w-4xl space-y-8">
        {/* Profile Header */}
        <section className="glass-card p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield size={120} />
          </div>
          
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary glow-primary overflow-hidden">
              <User size={64} className="text-primary" />
            </div>
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground border-none font-bold py-1 px-3">
              LVL {user.level}
            </Badge>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-headline font-bold">{user.username}</h1>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-1">
                <Shield size={14} className="text-primary" /> Active Neural Operative
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span>Experience Points</span>
                <span className="text-primary">{user.xp} / {user.level * 1000} XP</span>
              </div>
              <Progress value={xpProgress} className="h-2 bg-white/5" />
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <ProfileStat icon={<Award size={16} />} label="Rank" value="Novice" />
              <ProfileStat icon={<Calendar size={16} />} label="Streak" value={`${user.streak} Days`} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cognitive Breakdown */}
          <Card className="glass-card md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold uppercase tracking-widest text-primary">Neural Capacities</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatProgress label="Memory Retention" value={user.stats.memory} />
              <StatProgress label="Logical Deduction" value={user.stats.logic} />
              <StatProgress label="Processing Speed" value={user.stats.speed} />
              <StatProgress label="Decision Accuracy" value={user.stats.accuracy} />
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold uppercase tracking-widest text-accent">Terminal Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start gap-3 border-white/10 hover:bg-white/5">
                <Settings size={18} /> Neural Calibration
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 border-destructive/20 text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut size={18} /> Decouple Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function ProfileStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
      <span className="text-primary">{icon}</span>
      <span className="text-xs font-bold uppercase text-muted-foreground">{label}:</span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}

function StatProgress({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-primary">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5 bg-white/5" />
    </div>
  );
}
