import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { getSugarRecords } from '../firebase/sugarService';
import { getUserStats } from '../firebase/statsService';
import { getWeekActivitiesStatus, getTodayActivities } from '../firebase/activityService';
import {
  calculateHealthScore, getHealthScoreColor, getGreeting, generatePersonalPlan,
} from '../utils/planGenerator';
import { calcWeeklyStats, calcDailyStats, getMotivationMessage, getStreakColor } from '../utils/progressUtils';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, FONT_SIZE, SHADOW } from '../constants/styles';

const HomeScreen = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const [latestSugar, setLatestSugar] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const [sugarResult, statsResult, weekResult, todayResult] = await Promise.all([
      getSugarRecords(user.uid),
      getUserStats(user.uid),
      getWeekActivitiesStatus(user.uid),
      getTodayActivities(user.uid),
    ]);

    if (sugarResult.success && sugarResult.data.length > 0) {
      setLatestSugar(sugarResult.data[0].value);
    }
    if (statsResult.success) setUserStats(statsResult.data);
    if (weekResult.success) setWeeklyStats(calcWeeklyStats(weekResult.data));
    if (todayResult.success) setTodayStats(calcDailyStats(todayResult.data));

    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const plan = generatePersonalPlan(userProfile, latestSugar);
  const healthScore = calculateHealthScore(userProfile, latestSugar);
  const scoreColor = getHealthScoreColor(healthScore);
  const greeting = getGreeting();
  const firstName = userProfile?.name?.split(' ')[0] || 'Kullanıcı';

  const motivation = weeklyStats && todayStats
    ? getMotivationMessage(todayStats.completionRate, weeklyStats.completedDays)
    : null;

  const streakColor = userStats ? getStreakColor(userStats.streakDays || 0) : COLORS.primary;

  const quickActions = [
    { id: 1, title: 'Sağlık Koçu', icon: 'heart', color: '#51CF66', screen: 'AI' },
    { id: 2, title: 'Haftalık Plan', icon: 'calendar', color: '#4A90E2', screen: 'WeeklyPlan' },
    { id: 3, title: 'Kan Şekeri', icon: 'water', color: '#FF6B6B', screen: 'Sugar' },
    { id: 4, title: 'Hedefler', icon: 'trophy', color: '#FFD700', screen: 'Goals' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Header */}
      <LinearGradient colors={['#4A90E2', '#7BB8F7']} style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>{greeting} 👋</Text>
            <Text style={styles.nameText}>{firstName}</Text>
          </View>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>{healthScore}</Text>
            <Text style={styles.scoreLabel}>Skor</Text>
          </View>
        </View>
        <View style={styles.headerStats}>
          {latestSugar ? (
            <View style={styles.statBadge}>
              <Ionicons name="water" size={14} color={COLORS.white} />
              <Text style={styles.statBadgeText}>Son: {latestSugar} mg/dL</Text>
            </View>
          ) : (
            <View style={styles.statBadge}>
              <Ionicons name="add-circle-outline" size={14} color={COLORS.white} />
              <Text style={styles.statBadgeText}>Kan şekeri gir</Text>
            </View>
          )}
          {userProfile?.chronicDiseases && userProfile.chronicDiseases !== 'Yok' && (
            <View style={styles.statBadge}>
              <Ionicons name="medical" size={14} color={COLORS.white} />
              <Text style={styles.statBadgeText}>{userProfile.chronicDiseases.split(',')[0]}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.body}>

        {/* ── İlerleme Dashboard ── */}
        {(weeklyStats || userStats) && (
          <>
            <Text style={styles.sectionTitle}>Bu Haftaki Durumun</Text>
            <View style={styles.statsGrid}>

              {/* Haftalık İlerleme */}
              {weeklyStats && (
                <View style={[styles.statsCard, styles.statsCardWide]}>
                  <View style={styles.statsCardHeader}>
                    <View style={[styles.statsIconBg, { backgroundColor: '#4A90E215' }]}>
                      <Ionicons name="bar-chart-outline" size={18} color="#4A90E2" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.statsLabel}>Haftalık İlerleme</Text>
                      <Text style={styles.statsValue}>{weeklyStats.completionRate}%</Text>
                    </View>
                    <Text style={styles.statsSubRight}>
                      {weeklyStats.totalCompleted}/{weeklyStats.totalPlanned}
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, {
                      width: `${weeklyStats.completionRate}%`,
                      backgroundColor: weeklyStats.completionRate >= 80 ? '#51CF66'
                        : weeklyStats.completionRate >= 50 ? '#4A90E2' : '#FF9800',
                    }]} />
                  </View>
                  <Text style={styles.statsCaption}>
                    {weeklyStats.completedDays}/7 gün tamamlandı
                  </Text>
                </View>
              )}

              {/* Streak */}
              {userStats && (
                <View style={styles.statsCard}>
                  <View style={[styles.statsIconBg, { backgroundColor: streakColor + '20' }]}>
                    <Text style={styles.fireEmoji}>🔥</Text>
                  </View>
                  <Text style={[styles.statsValueLg, { color: streakColor }]}>
                    {userStats.streakDays || 0}
                  </Text>
                  <Text style={styles.statsLabel}>Gün Üst Üste</Text>
                </View>
              )}

              {/* Stres Azaltma */}
              {userStats && (
                <View style={styles.statsCard}>
                  <View style={[styles.statsIconBg, { backgroundColor: '#7C4DFF15' }]}>
                    <Ionicons name="leaf-outline" size={18} color="#7C4DFF" />
                  </View>
                  <Text style={[styles.statsValueLg, { color: '#7C4DFF' }]}>
                    {userStats.totalStressReductionScore || 0}
                  </Text>
                  <Text style={styles.statsLabel}>Stres Azaltma</Text>
                </View>
              )}

              {/* Bugün */}
              {todayStats && (
                <View style={styles.statsCard}>
                  <View style={[styles.statsIconBg, { backgroundColor: '#51CF6615' }]}>
                    <Ionicons name="time-outline" size={18} color="#51CF66" />
                  </View>
                  <Text style={[styles.statsValueLg, { color: '#51CF66' }]}>
                    {todayStats.completedDuration}
                  </Text>
                  <Text style={styles.statsLabel}>Bugün (dk)</Text>
                </View>
              )}

            </View>

            {/* Motivasyon mesajı */}
            {motivation && (
              <Pressable
                style={[styles.motivationBanner, { borderLeftColor: motivation.color }]}
                onPress={() => navigation.navigate('Activities')}
              >
                <Text style={[styles.motivationBannerText, { color: motivation.color }]}>
                  {motivation.text}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={motivation.color} />
              </Pressable>
            )}
          </>
        )}

        {/* Günlük Plan Kartı */}
        <View style={styles.planCard}>
          <View style={styles.planCardHeader}>
            <View style={styles.planIcon}>
              <Ionicons name="today-outline" size={18} color={COLORS.white} />
            </View>
            <Text style={styles.planCardTitle}>Bugünkü Kişisel Planın</Text>
          </View>

          <View style={styles.planRow}>
            <Ionicons name="barbell-outline" size={18} color={COLORS.primary} />
            <Text style={styles.planText}>{plan.workoutPlan}</Text>
          </View>

          <View style={styles.planRow}>
            <Ionicons name="nutrition-outline" size={18} color={COLORS.secondary} />
            <Text style={styles.planText}>{plan.nutritionAdvice}</Text>
          </View>

          <View style={styles.planRow}>
            <Ionicons name="water-outline" size={18} color="#4A90E2" />
            <Text style={styles.planText}>💧 Günlük su hedefi: {plan.waterTarget} litre</Text>
          </View>

          <View style={styles.motivationBox}>
            <Text style={styles.motivationText}>{plan.motivationMessage}</Text>
          </View>
        </View>

        {/* Hızlı Erişim */}
        <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.quickIconBg, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text style={styles.quickCardTitle}>{item.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* Öz Bakım Özeti */}
        {userStats && (userStats.totalBreathingSessions > 0 || userStats.totalActivitiesCompleted > 0) && (
          <View style={styles.selfCareCard}>
            <Text style={styles.sectionTitle}>Öz Bakım Özeti</Text>
            <View style={styles.selfCareRow}>
              {[
                { label: 'Tamamlanan', value: userStats.totalActivitiesCompleted || 0, icon: 'checkmark-circle-outline', color: '#51CF66' },
                { label: 'Nefes Turu', value: userStats.totalBreathingSessions || 0, icon: 'wind-outline', color: '#7C4DFF' },
                { label: 'Öz Bakım', value: userStats.totalSelfCareScore || 0, icon: 'heart-outline', color: '#FF6B6B' },
              ].map((s) => (
                <View key={s.label} style={styles.selfCareStat}>
                  <Ionicons name={s.icon} size={20} color={s.color} />
                  <Text style={[styles.selfCareVal, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.selfCareLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Profil Özeti */}
        {userProfile && (
          <View style={styles.profileSummary}>
            <Text style={styles.sectionTitle}>Profil Özeti</Text>
            <View style={styles.profileGrid}>
              {[
                { label: 'Boy', value: `${userProfile.height} cm`, icon: 'resize-outline' },
                { label: 'Kilo', value: `${userProfile.weight} kg`, icon: 'scale-outline' },
                { label: 'Yaş', value: `${userProfile.age}`, icon: 'calendar-outline' },
                {
                  label: 'BMI',
                  value: userProfile.height && userProfile.weight
                    ? (userProfile.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1)
                    : '-',
                  icon: 'body-outline',
                },
              ].map((stat) => (
                <View key={stat.label} style={styles.profileStat}>
                  <Ionicons name={stat.icon} size={16} color={COLORS.primary} />
                  <Text style={styles.profileStatValue}>{stat.value}</Text>
                  <Text style={styles.profileStatLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: SPACING.sm, color: COLORS.textLight },
  headerGradient: { paddingTop: 54, paddingBottom: 28, paddingHorizontal: SPACING.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  greetingText: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZE.md },
  nameText: { color: COLORS.white, fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  scoreCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', ...SHADOW.small },
  scoreNumber: { fontSize: 22, fontWeight: 'bold' },
  scoreLabel: { fontSize: 10, color: COLORS.textLight, fontWeight: '600' },
  headerStats: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statBadgeText: { color: COLORS.white, fontSize: FONT_SIZE.xs, fontWeight: '600' },

  body: { padding: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },

  // Stats Dashboard
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  statsCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    flex: 1, minWidth: '45%', alignItems: 'center', ...SHADOW.small,
  },
  statsCardWide: { minWidth: '100%', alignItems: 'stretch' },
  statsCardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  statsIconBg: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  fireEmoji: { fontSize: 18 },
  statsLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, fontWeight: '600' },
  statsValue: { fontSize: FONT_SIZE.xl, fontWeight: 'bold', color: COLORS.text },
  statsValueLg: { fontSize: 28, fontWeight: 'bold', marginVertical: 4 },
  statsSubRight: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, fontWeight: '700' },
  statsCaption: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, marginTop: 4 },
  progressBarBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, borderRadius: 4 },

  motivationBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.md, borderLeftWidth: 4, ...SHADOW.small,
  },
  motivationBannerText: { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: '600', lineHeight: 20, marginRight: 8 },

  // Günlük Plan
  planCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.medium },
  planCardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  planIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  planCardTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text },
  planRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.sm, alignItems: 'flex-start' },
  planText: { flex: 1, fontSize: FONT_SIZE.sm, color: COLORS.text, lineHeight: 20 },
  motivationBox: { backgroundColor: COLORS.primary + '12', borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, marginTop: SPACING.xs },
  motivationText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '600', textAlign: 'center' },

  // Hızlı Erişim
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  quickCard: { width: '22%', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.sm, alignItems: 'center', justifyContent: 'center', minHeight: 80, ...SHADOW.small },
  quickIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  quickCardTitle: { fontSize: 10, fontWeight: '600', color: COLORS.text, textAlign: 'center' },

  // Öz Bakım
  selfCareCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.small },
  selfCareRow: { flexDirection: 'row', justifyContent: 'space-around' },
  selfCareStat: { alignItems: 'center', flex: 1 },
  selfCareVal: { fontSize: FONT_SIZE.xl, fontWeight: 'bold', marginVertical: 4 },
  selfCareLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, textAlign: 'center' },

  // Profil
  profileSummary: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, ...SHADOW.small, marginBottom: SPACING.md },
  profileGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  profileStat: { alignItems: 'center', flex: 1 },
  profileStatValue: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text, marginTop: 4 },
  profileStatLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },
});

export default HomeScreen;
