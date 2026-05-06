"use client"

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppState } from '@/components/providers/StateProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCcw, ArrowRight } from 'lucide-react';

export function PatternRecall() {
  const { completeGame } = useAppState();
  const [gridSize, setGridSize] = useState(3);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'result'>('idle');
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState('Watch the pattern');
  const [score, setScore] = useState(0);

  const startLevel = useCallback(() => {
    const patternSize = 2 + Math.floor(level / 2);
    const newPattern: number[] = [];
    const totalCells = gridSize * gridSize;

    for (let i = 0; i < patternSize; i++) {
      let rand;
      do { rand = Math.floor(Math.random() * totalCells); } while (newPattern.includes(rand));
      newPattern.push(rand);
    }

    setPattern(newPattern);
    setUserInput([]);
    setGameState('showing');
    setMessage('Memorizing...');

    setTimeout(() => {
      setGameState('playing');
      setMessage('Reproduce the pattern');
    }, 1000 + (patternSize * 400));
  }, [level, gridSize]);

  const handleCellClick = (idx: number) => {
    if (gameState !== 'playing') return;

    if (userInput.includes(idx)) return;

    const newInputs = [...userInput, idx];
    setUserInput(newInputs);

    if (pattern.includes(idx)) {
      if (newInputs.length === pattern.length) {
        // Success
        setScore(prev => prev + (level * 100));
        setLevel(prev => prev + 1);
        setMessage('Correct!');
        setTimeout(startLevel, 1000);
      }
    } else {
      // Failure
      setGameState('result');
      setMessage('Game Over');
      completeGame('memory-pattern', score, Math.min(100, (level * 10)), 1.5);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-headline font-bold">Pattern Recall</h2>
        <p className="text-muted-foreground">{message}</p>
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
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <RefreshCcw className="text-primary h-10 w-10" />
              </div>
              <p className="text-muted-foreground">Test your spatial memory. Repeat the sequence of lighted tiles.</p>
              <Button onClick={startLevel} size="lg" className="w-full bg-primary font-bold">Start Neural Sync</Button>
            </Card>
          </motion.div>
        ) : gameState === 'result' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass-card p-12 text-center space-y-6 border-primary/40">
              <Trophy className="text-accent h-16 w-16 mx-auto" />
              <h3 className="text-4xl font-headline font-bold">Session Complete</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Final Score</p>
                  <p className="text-2xl text-primary font-bold">{score}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Accuracy</p>
                  <p className="text-2xl text-accent font-bold">{Math.min(100, level * 10)}%</p>
                </div>
              </div>
              <Button onClick={() => { setLevel(1); setScore(0); setGameState('idle'); }} variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">Try Again</Button>
            </Card>
          </motion.div>
        ) : (
          <div 
            className="grid gap-4" 
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
              const isPattern = pattern.includes(idx);
              const isSelected = userInput.includes(idx);
              const isCorrect = isSelected && isPattern;
              const isShowing = gameState === 'showing' && isPattern;

              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCellClick(idx)}
                  className={`
                    aspect-square rounded-xl border-2 transition-all duration-300
                    ${isShowing ? 'bg-primary border-primary glow-primary' : ''}
                    ${isCorrect ? 'bg-primary/40 border-primary' : ''}
                    ${isSelected && !isPattern ? 'bg-destructive/40 border-destructive' : ''}
                    ${!isShowing && !isSelected ? 'bg-muted/30 border-white/5' : ''}
                  `}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
