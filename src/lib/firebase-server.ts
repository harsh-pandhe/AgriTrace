import { initializeApp, getApps, cert, App, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Server-side Firebase Admin initialization
function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Option 1: Use service account JSON from environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      return initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
    }
  }

  // Option 2: Use GOOGLE_APPLICATION_CREDENTIALS file path
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return initializeApp({
        credential: applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } catch (e) {
      console.error('Failed to use GOOGLE_APPLICATION_CREDENTIALS:', e);
    }
  }

  // Option 3: Fallback for Google Cloud environments (Cloud Run, Cloud Functions, etc.)
  // This will only work in GCP environments with default credentials
  console.warn('Firebase Admin: No explicit credentials found, attempting default initialization');
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const app = initializeFirebaseAdmin();
const db = getFirestore(app);

export { app, db };
