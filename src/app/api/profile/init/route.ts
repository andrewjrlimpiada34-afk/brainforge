import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuthenticatedUser } from '@/lib/mongo-auth';
import { createDefaultProfile } from '@/lib/brainforge-profile';

function nowIso() {
  return new Date().toISOString();
}

export async function POST(request: NextRequest) {
  // Verify the Firebase token first and return explicit errors so we can
  // determine whether failures are auth-related or infrastructure-related.
  let decoded;
  try {
    decoded = await requireAuthenticatedUser(request);
  } catch (err: any) {
    console.error('Auth error during profile init:', err?.message || err);
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 });
  }

  const body = await request.json().catch((err) => {
    console.error('Failed to parse JSON body:', err);
    throw new Error('Invalid request body.');
  });

  // Connect to DB and perform writes. Surface distinct errors for faster debugging.
  let db;
  try {
    db = await getDatabase();
  } catch (err: any) {
    console.error('Database connection error during profile init:', err?.message || err);
    return NextResponse.json({ error: 'Database connection failed.' }, { status: 503 });
  }

  try {
    const users = db.collection('users');
    const profiles = db.collection('profiles');
    const timestamp = nowIso();

    const profile = createDefaultProfile({
      firebaseUid: decoded.uid,
      email: decoded.email,
      username: body.username,
      fullName: body.fullName,
      photoURL: '',
    });

    await users.updateOne(
      { firebaseUid: decoded.uid },
      {
        $setOnInsert: {
          firebaseUid: decoded.uid,
          email: decoded.email || '',
          createdAt: timestamp,
        },
        $set: {
          username: profile.username,
          updatedAt: timestamp,
          lastLogin: timestamp,
        },
      },
      { upsert: true }
    );

    // Persist the full profile shape so GET /api/profile returns all fields
    // required by StateProvider (level/xp/stats/unlockedGames/etc.).
    await profiles.updateOne(
      { firebaseUid: decoded.uid },
      {
        $setOnInsert: {
          ...profile,
          createdAt: timestamp,
        },
        $set: {
          ...profile,
          email: profile.email,
          updatedAt: timestamp,
        },
      },
      { upsert: true }
    );

    const savedProfile = await profiles.findOne({ firebaseUid: decoded.uid });
    return NextResponse.json(savedProfile);
  } catch (err: any) {
    console.error('Unexpected error during profile init:', err);
    return NextResponse.json({ error: 'Unable to initialize profile.' }, { status: 500 });
  }
}
