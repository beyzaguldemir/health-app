import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from './config';

export const saveSugarRecord = async (uid, sugarValue) => {
  try {
    const record = {
      value: sugarValue,
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };
    const docRef = await addDoc(
      collection(db, 'users', uid, 'bloodSugarRecords'),
      record
    );
    return { success: true, id: docRef.id, ...record };
  } catch (error) {
    console.error('saveSugarRecord hata:', error.code, error.message);
    return { success: false, error: error.message };
  }
};

export const getSugarRecords = async (uid) => {
  try {
    const q = query(
      collection(db, 'users', uid, 'bloodSugarRecords'),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((d) => {
      records.push({ id: d.id, ...d.data() });
    });
    return { success: true, data: records };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
};

export const deleteSugarRecord = async (uid, recordId) => {
  try {
    await deleteDoc(doc(db, 'users', uid, 'bloodSugarRecords', recordId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
