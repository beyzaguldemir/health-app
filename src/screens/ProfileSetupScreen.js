import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../auth/AuthContext';
import { createUserProfile } from '../firebase/userService';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants/styles';

const GOALS = [
  { value: 'lose_weight', label: '⚖️ Kilo Vermek', icon: 'trending-down' },
  { value: 'gain_muscle', label: '💪 Kas Kazanmak', icon: 'barbell' },
  { value: 'control_blood_sugar', label: '🩸 Kan Şekeri Kontrolü', icon: 'water' },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Hareketsiz', desc: 'Masa başı iş, az hareket' },
  { value: 'moderate', label: 'Orta Aktif', desc: 'Haftada 2-3 gün egzersiz' },
  { value: 'active', label: 'Çok Aktif', desc: 'Günlük yoğun egzersiz' },
];

const GENDERS = [
  { value: 'male', label: '👨 Erkek' },
  { value: 'female', label: '👩 Kadın' },
  { value: 'other', label: '🧑 Diğer' },
];

const CHRONIC_DISEASES = [
  'Tip 2 Diyabet', 'Tip 1 Diyabet', 'Hipertansiyon',
  'Kalp Hastalığı', 'Tiroid', 'Kolestorol', 'Astım',
];

const STRESS_LEVELS = [
  { value: 1, label: '😌 Çok Düşük' },
  { value: 2, label: '🙂 Düşük' },
  { value: 3, label: '😐 Orta' },
  { value: 4, label: '😟 Yüksek' },
  { value: 5, label: '😰 Çok Yüksek' },
];

const ProfileSetupScreen = ({ navigation }) => {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;

  // Adım 1 - Kişisel Bilgiler
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  // Adım 2 - Vücut Ölçüleri
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Adım 3 - Hedef ve Aktivite
  const [healthGoal, setHealthGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState('');

  // Adım 4 - Sağlık Detayları
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [foodRestrictions, setFoodRestrictions] = useState('');
  const [sleepHours, setSleepHours] = useState('7');
  const [stressLevel, setStressLevel] = useState(3);
  const [mealsPerDay, setMealsPerDay] = useState('3');
  const [smoking, setSmoking] = useState(false);
  const [alcohol, setAlcohol] = useState(false);

  const toggleDisease = (disease) => {
    setSelectedDiseases((prev) =>
      prev.includes(disease) ? prev.filter((d) => d !== disease) : [...prev, disease]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim() || !age || !gender) {
        Alert.alert('Eksik Bilgi', 'Ad, yaş ve cinsiyet alanlarını doldurun');
        return;
      }
      if (isNaN(age) || parseInt(age) < 10 || parseInt(age) > 120) {
        Alert.alert('Hata', 'Geçerli bir yaş girin');
        return;
      }
    } else if (step === 2) {
      if (!height || !weight || isNaN(height) || isNaN(weight)) {
        Alert.alert('Eksik Bilgi', 'Boy ve kilo alanlarını doldurun');
        return;
      }
    } else if (step === 3) {
      if (!healthGoal || !activityLevel) {
        Alert.alert('Eksik Bilgi', 'Hedef ve aktivite seviyesi seçin');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSave = async () => {
    setLoading(true);
    const profile = {
      name: name.trim(),
      age: parseInt(age),
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      healthGoal,
      activityLevel,
      chronicDiseases: selectedDiseases.join(', ') || 'Yok',
      foodRestrictions: foodRestrictions.trim() || 'Yok',
      sleepHours: parseInt(sleepHours) || 7,
      stressLevel,
      mealsPerDay: parseInt(mealsPerDay) || 3,
      smoking,
      alcohol,
    };
    const result = await createUserProfile(user.uid, profile);
    if (result.success) {
      await refreshProfile();
      navigation.replace('MainTabs');
    } else {
      Alert.alert('Hata', 'Profil kaydedilemedi. Tekrar deneyin.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4A90E2', '#7BB8F7']} style={styles.headerGradient}>
        <Text style={styles.stepText}>Adım {step} / {TOTAL_STEPS}</Text>
        <Text style={styles.headerTitle}>Profilini Oluştur</Text>
        <Text style={styles.headerSub}>AI planın için bilgilerini gir</Text>
        <View style={styles.stepDots}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View key={i} style={[styles.dot, step >= i + 1 && styles.dotActive]} />
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        {/* ADIM 1 - Kişisel Bilgiler */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput style={styles.input} placeholder="Örn: Ahmet Yılmaz" value={name} onChangeText={setName} placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Yaşın</Text>
            <TextInput style={styles.input} placeholder="Örn: 28" value={age} onChangeText={setAge} keyboardType="numeric" placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Cinsiyet</Text>
            <View style={styles.optionRow}>
              {GENDERS.map((g) => (
                <Pressable key={g.value} style={[styles.optionChip, gender === g.value && styles.optionChipActive]} onPress={() => setGender(g.value)}>
                  <Text style={[styles.optionChipText, gender === g.value && styles.optionChipTextActive]}>{g.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ADIM 2 - Vücut Ölçüleri */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Vücut Ölçüleri</Text>

            <Text style={styles.label}>Boy (cm)</Text>
            <TextInput style={styles.input} placeholder="Örn: 175" value={height} onChangeText={setHeight} keyboardType="numeric" placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Kilo (kg)</Text>
            <TextInput style={styles.input} placeholder="Örn: 70" value={weight} onChangeText={setWeight} keyboardType="numeric" placeholderTextColor={COLORS.textLight} />

            {height && weight && !isNaN(height) && !isNaN(weight) && (
              <View style={styles.bmiCard}>
                <Text style={styles.bmiLabel}>BMI</Text>
                <Text style={styles.bmiValue}>
                  {(parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ADIM 3 - Hedef */}
        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Sağlık Hedefin</Text>
            {GOALS.map((g) => (
              <Pressable key={g.value} style={[styles.goalCard, healthGoal === g.value && styles.goalCardActive]} onPress={() => setHealthGoal(g.value)}>
                <Ionicons name={g.icon} size={26} color={healthGoal === g.value ? COLORS.white : COLORS.primary} />
                <Text style={[styles.goalText, healthGoal === g.value && styles.goalTextActive]}>{g.label}</Text>
                {healthGoal === g.value && <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />}
              </Pressable>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Aktivite Seviyesi</Text>
            {ACTIVITY_LEVELS.map((a) => (
              <Pressable key={a.value} style={[styles.activityCard, activityLevel === a.value && styles.activityCardActive]} onPress={() => setActivityLevel(a.value)}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activityLabel, activityLevel === a.value && styles.activityLabelActive]}>{a.label}</Text>
                  <Text style={[styles.activityDesc, activityLevel === a.value && { color: 'rgba(255,255,255,0.8)' }]}>{a.desc}</Text>
                </View>
                {activityLevel === a.value && <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />}
              </Pressable>
            ))}
          </View>
        )}

        {/* ADIM 4 - Sağlık Detayları */}
        {step === 4 && (
          <View>
            <Text style={styles.sectionTitle}>🤖 AI için Sağlık Detayları</Text>
            <Text style={styles.sectionSubtitle}>Bu bilgiler Gemini AI'ın sana özel plan oluşturması için kullanılır</Text>

            <Text style={styles.label}>Kronik Hastalıklar (varsa seç)</Text>
            <View style={styles.diseaseGrid}>
              {CHRONIC_DISEASES.map((d) => (
                <Pressable
                  key={d}
                  style={[styles.diseaseChip, selectedDiseases.includes(d) && styles.diseaseChipActive]}
                  onPress={() => toggleDisease(d)}
                >
                  <Text style={[styles.diseaseChipText, selectedDiseases.includes(d) && styles.diseaseChipTextActive]}>{d}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Yemek Alerjileri / Kısıtlamaları</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              placeholder="Örn: Laktoz intoleransı, gluten alerjisi, vejetaryen..."
              value={foodRestrictions}
              onChangeText={setFoodRestrictions}
              multiline
              placeholderTextColor={COLORS.textLight}
            />

            <View style={styles.rowField}>
              <Text style={styles.label}>Günlük Uyku (saat)</Text>
              <TextInput style={[styles.input, styles.smallInput]} placeholder="7" value={sleepHours} onChangeText={setSleepHours} keyboardType="numeric" placeholderTextColor={COLORS.textLight} />
            </View>

            <View style={styles.rowField}>
              <Text style={styles.label}>Günlük Öğün Sayısı</Text>
              <TextInput style={[styles.input, styles.smallInput]} placeholder="3" value={mealsPerDay} onChangeText={setMealsPerDay} keyboardType="numeric" placeholderTextColor={COLORS.textLight} />
            </View>

            <Text style={styles.label}>Stres Seviyesi</Text>
            <View style={styles.stressRow}>
              {STRESS_LEVELS.map((s) => (
                <Pressable
                  key={s.value}
                  style={[styles.stressChip, stressLevel === s.value && styles.stressChipActive]}
                  onPress={() => setStressLevel(s.value)}
                >
                  <Text style={[styles.stressText, stressLevel === s.value && styles.stressTextActive]}>{s.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>🚬 Sigara Kullanıyor musun?</Text>
              <Switch value={smoking} onValueChange={setSmoking} trackColor={{ true: COLORS.danger }} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>🍺 Alkol Kullanıyor musun?</Text>
              <Switch value={alcohol} onValueChange={setAlcohol} trackColor={{ true: COLORS.warning }} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <Pressable style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
            <Text style={styles.backBtnText}>Geri</Text>
          </Pressable>
        )}
        {step < TOTAL_STEPS ? (
          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <LinearGradient colors={['#4A90E2', '#2C6FBF']} style={styles.nextBtnGradient}>
              <Text style={styles.nextBtnText}>Devam Et</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable style={[styles.nextBtn, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading}>
            <LinearGradient colors={['#51CF66', '#2EAD4B']} style={styles.nextBtnGradient}>
              {loading ? <ActivityIndicator color={COLORS.white} /> : (
                <>
                  <Text style={styles.nextBtnText}>Profili Kaydet & Başla</Text>
                  <Ionicons name="sparkles" size={20} color={COLORS.white} />
                </>
              )}
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerGradient: { paddingTop: 54, paddingBottom: 28, paddingHorizontal: SPACING.lg, alignItems: 'center' },
  stepText: { color: 'rgba(255,255,255,0.75)', fontSize: FONT_SIZE.sm, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  headerSub: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.85)', marginBottom: SPACING.md },
  stepDots: { flexDirection: 'row', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: COLORS.white, width: 28 },
  content: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  sectionSubtitle: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, marginBottom: SPACING.md, lineHeight: 18 },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textLight, marginBottom: 6, marginTop: SPACING.sm },
  input: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    fontSize: FONT_SIZE.md, color: COLORS.text, marginBottom: SPACING.sm,
  },
  smallInput: { width: 80, textAlign: 'center', marginBottom: 0 },
  rowField: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  optionRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.md, flexWrap: 'wrap' },
  optionChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  optionChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  optionChipText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  optionChipTextActive: { color: COLORS.white, fontWeight: '600' },
  bmiCard: { backgroundColor: COLORS.primary + '15', borderRadius: BORDER_RADIUS.md, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  bmiLabel: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '600' },
  bmiValue: { fontSize: 36, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
  goalCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.border },
  goalCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  goalText: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  goalTextActive: { color: COLORS.white },
  activityCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.border },
  activityCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  activityLabel: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  activityLabelActive: { color: COLORS.white },
  activityDesc: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, marginTop: 2 },
  diseaseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.sm },
  diseaseChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  diseaseChipActive: { borderColor: COLORS.danger, backgroundColor: COLORS.danger + '15' },
  diseaseChipText: { fontSize: FONT_SIZE.xs, color: COLORS.text },
  diseaseChipTextActive: { color: COLORS.danger, fontWeight: '600' },
  stressRow: { flexDirection: 'column', gap: 6, marginBottom: SPACING.md },
  stressChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  stressChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  stressText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  stressTextActive: { color: COLORS.primary, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  switchLabel: { fontSize: FONT_SIZE.md, color: COLORS.text },
  footer: { flexDirection: 'row', padding: SPACING.md, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, gap: SPACING.sm },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.primary, gap: 4 },
  backBtnText: { color: COLORS.primary, fontWeight: '600' },
  nextBtn: { flex: 1, borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
  nextBtnGradient: { paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  nextBtnText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: 'bold' },
});

export default ProfileSetupScreen;
