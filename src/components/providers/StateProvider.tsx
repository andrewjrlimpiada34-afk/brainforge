"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
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
  isLoading: boolean;
  completeGame: (gameId: string, score: number, accuracy: number, speed: number) => void;
};

const DEFAULT_USER: UserProfile = {
  username: "BrainSoldier",
  level: 1,
  xp: 0,
  stats: { memory: 40, logic: 40, speed: 40, accuracy: 40 },
  streak: 0,
  unlockedGames: ['memory-pattern', 'logic-sequence', 'speed-chrono', 'math-arithmetic', 'verbal-lexicon']
};

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, isUserLoading } = useUser();
  const db = useFirestore();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!authUser || !db) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', authUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Map cognitiveStats array from Firestore back to object
          const stats: CognitiveStats = { memory: 40, logic: 40, speed: 40, accuracy: 40 };
          data.cognitiveStats?.forEach((s: string) => {
            const [key, val] = s.split(': ');
            if (key.toLowerCase() === 'memory') stats.memory = parseInt(val);
            if (key.toLowerCase() === 'logic') stats.logic = parseInt(val);
            if (key.toLowerCase() === 'speed') stats.speed = parseInt(val);
            if (key.toLowerCase() === 'accuracy') stats.accuracy = parseInt(val);
          });

          setProfile({
            username: data.username || "BrainSoldier",
            level: data.level || 1,
            xp: data.xp || 0,
            stats,
            streak: 3, // Default mock streak
            unlockedGames: ['memory-pattern', 'logic-sequence', 'speed-chrono', 'math-arithmetic', 'verbal-lexicon']
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [authUser, db]);

  const completeGame = async (gameId: string, score: number, accuracy: number, speed: number) => {
    if (!authUser || !db) return;

    const xpGained = Math.round(score / 10);
    const docRef = doc(db, 'users', authUser.uid);

    try {
      await updateDoc(docRef, {
        xp: increment(xpGained),
        updatedAt: new Date(),
      });

      // Update local state optimistically
      setProfile(prev => {
        const newXP = prev.xp + xpGained;
        const xpForNextLevel = prev.level * 1000;
        let newLevel = prev.level;
        let xpRemaining = newXP;

        if (newXP >= xpForNextLevel) {
          newLevel += 1;
          xpRemaining = newXP - xpForNextLevel;
          updateDoc(docRef, { level: newLevel, xp: xpRemaining });
          toast({ title: "LEVEL UP!", description: `Welcome to Level ${newLevel}.` });
        }

        return { ...prev, xp: xpRemaining, level: newLevel };
      });

      toast({ title: "Module Complete", description: `Synchronized ${xpGained} XP.` });
    } catch (err) {
      console.error("Error updating game completion:", err);
    }
  };

  return (
    <StateContext.Provider value={{ user: profile, isLoading: isUserLoading || loading, completeGame }}>
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
