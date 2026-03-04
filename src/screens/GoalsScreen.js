import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { getTodayActivities } from '../firebase/activityService';
import { getSugarRecords } from '../firebase/sugarService';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, FONT_SIZE, SHADOW } from '../constants/styles';

const GoalsScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [sugarRecords, setSugarRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [actResult, sugarResult] = await Promise.all([
      getTodayActivities(user.uid),
      getSugarRecords(user.uid),
    ]);
    if (actResult.success) setActivities(actResult.data);
    if (sugarResult.success) setSugarRecords(sugarResult.data);
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const completed = activities.filter((a) => a.completed).length;
  const total = activities.length;
  const progress = total > 0 ? completed / total : 0;

  const latestSugar = sugarRecords.length > 0 ? sugarRecords[0].value : null;
  const sugarGoalMet = latestSugar && latestSugar >= 70 && latestSugar <= 180;

  const bmi = userProfile?.height && userProfile?.weight
    ? userProfile.weight / Math.pow(userProfile.height / 100, 2)
    : null;

  const goals = [
    {
      id: 'activity',
      title: 'Günlük Aktivite',
      subtitle: `${completed}/${total} aktivite tamamlandı`,
      progress: progress,
      color: '#4A90E2',
      icon: 'fitness-outline',
      status: progress === 1 ? 'done' : progress > 0 ? 'partial' : 'empty',
      actionLabel: 'Aktivitelere Git',
      actionScreen: 'Activities',
    },
    {
      id: 'sugar',
      title: 'Kan Şekeri Kontrolü',
      subtitle: latestSugar
        ? `Son: ${latestSugar} mg/dL - ${sugarGoalMet ? 'Hedefte ✓' : 'Hedef dışında'}`
        : 'Henüz ölçüm yok',
      progress: latestSugar ? (sugarGoalMet ? 1 : 0.4) : 0,
      color: '#FF6B6B',
      icon: 'water-outline',
      status: latestSugar ? (sugarGoalMet ? 'done' : 'partial') : 'empty',
      actionLabel: 'Ölçüm Ekle',
      actionScreen: 'Sugar',
    },
    {
      id: 'water',
      title: 'Su Hedefi',
      subtitle: `Hedef: ${userProfile?.weight ? Math.round(userProfile.weight * 0.033 * 10) / 10 : 2.5} L/gün`,
      progress: 0,
      color: '#51CF66',
      icon: 'water',
      status: 'empty',
      actionLabel: null,
      actionScreen: null,
    },
  ];

  const goalLabel = userProfile?.healthGoal === 'lose_weight'
    ? '⚖️ Kilo Vermek'
    : userProfile?.healthGoal === 'gain_muscle'
    ? '💪 Kas Kazanmak'
    : '🩸 Kan Şekeri Kontrolü';

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <LinearGradient colors={['#FFD700', '#FF9800']} style={styles.header}>
        <Ionicons name="trophy" size={36} color={COLORS.white} style={{ marginBottom: 6 }} />
        <Text style={styles.headerTitle}>Hedeflerim</Text>
        <Text style={styles.headerSub}>Bugünkü ilerlemenı takip et</Text>
        <View style={styles.mainGoalBadge}>
          <Text style={styles.mainGoalText}>Ana Hedef: {goalLabel}</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Haftalık Plan Kartı */}
        <Pressable style={styles.weeklyPlanCard} onPress={() => navigation.navigate('WeeklyPlan')}>
          <LinearGradient colors={['#4A90E2', '#2C6FBF']} style={styles.weeklyPlanGradient}>
            <View style={styles.weeklyPlanLeft}>
              <Ionicons name="calendar" size={30} color={COLORS.white} />
              <View>
                <Text style={styles.weeklyPlanTitle}>Haftalık Plan</Text>
                <Text style={styles.weeklyPlanSub}>7 günlük spor & beslenme planın</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        </Pressable>

        {/* Günlük Özet */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>📊 Günlük Özet</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>{completed}</Text>
              <Text style={styles.summaryLabel}>Tamamlanan</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>{total - completed}</Text>
              <Text style={styles.summaryLabel}>Kalan</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryValue, { color: progress === 1 ? '#51CF66' : COLORS.primary }]}>
                {Math.round(progress * 100)}%
              </Text>
              <Text style={styles.summaryLabel}>Başarı</Text>
            </View>
          </View>
        </View>

        {/* Hedef Kartları */}
        <Text style={styles.sectionTitle}>Hedefler</Text>
        {goals.map((goal) => (
          <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={[styles.goalIconBg, { backgroundColor: goal.color + '20' }]}>
                <Ionicons name={goal.icon} size={22} color={goal.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
              </View>
              <View style={[styles.statusBadge, {
                backgroundColor:
                  goal.status === 'done' ? '#51CF6620' :
                  goal.status === 'partial' ? '#FFA94D20' : COLORS.border + '50',
              }]}>
                <Ionicons
                  name={goal.status === 'done' ? 'checkmark-circle' : goal.status === 'partial' ? 'time' : 'ellipse-outline'}
                  size={16}
                  color={goal.status === 'done' ? '#51CF66' : goal.status === 'partial' ? '#FFA94D' : COLORS.textLight}
                />
              </View>
            </View>

            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${goal.progress * 100}%`, backgroundColor: goal.color }]} />
            </View>
            <Text style={styles.progressPercent}>{Math.round(goal.progress * 100)}% tamamlandı</Text>

            {goal.actionLabel && goal.actionScreen && (
              <Pressable
                style={[styles.actionBtn, { borderColor: goal.color }]}
                onPress={() => navigation.navigate(goal.actionScreen)}
              >
                <Text style={[styles.actionBtnText, { color: goal.color }]}>{goal.actionLabel}</Text>
                <Ionicons name="arrow-forward" size={14} color={goal.color} />
              </Pressable>
            )}
          </View>
        ))}

        {/* Profil Bilgileri */}
        {userProfile && (
          <View style={styles.profileCard}>
            <Text style={styles.cardTitle}>👤 Profil Bilgileri</Text>
            <View style={styles.infoGrid}>
              {[
                { label: 'Aktivite', value: userProfile.activityLevel === 'sedentary' ? 'Hareketsiz' : userProfile.activityLevel === 'moderate' ? 'Orta Aktif' : 'Çok Aktif', icon: 'walk-outline' },
                { label: 'BMI', value: bmi ? bmi.toFixed(1) : '-', icon: 'body-outline' },
                { label: 'Uyku', value: `${userProfile.sleepHours || 7} saat`, icon: 'moon-outline' },
                { label: 'Stres', value: `${userProfile.stressLevel || 3}/5`, icon: 'pulse-outline' },
              ].map((info) => (
                <View key={info.label} style={styles.infoItem}>
                  <Ionicons name={info.icon} size={20} color={COLORS.primary} />
                  <Text style={styles.infoValue}>{info.value}</Text>
                  <Text style={styles.infoLabel}>{info.label}</Text>
                </View>
              ))}
            </View>
            {userProfile.chronicDiseases && userProfile.chronicDiseases !== 'Yok' && (
              <View style={styles.diseaseBadge}>
                <Ionicons name="medical" size={14} color={COLORS.danger} />
                <Text style={styles.diseaseText}>{userProfile.chronicDiseases}</Text>
              </View>
            )}
          </View>
        )}

        {/* Kan Şekeri Son 5 Kayıt */}
        {sugarRecords.length > 0 && (
          <View style={styles.sugarCard}>
            <Text style={styles.cardTitle}>🩸 Son Kan Şekeri Ölçümleri</Text>
            {sugarRecords.slice(0, 5).map((record, index) => {
              const status = record.value < 70 ? 'low' : record.value <= 180 ? 'normal' : 'high';
              const statusColor = status === 'low' ? '#FF9800' : status === 'normal' ? '#51CF66' : '#FF6B6B';
              const statusLabel = status === 'low' ? 'Düşük' : status === 'normal' ? 'Normal' : 'Yüksek';
              return (
                <View key={record.id || index} style={styles.sugarRow}>
                  <View style={[styles.sugarDot, { backgroundColor: statusColor }]} />
                  <Text style={styles.sugarValue}>{record.value} mg/dL</Text>
                  <Text style={[styles.sugarStatus, { color: statusColor }]}>{statusLabel}</Text>
                  <Text style={styles.sugarDate}>
                    {new Date(record.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingTop: 54, paddingBottom: 28, paddingHorizontal: SPACING.lg, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZE.sm, marginBottom: SPACING.md },
  mainGoalBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  mainGoalText: { color: COLORS.white, fontWeight: '600', fontSize: FONT_SIZE.sm },
  body: { padding: SPACING.md },
  summaryCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.small },
  cardTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.md },
  summaryGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  summaryStat: { alignItems: 'center', flex: 1 },
  summaryValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  summaryLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, marginTop: 2 },
  summaryDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.md },
  goalCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.small },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  goalIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  goalTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  goalSubtitle: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, marginTop: 2 },
  statusBadge: { padding: 6, borderRadius: 14 },
  progressBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, marginBottom: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  progressPercent: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, marginBottom: SPACING.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderRadius: BORDER_RADIUS.sm, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  actionBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  profileCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.small },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.sm },
  infoItem: { alignItems: 'center', flex: 1 },
  infoValue: { fontSize: FONT_SIZE.md, fontWeight: 'bold', color: COLORS.text, marginTop: 4 },
  infoLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, marginTop: 2 },
  diseaseBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.danger + '10', borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm },
  diseaseText: { fontSize: FONT_SIZE.xs, color: COLORS.danger, fontWeight: '600', flex: 1 },
  sugarCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.small },
  sugarRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border + '40' },
  sugarDot: { width: 10, height: 10, borderRadius: 5 },
  sugarValue: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  sugarStatus: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  sugarDate: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },
  weeklyPlanCard: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md, ...SHADOW.medium },
  weeklyPlanGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md },
  weeklyPlanLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  weeklyPlanTitle: { color: COLORS.white, fontWeight: 'bold', fontSize: FONT_SIZE.lg },
  weeklyPlanSub: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.xs, marginTop: 2 },
});

export default GoalsScreen;
