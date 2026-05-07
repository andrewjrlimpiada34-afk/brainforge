import { NextRequest } from 'next/server';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';

export async function requireAuthenticatedUser(request: NextRequest): Promise<DecodedIdToken> {
  const authorization = request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Missing authorization token.');
  }

  const idToken = authorization.slice('Bearer '.length);
  try {
    return await getFirebaseAdminAuth().verifyIdToken(idToken);
  } catch (err: any) {
    // Server-side debugging to pinpoint TLS/network vs token issues.
    // Keep messages compact to avoid leaking sensitive token data.
    console.error('[auth] verifyIdToken failed:', {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });
    throw err;
  }
}
