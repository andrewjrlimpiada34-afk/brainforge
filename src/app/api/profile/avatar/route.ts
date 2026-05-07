import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getDatabase } from '@/lib/mongodb';
import { requireAuthenticatedUser } from '@/lib/mongo-auth';
import { createDefaultProfile } from '@/lib/brainforge-profile';

export const runtime = 'nodejs';

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

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadData = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Cloudinary upload failed.'));
            return;
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      stream.end(buffer);
    });

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
