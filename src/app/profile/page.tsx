"use client"

import { Navbar } from '@/components/layout/Navbar';
import { useAppState } from '@/components/providers/StateProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, LogOut, Settings, Award, Shield, Calendar, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAppState();
  const xpProgress = (user.xp / (user.level * 1000)) * 100;

  const handleSignOut = () => {
    localStorage.removeItem('brainforge_user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-12 max-w-5xl space-y-8">
        {/* Profile Header */}
        <section className="glass-card p-6 md:p-10 rounded-3xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden border-white/10">
          <div className="absolute -top-10 -right-10 p-8 opacity-5 select-none pointer-events-none">
            <Shield size={240} />
          </div>
          
          <div className="relative group shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-primary/10 flex items-center justify-center border-2 border-primary/30 glow-primary overflow-hidden transition-all duration-300 group-hover:scale-105">
              <User size={64} className="text-primary md:w-20 md:h-20" />
            </div>
            <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground border-none font-black py-1 px-4 text-xs tracking-wider shadow-lg">
              LVL {user.level}
            </Badge>
          </div>

          <div className="flex-1 text-center md:text-left space-y-6 w-full">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-5xl font-headline font-bold tracking-tight">{user.username}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse-primary" />
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  Active Neural Operative
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <span>Neural Experience</span>
                <span className="text-primary">{user.xp} / {user.level * 1000} XP</span>
              </div>
              <Progress value={xpProgress} className="h-2.5 bg-white/5" />
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 pt-2">
              <ProfileStat icon={<Award size={18} />} label="Rank" value="Novice" />
              <ProfileStat icon={<Calendar size={18} />} label="Streak" value={`${user.streak} Days`} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cognitive Breakdown */}
          <Card className="glass-card lg:col-span-2 border-white/10">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-primary">Neural Capacities</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 px-6 md:px-8">
              <StatProgress label="Memory Retention" value={user.stats.memory} />
              <StatProgress label="Logical Deduction" value={user.stats.logic} />
              <StatProgress label="Processing Speed" value={user.stats.speed} />
              <StatProgress label="Decision Accuracy" value={user.stats.accuracy} />
            </CardContent>
          </Card>

          {/* Account Settings */}
          <div className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-accent">Terminal Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <Button variant="outline" className="w-full justify-between h-12 border-white/10 hover:bg-white/10 font-bold group">
                  <div className="flex items-center gap-3">
                    <Settings size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    Calibration
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-12 border-destructive/20 text-destructive hover:bg-destructive/10 font-bold group"
                  onClick={handleSignOut}
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={18} />
                    Decouple Session
                  </div>
                  <ChevronRight size={16} />
                </Button>
              </CardContent>
            </Card>

            <div className="glass-card p-6 rounded-2xl bg-primary/5 border-primary/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Neural tip</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Regular synchronization across all modules ensures peak performance and prevents neural decay.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfileStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-all duration-300">
      <span className="text-primary group-hover:scale-110 transition-transform">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">{label}</span>
        <span className="text-sm font-bold tracking-tight">{value}</span>
      </div>
    </div>
  );
}

function StatProgress({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
        <span className="text-primary font-black text-sm">{value}%</span>
      </div>
      <Progress value={value} className="h-2 bg-white/5" />
    </div>
  );
}
