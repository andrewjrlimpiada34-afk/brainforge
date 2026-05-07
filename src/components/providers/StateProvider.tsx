"use client"

import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { authenticatedFetch } from '@/lib/client-api';
import {
  ALL_GAMES,
  clampStat,
  createDefaultProfile,
  type BrainforgeProfile,
  type CognitiveStats,
  type GameSessionPayload,
} from '@/lib/brainforge-profile';
import { toast } from '@/hooks/use-toast';

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

function mapProfile(profile: Partial<BrainforgeProfile> | null | undefined, authFallback?: { uid: string; email?: string | null }): UserProfile {
  const fallback = authFallback
    ? createDefaultProfile({ firebaseUid: authFallback.uid, email: authFallback.email })
    : createDefaultProfile({ firebaseUid: 'local-fallback' });

  return {
    username: profile?.username || fallback.username,
    fullName: profile?.fullName || fallback.fullName,
    email: profile?.email || fallback.email,
    photoURL: profile?.photoURL || fallback.photoURL,
    level: profile?.level || fallback.level,
    xp: profile?.xp || fallback.xp,
    stats: {
      memory: clampStat(profile?.stats?.memory ?? fallback.stats.memory),
      logic: clampStat(profile?.stats?.logic ?? fallback.stats.logic),
      speed: clampStat(profile?.stats?.speed ?? fallback.stats.speed),
      accuracy: clampStat(profile?.stats?.accuracy ?? fallback.stats.accuracy),
      math: clampStat(profile?.stats?.math ?? fallback.stats.math),
    },
    streak: profile?.streak || fallback.streak,
    unlockedGames: Array.isArray(profile?.unlockedGames) && profile!.unlockedGames!.length > 0 ? profile!.unlockedGames! : [...ALL_GAMES],
    gamesPlayed: profile?.gamesPlayed || fallback.gamesPlayed,
  };
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading } = useUser();
  const [profile, setProfile] = useState<UserProfile>(mapProfile(null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!authUser) {
        setProfile(mapProfile(null));
        setLoading(false);
        return;
      }

      try {
        const response = await authenticatedFetch<BrainforgeProfile>(authUser, '/api/profile');
        setProfile(mapProfile(response, { uid: authUser.uid, email: authUser.email }));
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfile(mapProfile(null, { uid: authUser.uid, email: authUser.email }));
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    loadProfile();
  }, [authUser]);

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!authUser) return;

    const updated = await authenticatedFetch<BrainforgeProfile>(authUser, '/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    setProfile(mapProfile(updated, { uid: authUser.uid, email: authUser.email }));
  };

  const completeGame = async (gameId: string, score: number, accuracy: number, speed: number) => {
    if (!authUser) return;

    const xpEarned = Math.max(10, Math.round(score / 10));
    const payload: GameSessionPayload = {
      gameId,
      score,
      accuracy,
      speed,
      xpEarned,
      difficultyLevel: Math.max(1, Math.round((accuracy + Math.max(0, score / 100)) / 20)),
      timeSpent: Math.max(1, Math.round(speed * 10)),
    };

    try {
      const response = await authenticatedFetch<{ profile: BrainforgeProfile; leveledUp: boolean }>(
        authUser,
        '/api/game-sessions',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      setProfile(mapProfile(response.profile, { uid: authUser.uid, email: authUser.email }));

      if (response.leveledUp) {
        toast({ title: "LEVEL UP!", description: `Welcome to Level ${response.profile.level}.` });
      }
      toast({ title: "Module Complete", description: `Synchronized ${xpEarned} XP.` });
    } catch (error) {
      console.error('Error updating game completion:', error);
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "The session was not saved. Check your backend configuration and try again.",
      });
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
