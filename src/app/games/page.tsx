"use client"

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Brain, Calculator, Search, Target, X, Zap } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const GAMES = [
  { id: 'memory-pattern', title: 'Pattern Recall', category: 'Memory', icon: <Brain size={20} />, difficulty: 'Medium', desc: 'Repeat increasing sequences of visual tiles.' },
  { id: 'logic-sequence', title: 'Neural Sequences', category: 'Logic', icon: <Target size={20} />, difficulty: 'Hard', desc: 'Identify patterns in complex number grids.' },
  { id: 'speed-chrono', title: 'Chrono-Tap', category: 'Speed', icon: <Zap size={20} />, difficulty: 'Easy', desc: 'React to visual stimuli in micro-seconds.' },
  { id: 'math-arithmetic', title: 'Prime Flow', category: 'Math', icon: <Calculator size={20} />, difficulty: 'Medium', desc: 'Solve arithmetic flow challenges under pressure.' },
  { id: 'verbal-lexicon', title: 'Neural Lexicon', category: 'Verbal', icon: <BookOpen size={20} />, difficulty: 'Hard', desc: 'Expand and test your linguistic recall capacity.' },
];

export default function GamesLibraryPage() {
  const [query, setQuery] = useState('');

  const filteredGames = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return GAMES;

    return GAMES.filter((game) =>
      [game.title, game.category, game.desc, game.difficulty].some((field) =>
        field.toLowerCase().includes(normalized)
      )
    );
  }, [query]);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <main className="container mx-auto px-4 pt-12 space-y-12">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-headline font-bold mb-4">Neural Library</h1>
          <p className="text-xl text-muted-foreground">Select a cognitive module to begin training. All progress is synchronized to your neural profile.</p>

          <div className="relative mt-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-10 pr-12 h-12 bg-card border-white/5 rounded-xl"
              placeholder="Search modules by title, category, or difficulty..."
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>
        </div>

        {filteredGames.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <Link href={`/games/${game.id}`} key={game.id} className="group">
                <div className="glass-card p-8 rounded-3xl border-white/5 hover:border-primary/40 transition-all space-y-6 h-full flex flex-col">
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary glow-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {game.icon}
                    </div>
                    <Badge className="bg-muted text-muted-foreground border-none font-bold text-[10px]">{game.difficulty}</Badge>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-bold font-headline">{game.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{game.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">{game.category}</span>
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                      <Zap size={14} className="group-hover:text-primary-foreground transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl border-white/10 p-10 text-center space-y-4">
            <h2 className="text-2xl font-headline font-bold">No Modules Found</h2>
            <p className="text-muted-foreground">
              No game modules matched <span className="text-foreground font-semibold">{query}</span>. Try a title like `Pattern`, `Logic`, or `Speed`.
            </p>
            <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10" onClick={() => setQuery('')}>
              Clear Search
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
