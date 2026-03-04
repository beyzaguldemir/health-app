import { formatWorkout, getRandomMuscleGroup } from '../utils/workoutData';
import { getNutritionAdvice, getSugarLevel } from '../utils/nutritionData';

// ─── Motivasyon Mesajları ─────────────────────────────────────────────────────

const MOTIVATION_LOW = [
  'Bugün küçük bir adım attın, devam et 💪',
  'Her büyük yolculuk tek adımla başlar. Sen zaten başladın!',
  'Bugün mükemmel olmak zorunda değilsin, sadece bir adım daha at.',
  'Dün senden iyi olmak yeterli. Küçük ilerleme, büyük fark yaratır.',
  'Vücudun sana teşekkür edecek. Devam etmek yeterli! 🌱',
];

const MOTIVATION_MID = [
  'Harika gidiyorsun! Kendine yatırım yapıyorsun ✨',
  'Yarı yolda olanların en iyi özelliği devam etmeleri!',
  'Bu düzen seninle birlikte güçleniyor. Süper! 🔥',
  'Her antrenman seni bir adım daha ileriye götürüyor.',
  'Kararlılığın sağlığını şekillendiriyor. Çok iyi! 💚',
];

const MOTIVATION_HIGH = [
  'Mükemmel! Bugün kendine gerçekten iyi davrandın 🌿',
  'İnanılmazsın! Hedeflerine her gün biraz daha yaklaşıyorsun!',
  'Bu performans seni en iyi versiyonuna taşıyor 🏆',
  'Kendinle gurur duy — bu sonuçlar tesadüf değil!',
  'Harikasın! Sağlıklı yaşam artık bir alışkanlık olmaya başladı 💎',
];

const STREAK_3 = [
  '🔥 3 gün üst üste! İstikrar kazanıyorsun!',
  '🔥 Ard arda 3 gün — bu momentumu koru!',
];

const STREAK_7 = [
  '🏆 7 günlük streak! Bu alışkanlık artık seninle!',
  '🏆 Tam bir hafta kesintisiz! Sen gerçek bir şampiyon! 🎉',
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getMotivationText = (weeklyCompletionRate, streakDays) => {
  const rate = weeklyCompletionRate ?? 0;
  const streak = streakDays ?? 0;

  let base = '';
  if (rate < 40) base = pickRandom(MOTIVATION_LOW);
  else if (rate < 70) base = pickRandom(MOTIVATION_MID);
  else base = pickRandom(MOTIVATION_HIGH);

  let streakBonus = '';
  if (streak >= 7) streakBonus = `\n${pickRandom(STREAK_7)}`;
  else if (streak >= 3) streakBonus = `\n${pickRandom(STREAK_3)}`;

  return base + streakBonus;
};

// ─── Şeker Durum Mesajı ───────────────────────────────────────────────────────

const getSugarNote = (sugarLevel) => {
  if (!sugarLevel) return null;
  if (sugarLevel > 140) {
    return `⚠️ Kan şekerin ${sugarLevel} mg/dL — yüksek. Bugün düşük GI besinleri tercih et ve 20-30 dk hafif yürüyüş yap.`;
  }
  if (sugarLevel < 70) {
    return `🍬 Kan şekerin ${sugarLevel} mg/dL — düşük. Sağlıklı karbonhidrat kaynaklarından hemen birini al.`;
  }
  return `✅ Kan şekerin ${sugarLevel} mg/dL — normal aralıkta. Harika!`;
};

// ─── Ana Fonksiyon ────────────────────────────────────────────────────────────

export const generateLocalAdvice = (type, userData = {}) => {
  const {
    sugarLevel, streakDays, weeklyCompletionRate,
    kasGrubu, ogunTercihi, hedef,
  } = userData;

  switch (type) {
    case 'workout': {
      const kas = kasGrubu || getRandomMuscleGroup();
      const workout = formatWorkout(kas);
      const motivation = getMotivationText(weeklyCompletionRate, streakDays);
      const sugarNote = getSugarNote(sugarLevel);

      return [
        motivation,
        sugarNote,
        '\n' + workout,
        hedef ? `\n🎯 Hedefin "${hedef}" — bu antrenman seni oraya götürecek!` : null,
      ].filter(Boolean).join('\n');
    }

    case 'meal': {
      const nutrition = getNutritionAdvice(sugarLevel, ogunTercihi);
      const motivation = getMotivationText(weeklyCompletionRate, streakDays);
      const sugarNote = getSugarNote(sugarLevel);

      return [
        motivation,
        sugarNote,
        '\n' + nutrition,
      ].filter(Boolean).join('\n');
    }

    case 'sugar': {
      const sugarNote = getSugarNote(sugarLevel);
      const level = getSugarLevel(sugarLevel);

      const advice = {
        high: [
          '🥗 Öğünlerde beyaz ekmek, pirinç ve şekerli içeceklerden uzak dur.',
          '🚶 Yemekten 30 dk sonra 15-20 dk yavaş yürüyüş yap — şeker düşer.',
          '💧 Bol su iç, şekeri seyreltmeye yardımcı olur.',
          '🥦 Tabağının yarısını yeşil sebzelerle doldur.',
          '⏰ Öğün atlamadan düzenli beslen, ani yükselmeleri önler.',
        ],
        low: [
          '🍌 Hemen bir muz ya da 2 hurma ye.',
          '🥛 Bir bardak süt veya ayran iyi bir seçim.',
          '🍞 Tam tahıllı tost ile güvenli karbonhidrat al.',
          '⏰ Bir sonraki ölçümü 15 dk sonra yap.',
          '🩺 Sık sık düşüyorsa doktoruna danış.',
        ],
        normal: [
          '✅ Dengeni korumak için düzenli öğün saatlerine devam et.',
          '🥗 Her öğünde protein + lif + az karbonhidrat dengesi kur.',
          '🚶 Günde 20-30 dk yürüyüş insülin duyarlılığını artırır.',
          '💧 En az 2 litre su iç.',
          '😴 Düzenli uyku kan şekeri dengesini destekler.',
        ],
      }[level];

      return [
        sugarNote,
        '\n📋 Öneriler:\n',
        ...advice,
      ].filter(Boolean).join('\n');
    }

    case 'motivation': {
      const motivation = getMotivationText(weeklyCompletionRate, streakDays);
      const sugarNote = getSugarNote(sugarLevel);

      const weekTip = weeklyCompletionRate != null
        ? `\n📊 Bu hafta %${weeklyCompletionRate} oranında hedefini tamamladın.`
        : null;

      const streakTip = streakDays > 0
        ? `🔥 ${streakDays} günlük aktivite serisi devam ediyor!`
        : null;

      const dailyTips = [
        '🌅 Her sabah 5 dk derin nefes ile güne başla.',
        '💧 Günde 8 bardak su iç.',
        '🚶 En az 20 dk yürüyüş yap.',
        '🛌 7-8 saat düzenli uyku al.',
        '🥗 Günde 5 porsiyon sebze-meyve tüket.',
      ];

      return [
        motivation,
        weekTip,
        streakTip,
        sugarNote,
        '\n💡 Günlük İpuçları:',
        pickRandom(dailyTips),
        pickRandom(dailyTips),
      ].filter(Boolean).join('\n');
    }

    default:
      return 'Öneri türü tanınmadı.';
  }
};
