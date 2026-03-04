// completionRate: tamamlananSure / hedefSure * 100
export const calcCompletionRate = (tamamlananSure, hedefSure) => {
  if (!hedefSure || hedefSure === 0) return 0;
  return Math.min(Math.round((tamamlananSure / hedefSure) * 100), 100);
};

// Bugünün aktivitelerinden istatistik üret
export const calcDailyStats = (activities = []) => {
  const planned = activities.length;
  const completed = activities.filter((a) => a.completed).length;
  const totalDuration = activities.reduce((s, a) => s + (a.duration || 0), 0);
  const completedDuration = activities
    .filter((a) => a.completed)
    .reduce((s, a) => s + (a.duration || 0), 0);
  const completionRate = planned > 0 ? Math.round((completed / planned) * 100) : 0;
  return { planned, completed, completionRate, totalDuration, completedDuration };
};

// Haftalık özet (getWeekActivitiesStatus çıktısından)
export const calcWeeklyStats = (weekStatus = {}) => {
  const days = Object.values(weekStatus);
  if (days.length === 0) {
    return { totalPlanned: 0, totalCompleted: 0, completionRate: 0, completedDays: 0 };
  }
  const totalPlanned = days.reduce((s, d) => s + d.total, 0);
  const totalCompleted = days.reduce((s, d) => s + d.completed, 0);
  const completionRate = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;
  const completedDays = days.filter((d) => d.total > 0 && d.completed >= d.total).length;
  return { totalPlanned, totalCompleted, completionRate, completedDays };
};

// Tamamlanma oranı ve haftalık ilerlemeye göre motivasyon mesajı
export const getMotivationMessage = (completionRate, completedDaysThisWeek = 0) => {
  if (completedDaysThisWeek >= 7) {
    return {
      text: 'Mükemmel bir hafta! Daha bilinçli ve daha sağlıklı bir versiyona dönüştün 💚',
      color: '#51CF66',
      level: 'perfect',
    };
  }
  if (completedDaysThisWeek === 1) {
    return {
      text: 'Haftanın ilk gününü tamamladın! İstikrar başlıyor 🔥',
      color: '#FF9800',
      level: 'start',
    };
  }
  if (completionRate >= 80) {
    return {
      text: 'Mükemmel! Bugün kendine gerçekten iyi davrandın 🌿',
      color: '#51CF66',
      level: 'excellent',
    };
  }
  if (completionRate >= 50) {
    return {
      text: 'Harika gidiyorsun! Kendine yatırım yapıyorsun ✨',
      color: '#4A90E2',
      level: 'good',
    };
  }
  return {
    text: 'Bugün küçük bir adım attın, devam et 💪',
    color: '#FF6B6B',
    level: 'low',
  };
};

// Streak badge rengi
export const getStreakColor = (days) => {
  if (days >= 7) return '#FF6B6B';
  if (days >= 3) return '#FF9800';
  return '#4A90E2';
};
