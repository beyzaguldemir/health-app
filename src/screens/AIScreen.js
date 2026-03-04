import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { getSugarRecords } from '../firebase/sugarService';
import { getUserStats } from '../firebase/statsService';
import { getWeekActivitiesStatus } from '../firebase/activityService';
import { calcWeeklyStats } from '../utils/progressUtils';
import { generateLocalAdvice } from '../services/localAdviceService';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, FONT_SIZE, SHADOW } from '../constants/styles';

// ─── Seçenek verileri ─────────────────────────────────────────────────────────
const KAS_GRUPLARI = [
  { id: 'göğüs', label: 'Göğüs', icon: 'body-outline' },
  { id: 'sırt', label: 'Sırt', icon: 'barbell-outline' },
  { id: 'bacak', label: 'Bacak', icon: 'walk-outline' },
  { id: 'omuz', label: 'Omuz', icon: 'fitness-outline' },
  { id: 'karın', label: 'Karın', icon: 'flame-outline' },
  { id: 'tüm vücut', label: 'Tüm Vücut', icon: 'body-outline' },
];

const OGUN_SECENEKLERI = [
  { id: 'kahvaltı', label: 'Kahvaltı', icon: 'sunny-outline' },
  { id: 'öğle yemeği', label: 'Öğle', icon: 'partly-sunny-outline' },
  { id: 'akşam yemeği', label: 'Akşam', icon: 'moon-outline' },
  { id: 'ara öğün', label: 'Ara Öğün', icon: 'nutrition-outline' },
];

const HEDEFLER = [
  { id: 'kilo vermek', label: 'Kilo Ver', icon: 'trending-down-outline' },
  { id: 'kas yapmak', label: 'Kas Yap', icon: 'barbell-outline' },
  { id: 'kan şekerini kontrol altında tutmak', label: 'Şeker Kontrol', icon: 'water-outline' },
  { id: 'stresi azaltmak', label: 'Stres Azalt', icon: 'leaf-outline' },
  { id: 'genel sağlık', label: 'Genel Sağlık', icon: 'heart-outline' },
];

const ADVICE_TABS = [
  { id: 'workout', label: 'Antrenman', icon: 'barbell-outline', gradient: ['#4A90E2', '#7BB8F7'] },
  { id: 'meal', label: 'Beslenme', icon: 'nutrition-outline', gradient: ['#51CF66', '#8CE0A0'] },
  { id: 'sugar', label: 'Şeker', icon: 'water-outline', gradient: ['#FF6B6B', '#FF9A9A'] },
  { id: 'motivation', label: 'Motivasyon', icon: 'star-outline', gradient: ['#FF9800', '#FFB74D'] },
];

// ─── Chip Seçici ──────────────────────────────────────────────────────────────
const ChipSelector = ({ options, selected, onSelect, color = COLORS.primary }) => (
  <View style={chipStyles.row}>
    {options.map((opt) => {
      const isSelected = selected === opt.id;
      return (
        <Pressable
          key={opt.id}
          style={[chipStyles.chip, isSelected && { backgroundColor: color, borderColor: color }]}
          onPress={() => onSelect(isSelected ? null : opt.id)}
        >
          <Ionicons name={opt.icon} size={13} color={isSelected ? COLORS.white : COLORS.textLight} />
          <Text style={[chipStyles.chipText, isSelected && { color: COLORS.white }]}>
            {opt.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const chipStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
});

// ─── Ana Ekran ────────────────────────────────────────────────────────────────
const AIScreen = ({ navigation }) => {
  const { user, userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('workout');
  const [kasGrubu, setKasGrubu] = useState(null);
  const [ogunTercihi, setOgunTercihi] = useState(null);
  const [hedef, setHedef] = useState(null);
  const [extraNote, setExtraNote] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});

  const loadUserData = useCallback(async () => {
    if (!user) return;
    const [sugarRes, statsRes, weekRes] = await Promise.all([
      getSugarRecords(user.uid),
      getUserStats(user.uid),
      getWeekActivitiesStatus(user.uid),
    ]);

    const sugarLevel = sugarRes.success && sugarRes.data.length > 0
      ? sugarRes.data[0].value : null;
    const stats = statsRes.success ? statsRes.data : {};
    const weeklyStats = weekRes.success ? calcWeeklyStats(weekRes.data) : {};

    const bmi = userProfile?.height && userProfile?.weight
      ? parseFloat((userProfile.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1))
      : null;

    setUserData({
      boy: userProfile?.height,
      kilo: userProfile?.weight,
      bmi,
      sugarLevel,
      weeklyCompletionRate: weeklyStats.completionRate ?? null,
      streakDays: stats?.streakDays ?? null,
    });
  }, [user, userProfile]);

  useFocusEffect(useCallback(() => {
    loadUserData();
    return () => { setResponse(null); };
  }, [loadUserData]));

  const handleAsk = () => {
    if (activeTab === 'workout' && !kasGrubu) {
      Alert.alert('Seçim Yap', 'Lütfen odaklanmak istediğin kas grubunu seç.');
      return;
    }
    if (activeTab === 'meal' && !ogunTercihi) {
      Alert.alert('Seçim Yap', 'Lütfen öneri istediğin öğünü seç.');
      return;
    }

    setLoading(true);
    setResponse(null);

    // Tamamen yerel — senkron, timeout ile gerçekçi hissi
    setTimeout(() => {
      const result = generateLocalAdvice(activeTab, {
        ...userData,
        kasGrubu,
        ogunTercihi,
        hedef,
      });
      setResponse(result);
      setLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setResponse(null);
    setKasGrubu(null);
    setOgunTercihi(null);
    setHedef(null);
    setExtraNote('');
  };

  const activeTabData = ADVICE_TABS.find((t) => t.id === activeTab);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#4A90E2', '#7BB8F7']} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Sağlık Koçu</Text>
          <Text style={styles.headerSub}>Kişiselleştirilmiş sağlık önerileri</Text>
        </View>
        <View style={styles.coachBadge}>
          <Ionicons name="heart" size={14} color={COLORS.white} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Kullanıcı veri özeti */}
        {(userData.sugarLevel || userData.streakDays != null) && (
          <View style={styles.dataCard}>
            <Text style={styles.dataCardTitle}>📊 Profilinden Alınan Veriler</Text>
            <View style={styles.dataGrid}>
              {userData.sugarLevel && (
                <View style={styles.dataPill}>
                  <Ionicons name="water" size={12} color="#FF6B6B" />
                  <Text style={styles.dataPillText}>{userData.sugarLevel} mg/dL</Text>
                </View>
              )}
              {userData.bmi && (
                <View style={styles.dataPill}>
                  <Ionicons name="body-outline" size={12} color="#4A90E2" />
                  <Text style={styles.dataPillText}>BMI {userData.bmi}</Text>
                </View>
              )}
              {userData.streakDays != null && (
                <View style={styles.dataPill}>
                  <Text style={{ fontSize: 12 }}>🔥</Text>
                  <Text style={styles.dataPillText}>{userData.streakDays} gün streak</Text>
                </View>
              )}
              {userData.weeklyCompletionRate != null && (
                <View style={styles.dataPill}>
                  <Ionicons name="bar-chart-outline" size={12} color="#51CF66" />
                  <Text style={styles.dataPillText}>%{userData.weeklyCompletionRate} haftalık</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Öneri Tipi Sekmeleri */}
        <Text style={styles.sectionLabel}>Ne Hakkında Öneri İstiyorsun?</Text>
        <View style={styles.tabRow}>
          {ADVICE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable key={tab.id} style={styles.tabCard} onPress={() => { setActiveTab(tab.id); setResponse(null); }}>
                <LinearGradient
                  colors={isActive ? tab.gradient : [COLORS.white, COLORS.white]}
                  style={styles.tabCardGradient}
                >
                  <Ionicons name={tab.icon} size={20} color={isActive ? COLORS.white : COLORS.textLight} />
                  <Text style={[styles.tabCardLabel, isActive && { color: COLORS.white }]}>{tab.label}</Text>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {/* Kas Grubu Seçimi */}
        {activeTab === 'workout' && (
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>
              <Ionicons name="barbell-outline" size={15} color={COLORS.primary} /> Hangi kas grubuna odaklanmak istiyorsun?
            </Text>
            <ChipSelector options={KAS_GRUPLARI} selected={kasGrubu} onSelect={setKasGrubu} color="#4A90E2" />
          </View>
        )}

        {/* Öğün Seçimi */}
        {activeTab === 'meal' && (
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>
              <Ionicons name="nutrition-outline" size={15} color="#51CF66" /> Hangi öğün için öneri istiyorsun?
            </Text>
            <ChipSelector options={OGUN_SECENEKLERI} selected={ogunTercihi} onSelect={setOgunTercihi} color="#51CF66" />
          </View>
        )}

        {/* Hedef Seçimi */}
        {activeTab !== 'motivation' && (
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>
              <Ionicons name="trophy-outline" size={15} color="#FFD700" /> Hedefin nedir?
            </Text>
            <ChipSelector options={HEDEFLER} selected={hedef} onSelect={setHedef} color="#FF9800" />
          </View>
        )}

        {/* Ek Not */}
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>
            <Ionicons name="create-outline" size={15} color={COLORS.textLight} /> Eklemek istediğin bir şey var mı? (opsiyonel)
          </Text>
          <TextInput
            style={styles.noteInput}
            value={extraNote}
            onChangeText={setExtraNote}
            placeholder="Örn: Diz ağrım var, bunu göz önünde bulundur..."
            placeholderTextColor={COLORS.textLight}
            multiline
            maxLength={200}
          />
        </View>

        {/* Öneri Al Butonu */}
        <Pressable
          style={[styles.askBtn, loading && { opacity: 0.6 }]}
          onPress={handleAsk}
          disabled={loading}
        >
          <LinearGradient
            colors={activeTabData?.gradient || ['#4A90E2', '#7BB8F7']}
            style={styles.askBtnGradient}
          >
            {loading ? (
              <>
                <ActivityIndicator color={COLORS.white} size="small" />
                <Text style={styles.askBtnText}>Hazırlanıyor...</Text>
              </>
            ) : (
              <>
                <Ionicons name="heart-outline" size={20} color={COLORS.white} />
                <Text style={styles.askBtnText}>Kişiselleştirilmiş Öneri Al</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        {/* Öneri Kartı */}
        {response && (
          <View style={styles.responseCard}>
            <View style={styles.responseHeader}>
              <LinearGradient
                colors={activeTabData?.gradient || ['#4A90E2', '#7BB8F7']}
                style={styles.responseIconBg}
              >
                <Ionicons name="heart" size={16} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.responseTitle}>Sağlık Koçunun Önerisi</Text>
              <Pressable onPress={handleAsk} style={styles.refreshBtn}>
                <Ionicons name="refresh-outline" size={18} color={COLORS.primary} />
              </Pressable>
            </View>

            <View style={styles.responseDivider} />

            <Text style={styles.responseText}>{response}</Text>

            <Pressable style={styles.newAdviceBtn} onPress={handleReset}>
              <Ionicons name="arrow-back-outline" size={15} color={COLORS.primary} />
              <Text style={styles.newAdviceBtnText}>Yeni Öneri İste</Text>
            </Pressable>
          </View>
        )}

        {/* Boş Durum */}
        {!response && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💚</Text>
            <Text style={styles.emptyTitle}>Sağlık koçun hazır!</Text>
            <Text style={styles.emptyText}>
              Yukarıdan öneri tipini seç, tercihlerini belirle ve kişiselleştirilmiş tavsiye al.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: SPACING.md,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn: { padding: 4, width: 36 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZE.xs, marginTop: 2 },
  coachBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  dataCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.small,
  },
  dataCardTitle: { fontSize: FONT_SIZE.sm, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },
  dataGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dataPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.background, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.border,
  },
  dataPillText: { fontSize: 12, color: COLORS.text, fontWeight: '600' },

  sectionLabel: { fontSize: FONT_SIZE.md, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },
  tabRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  tabCard: { flex: 1, borderRadius: BORDER_RADIUS.md, overflow: 'hidden', ...SHADOW.small },
  tabCardGradient: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 5,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
  },
  tabCardLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textLight, textAlign: 'center' },

  formCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.small,
  },
  formLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, lineHeight: 20 },
  noteInput: {
    backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.sm,
    fontSize: FONT_SIZE.sm, color: COLORS.text, minHeight: 64,
    textAlignVertical: 'top', lineHeight: 20,
  },

  askBtn: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', marginTop: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.medium },
  askBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  askBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: FONT_SIZE.md },

  responseCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING.md, marginTop: SPACING.sm, ...SHADOW.medium },
  responseHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  responseIconBg: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  responseTitle: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: 'bold', color: COLORS.text },
  refreshBtn: { padding: 6 },
  responseDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.md },
  responseText: { fontSize: FONT_SIZE.sm, color: COLORS.text, lineHeight: 24, letterSpacing: 0.1 },
  newAdviceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: SPACING.md, alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '12', paddingHorizontal: SPACING.sm,
    paddingVertical: 8, borderRadius: BORDER_RADIUS.sm,
  },
  newAdviceBtnText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 22, paddingHorizontal: SPACING.lg },
});

export default AIScreen;
