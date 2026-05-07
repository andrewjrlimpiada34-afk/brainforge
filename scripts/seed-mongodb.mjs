import 'dotenv/config';
import { MongoClient, ServerApiVersion } from 'mongodb';

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'brainforge';

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI in environment.');
}

const client = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const games = [
  {
    gameId: 'memory-pattern',
    name: 'Pattern Recall',
    category: 'memory',
    description: 'Memorize and reproduce visual tile patterns.',
    isActive: true,
  },
  {
    gameId: 'logic-sequence',
    name: 'Neural Sequences',
    category: 'logic',
    description: 'Identify the next number in a reasoning chain.',
    isActive: true,
  },
  {
    gameId: 'speed-chrono',
    name: 'Chrono-Tap',
    category: 'speed',
    description: 'React as quickly as possible when the signal appears.',
    isActive: true,
  },
  {
    gameId: 'math-arithmetic',
    name: 'Prime Flow',
    category: 'math',
    description: 'Solve rapid arithmetic problems under pressure.',
    isActive: true,
  },
  {
    gameId: 'verbal-lexicon',
    name: 'Neural Lexicon',
    category: 'memory',
    description: 'Recall whether words appeared in the memorization list.',
    isActive: true,
  },
];

const achievements = [
  {
    achievementKey: 'first-sync',
    title: 'First Sync',
    description: 'Complete your first training session.',
    xpReward: 100,
  },
  {
    achievementKey: 'streak-3',
    title: 'Signal Keeper',
    description: 'Reach a 3-day streak.',
    xpReward: 250,
  },
  {
    achievementKey: 'xp-1000',
    title: 'Neural Lift-Off',
    description: 'Accumulate 1,000 XP.',
    xpReward: 500,
  },
];

const challengeDate = new Date().toISOString().slice(0, 10);
const dailyChallenges = [
  {
    challengeKey: `memory-baseline-${challengeDate}`,
    title: 'Memory Baseline',
    description: 'Complete 3 rounds of Pattern Recall.',
    targetValue: 3,
    xpReward: 150,
    challengeType: 'complete_rounds',
    targetGameId: 'memory-pattern',
    challengeDate,
  },
  {
    challengeKey: `logic-chain-${challengeDate}`,
    title: 'Logic Chain',
    description: 'Finish 2 Neural Sequences with solid accuracy.',
    targetValue: 2,
    xpReward: 175,
    challengeType: 'complete_games',
    targetGameId: 'logic-sequence',
    challengeDate,
  },
  {
    challengeKey: `speed-burst-${challengeDate}`,
    title: 'Speed Burst',
    description: 'Run 1 Chrono-Tap session and sharpen your reaction profile.',
    targetValue: 1,
    xpReward: 125,
    challengeType: 'complete_games',
    targetGameId: 'speed-chrono',
    challengeDate,
  },
];

async function seedCollection(collection, items, keyField) {
  const timestamp = new Date().toISOString();

  for (const item of items) {
    await collection.updateOne(
      { [keyField]: item[keyField] },
      {
        $set: {
          ...item,
          updatedAt: timestamp,
        },
        $setOnInsert: {
          createdAt: timestamp,
        },
      },
      { upsert: true }
    );
  }
}

async function ensureIndexes(db) {
  await db.collection('users').createIndex({ firebaseUid: 1 }, { unique: true });
  await db.collection('profiles').createIndex({ firebaseUid: 1 }, { unique: true });
  await db.collection('games').createIndex({ gameId: 1 }, { unique: true });
  await db.collection('achievements').createIndex({ achievementKey: 1 }, { unique: true });
  await db.collection('daily_challenges').createIndex({ challengeKey: 1 }, { unique: true });
  await db.collection('game_sessions').createIndex({ firebaseUid: 1, playedAt: -1 });
  await db.collection('progress_history').createIndex({ firebaseUid: 1, recordedAt: -1 });
}

async function main() {
  await client.connect();
  const db = client.db(dbName);

  await ensureIndexes(db);
  await seedCollection(db.collection('games'), games, 'gameId');
  await seedCollection(db.collection('achievements'), achievements, 'achievementKey');
  await seedCollection(db.collection('daily_challenges'), dailyChallenges, 'challengeKey');

  console.log(`Mongo seed complete for database "${dbName}".`);
  console.log(`Games: ${games.length}, Achievements: ${achievements.length}, Daily challenges: ${dailyChallenges.length}`);
}

main()
  .catch((error) => {
    console.error('Mongo seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });
