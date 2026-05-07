"use client"

import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export type CognitiveStats = {
  memory: number;
  logic: number;
  speed: number;
  accuracy: number;
};

export type UserProfile = {
  username: string;
  fullName: string;
  email: string;
  photoURL: string;
  level: number;
  xp: number;
  stats: CognitiveStats;
  streak: number;
  unlockedGames: string[];
  gamesPlayed: number;
};

type ProfileUpdate = Partial<Pick<UserProfile, 'username' | 'fullName' | 'photoURL'>>;

type StateContextType = {
  user: UserProfile;
  isLoading: boolean;
  hasProgress: boolean;
  completeGame: (gameId: string, score: number, accuracy: number, speed: number) => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
};

const ALL_GAMES = ['memory-pattern', 'logic-sequence', 'speed-chrono', 'math-arithmetic', 'verbal-lexicon'];

function clampStat(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function deriveUsername(email?: string | null) {
  if (!email) return 'Operative';
  return email.split('@')[0];
}

function buildDefaultProfile(email?: string | null): UserProfile {
  return {
    username: deriveUsername(email),
    fullName: '',
    email: email ?? '',
    photoURL: '',
    level: 1,
    xp: 0,
    stats: { memory: 0, logic: 0, speed: 0, accuracy: 0 },
    streak: 0,
    unlockedGames: ALL_GAMES,
    gamesPlayed: 0,
  };
}

function parseCognitiveStats(rawStats: unknown): CognitiveStats {
  const emptyStats: CognitiveStats = { memory: 0, logic: 0, speed: 0, accuracy: 0 };

  if (Array.isArray(rawStats)) {
    const parsed = { ...emptyStats };
    rawStats.forEach((entry) => {
      if (typeof entry !== 'string') return;

      const [label, value] = entry.split(': ');
      const parsedValue = Number.parseInt(value, 10);
      if (Number.isNaN(parsedValue)) return;

      switch (label.toLowerCase()) {
        case 'memory':
          parsed.memory = clampStat(parsedValue);
          break;
        case 'logic':
          parsed.logic = clampStat(parsedValue);
          break;
        case 'speed':
          parsed.speed = clampStat(parsedValue);
          break;
        case 'accuracy':
          parsed.accuracy = clampStat(parsedValue);
          break;
      }
    });
    return parsed;
  }

  if (rawStats && typeof rawStats === 'object') {
    const objectStats = rawStats as Partial<Record<keyof CognitiveStats, number>>;
    return {
      memory: clampStat(objectStats.memory ?? 0),
      logic: clampStat(objectStats.logic ?? 0),
      speed: clampStat(objectStats.speed ?? 0),
      accuracy: clampStat(objectStats.accuracy ?? 0),
    };
  }

  return emptyStats;
}

function serializeCognitiveStats(stats: CognitiveStats) {
  return [
    `Memory: ${clampStat(stats.memory)}`,
    `Logic: ${clampStat(stats.logic)}`,
    `Speed: ${clampStat(stats.speed)}`,
    `Accuracy: ${clampStat(stats.accuracy)}`,
  ];
}

function deriveRankedStats(current: CognitiveStats, gameId: string, accuracy: number, speed: number): CognitiveStats {
  const next = { ...current };
  const normalizedAccuracy = clampStat(accuracy);
  const speedScore = clampStat(speed >= 1 ? Math.min(100, speed * 20) : speed * 100);

  if (gameId === 'memory-pattern') next.memory = clampStat(current.memory + 6);
  if (gameId === 'logic-sequence') next.logic = clampStat(current.logic + 6);
  if (gameId === 'speed-chrono') next.speed = clampStat(Math.max(current.speed + 6, speedScore));
  if (gameId === 'math-arithmetic') next.logic = clampStat(current.logic + 4);
  if (gameId === 'verbal-lexicon') next.memory = clampStat(current.memory + 4);

  next.accuracy = clampStat(Math.max(current.accuracy, normalizedAccuracy));
  if (gameId !== 'speed-chrono') {
    next.speed = clampStat(Math.max(current.speed, speedScore));
  }

  return next;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading } = useUser();
  const db = useFirestore();
  const [profile, setProfile] = useState<UserProfile>(buildDefaultProfile());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!authUser || !db) {
        setProfile(buildDefaultProfile());
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', authUser.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setProfile(buildDefaultProfile(authUser.email));
          return;
        }

        const data = docSnap.data();
        setProfile({
          username: data.username || deriveUsername(authUser.email),
          fullName: data.name || '',
          email: data.email || authUser.email || '',
          photoURL: data.photoURL || '',
          level: data.level || 1,
          xp: data.xp || 0,
          stats: parseCognitiveStats(data.cognitiveStats),
          streak: data.streak || 0,
          unlockedGames: Array.isArray(data.unlockedGames) && data.unlockedGames.length > 0 ? data.unlockedGames : ALL_GAMES,
          gamesPlayed: data.gamesPlayed || 0,
        });
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    loadProfile();
  }, [authUser, db]);

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!authUser || !db) return;

    const cleanedUpdates: Record<string, string | object> = {};

    if (typeof updates.username === 'string') {
      cleanedUpdates.username = updates.username.trim();
    }
    if (typeof updates.fullName === 'string') {
      cleanedUpdates.name = updates.fullName.trim();
    }
    if (typeof updates.photoURL === 'string') {
      cleanedUpdates.photoURL = updates.photoURL;
    }

    if (Object.keys(cleanedUpdates).length === 0) return;

    await updateDoc(doc(db, 'users', authUser.uid), {
      ...cleanedUpdates,
      updatedAt: serverTimestamp(),
    });

    setProfile((prev) => ({
      ...prev,
      username: typeof updates.username === 'string' ? updates.username.trim() : prev.username,
      fullName: typeof updates.fullName === 'string' ? updates.fullName.trim() : prev.fullName,
      photoURL: typeof updates.photoURL === 'string' ? updates.photoURL : prev.photoURL,
    }));
  };

  const completeGame = async (gameId: string, score: number, accuracy: number, speed: number) => {
    if (!authUser || !db) return;

    const xpGained = Math.max(10, Math.round(score / 10));
    const currentProfile = profile;
    const totalXp = currentProfile.xp + xpGained;
    const xpForNextLevel = currentProfile.level * 1000;
    const leveledUp = totalXp >= xpForNextLevel;
    const nextLevel = leveledUp ? currentProfile.level + 1 : currentProfile.level;
    const nextXp = leveledUp ? totalXp - xpForNextLevel : totalXp;
    const nextStats = deriveRankedStats(currentProfile.stats, gameId, accuracy, speed);
    const nextGamesPlayed = currentProfile.gamesPlayed + 1;
    const nextStreak = Math.max(1, currentProfile.streak + 1);

    try {
      await updateDoc(doc(db, 'users', authUser.uid), {
        xp: nextXp,
        level: nextLevel,
        streak: nextStreak,
        gamesPlayed: nextGamesPlayed,
        cognitiveStats: serializeCognitiveStats(nextStats),
        updatedAt: serverTimestamp(),
      });

      setProfile((prev) => ({
        ...prev,
        xp: nextXp,
        level: nextLevel,
        streak: nextStreak,
        gamesPlayed: nextGamesPlayed,
        stats: nextStats,
      }));

      if (leveledUp) {
        toast({ title: "LEVEL UP!", description: `Welcome to Level ${nextLevel}.` });
      }

      toast({ title: "Module Complete", description: `Synchronized ${xpGained} XP.` });
    } catch (err) {
      console.error("Error updating game completion:", err);
    }
  };

  return (
    <StateContext.Provider
      value={{
        user: profile,
        isLoading: isUserLoading || loading,
        hasProgress: profile.gamesPlayed > 0 || profile.xp > 0,
        completeGame,
        updateProfile,
      }}
    >
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
