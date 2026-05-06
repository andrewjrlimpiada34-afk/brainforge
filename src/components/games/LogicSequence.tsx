"use client"

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppState } from '@/components/providers/StateProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trophy, HelpCircle } from 'lucide-react';

export function LogicSequence() {
  const { completeGame } = useAppState();
  const [sequence, setSequence] = useState<number[]>([]);
  const [options, setOptions] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);

  const generateSequence = useCallback(() => {
    const start = Math.floor(Math.random() * 20);
    const diff = Math.floor(Math.random() * 5) + 1;
    const type = Math.random() > 0.5 ? 'arithmetic' : 'geometric';
    
    let current = start;
    const newSeq = [];
    for (let i = 0; i < 4; i++) {
      newSeq.push(current);
      if (type === 'arithmetic') current += diff;
      else current *= 2;
    }

    const answer = current;
    const newOptions = [answer];
    while (newOptions.length < 4) {
      const wrong = answer + (Math.floor(Math.random() * 20) - 10);
      if (!newOptions.includes(wrong)) newOptions.push(wrong);
    }

    setSequence(newSeq);
    setCorrectAnswer(answer);
    setOptions(newOptions.sort(() => Math.random() - 0.5));
    setGameState('playing');
  }, []);

  const handleChoice = (choice: number) => {
    if (choice === correctAnswer) {
      setScore(prev => prev + (level * 150));
      setLevel(prev => prev + 1);
      generateSequence();
    } else {
      setGameState('result');
      completeGame('logic-sequence', score, Math.min(100, level * 15), 2.0);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-headline font-bold">Neural Sequences</h2>
        <p className="text-muted-foreground">Identify the next step in the logic chain.</p>
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
              <HelpCircle className="text-primary h-16 w-16 mx-auto" />
              <p className="text-muted-foreground">Exercise your pattern recognition and logical deduction.</p>
              <Button onClick={generateSequence} size="lg" className="w-full bg-primary font-bold">Begin Logic Sync</Button>
            </Card>
          </motion.div>
        ) : gameState === 'result' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass-card p-12 text-center space-y-6 border-primary/40">
              <Trophy className="text-accent h-16 w-16 mx-auto" />
              <h3 className="text-4xl font-headline font-bold">Logic Failure</h3>
              <p className="text-muted-foreground">Your neural pathways reached a logical impasse.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Final Score</p>
                  <p className="text-2xl text-primary font-bold">{score}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Accuracy</p>
                  <p className="text-2xl text-accent font-bold">{Math.min(100, level * 15)}%</p>
                </div>
              </div>
              <Button onClick={() => { setLevel(1); setScore(0); setGameState('idle'); }} variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">Re-Initialize</Button>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-center gap-4">
              {sequence.map((n, i) => (
                <div key={i} className="w-16 h-16 glass-card rounded-xl flex items-center justify-center text-xl font-bold border-primary/20">
                  {n}
                </div>
              ))}
              <div className="w-16 h-16 bg-primary/10 border-2 border-dashed border-primary/40 rounded-xl flex items-center justify-center text-primary animate-pulse">
                ?
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {options.map((opt, i) => (
                <Button 
                  key={i} 
                  onClick={() => handleChoice(opt)}
                  variant="outline"
                  className="h-20 text-xl font-bold hover:bg-primary/20 hover:border-primary transition-all"
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
