const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

// ─── Kilo Verme Öğün Planı ────────────────────────────────────────────────────
const MEALS_LOSE_WEIGHT = [
  {
    breakfast: 'Yulaf ezmesi (50g) + 1 muz + 10 ceviz',
    morningSnack: '1 elma + 5 badem',
    lunch: 'Izgara tavuk göğsü (150g) + kinoa salatası + roka',
    afternoonSnack: 'Yağsız yoğurt (150g) + 1 çay kaşığı bal',
    dinner: 'Fırın somon (150g) + buharda brokoli + ızgara kabak',
    kcal: '1.550',
  },
  {
    breakfast: '2 haşlanmış yumurta + 1 dilim tam tahıllı ekmek + domates-salatalık',
    morningSnack: '1 armut + küçük avuç ceviz',
    lunch: 'Mercimek çorbası (2 kase) + 1 dilim tam tahıllı ekmek',
    afternoonSnack: 'Havuç ve kereviz çubukları + humus (2 yemek kaşığı)',
    dinner: 'Hindi eti (150g) + ızgara sebze + yeşil salata',
    kcal: '1.480',
  },
  {
    breakfast: 'Protein smoothie: süt (200ml) + yulaf + muz + protein tozu',
    morningSnack: '1 portakal',
    lunch: 'Ton balıklı kepekli makarna (60g kuru) + zeytinyağlı salata',
    afternoonSnack: 'Yağsız lor peyniri + 5 tam tahıllı kraker',
    dinner: 'Izgara ahtapot/kalkan + ıspanaklı pilaki',
    kcal: '1.600',
  },
  {
    breakfast: 'Chia pudding: chia tohumu + yulaf sütü + çilek + nane',
    morningSnack: '2 hurma + 1 avuç fıstık',
    lunch: 'Nohut ve ıspanak yemeği + yoğurt',
    afternoonSnack: '1 dilim tam tahıllı ekmek + avokado (½)',
    dinner: 'Izgara bonfile (120g) + haşlanmış tatlı patates + salata',
    kcal: '1.620',
  },
  {
    breakfast: '3 yumurta omlet (sebzeli) + 1 dilim tam tahıllı ekmek',
    morningSnack: '1 muz',
    lunch: 'Tavuk wrap: kepekli tortilla + tavuk + roka + domates + yoğurt sos',
    afternoonSnack: 'Yağsız yoğurt + granola (1 yemek kaşığı)',
    dinner: 'Fırın tavuk but (150g) + kinoa + mevsim salata',
    kcal: '1.580',
  },
  {
    breakfast: 'Avokado tost (1 dilim tam tahıllı) + 2 yumurta + domates',
    morningSnack: 'Meyve salatası (elma, armut, kivi)',
    lunch: 'Sebzeli bulgur pilavı + cacık',
    afternoonSnack: '1 kase yoğurt + tarçın',
    dinner: 'Izgara levrek + ızgara sebzeler + yeşil salata',
    kcal: '1.540',
  },
  {
    breakfast: 'Yulaf pankek (yulaf + muz + yumurta) + yaban mersini',
    morningSnack: '1 avuç çiğ badem (15 adet)',
    lunch: 'Mercimek köftesi (6 adet) + yoğurt + salata',
    afternoonSnack: '1 dilim kavun veya karpuz',
    dinner: 'Buharda tavuk + sebze çorbası + 1 dilim ekmek',
    kcal: '1.500',
  },
];

// ─── Kas Yapma Öğün Planı ─────────────────────────────────────────────────────
const MEALS_GAIN_MUSCLE = [
  {
    breakfast: '4 yumurta omlet + 2 dilim tam tahıllı ekmek + yulaf ezmesi + muz',
    morningSnack: 'Protein shake (30g protein tozu) + süt + muz',
    lunch: 'Izgara dana eti (200g) + kinoa (100g) + buharda brokoli',
    afternoonSnack: 'Yağsız yoğurt (200g) + 1 avuç ceviz + 2 hurma',
    dinner: 'Izgara tavuk (200g) + tam tahıllı makarna (80g kuru) + salata',
    kcal: '3.100',
  },
  {
    breakfast: 'Yulaf ezmesi (80g) + süt + 3 yumurta + fıstık ezmesi (1 yemek kaşığı)',
    morningSnack: 'Tam tahıllı ekmek (2 dilim) + yumurta (2) + muz',
    lunch: 'Fırın somon (200g) + bulgur pilavı (150g) + ıspanak salatası',
    afternoonSnack: 'Protein bar veya yoğurt + meyve',
    dinner: 'Dana kıyma köfte (4 adet) + patates püresi + yeşil fasulye',
    kcal: '3.200',
  },
  {
    breakfast: '5 yumurta sahanda + avokado (1 tam) + 2 dilim ekmek + portakal suyu',
    morningSnack: 'Smoothie: yulaf + süt + protein tozu + dondurulmuş meyve',
    lunch: 'Tavuk pirzola (220g) + pirinç pilavı (100g) + zeytinyağlı salata',
    afternoonSnack: '200g yoğurt + granola (50g) + meyve',
    dinner: 'Hindi eti (200g) + tam tahıllı makarna (80g) + brokoli',
    kcal: '3.150',
  },
  {
    breakfast: 'Gözleme (2 adet, az yağlı peynirli) + yulaf ezmesi + süt',
    morningSnack: 'Fıstık ezmeli tam tahıllı ekmek + 1 muz',
    lunch: 'Balık buğulama (200g) + kinoa salatası + avokado',
    afternoonSnack: 'Haşlanmış yumurta (3 adet) + domates',
    dinner: 'Kuzu eti güveç (200g) + bulgur pilavı + yoğurt',
    kcal: '3.000',
  },
  {
    breakfast: 'Protein pancake (protein tozu + yulaf + yumurta) + fıstık ezmesi',
    morningSnack: 'Süt (300ml) + 2 muz + badem (20 adet)',
    lunch: 'Izgara bonfile (200g) + haşlanmış patates (2 orta) + salata',
    afternoonSnack: 'Yoğurt parfait: yoğurt + granola + çilek + bal',
    dinner: 'Fırın tavuk (220g) + pirinç pilavı + zeytinyağlı sebze',
    kcal: '3.250',
  },
  {
    breakfast: '4 yumurta omlet (sebzeli, peynirli) + 2 dilim tam tahıllı ekmek + taze meyve',
    morningSnack: 'Protein shake + yulaf + muz',
    lunch: 'Somon steak (200g) + quinoa + ızgara kuşkonmaz',
    afternoonSnack: 'Lor peyniri (150g) + 2 dilim ekmek + domates',
    dinner: 'Dana bonfile (200g) + tatlı patates (200g) + yeşil salata',
    kcal: '3.300',
  },
  {
    breakfast: 'Yulaf ezmesi (80g) + protein tozu + fıstık ezmesi + muz + süt',
    morningSnack: '2 tam tahıllı ekmek + ton balığı + domates',
    lunch: 'Izgara tavuk (200g) + pirinç (120g) + buharda brokoli + yoğurt',
    afternoonSnack: '3 haşlanmış yumurta + ceviz + 1 elma',
    dinner: 'Balık güveç (200g) + kinoa + yeşil salata',
    kcal: '3.050',
  },
];

// ─── Kan Şekeri Kontrolü Öğün Planı ──────────────────────────────────────────
const MEALS_SUGAR = [
  {
    breakfast: 'Yulaf ezmesi (40g) + çilek (½ kase) + 5 badem — Şekersiz',
    morningSnack: '1 küçük elma + 5 ceviz içi',
    lunch: 'Haşlanmış mercimek (1 kase) + yoğurt + 1 dilim tam tahıllı ekmek',
    afternoonSnack: 'Yağsız yoğurt (150g) + tarçın',
    dinner: 'Izgara tavuk (130g) + buharda brokoli + yeşil salata (zeytinyağlı)',
    kcal: '1.400',
  },
  {
    breakfast: '2 yumurta + 1 dilim tam tahıllı ekmek + domates-salatalık — Şekersiz',
    morningSnack: '1 küçük armut',
    lunch: 'Sebze çorbası (2 kase) + lor peyniri (50g) + salata',
    afternoonSnack: '1 avuç çiğ badem',
    dinner: 'Fırın balık (130g) + ıspanak kavurma + 2 yemek kaşığı bulgur',
    kcal: '1.350',
  },
  {
    breakfast: 'Sebzeli omlet (2 yumurta, ıspanak, mantar) — Şekersiz',
    morningSnack: 'Yeşil salata (roka, salatalık, limon)',
    lunch: 'Nohut yemeği (az yağlı, 1 kase) + yoğurt + salata',
    afternoonSnack: '1 avuç fındık',
    dinner: 'Izgara hindi (130g) + zeytinyağlı sebze (kabak, patlıcan)',
    kcal: '1.420',
  },
  {
    breakfast: 'Chia tohumu (2 yemek kaşığı) + yulaf sütü + tarçın — Şekersiz',
    morningSnack: '1 küçük avokado dilimi + limon',
    lunch: 'Kuru fasulye (az yağlı, 1 kase) + cacık + salata',
    afternoonSnack: 'Haşlanmış yumurta (1 adet) + domates',
    dinner: 'Somon (130g) + buharda karnabahar + yeşil salata',
    kcal: '1.380',
  },
  {
    breakfast: 'Tam tahıllı ekmek (1 dilim) + beyaz peynir (40g) + domates-biber',
    morningSnack: '1 küçük portakal',
    lunch: 'Tavuk çorbası (az nişastalı, 2 kase) + salata',
    afternoonSnack: 'Yağsız yoğurt + tarçın',
    dinner: 'Haşlanmış tavuk (130g) + zeytinyağlı ıspanak + bulgur (2 yemek kaşığı)',
    kcal: '1.360',
  },
  {
    breakfast: 'Sebzeli menemen (2 yumurta, az yağlı) + 1 dilim tam tahıllı ekmek',
    morningSnack: '5 ceviz içi',
    lunch: 'Zeytinyağlı taze fasulye + yoğurt (150g)',
    afternoonSnack: '1 küçük elma',
    dinner: 'Fırın tavuk (130g) + ızgara sebze (kabak, patlıcan, biber)',
    kcal: '1.340',
  },
  {
    breakfast: 'Yulaf ezmesi (40g) + tarçın + 5 badem + ½ muz (olgunlaşmamış)',
    morningSnack: '1 küçük armut',
    lunch: 'Mercimek köftesi (5 adet) + cacık + salata',
    afternoonSnack: 'Haşlanmış yumurta (1 adet)',
    dinner: 'Balık buğulama (130g) + buharda brokoli + zeytinyağlı semizotu',
    kcal: '1.370',
  },
];

// ─── Spor Planları ────────────────────────────────────────────────────────────
const WORKOUTS_LOSE_WEIGHT = {
  sedentary: [
    { name: 'Yürüyüş (Tempolu)', duration: 35, type: 'cardio', details: '35 dk tempolu yürüyüş. Nabzın konuşmayı zorlaştırmalı ama tamamen durdurmamali.', isRest: false },
    { name: 'Üst Vücut Kuvvet', duration: 30, type: 'strength', details: 'Dumbbell press 3x12, Kürek çekme 3x12, Omuz press 3x12, Triceps uzatma 3x15', isRest: false },
    { name: 'Aktif Dinlenme', duration: 25, type: 'flexibility', details: 'Yavaş yürüyüş + esneme hareketleri. Kas iyileşmesi için hafif kalın.', isRest: false },
    { name: 'Alt Vücut Kuvvet', duration: 30, type: 'strength', details: 'Squat 3x15, Lunge 3x12, Kalça köprüsü 3x15, Calf raise 3x20', isRest: false },
    { name: 'Yürüyüş + Interval', duration: 40, type: 'cardio', details: '5 dk ısınma, 3x(5 dk normal + 2 dk hızlı), 5 dk soğuma', isRest: false },
    { name: 'Yoga & Esneme', duration: 30, type: 'flexibility', details: 'Temel yoga pozisyonları. Sun salutation, kalça açma, sırt germe.', isRest: false },
    { name: 'Dinlenme Günü', duration: 0, type: 'rest', details: 'Bugün dinlen! Hafif yürüyüş yapabilirsin.', isRest: true },
  ],
  moderate: [
    { name: 'HIIT Kardiyo', duration: 40, type: 'cardio', details: 'Isınma 5dk → 20 dk HIIT (30sn yüksek, 30sn düşük) → Soğuma 5dk. Burpee, high knees, jump squat.', isRest: false },
    { name: 'Üst Vücut Kuvvet', duration: 45, type: 'strength', details: 'Bench press 4x10, Pull-up/kürek 4x10, Omuz press 4x12, Bicep curl 3x12, Triceps 3x12', isRest: false },
    { name: 'Bisiklet / Yüzme', duration: 45, type: 'cardio', details: 'Orta tempoda bisiklet veya yüzme. Kalp atışı orta yüksek tutulmalı.', isRest: false },
    { name: 'Alt Vücut + Core', duration: 45, type: 'strength', details: 'Squat 4x15, Deadlift 3x10, Lunge 3x12, Plank 3x45sn, Crunch 3x20', isRest: false },
    { name: 'Orta Tempolu Koşu', duration: 40, type: 'cardio', details: '5 dk yürüyüş ısınma + 30 dk orta tempo koşu + 5 dk yürüyüş soğuma.', isRest: false },
    { name: 'Pilates / Yoga', duration: 40, type: 'flexibility', details: 'Tüm vücut esneme + core güçlendirme. Pilates reformer veya mat pilates.', isRest: false },
    { name: 'Dinlenme Günü', duration: 0, type: 'rest', details: 'Kasların iyileşsin! Gerekirse 20 dk yavaş yürüyüş yapabilirsin.', isRest: true },
  ],
  active: [
    { name: 'HIIT + Kardiyo', duration: 55, type: 'cardio', details: 'Isınma 5dk → 35dk HIIT (Tabata protokolü) → 10dk orta tempo koşu → Soğuma 5dk', isRest: false },
    { name: 'Üst Vücut Kuvvet', duration: 60, type: 'strength', details: 'Barbell bench 5x8, Weighted pull-up 4x8, Military press 4x10, Bicep+triceps süperset 4x12', isRest: false },
    { name: 'Koşu (Uzun Mesafe)', duration: 50, type: 'cardio', details: 'Sabit tempoda 6-8 km koşu. Zone 2-3 kalp atışı hedefle.', isRest: false },
    { name: 'Alt Vücut + HIIT', duration: 60, type: 'strength', details: 'Barbell squat 5x8, RDL 4x10, Leg press 4x12, Box jump 3x10, Plank 3x60sn', isRest: false },
    { name: 'Spinning / Bisiklet', duration: 55, type: 'cardio', details: 'Yüksek dirençli spinning veya yokuşlu bisiklet. 45dk orta-yüksek tempo.', isRest: false },
    { name: 'Aktif Dinlenme', duration: 40, type: 'flexibility', details: 'Yüzme veya doğa yürüyüşü. Yoga + derin esneme kombinasyonu.', isRest: false },
    { name: 'Dinlenme Günü', duration: 0, type: 'rest', details: 'Tam dinlenme. Protein alımını artır, bol su iç.', isRest: true },
  ],
};

const WORKOUTS_GAIN_MUSCLE = {
  sedentary: [
    { name: 'Göğüs & Triceps', duration: 45, type: 'strength', details: 'Dumbbell bench press 4x10, Dumbbell fly 3x12, Triceps dips 3x12, Push-up 3x15', isRest: false },
    { name: 'Sırt & Biceps', duration: 45, type: 'strength', details: 'Dumbbell row 4x10, Lat pulldown 3x12, Bicep curl 4x12, Hammer curl 3x12', isRest: false },
    { name: 'Aktif Dinlenme', duration: 25, type: 'flexibility', details: 'Hafif esneme + yürüyüş. Kaslar iyileşiyor, zorlamayın.', isRest: false },
    { name: 'Bacak & Kalça', duration: 45, type: 'strength', details: 'Goblet squat 4x12, Lunge 3x12, Leg curl 3x15, Calf raise 4x20', isRest: false },
    { name: 'Omuz & Core', duration: 40, type: 'strength', details: 'Dumbbell press 4x10, Lateral raise 3x15, Front raise 3x12, Plank 3x45sn', isRest: false },
    { name: 'Full Body', duration: 45, type: 'strength', details: 'Squat + press kombinasyonu, Deadlift 3x10, Push-up 3x15, Kürek çekme 3x12', isRest: false },
    { name: 'Dinlenme Günü', duration: 0, type: 'rest', details: 'Kas büyümesi dinlenmede olur! Protein alımını ihmal etme.', isRest: true },
  ],
  moderate: [
    { name: 'Göğüs & Triceps', duration: 60, type: 'strength', details: 'Bench press 5x8, İnkline bench 4x10, Cable fly 3x12, Skull crusher 4x10, Pushdown 3x15', isRest: false },
    { name: 'Sırt & Biceps', duration: 60, type: 'strength', details: 'Barbell row 5x8, Pull-up 4x8, Seated cable row 3x12, Barbell curl 4x10, Hammer curl 3x12', isRest: false },
    { name: 'Bacak (Ön)', duration: 60, type: 'strength', details: 'Squat 5x8, Leg press 4x10, Leg extension 3x12, Hack squat 3x10, Calf raise 5x20', isRest: false },
    { name: 'Omuz & Trapez', duration: 55, type: 'strength', details: 'Military press 5x8, Lateral raise 4x12, Reverse fly 3x15, Shrug 4x12, Face pull 3x15', isRest: false },
    { name: 'Bacak (Arka) + Core', duration: 55, type: 'strength', details: 'Deadlift 5x5, Romanian DL 4x10, Leg curl 4x12, GHR 3x12, Plank 4x60sn', isRest: false },
    { name: 'Aktif Dinlenme', duration: 35, type: 'flexibility', details: 'Yüzme veya bisiklet (hafif). Tüm kas grupları için derin esneme.', isRest: false },
    { name: 'Dinlenme Günü', duration: 0, type: 'rest', details: 'Tam dinlenme. Kasların büyümesi bu gün gerçekleşiyor!', isRest: true },
  ],
  active: [
    { name: 'Göğüs & Triceps (Ağır)', duration: 75, type: 'strength', details: 'Barbell bench 6x5 (ağır), İnkline dumbbell 4x10, Cable crossover 4x12, Skull crusher 4x8, Dip (ağırlıklı) 4x10', isRest: false },
    { name: 'Sırt & Biceps (Ağır)', duration: 75, type: 'strength', details: 'Deadlift 5x5, Weighted pull-up 5x8, Barbell row 5x8, Cable row 4x10, Barbell curl 4x8', isRest: false },
    { name: 'Bacak (Hacim)', duration: 75, type: 'strength', details: 'Squat 6x5, Leg press 5x12, Lunge 4x12, Leg ext+curl superset 4x12, Calf raise 6x20', isRest: false },
    { name: 'Omuz & Arms (Hacim)', duration: 70, type: 'strength', details: 'Military press 5x5, Arnold press 4x10, Lateral+front raise superset 4x12, Bicep+Tricep süperset 5x10', isRest: false },
    { name: 'Full Body (Güç)', duration: 75, type: 'strength', details: 'Power clean 5x5, Front squat 5x5, Pull-up 5x8, Dip 5x10, Farmer carry 4x30m', isRest: false },
    { name: 'Aktif Dinlenme', duration: 40, type: 'flexibility', details: 'Yüzme 30dk + derin esneme 10dk. Kas iyileşmesini destekle.', isRest: false },
    { name: 'Dinlenme Günü', duration: 0, type: 'rest', details: 'Tam dinlenme. Yüksek protein + bol uyku. Kaslar inşa ediliyor!', isRest: true },
  ],
};

const WORKOUTS_SUGAR = {
  sedentary: [
    { name: 'Sabah Yürüyüşü', duration: 30, type: 'cardio', details: 'Yemekten 1-2 saat sonra hafif tempolu yürüyüş. Kan şekerini dengelemeye yardımcı olur.', isRest: false },
    { name: 'Hafif Kuvvet', duration: 25, type: 'strength', details: 'Vücut ağırlığı egzersizleri: squat 3x10, push-up 3x8, kürek çekme (direnç bandı) 3x12', isRest: false },
    { name: 'Yoga & Nefes', duration: 30, type: 'flexibility', details: 'Esneme ve nefes egzersizleri. Stres düşürücü yoga pozisyonları.', isRest: false },
    { name: 'Yürüyüş + Esneme', duration: 35, type: 'cardio', details: 'Orta tempolu yürüyüş 25dk + tüm vücut esneme 10dk', isRest: false },
    { name: 'Aqua Aerobik / Yüzme', duration: 30, type: 'cardio', details: 'Yüzme veya su içi yürüyüş. Eklemlere yük bindirmeden kardiyo.', isRest: false },
    { name: 'Doğa Yürüyüşü', duration: 40, type: 'cardio', details: 'Yeşil alanda sakin tempo yürüyüş. Stresi azaltır, kan şekerini dengeler.', isRest: false },
    { name: 'Dinlenme & Esneme', duration: 15, type: 'flexibility', details: 'Tam dinlenme. Sadece hafif esneme hareketleri yapabilirsin.', isRest: true },
  ],
  moderate: [
    { name: 'Orta Tempo Yürüyüş', duration: 40, type: 'cardio', details: 'Sabah kahvaltıdan 1 saat sonra 40dk tempolu yürüyüş. Hedef nabız 100-120.', isRest: false },
    { name: 'Direnç Antrenmanı', duration: 35, type: 'strength', details: 'Squat 3x12, Deadlift 3x10, Göğüs press 3x12, Kürek çekme 3x12, Plank 3x40sn', isRest: false },
    { name: 'Bisiklet (Hafif)', duration: 35, type: 'cardio', details: 'Düz zeminde hafif-orta tempoda bisiklet. Kan şekerini düzenlemeye yardımcı olur.', isRest: false },
    { name: 'Pilates / Yoga', duration: 40, type: 'flexibility', details: 'Core güçlendirme + esneme kombinasyonu. Insulin duyarlılığını artırır.', isRest: false },
    { name: 'Yürüyüş + Kuvvet', duration: 45, type: 'cardio', details: '20dk yürüyüş + 25dk vücut ağırlığı egzersizleri (devre antrenman formatı)', isRest: false },
    { name: 'Yüzme', duration: 35, type: 'cardio', details: 'Serbest stil veya kurbağalama. Eklem dostu, tam vücut kardiyo.', isRest: false },
    { name: 'Dinlenme Günü', duration: 0, type: 'rest', details: 'Dinlen. Sadece yemekten sonra 15dk yavaş yürüyüş yeterli.', isRest: true },
  ],
  active: [
    { name: 'Koşu + Interval', duration: 45, type: 'cardio', details: '5dk yürüyüş + 4x(6dk koşu / 2dk yürüyüş) + 5dk soğuma. Yemekten 2 saat sonra yap.', isRest: false },
    { name: 'Güç Antrenmanı', duration: 50, type: 'strength', details: 'Barbell squat 4x10, Bench press 4x10, Deadlift 3x8, Overhead press 4x10, Core devresi', isRest: false },
    { name: 'Bisiklet (Orta-Yüksek)', duration: 50, type: 'cardio', details: 'Yokuşlu bisiklet veya spinning. Insulin duyarlılığını önemli ölçüde artırır.', isRest: false },
    { name: 'Kuvvet + Core', duration: 50, type: 'strength', details: 'Pull-up 4x8, Dumbbell row 4x10, Lunge 4x12, Plank varyasyonları, Russian twist 3x20', isRest: false },
    { name: 'Yüzme', duration: 45, type: 'cardio', details: '45dk yüzme: serbest stil ağırlıklı, 400m ısınma, 4x100m interval, 200m soğuma', isRest: false },
    { name: 'Aktif Dinlenme', duration: 35, type: 'flexibility', details: 'Yoga veya hafif doğa yürüyüşü. Derin esneme + nefes çalışması.', isRest: false },
    { name: 'Dinlenme Günü', duration: 0, type: 'rest', details: 'Tam dinlenme. Kan şekeri takibini ihmal etme.', isRest: true },
  ],
};

// ─── Public Fonksiyonlar ───────────────────────────────────────────────────────

export const generateWeeklyMealPlan = (userProfile) => {
  const goal = userProfile?.healthGoal || 'control_blood_sugar';
  const plans = goal === 'lose_weight' ? MEALS_LOSE_WEIGHT
    : goal === 'gain_muscle' ? MEALS_GAIN_MUSCLE
    : MEALS_SUGAR;

  return DAYS.map((day, i) => ({ day, ...plans[i] }));
};

export const generateWeeklyActivityPlan = (userProfile) => {
  const goal = userProfile?.healthGoal || 'control_blood_sugar';
  const level = userProfile?.activityLevel || 'moderate';

  const allWorkouts = goal === 'lose_weight' ? WORKOUTS_LOSE_WEIGHT
    : goal === 'gain_muscle' ? WORKOUTS_GAIN_MUSCLE
    : WORKOUTS_SUGAR;

  const workouts = allWorkouts[level] || allWorkouts.moderate;
  return DAYS.map((day, i) => ({
    day,
    ...workouts[i],
    kategori: workouts[i].isRest ? 'dinlenme' : 'spor',
    breathingExercise: {
      name: 'Günlük Nefes Egzersizi',
      duration: 5,
      type: 'breathing',
      kategori: 'nefes',
      details: '4-4-4 Kutu Nefesi veya 4-7-8 tekniği ile 5 dk nefes egzersizi',
      hedefSure: 5,
      stressReductionScore: 10,
      selfCareScore: 5,
      isRest: false,
    },
  }));
};

// ─── Mevcut fonksiyonlar ──────────────────────────────────────────────────────

export const generatePersonalPlan = (userProfile, latestBloodSugar) => {
  const { healthGoal, activityLevel, weight } = userProfile || {};

  let workoutPlan = '🚶 30 dakika tempolu yürüyüş';
  let nutritionAdvice = '🥗 Dengeli beslenme: protein, sebze ve tam tahıl';
  let waterTarget = '2.0';
  let motivationMessage = '🌟 Sağlıklı bir gün için küçük adımlar at!';

  if (healthGoal === 'lose_weight') {
    if (activityLevel === 'sedentary') workoutPlan = '🚶 30 dk tempolu yürüyüş + 10 dk esneme';
    else if (activityLevel === 'moderate') workoutPlan = '🏃 45 dk kardiyo (koşu/bisiklet) + 15 dk kuvvet';
    else workoutPlan = '🔥 50 dk HIIT antrenmanı + 15 dk kuvvet';
    nutritionAdvice = '🥗 Düşük kalorili, yüksek proteinli beslenme. Öğün başına 400-500 kal.';
    waterTarget = '2.5';
    motivationMessage = '💪 Her adım hedefe götürür, vazgeçme!';
  } else if (healthGoal === 'gain_muscle') {
    if (activityLevel === 'sedentary') workoutPlan = '🏋️ 30 dk temel kuvvet hareketleri';
    else if (activityLevel === 'moderate') workoutPlan = '🏋️ 50 dk split antrenman (üst/alt vücut)';
    else workoutPlan = '🏋️ 60 dk ağır kuvvet antrenmanı + germe';
    nutritionAdvice = '🥩 Yüksek protein: her kg için 1.6-2g protein. Kaliteli karbonhidrat ekle.';
    waterTarget = '3.0';
    motivationMessage = '💪 Kaslar mutfakta yapılır, salonunda sergilenir!';
  } else if (healthGoal === 'control_blood_sugar') {
    if (latestBloodSugar && latestBloodSugar > 180) {
      workoutPlan = '🚶 35 dk yemekten 1 saat sonra yavaş yürüyüş';
      nutritionAdvice = '🥦 Düşük karbonhidrat! Yeşil sebze, protein odaklı beslen.';
    } else if (latestBloodSugar && latestBloodSugar < 70) {
      workoutPlan = '🧘 Hafif esneme ve nefes egzersizi.';
      nutritionAdvice = '🍌 Hemen meyve suyu veya glikoz al. 15 dk sonra tekrar ölç.';
    } else {
      workoutPlan = '🏃 40 dk orta tempolu yürüyüş veya bisiklet';
      nutritionAdvice = '🥗 Dengeli öğünler: protein + lif + az karbonhidrat.';
    }
    waterTarget = '2.5';
    motivationMessage = '🌟 Kan şekerini kontrol etmek bir süper güç!';
  }

  if (weight) {
    const calculatedWater = (weight * 0.033).toFixed(1);
    waterTarget = Math.max(parseFloat(waterTarget), parseFloat(calculatedWater)).toFixed(1);
  }

  return { workoutPlan, nutritionAdvice, waterTarget, motivationMessage };
};

export const calculateHealthScore = (userProfile, latestBloodSugar) => {
  let score = 50;
  if (latestBloodSugar) {
    if (latestBloodSugar >= 70 && latestBloodSugar <= 140) score += 30;
    else if (latestBloodSugar >= 141 && latestBloodSugar <= 180) score += 15;
    else if (latestBloodSugar > 180) score += 0;
    else score += 5;
  } else { score += 15; }
  if (userProfile?.activityLevel === 'active') score += 20;
  else if (userProfile?.activityLevel === 'moderate') score += 10;
  else score += 2;
  if (userProfile?.height && userProfile?.weight) {
    const bmi = userProfile.weight / Math.pow(userProfile.height / 100, 2);
    if (bmi >= 18.5 && bmi <= 24.9) score += 10;
    else if (bmi >= 25 && bmi <= 29.9) score += 5;
  }
  return Math.min(Math.round(score), 100);
};

export const getHealthScoreColor = (score) => {
  if (score >= 80) return '#51CF66';
  if (score >= 60) return '#FFA94D';
  return '#FF6B6B';
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
};
