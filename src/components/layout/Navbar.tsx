"use client"

import Link from 'next/link';
import { useAppState } from '@/components/providers/StateProvider';
import { Brain, Trophy, User, LayoutDashboard, Target, LogOut } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user } = useAppState();
  const pathname = usePathname();
  const xpProgress = (user.xp / (user.level * 1000)) * 100;

  const handleSignOut = () => {
    localStorage.removeItem('brainforge_user');
    window.location.href = '/login';
  };

  return (
    <nav className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-[100] w-full">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center glow-primary transition-transform duration-300 group-hover:scale-110">
            <Brain className="text-primary-foreground h-6 w-6" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tighter uppercase hidden xs:inline-block">
            Brain<span className="text-primary">Forge</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-6">
          <div className="hidden lg:flex items-center gap-1">
            <NavLink href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" active={pathname === '/'} />
            <NavLink href="/games" icon={<Target size={18} />} label="Library" active={pathname.startsWith('/games')} />
            <NavLink href="/leaderboard" icon={<Trophy size={18} />} label="Standings" active={pathname === '/leaderboard'} />
          </div>

          <div className="h-8 w-px bg-white/10 hidden lg:block mx-2" />

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1.5">LVL {user.level}</span>
              <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                <Progress value={xpProgress} className="h-full bg-primary" />
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-all duration-300 group">
                  <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background animate-pulse" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card mt-2 border-white/10 p-2">
                <DropdownMenuLabel className="px-3 py-2">
                  <p className="text-sm font-bold truncate">{user.username}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Neural Operative</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem asChild className="focus:bg-primary/10 rounded-lg cursor-pointer">
                  <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 font-bold text-sm">
                    <User size={16} className="text-primary" /> Profile Control
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="lg:hidden focus:bg-primary/10 rounded-lg cursor-pointer">
                  <Link href="/games" className="flex items-center gap-3 px-3 py-2.5 font-bold text-sm">
                    <Target size={16} className="text-primary" /> Game Library
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="lg:hidden focus:bg-primary/10 rounded-lg cursor-pointer">
                  <Link href="/leaderboard" className="flex items-center gap-3 px-3 py-2.5 font-bold text-sm">
                    <Trophy size={16} className="text-primary" /> Standings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={handleSignOut} className="focus:bg-destructive/10 text-destructive rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3 px-3 py-2.5 font-bold text-sm w-full">
                    <LogOut size={16} /> Decouple Link
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300",
        active 
          ? "text-primary bg-primary/10 shadow-[0_0_15px_-5px_rgba(34,197,94,0.3)]" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
