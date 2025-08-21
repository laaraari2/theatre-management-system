// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB4q6_RuoN3C0T9vc9n-dcq9p21N3I4CAQ",
  authDomain: "theatre-activities.firebaseapp.com",
  projectId: "theatre-activities",
  storageBucket: "theatre-activities.firebasestorage.app",
  messagingSenderId: "213207908071",
  appId: "1:213207908071:web:b1a2b4552c186ad3576c42",
  measurementId: "G-W4J02STN0N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Export app for compatibility
export { app };
export default app;