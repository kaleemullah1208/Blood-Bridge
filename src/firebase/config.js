import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCibdgUXcuCpAh06qQBNBHi3ZJxBDlxmOc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "blood-bridge-6abc0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "blood-bridge-6abc0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "blood-bridge-6abc0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "160879433675",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:160879433675:web:c9460050aab2483039084e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CMLGBT6F7J"
};

// Check if valid Firebase configuration is present
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "your_api_key_here"
);

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);

// Safe Analytics initialization (only in supported browser environments)
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("Firebase Analytics could not be initialized:", err);
  });
}

export { analytics };
export default app;
