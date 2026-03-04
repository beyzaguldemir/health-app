// Kas grubuna göre sabit egzersiz listesi — API çağrısı gerektirmez

export const WORKOUT_DATA = {
  göğüs: {
    label: 'Göğüs',
    icon: 'body-outline',
    color: '#4A90E2',
    exercises: [
      { name: 'Şınav', sets: 3, reps: '12', note: 'Dirsekleri 45° açıyla tut' },
      { name: 'Dumbbell Press', sets: 3, reps: '10', note: 'Göğüste tam gerginlik hisset' },
      { name: 'İnkline Şınav', sets: 3, reps: '10', note: 'Üst göğsü hedefler' },
      { name: 'Göğüs Germe', sets: 2, reps: '30 sn', note: 'Her setin ardından uygula' },
      { name: 'Plank', sets: 3, reps: '30 sn', note: 'Core sıkı, bel düz kalmalı' },
    ],
  },
  sırt: {
    label: 'Sırt',
    icon: 'barbell-outline',
    color: '#51CF66',
    exercises: [
      { name: 'Kürek Çekme (Direnç Bandı)', sets: 3, reps: '12', note: 'Kürek kemiklerini sıkıştır' },
      { name: 'Superman', sets: 3, reps: '15', note: 'Alt sırt güçlendirir' },
      { name: 'Lat Pulldown (Bant)', sets: 3, reps: '12', note: 'Dirseği aşağı çek' },
      { name: 'Dumbbell Row', sets: 3, reps: '10', note: 'Belini düz tut' },
      { name: 'Köprü (Glute Bridge)', sets: 3, reps: '15', note: 'Kalça ve alt sırt hedefler' },
    ],
  },
  bacak: {
    label: 'Bacak',
    icon: 'walk-outline',
    color: '#FF9800',
    exercises: [
      { name: 'Squat', sets: 3, reps: '15', note: 'Dizler ayak parmak hizasını geçmesin' },
      { name: 'Lunge', sets: 3, reps: '10 (her bacak)', note: 'Gövdeyi dik tut' },
      { name: 'Wall Sit', sets: 3, reps: '30 sn', note: 'Bacak 90° açıda dur' },
      { name: 'Calf Raise', sets: 4, reps: '20', note: 'Yavaş kontrollü hareket' },
      { name: 'Glute Bridge', sets: 3, reps: '15', note: 'Kalçayı sıkarak yukarı itin' },
    ],
  },
  omuz: {
    label: 'Omuz',
    icon: 'fitness-outline',
    color: '#9C27B0',
    exercises: [
      { name: 'Dumbbell Press', sets: 3, reps: '12', note: 'Dirsekleri öne getirme' },
      { name: 'Lateral Raise', sets: 3, reps: '12', note: 'Dirsekler hafif bükülü' },
      { name: 'Front Raise', sets: 3, reps: '10', note: 'Omuz hizasına kadar kaldır' },
      { name: 'Rear Delt Fly', sets: 3, reps: '12', note: 'Arka omzu hedefler' },
      { name: 'Neck Side Stretch', sets: 2, reps: '20 sn', note: 'Boyun-omuz gerilimini azaltır' },
    ],
  },
  karın: {
    label: 'Karın',
    icon: 'flame-outline',
    color: '#FF6B6B',
    exercises: [
      { name: 'Crunch', sets: 3, reps: '15', note: 'Boynu germeden uygula' },
      { name: 'Leg Raise', sets: 3, reps: '12', note: 'Beli yere yapıştır' },
      { name: 'Plank', sets: 3, reps: '40 sn', note: 'Kalçayı yukarı veya aşağı bırakma' },
      { name: 'Bicycle Crunch', sets: 3, reps: '20', note: 'Kontrollü, hızlı değil' },
      { name: 'Mountain Climber', sets: 3, reps: '20 sn', note: 'Core + kardiyo kombinasyonu' },
    ],
  },
  'tüm vücut': {
    label: 'Tüm Vücut',
    icon: 'body-outline',
    color: '#4A90E2',
    exercises: [
      { name: 'Burpee', sets: 3, reps: '10', note: 'Yüksek yoğunluklu tam vücut' },
      { name: 'Squat + Overhead Press', sets: 3, reps: '12', note: 'Bacak + omuz kombinasyonu' },
      { name: 'Push-Up to Row', sets: 3, reps: '10', note: 'Şınav + sırt kombinasyonu' },
      { name: 'Lunge + Curl', sets: 3, reps: '10', note: 'Denge ve güç geliştirici' },
      { name: 'Plank + Shoulder Tap', sets: 3, reps: '20 sn', note: 'Core stabilizasyonu' },
    ],
  },
};

// Rastgele kas grubu seç (kullanıcı seçmediyse)
export const getRandomMuscleGroup = () => {
  const keys = Object.keys(WORKOUT_DATA);
  return keys[Math.floor(Math.random() * keys.length)];
};

// Egzersiz listesini formatla
export const formatWorkout = (kasGrubu) => {
  const data = WORKOUT_DATA[kasGrubu] || WORKOUT_DATA['tüm vücut'];
  const lines = [`💪 ${data.label} Antrenmanı\n`];
  data.exercises.forEach((ex, i) => {
    lines.push(`${i + 1}. ${ex.name} — ${ex.sets}x${ex.reps}`);
    if (ex.note) lines.push(`   💡 ${ex.note}`);
  });
  lines.push('\n⏱️ Setler arası 60-90 saniye dinlen.');
  lines.push('💧 Bol su içmeyi unutma!');
  return lines.join('\n');
};
