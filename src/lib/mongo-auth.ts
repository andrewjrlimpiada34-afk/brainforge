import { NextRequest } from 'next/server';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';

export async function requireAuthenticatedUser(request: NextRequest): Promise<DecodedIdToken> {
  const authorization = request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Missing authorization token.');
  }

  const idToken = authorization.slice('Bearer '.length);
  return getFirebaseAdminAuth().verifyIdToken(idToken);
}
