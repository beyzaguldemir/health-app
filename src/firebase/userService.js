import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';

export const createUserProfile = async (uid, profileData) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...profileData,
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (uid) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (uid, updates) => {
  try {
    await updateDoc(doc(db, 'users', uid), updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
