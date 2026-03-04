import {
  collection, getDocs, query, where,
  updateDoc, doc, deleteDoc, setDoc, getDoc,
} from 'firebase/firestore';
import { db } from './config';
import { recordCompletion } from './statsService';

const todayStr = () => new Date().toISOString().split('T')[0];

// Haftanın gün tarihini döndür (0=Pazartesi … 6=Pazar)
export const getWeekDate = (dayIndex) => {
  const now = new Date();
  const day = now.getDay(); // JS: 0=Pazar
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const d = new Date(now);
  d.setDate(now.getDate() + mondayOffset + dayIndex);
  return d.toISOString().split('T')[0];
};

// Aktivite türüne göre varsayılan skorlar
const getDefaultScores = (type, kategori) => {
  if (kategori === 'nefes' || type === 'breathing') {
    return { stressReductionScore: 10, selfCareScore: 5 };
  }
  if (type === 'flexibility') return { stressReductionScore: 8, selfCareScore: 6 };
  if (type === 'cardio') return { stressReductionScore: 6, selfCareScore: 4 };
  if (type === 'strength') return { stressReductionScore: 5, selfCareScore: 4 };
  return { stressReductionScore: 5, selfCareScore: 3 };
};

// ─── Haftalık Aktiviteleri Kaydet ─────────────────────────────────────────────
export const saveWeeklyActivities = async (uid, weeklyWorkouts) => {
  try {
    const promises = weeklyWorkouts.map(async (workout, dayIndex) => {
      const date = getWeekDate(dayIndex);
      const scores = getDefaultScores(workout.type, workout.kategori);

      // Ana antrenman (dinlenme günleri hariç)
      if (!workout.isRest) {
        const id = `${date}_weekly_${workout.name.replace(/\s+/g, '_').slice(0, 20)}`;
        const ref = doc(db, 'users', uid, 'activities', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          await updateDoc(ref, {
            name: workout.name,
            duration: workout.duration,
            type: workout.type,
            description: workout.details,
            kategori: workout.kategori || 'spor',
            hedefSure: workout.duration,
            date,
            isWeekly: true,
            ...scores,
          });
        } else {
          await setDoc(ref, {
            name: workout.name,
            duration: workout.duration,
            type: workout.type,
            description: workout.details,
            kategori: workout.kategori || 'spor',
            hedefSure: workout.duration,
            completionRate: 0,
            tamamlananSure: 0,
            completed: false,
            date,
            createdAt: Date.now(),
            isWeekly: true,
            ...scores,
          });
        }
      }

      // Her gün için otomatik nefes egzersizi
      const breathId = `${date}_breathing_daily`;
      const breathRef = doc(db, 'users', uid, 'activities', breathId);
      const breathSnap = await getDoc(breathRef);
      if (!breathSnap.exists()) {
        await setDoc(breathRef, {
          name: 'Günlük Nefes Egzersizi',
          duration: 5,
          type: 'breathing',
          kategori: 'nefes',
          description: '4-4-4 Kutu Nefesi veya 4-7-8 tekniği ile 5 dk nefes egzersizi',
          hedefSure: 5,
          completionRate: 0,
          tamamlananSure: 0,
          completed: false,
          date,
          createdAt: Date.now() + dayIndex,
          isWeekly: true,
          stressReductionScore: 10,
          selfCareScore: 5,
        });
      }
    });

    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error('saveWeeklyActivities:', error.message);
    return { success: false, error: error.message };
  }
};

// ─── Bu Haftanın Tüm Aktiviteleri ────────────────────────────────────────────
export const getWeekActivities = async (uid) => {
  try {
    const monday = getWeekDate(0);
    const sunday = getWeekDate(6);
    const q = query(
      collection(db, 'users', uid, 'activities'),
      where('date', '>=', monday),
      where('date', '<=', sunday)
    );
    const snapshot = await getDocs(q);
    const all = [];
    snapshot.forEach((d) => all.push({ id: d.id, ...d.data() }));
    return { success: true, data: all };
  } catch (error) {
    console.error('getWeekActivities:', error.message);
    return { success: false, error: error.message, data: [] };
  }
};

// ─── Haftalık Tamamlanma Özeti (gün bazlı) ───────────────────────────────────
export const getWeekActivitiesStatus = async (uid) => {
  const result = await getWeekActivities(uid);
  if (!result.success) return { success: false, data: {} };

  const data = {};
  result.data.forEach((act) => {
    if (!data[act.date]) data[act.date] = { total: 0, completed: 0, activities: [] };
    data[act.date].total += 1;
    if (act.completed) data[act.date].completed += 1;
    data[act.date].activities.push(act);
  });
  return { success: true, data };
};

// ─── Bugünün Aktiviteleri ─────────────────────────────────────────────────────
export const getTodayActivities = async (uid) => {
  try {
    const q = query(
      collection(db, 'users', uid, 'activities'),
      where('date', '==', todayStr())
    );
    const snapshot = await getDocs(q);
    const activities = [];
    snapshot.forEach((d) => activities.push({ id: d.id, ...d.data() }));
    activities.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    return { success: true, data: activities };
  } catch (error) {
    console.error('getTodayActivities:', error.message);
    return { success: false, error: error.message, data: [] };
  }
};

// ─── Aktivite Tamamlandı / Tamamlanmadı ──────────────────────────────────────
// activityData opsiyonel; geçilirse tamamlama kaydedilir ve skorlar güncellenir
export const toggleActivity = async (uid, activityId, completed, activityData = null) => {
  try {
    const updates = {
      completed,
      completedAt: completed ? Date.now() : null,
      completionRate: completed ? 100 : 0,
      tamamlananSure: completed ? (activityData?.duration || 0) : 0,
    };

    await updateDoc(doc(db, 'users', uid, 'activities', activityId), updates);

    if (completed && activityData) {
      const scores = getDefaultScores(activityData.type, activityData.kategori);
      await recordCompletion(uid, {
        kategori: activityData.kategori || (activityData.type === 'breathing' ? 'nefes' : 'spor'),
        stressReductionScore: activityData.stressReductionScore ?? scores.stressReductionScore,
        selfCareScore: activityData.selfCareScore ?? scores.selfCareScore,
        date: activityData.date,
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ─── Aktivite Sil ─────────────────────────────────────────────────────────────
export const deleteActivity = async (uid, activityId) => {
  try {
    await deleteDoc(doc(db, 'users', uid, 'activities', activityId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ─── Manuel Aktivite Ekle ─────────────────────────────────────────────────────
export const addManualActivity = async (uid, name, duration) => {
  try {
    const id = `${todayStr()}_manual_${Date.now()}`;
    await setDoc(doc(db, 'users', uid, 'activities', id), {
      name,
      duration,
      type: 'manual',
      kategori: 'spor',
      description: 'Manuel eklendi',
      hedefSure: duration,
      completionRate: 0,
      tamamlananSure: 0,
      completed: false,
      date: todayStr(),
      createdAt: Date.now(),
      isWeekly: false,
      stressReductionScore: 5,
      selfCareScore: 3,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ─── Nefes Egzersizi Tamamlandığında Kaydet ───────────────────────────────────
export const saveBreathingSession = async (uid, { rounds, technique, durationMinutes }) => {
  try {
    const id = `${todayStr()}_breathing_session_${Date.now()}`;
    await setDoc(doc(db, 'users', uid, 'activities', id), {
      name: `Nefes Egzersizi (${technique})`,
      duration: durationMinutes || 5,
      type: 'breathing',
      kategori: 'nefes',
      description: `${technique} tekniği · ${rounds} tur`,
      hedefSure: 5,
      tamamlananSure: durationMinutes || 5,
      completionRate: 100,
      completed: true,
      completedAt: Date.now(),
      date: todayStr(),
      createdAt: Date.now(),
      isWeekly: false,
      rounds,
      stressReductionScore: 10,
      selfCareScore: 5,
    });

    await recordCompletion(uid, {
      kategori: 'nefes',
      stressReductionScore: 10,
      selfCareScore: 5,
      date: todayStr(),
    });

    return { success: true };
  } catch (error) {
    console.error('saveBreathingSession:', error.message);
    return { success: false, error: error.message };
  }
};
