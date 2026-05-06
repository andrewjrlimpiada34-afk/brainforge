"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppState } from '@/components/providers/StateProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Timer } from 'lucide-react';

export function ChronoTap() {
  const { completeGame } = useAppState();
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTest = () => {
    setGameState('waiting');
    const delay = Math.floor(Math.random() * 3000) + 1000;
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const handleTap = () => {
    if (gameState === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      alert('Too early! Penalizing score.');
      setGameState('idle');
      return;
    }

    if (gameState === 'ready') {
      const now = Date.now();
      const diff = now - startTime;
      setReactionTime(diff);
      const points = Math.max(0, 1000 - diff);
      setScore(prev => prev + points);
      setAttempts(prev => prev + 1);
      
      if (attempts >= 4) {
        setGameState('result');
        completeGame('speed-chrono', score + points, 100, diff / 1000);
      } else {
        setGameState('idle');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-headline font-bold">Chrono-Tap</h2>
        <p className="text-muted-foreground">Tap as soon as the neural link turns green.</p>
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-primary">Attempt</p>
            <p className="text-2xl font-bold">{attempts + 1}/5</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-accent">Total Score</p>
            <p className="text-2xl font-bold">{score}</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'result' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass-card p-12 text-center space-y-6 border-primary/40">
              <Zap className="text-primary h-16 w-16 mx-auto" />
              <h3 className="text-4xl font-headline font-bold">Test Complete</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Final Score</p>
                  <p className="text-2xl text-primary font-bold">{score}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Avg Reaction</p>
                  <p className="text-2xl text-accent font-bold">{Math.round(score / 5)}ms</p>
                </div>
              </div>
              <Button onClick={() => { setAttempts(0); setScore(0); setGameState('idle'); }} variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">Reset Timer</Button>
            </Card>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            <button
              onClick={gameState === 'idle' ? startTest : handleTap}
              className={`
                w-64 h-64 rounded-full border-8 transition-all duration-100 flex items-center justify-center text-2xl font-bold uppercase tracking-widest
                ${gameState === 'idle' ? 'bg-muted/20 border-white/10 text-muted-foreground' : ''}
                ${gameState === 'waiting' ? 'bg-orange-500/20 border-orange-500 animate-pulse text-orange-500' : ''}
                ${gameState === 'ready' ? 'bg-primary border-primary text-primary-foreground glow-primary scale-110' : ''}
              `}
            >
              {gameState === 'idle' ? 'Start' : gameState === 'waiting' ? 'Wait...' : 'Tap Now!'}
            </button>
            {reactionTime > 0 && gameState === 'idle' && (
              <p className="text-primary font-bold">Last Reaction: {reactionTime}ms</p>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
