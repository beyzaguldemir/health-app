import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCg_fDu17pg8yYRyb7XngjS9P6rti6hbzA",
  authDomain: "health-tracker-fa942.firebaseapp.com",
  projectId: "health-tracker-fa942",
  storageBucket: "health-tracker-fa942.firebasestorage.app",
  messagingSenderId: "250353231182",
  appId: "1:250353231182:web:ad44ea1b11490bd9d22a1f"
};

const isNew = getApps().length === 0;
const app = isNew ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

// Web: tarayıcı localStorage ile oturum kalıcı olur.
// Native: AsyncStorage v2 ile oturum uygulama yeniden açılsa da devam eder.
// Fast Refresh: app zaten kayıtlı, getAuth ile mevcut instance alınır.
let auth;
if (!isNew) {
  auth = getAuth(app);
} else if (Platform.OS === 'web') {
  auth = initializeAuth(app, { persistence: browserLocalPersistence });
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export default app;
