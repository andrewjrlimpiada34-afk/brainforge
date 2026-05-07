import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function POST() {
  try {
    const cloudName = getRequiredEnv('CLOUDINARY_CLOUD_NAME');
    const apiKey = getRequiredEnv('CLOUDINARY_API_KEY');
    const apiSecret = getRequiredEnv('CLOUDINARY_API_SECRET');
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'brainforge/avatars';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(signatureBase).digest('hex');

    return NextResponse.json({
      cloudName,
      apiKey,
      folder,
      timestamp,
      signature,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unable to sign Cloudinary upload request.' },
      { status: 500 }
    );
  }
}
