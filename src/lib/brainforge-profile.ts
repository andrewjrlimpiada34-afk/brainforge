export const ALL_GAMES = ['memory-pattern', 'logic-sequence', 'speed-chrono', 'math-arithmetic', 'verbal-lexicon'] as const;

export type CognitiveStats = {
  memory: number;
  logic: number;
  speed: number;
  accuracy: number;
  math: number;
};

export type BrainforgeProfile = {
  firebaseUid: string;
  username: string;
  fullName: string;
  email: string;
  photoURL: string;
  level: number;
  xp: number;
  streak: number;
  gamesPlayed: number;
  unlockedGames: string[];
  stats: CognitiveStats;
  createdAt?: string;
  updatedAt?: string;
};

export type GameSessionPayload = {
  gameId: string;
  score: number;
  accuracy: number;
  speed: number;
  xpEarned: number;
  difficultyLevel: number;
  timeSpent: number;
};

export function clampStat(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function deriveUsername(email?: string | null) {
  if (!email) return 'Operative';
  return email.split('@')[0] || 'Operative';
}

export function createDefaultStats(): CognitiveStats {
  return { memory: 0, logic: 0, speed: 0, accuracy: 0, math: 0 };
}

export function createDefaultProfile(params: {
  firebaseUid: string;
  email?: string | null;
  username?: string;
  fullName?: string;
  photoURL?: string;
}): BrainforgeProfile {
  return {
    firebaseUid: params.firebaseUid,
    username: params.username?.trim() || deriveUsername(params.email),
    fullName: params.fullName?.trim() || '',
    email: params.email || '',
    photoURL: params.photoURL || '',
    level: 1,
    xp: 0,
    streak: 0,
    gamesPlayed: 0,
    unlockedGames: [...ALL_GAMES],
    stats: createDefaultStats(),
  };
}

export function deriveRankedStats(current: CognitiveStats, gameId: string, accuracy: number, speed: number): CognitiveStats {
  const next = { ...current };
  const normalizedAccuracy = clampStat(accuracy);
  const speedScore = clampStat(speed >= 1 ? Math.min(100, speed * 20) : speed * 100);

  if (gameId === 'memory-pattern') next.memory = clampStat(current.memory + 6);
  if (gameId === 'logic-sequence') next.logic = clampStat(current.logic + 6);
  if (gameId === 'speed-chrono') next.speed = clampStat(Math.max(current.speed + 6, speedScore));
  if (gameId === 'math-arithmetic') next.math = clampStat(current.math + 6);
  if (gameId === 'verbal-lexicon') next.memory = clampStat(current.memory + 4);

  next.accuracy = clampStat(Math.max(current.accuracy, normalizedAccuracy));
  if (gameId !== 'speed-chrono') {
    next.speed = clampStat(Math.max(current.speed, speedScore));
  }

  return next;
}

export function calculateNextProgress(profile: BrainforgeProfile, payload: GameSessionPayload) {
  const totalXp = profile.xp + payload.xpEarned;
  const xpForNextLevel = profile.level * 1000;
  const leveledUp = totalXp >= xpForNextLevel;
  const level = leveledUp ? profile.level + 1 : profile.level;
  const xp = leveledUp ? totalXp - xpForNextLevel : totalXp;
  const stats = deriveRankedStats(profile.stats, payload.gameId, payload.accuracy, payload.speed);

  return {
    xp,
    level,
    stats,
    leveledUp,
    gamesPlayed: profile.gamesPlayed + 1,
    streak: Math.max(1, profile.streak + 1),
  };
}
