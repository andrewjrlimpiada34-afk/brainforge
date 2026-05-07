import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Missing required environment variable: MONGODB_URI');
}

const globalForMongo = globalThis as typeof globalThis & {
  __mongoClientPromise?: Promise<MongoClient>;
};

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const mongoClientPromise =
  globalForMongo.__mongoClientPromise ?? client.connect();

if (process.env.NODE_ENV !== 'production') {
  globalForMongo.__mongoClientPromise = mongoClientPromise;
}

export async function getDatabase() {
  const dbName = process.env.MONGODB_DB_NAME || 'brainforge';
  const mongoClient = await mongoClientPromise;
  return mongoClient.db(dbName);
}
