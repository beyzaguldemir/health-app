import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './config';

const todayStr = () => new Date().toISOString().split('T')[0];

const DEFAULT_STATS = {
  weeklyCompletionRate: 0,
  totalActivitiesCompleted: 0,
  totalBreathingSessions: 0,
  totalStressReductionScore: 0,
  totalSelfCareScore: 0,
  streakDays: 0,
  lastActiveDate: null,
};

export const getUserStats = async (uid) => {
  try {
    const snap = await getDoc(doc(db, 'userStats', uid));
    if (snap.exists()) return { success: true, data: snap.data() };
    return { success: true, data: DEFAULT_STATS };
  } catch (error) {
    console.error('getUserStats:', error.message);
    return { success: false, error: error.message, data: DEFAULT_STATS };
  }
};

export const updateWeeklyCompletionRate = async (uid, rate) => {
  try {
    await setDoc(doc(db, 'userStats', uid), { weeklyCompletionRate: rate }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Her aktivite tamamlandığında çağrılır. Streak, skor ve sayaçları günceller.
export const recordCompletion = async (uid, {
  kategori = 'spor',
  stressReductionScore = 5,
  selfCareScore = 3,
  date,
} = {}) => {
  try {
    const today = date || todayStr();
    const ref = doc(db, 'userStats', uid);
    const snap = await getDoc(ref);
    const existing = snap.exists() ? snap.data() : {};

    const lastActive = existing.lastActiveDate || null;
    let newStreak = existing.streakDays || 0;

    if (lastActive && lastActive !== today) {
      const diffMs = new Date(today) - new Date(lastActive);
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else if (!lastActive) {
      newStreak = 1;
    }

    const updates = {
      totalActivitiesCompleted: increment(1),
      totalStressReductionScore: increment(stressReductionScore),
      totalSelfCareScore: increment(selfCareScore),
      streakDays: newStreak,
      lastActiveDate: today,
    };

    if (kategori === 'nefes') {
      updates.totalBreathingSessions = increment(1);
    }

    if (!snap.exists()) {
      await setDoc(ref, {
        uid,
        ...DEFAULT_STATS,
        totalActivitiesCompleted: 1,
        totalBreathingSessions: kategori === 'nefes' ? 1 : 0,
        totalStressReductionScore: stressReductionScore,
        totalSelfCareScore: selfCareScore,
        streakDays: newStreak,
        lastActiveDate: today,
        createdAt: Date.now(),
      });
    } else {
      await updateDoc(ref, updates);
    }

    return { success: true };
  } catch (error) {
    console.error('recordCompletion:', error.message);
    return { success: false, error: error.message };
  }
};
