"use client"

import Link from 'next/link';
import { useAppState } from '@/components/providers/StateProvider';
import { Brain, Trophy, User, LayoutDashboard, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function Navbar() {
  const { user } = useAppState();
  const xpProgress = (user.xp / (user.level * 1000)) * 100;

  return (
    <nav className="border-b bg-card/30 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center glow-primary">
            <Brain className="text-primary-foreground h-6 w-6" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tighter uppercase hidden sm:inline-block">
            Brain<span className="text-primary">Forge</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4">
            <NavLink href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavLink href="/games" icon={<Target size={18} />} label="Games" />
            <NavLink href="/leaderboard" icon={<Trophy size={18} />} label="Leaderboard" />
          </div>

          <div className="h-8 w-px bg-border hidden md:block" />

          <Link href="/profile" className="flex items-center gap-3 hover:bg-white/5 p-1 rounded-full transition-colors">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold uppercase text-primary">Level {user.level}</span>
              <div className="w-24 h-1.5 mt-1">
                <Progress value={xpProgress} className="h-full bg-muted" />
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-primary/20">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
      {icon}
      <span>{label}</span>
    </Link>
  );
}
