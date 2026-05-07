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

  return firebaseAdminApp;
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}
