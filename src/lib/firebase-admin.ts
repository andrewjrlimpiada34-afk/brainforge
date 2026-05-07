import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getPrivateKey() {
  return getRequiredEnv('FIREBASE_ADMIN_PRIVATE_KEY').replace(/\\n/g, '\n');
}

let firebaseAdminApp: App;

export function getFirebaseAdminApp() {
  if (firebaseAdminApp) return firebaseAdminApp;

  if (getApps().length > 0) {
    firebaseAdminApp = getApps()[0]!;
    return firebaseAdminApp;
  }

  firebaseAdminApp = initializeApp({
    credential: cert({
      projectId: getRequiredEnv('FIREBASE_ADMIN_PROJECT_ID'),
      clientEmail: getRequiredEnv('FIREBASE_ADMIN_CLIENT_EMAIL'),
      privateKey: getPrivateKey(),
    }),
  });

  // Reduce TLS-related handshake problems in some node environments.
  // This is safe for outbound HTTPS calls used by Firebase Admin token verification.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED ?? '1';

  return firebaseAdminApp;
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}
