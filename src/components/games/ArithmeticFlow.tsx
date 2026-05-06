"use client"

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppState } from '@/components/providers/StateProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Trophy, Timer } from 'lucide-react';

export function ArithmeticFlow() {
  const { completeGame } = useAppState();
  const [problem, setProblem] = useState({ text: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>('idle');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const generateProblem = useCallback(() => {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    
    let ans = 0;
    if (op === '+') ans = a + b;
    else if (op === '-') ans = a - b;
    else ans = a * b;

    setProblem({ text: `${a} ${op} ${b}`, answer: ans });
    setUserAnswer('');
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('result');
      completeGame('math-arithmetic', score, Math.min(100, correctCount * 5), 1.0);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, completeGame, correctCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userAnswer) === problem.answer) {
      setScore(prev => prev + 100);
      setCorrectCount(prev => prev + 1);
      generateProblem();
    } else {
      setTimeLeft(prev => Math.max(0, prev - 2)); // Penalty
      generateProblem();
    }
  };

  const startGame = () => {
    setScore(0);
    setCorrectCount(0);
    setTimeLeft(30);
    setGameState('playing');
    generateProblem();
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-headline font-bold">Prime Flow</h2>
        <p className="text-muted-foreground">Solve as many as possible before the link decays.</p>
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-primary">Time</p>
            <p className="text-2xl font-bold">{timeLeft}s</p>
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
              <Calculator className="text-primary h-16 w-16 mx-auto" />
              <p className="text-muted-foreground">Accelerate your mental processing with rapid arithmetic.</p>
              <Button onClick={startGame} size="lg" className="w-full bg-primary font-bold">Initialize Math Link</Button>
            </Card>
          </motion.div>
        ) : gameState === 'result' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass-card p-12 text-center space-y-6 border-primary/40">
              <Trophy className="text-accent h-16 w-16 mx-auto" />
              <h3 className="text-4xl font-headline font-bold">Session End</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Total Score</p>
                  <p className="text-2xl text-primary font-bold">{score}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Problems Solved</p>
                  <p className="text-2xl text-accent font-bold">{correctCount}</p>
                </div>
              </div>
              <Button onClick={() => setGameState('idle')} variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">Re-Sync</Button>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-12">
            <div className="text-center text-6xl font-bold font-headline tracking-tighter">
              {problem.text}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                autoFocus
                type="number" 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="text-center h-20 text-4xl font-bold bg-card border-white/10"
                placeholder="?"
              />
              <Button type="submit" className="w-full bg-primary h-12 font-bold uppercase tracking-widest">Enter Result</Button>
            </form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
