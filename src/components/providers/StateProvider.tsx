"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export type CognitiveStats = {
  memory: number;
  logic: number;
  speed: number;
  accuracy: number;
};

export type UserProfile = {
  username: string;
  level: number;
  xp: number;
  stats: CognitiveStats;
  streak: number;
  unlockedGames: string[];
};

type StateContextType = {
  user: UserProfile;
  addXP: (amount: number) => void;
  updateStats: (newStats: Partial<CognitiveStats>) => void;
  completeGame: (gameId: string, score: number, accuracy: number, speed: number) => void;
};

const DEFAULT_USER: UserProfile = {
  username: "BrainSoldier",
  level: 1,
  xp: 0,
  stats: {
    memory: 40,
    logic: 40,
    speed: 40,
    accuracy: 40
  },
  streak: 3,
  unlockedGames: ['memory-pattern', 'logic-sequence', 'speed-chrono', 'math-arithmetic', 'verbal-lexicon']
};

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  useEffect(() => {
    const saved = localStorage.getItem('brainforge_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load user state", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('brainforge_user', JSON.stringify(user));
  }, [user]);

  const addXP = (amount: number) => {
    setUser(prev => {
      const newXP = prev.xp + amount;
      const xpForNextLevel = prev.level * 1000;
      let newLevel = prev.level;
      let xpRemaining = newXP;

      if (newXP >= xpForNextLevel) {
        newLevel += 1;
        xpRemaining = newXP - xpForNextLevel;
        toast({
          title: "LEVEL UP!",
          description: `Welcome to Level ${newLevel}, Brain Soldier.`,
        });
      }

      return { ...prev, xp: xpRemaining, level: newLevel };
    });
  };

  const updateStats = (newStats: Partial<CognitiveStats>) => {
    setUser(prev => ({
      ...prev,
      stats: { ...prev.stats, ...newStats }
    }));
  };

  const completeGame = (gameId: string, score: number, accuracy: number, speed: number) => {
    const xpGained = Math.round(score / 10);
    addXP(xpGained);
    
    const statMapping: Record<string, keyof CognitiveStats> = {
      'memory-pattern': 'memory',
      'logic-sequence': 'logic',
      'speed-chrono': 'speed',
      'math-arithmetic': 'logic',
      'verbal-lexicon': 'memory'
    };

    const targetStat = statMapping[gameId];
    if (targetStat) {
      setUser(prev => {
        const currentVal = prev.stats[targetStat];
        const newScore = Math.min(100, Math.max(0, currentVal + (accuracy / 100)));
        return {
          ...prev,
          stats: {
            ...prev.stats,
            [targetStat]: newScore,
            accuracy: Math.min(100, Math.max(0, prev.stats.accuracy + (accuracy - 50) / 100))
          }
        };
      });
    }

    toast({
      title: "Module Complete",
      description: `Synchronized ${xpGained} XP to neural profile.`,
    });
  };

  return (
    <StateContext.Provider value={{ user, addXP, updateStats, completeGame }}>
      {children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
}
