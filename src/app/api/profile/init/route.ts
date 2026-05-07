import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuthenticatedUser } from '@/lib/mongo-auth';
import { createDefaultProfile } from '@/lib/brainforge-profile';

function nowIso() {
  return new Date().toISOString();
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await requireAuthenticatedUser(request);
    const body = await request.json();
    const db = await getDatabase();
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

    await profiles.updateOne(
      { firebaseUid: decoded.uid },
      {
        $setOnInsert: {
          ...profile,
          createdAt: timestamp,
        },
        $set: {
          fullName: profile.fullName,
          username: profile.username,
          email: profile.email,
          updatedAt: timestamp,
        },
      },
      { upsert: true }
    );

    const savedProfile = await profiles.findOne({ firebaseUid: decoded.uid });
    return NextResponse.json(savedProfile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to initialize profile.' }, { status: 400 });
  }
}
