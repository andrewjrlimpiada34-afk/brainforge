"use client"

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppState } from '@/components/providers/StateProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trophy, Eye } from 'lucide-react';

const WORDS = ["NEURAL", "SYNC", "FORGE", "LOGIC", "MEMORY", "BINARY", "CORE", "PULSE", "ZENITH", "ARRAY", "QUANTUM", "CYBER"];

export function LexiconRecall() {
  const { completeGame } = useAppState();
  const [displayWords, setDisplayWords] = useState<string[]>([]);
  const [testWord, setTestWord] = useState('');
  const [isWordInList, setIsWordInList] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'memorizing' | 'testing' | 'result'>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const startLevel = useCallback(() => {
    const count = 3 + Math.floor(level / 2);
    const selected = [...WORDS].sort(() => Math.random() - 0.5).slice(0, count);
    setDisplayWords(selected);
    setGameState('memorizing');

    setTimeout(() => {
      const showExisting = Math.random() > 0.5;
      setIsWordInList(showExisting);
      if (showExisting) {
        setTestWord(selected[Math.floor(Math.random() * selected.length)]);
      } else {
        const remaining = WORDS.filter(w => !selected.includes(w));
        setTestWord(remaining[Math.floor(Math.random() * remaining.length)]);
      }
      setGameState('testing');
    }, 1000 + (count * 500));
  }, [level]);

  const handleChoice = (exists: boolean) => {
    if (exists === isWordInList) {
      setScore(prev => prev + (level * 200));
      setLevel(prev => prev + 1);
      startLevel();
    } else {
      setGameState('result');
      completeGame('verbal-lexicon', score, Math.min(100, level * 10), 3.0);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-headline font-bold">Neural Lexicon</h2>
        <p className="text-muted-foreground">Test your linguistic retention capacity.</p>
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-primary">Level</p>
            <p className="text-2xl font-bold">{level}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-accent">Score</p>
            <p className="text-2xl font-bold">{score}</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'idle' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="glass-card p-12 text-center space-y-6">
              <BookOpen className="text-primary h-16 w-16 mx-auto" />
              <p className="text-muted-foreground">Memorize the words, then identify if the test word was present.</p>
              <Button onClick={startLevel} size="lg" className="w-full bg-primary font-bold">Open Lexicon</Button>
            </Card>
          </motion.div>
        ) : gameState === 'memorizing' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              {displayWords.map((word, i) => (
                <motion.div 
                  key={i} 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="px-6 py-4 glass-card rounded-2xl text-xl font-bold text-primary border-primary/20"
                >
                  {word}
                </motion.div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground animate-pulse">Memorizing neural nodes...</p>
          </motion.div>
        ) : gameState === 'testing' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center space-y-4">
              <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Was this word in the list?</p>
              <h3 className="text-5xl font-black font-headline text-accent">{testWord}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handleChoice(true)} className="h-20 text-xl font-bold bg-primary hover:bg-primary/80">YES</Button>
              <Button onClick={() => handleChoice(false)} variant="outline" className="h-20 text-xl font-bold border-white/10 hover:bg-white/5">NO</Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass-card p-12 text-center space-y-6 border-primary/40">
              <Trophy className="text-accent h-16 w-16 mx-auto" />
              <h3 className="text-4xl font-headline font-bold">Lexicon Cleared</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Final Score</p>
                  <p className="text-2xl text-primary font-bold">{score}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Recall Rank</p>
                  <p className="text-2xl text-accent font-bold">{level}</p>
                </div>
              </div>
              <Button onClick={() => { setLevel(1); setScore(0); setGameState('idle'); }} variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">Retry Recall</Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
