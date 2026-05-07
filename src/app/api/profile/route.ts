import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuthenticatedUser } from '@/lib/mongo-auth';
import { createDefaultProfile } from '@/lib/brainforge-profile';

function nowIso() {
  return new Date().toISOString();
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await requireAuthenticatedUser(request);
    const db = await getDatabase();
    const profiles = db.collection('profiles');
    const users = db.collection('users');
    const timestamp = nowIso();

    const profile = await profiles.findOne({ firebaseUid: decoded.uid });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found.', registered: false },
        { status: 404 }
      );
    }

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

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to load profile.' }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const decoded = await requireAuthenticatedUser(request);
    const body = await request.json();
    const db = await getDatabase();
    const profiles = db.collection('profiles');
    const users = db.collection('users');
    const timestamp = nowIso();

    const profileUpdates: Record<string, string> = {};
    if (typeof body.username === 'string') profileUpdates.username = body.username.trim();
    if (typeof body.fullName === 'string') profileUpdates.fullName = body.fullName.trim();
    if (typeof body.photoURL === 'string') profileUpdates.photoURL = body.photoURL;

    if (Object.keys(profileUpdates).length === 0) {
      return NextResponse.json({ error: 'No profile changes supplied.' }, { status: 400 });
    }

    const existingProfile = await profiles.findOne({ firebaseUid: decoded.uid });
    if (!existingProfile) {
      return NextResponse.json({ error: 'Profile not found.', registered: false }, { status: 404 });
    }

    await profiles.updateOne(
      { firebaseUid: decoded.uid },
      {
        $set: {
          ...profileUpdates,
          email: decoded.email || '',
          updatedAt: timestamp,
        },
      },
      { upsert: false }
    );

    await users.updateOne(
      { firebaseUid: decoded.uid },
      {
        $set: {
          email: decoded.email || '',
          updatedAt: timestamp,
          ...(profileUpdates.username ? { username: profileUpdates.username } : {}),
        },
        $setOnInsert: {
          firebaseUid: decoded.uid,
          createdAt: timestamp,
        },
      },
      { upsert: true }
    );

    const profile = await profiles.findOne({ firebaseUid: decoded.uid });
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to update profile.' }, { status: 400 });
  }
}
