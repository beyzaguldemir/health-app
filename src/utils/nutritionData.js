// Şeker seviyesi ve öğüne göre beslenme önerileri — API çağrısı gerektirmez

// Düşük glisemik indeksli besinler (şeker > 140)
const HIGH_SUGAR_FOODS = {
  kahvaltı: [
    '🥣 Yulaf ezmesi (şekersiz) + tarçın + 5 badem',
    '🥚 2 haşlanmış yumurta + domates + salatalık',
    '🫙 Yağsız yoğurt + 1 çay kaşığı chia tohumu',
  ],
  'öğle yemeği': [
    '🥗 Izgara tavuk göğsü + bol yeşil salata (zeytinyağı-limon)',
    '🥦 Buharda brokoli + fırın somon (130g)',
    '🥙 Sebzeli omlet + yanında roka salatası',
  ],
  'akşam yemeği': [
    '🐟 Izgara balık + buharda sebze (kabak, havuç)',
    '🍗 Haşlanmış tavuk + ıspanak kavurma (az yağlı)',
    '🥗 Mercimek çorbası + yoğurt + salata',
  ],
  'ara öğün': [
    '🥜 10-12 çiğ badem',
    '🥒 Havuç + kereviz + az humus',
    '🫐 Bir avuç yaban mersini',
  ],
};

// Dengeli beslenme (şeker 70-140)
const NORMAL_SUGAR_FOODS = {
  kahvaltı: [
    '🍳 2 yumurta omlet + tam tahıllı ekmek (1 dilim) + domates',
    '🥣 Yulaf ezmesi + muz yarısı + 5 ceviz',
    '🫙 Yoğurt + granola (1 yemek kaşığı) + çilek',
  ],
  'öğle yemeği': [
    '🍱 Izgara tavuk + kinoa salatası + yoğurt',
    '🥗 Mercimek yemeği + tam tahıllı ekmek + cacık',
    '🥙 Ton balıklı salata + kepekli kraker',
  ],
  'akşam yemeği': [
    '🐟 Fırın somon + buharda brokoli + 2 yemek kaşığı bulgur',
    '🍗 Tavuk sote + mevsim salata + yoğurt',
    '🥩 Izgara köfte (az yağlı) + ızgara sebze',
  ],
  'ara öğün': [
    '🍎 1 elma + 5 ceviz içi',
    '🥛 Bir bardak kefir',
    '🍌 Muz yarısı + fıstık ezmesi (1 tatlı kaşığı)',
  ],
};

// Kan şekerini yükseltici besinler (şeker < 70)
const LOW_SUGAR_FOODS = {
  kahvaltı: [
    '🍌 1 muz + tam tahıllı tost (1 dilim)',
    '🍯 Yulaf + bal (1 tatlı kaşığı) + süt',
    '🥛 Bir bardak süt + 2 hurma',
  ],
  'öğle yemeği': [
    '🥔 Haşlanmış patates + yoğurt + salata',
    '🍚 Az miktarda pirinç + ızgara tavuk',
    '🥗 Nohut salatası + tam tahıllı ekmek',
  ],
  'akşam yemeği': [
    '🍝 Tam tahıllı makarna + sebze sosu',
    '🥗 Bulgur pilavı + mercimek çorbası',
    '🥙 Tam buğday ekmeği + peynir + domates',
  ],
  'ara öğün': [
    '🍇 Bir avuç üzüm',
    '🍊 1 portakal veya 2 mandalina',
    '🥛 Ayran + 2 hurma',
  ],
};

export const getSugarLevel = (value) => {
  if (!value) return 'normal';
  if (value > 140) return 'high';
  if (value < 70) return 'low';
  return 'normal';
};

export const getNutritionAdvice = (sugarLevel, ogunTercihi = 'kahvaltı') => {
  const level = getSugarLevel(sugarLevel);
  const ogun = ogunTercihi || 'kahvaltı';

  const foodMap = {
    high: HIGH_SUGAR_FOODS,
    normal: NORMAL_SUGAR_FOODS,
    low: LOW_SUGAR_FOODS,
  };

  const foods = foodMap[level][ogun] || foodMap[level]['kahvaltı'];
  const selected = foods[Math.floor(Math.random() * foods.length)];

  const levelNote = {
    high: '⚠️ Kan şekerin yüksek — düşük GI besinlere odaklan, tatlı ve beyaz un ürünlerinden uzak dur.',
    normal: '✅ Kan şekerin dengeli — protein, lif ve kompleks karbonhidratı dengeli al.',
    low: '🍬 Kan şekerin düşük — güvenli karbonhidrat kaynaklarını tercih et.',
  };

  const lines = [
    `🥗 ${ogunTercihi ? ogunTercihi.charAt(0).toUpperCase() + ogunTercihi.slice(1) : 'Öğün'} Önerisi\n`,
    selected,
    `\n${levelNote[level]}`,
    '\n💧 Öğünle birlikte 1-2 bardak su iç.',
    '🕐 Öğünleri atlama, kan şekerini dengeli tutar.',
  ];

  return lines.join('\n');
};
