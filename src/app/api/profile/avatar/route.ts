import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuthenticatedUser } from '@/lib/mongo-auth';
import { createDefaultProfile } from '@/lib/brainforge-profile';

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function nowIso() {
  return new Date().toISOString();
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await requireAuthenticatedUser(request);
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No image file was provided.' }, { status: 400 });
    }

    const cloudName = getRequiredEnv('CLOUDINARY_CLOUD_NAME');
    const apiKey = getRequiredEnv('CLOUDINARY_API_KEY');
    const apiSecret = getRequiredEnv('CLOUDINARY_API_SECRET');
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'brainforge/avatars';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(signatureBase).digest('hex');

    const cloudinaryForm = new FormData();
    cloudinaryForm.append('file', file);
    cloudinaryForm.append('api_key', apiKey);
    cloudinaryForm.append('folder', folder);
    cloudinaryForm.append('timestamp', timestamp);
    cloudinaryForm.append('signature', signature);

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryForm,
    });

    const uploadData = await uploadResponse.json();
    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: uploadData.error?.message || 'Cloudinary upload failed.' },
        { status: 502 }
      );
    }

    const db = await getDatabase();
    const profiles = db.collection('profiles');
    const users = db.collection('users');
    const timestampIso = nowIso();
    const defaultProfile = createDefaultProfile({
      firebaseUid: decoded.uid,
      email: decoded.email,
    });

    await profiles.updateOne(
      { firebaseUid: decoded.uid },
      {
        $set: {
          photoURL: uploadData.secure_url,
          email: decoded.email || '',
          updatedAt: timestampIso,
        },
        $setOnInsert: {
          ...defaultProfile,
          createdAt: timestampIso,
        },
      },
      { upsert: true }
    );

    await users.updateOne(
      { firebaseUid: decoded.uid },
      {
        $set: {
          email: decoded.email || '',
          updatedAt: timestampIso,
        },
        $setOnInsert: {
          firebaseUid: decoded.uid,
          username: defaultProfile.username,
          createdAt: timestampIso,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      secureUrl: uploadData.secure_url,
      publicId: uploadData.public_id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unable to upload avatar.' },
      { status: 400 }
    );
  }
}
