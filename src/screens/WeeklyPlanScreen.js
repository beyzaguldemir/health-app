import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { generateWeeklyMealPlan, generateWeeklyActivityPlan } from '../utils/planGenerator';
import {
  saveWeeklyActivities, getWeekActivitiesStatus,
  toggleActivity, getWeekDate,
} from '../firebase/activityService';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, FONT_SIZE, SHADOW } from '../constants/styles';

const DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const GOAL_LABELS = {
  lose_weight: { label: 'Kilo Verme', icon: 'trending-down', color: '#FF6B6B' },
  gain_muscle: { label: 'Kas Yapma', icon: 'barbell', color: '#4A90E2' },
  control_blood_sugar: { label: 'Şeker Kontrolü', icon: 'water', color: '#51CF66' },
};

const TYPE_CONFIG = {
  cardio: { color: '#FF6B6B', icon: 'flame-outline', label: 'Kardiyo' },
  strength: { color: '#4A90E2', icon: 'barbell-outline', label: 'Kuvvet' },
  flexibility: { color: '#51CF66', icon: 'body-outline', label: 'Esneme' },
  rest: { color: '#ADB5BD', icon: 'moon-outline', label: 'Dinlenme' },
  manual: { color: '#9C27B0', icon: 'add-circle-outline', label: 'Manuel' },
};

const WeeklyPlanScreen = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('workout');
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // JS Pazar=0 → bizim Pazar=6
  });
  const [saving, setSaving] = useState(false);
  const [weekStatus, setWeekStatus] = useState({}); // { 'YYYY-MM-DD': { total, completed, activities } }
  const [loadingStatus, setLoadingStatus] = useState(true);

  const mealPlan = generateWeeklyMealPlan(userProfile);
  const workoutPlan = generateWeeklyActivityPlan(userProfile);

  const goal = userProfile?.healthGoal || 'control_blood_sugar';
  const goalConfig = GOAL_LABELS[goal] || GOAL_LABELS.control_blood_sugar;

  const loadStatus = useCallback(async () => {
    if (!user) return;
    setLoadingStatus(true);
    const result = await getWeekActivitiesStatus(user.uid);
    if (result.success) setWeekStatus(result.data);
    setLoadingStatus(false);
  }, [user]);

  useFocusEffect(useCallback(() => { loadStatus(); }, [loadStatus]));

  // Toplam haftalık tamamlanma
  const weekTotals = Object.values(weekStatus).reduce(
    (acc, d) => ({ total: acc.total + d.total, completed: acc.completed + d.completed }),
    { total: 0, completed: 0 }
  );

  const handleSaveToActivities = async () => {
    setSaving(true);
    const result = await saveWeeklyActivities(user.uid, workoutPlan);
    setSaving(false);
    if (result.success) {
      await loadStatus();
      Alert.alert(
        '✅ Kaydedildi!',
        'Haftalık spor planın Aktiviteler ekranına eklendi.',
        [
          { text: 'Aktivitelere Git', onPress: () => navigation.navigate('Activities') },
          { text: 'Tamam' },
        ]
      );
    } else {
      Alert.alert('Hata', `Kaydedilemedi: ${result.error}`);
    }
  };

  // Belirli bir gün + antrenman için Firestore activity id'sini hesapla
  const getActivityId = (dayIndex) => {
    const date = getWeekDate(dayIndex);
    const workout = workoutPlan[dayIndex];
    if (!workout || workout.isRest) return null;
    return `${date}_weekly_${workout.name.replace(/\s+/g, '_').slice(0, 20)}`;
  };

  const getActivityForDay = (dayIndex) => {
    const date = getWeekDate(dayIndex);
    const dayData = weekStatus[date];
    if (!dayData) return null;
    const workout = workoutPlan[dayIndex];
    if (!workout || workout.isRest) return null;
    return dayData.activities?.find((a) =>
      a.id === `${date}_weekly_${workout.name.replace(/\s+/g, '_').slice(0, 20)}`
    ) || null;
  };

  const handleToggleCurrentDay = async () => {
    const activity = getActivityForDay(selectedDay);
    if (!activity) {
      Alert.alert('Önce Kaydet', 'Önce "Aktivitelere Ekle" butonuna bas.');
      return;
    }
    await toggleActivity(user.uid, activity.id, !activity.completed, activity);
    await loadStatus();
  };

  const currentMeal = mealPlan[selectedDay];
  const currentWorkout = workoutPlan[selectedDay];
  const currentActivity = getActivityForDay(selectedDay);
  const currentDate = getWeekDate(selectedDay);
  const currentDayStatus = weekStatus[currentDate];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#4A90E2', '#7BB8F7']} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Haftalık Plan</Text>
          <View style={styles.goalBadge}>
            <Ionicons name={goalConfig.icon} size={13} color={COLORS.white} />
            <Text style={styles.goalBadgeText}>{goalConfig.label}</Text>
          </View>
        </View>
        {/* Haftalık ilerleme */}
        <View style={styles.weekProgress}>
          <Text style={styles.weekProgressText}>
            {weekTotals.completed}/{weekTotals.total}
          </Text>
          <Text style={styles.weekProgressLabel}>Bu hafta</Text>
        </View>
      </LinearGradient>

      {/* Haftalık ilerleme çubuğu */}
      {weekTotals.total > 0 && (
        <View style={styles.weekBar}>
          <View style={styles.weekBarBg}>
            <View style={[styles.weekBarFill, { width: `${(weekTotals.completed / weekTotals.total) * 100}%` }]} />
          </View>
          <Text style={styles.weekBarText}>
            {Math.round((weekTotals.completed / weekTotals.total) * 100)}% tamamlandı
          </Text>
        </View>
      )}

      {/* Tab */}
      <View style={styles.tabBar}>
        <Pressable style={[styles.tabBtn, activeTab === 'workout' && styles.tabBtnActive]} onPress={() => setActiveTab('workout')}>
          <Ionicons name="barbell-outline" size={15} color={activeTab === 'workout' ? COLORS.white : COLORS.textLight} />
          <Text style={[styles.tabBtnText, activeTab === 'workout' && styles.tabBtnTextActive]}>💪 Spor Planı</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, activeTab === 'meal' && styles.tabBtnActive]} onPress={() => setActiveTab('meal')}>
          <Ionicons name="nutrition-outline" size={15} color={activeTab === 'meal' ? COLORS.white : COLORS.textLight} />
          <Text style={[styles.tabBtnText, activeTab === 'meal' && styles.tabBtnTextActive]}>🥗 Beslenme</Text>
        </Pressable>
      </View>

      {/* Gün Seçici */}
      <View style={styles.dayBar}>
        {DAY_LABELS.map((label, i) => {
          const date = getWeekDate(i);
          const dayData = weekStatus[date];
          const isRest = workoutPlan[i]?.isRest;
          const isActive = selectedDay === i;
          const isCompleted = dayData && dayData.total > 0 && dayData.completed >= dayData.total;
          const isPartial = dayData && dayData.completed > 0 && !isCompleted;

          return (
            <Pressable key={i} style={[styles.dayBtn, isActive && styles.dayBtnActive]} onPress={() => setSelectedDay(i)}>
              <Text style={[styles.dayBtnLabel, isActive && styles.dayBtnLabelActive]}>{label}</Text>
              {isRest ? (
                <Ionicons name="moon" size={9} color={isActive ? 'rgba(255,255,255,0.7)' : '#ADB5BD'} />
              ) : isCompleted ? (
                <Ionicons name="checkmark-circle" size={11} color={isActive ? COLORS.white : '#51CF66'} />
              ) : isPartial ? (
                <View style={[styles.dayDot, { backgroundColor: isActive ? COLORS.white : '#FFD700' }]} />
              ) : dayData?.total > 0 ? (
                <View style={[styles.dayDot, { backgroundColor: isActive ? 'rgba(255,255,255,0.5)' : COLORS.border }]} />
              ) : (
                <View style={[styles.dayDot, { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : COLORS.border }]} />
              )}
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* ── SPOR PLANI ── */}
        {activeTab === 'workout' && (
          <>
            {currentWorkout?.isRest ? (
              <View style={styles.restCard}>
                <Text style={styles.restEmoji}>😴</Text>
                <Text style={styles.restTitle}>Dinlenme Günü</Text>
                <Text style={styles.restText}>{currentWorkout.details}</Text>
              </View>
            ) : currentWorkout ? (
              <>
                {/* Tamamlanma durumu */}
                {currentDayStatus?.total > 0 && (
                  <View style={styles.statusBar}>
                    <View style={styles.statusBarBg}>
                      <View style={[styles.statusBarFill, {
                        width: `${(currentDayStatus.completed / currentDayStatus.total) * 100}%`,
                        backgroundColor: currentDayStatus.completed >= currentDayStatus.total ? '#51CF66' : '#FFD700',
                      }]} />
                    </View>
                    <Text style={styles.statusBarText}>
                      {currentDayStatus.completed}/{currentDayStatus.total} tamamlandı
                    </Text>
                  </View>
                )}

                <View style={[styles.workoutCard, { borderLeftColor: TYPE_CONFIG[currentWorkout.type]?.color || COLORS.primary }]}>
                  <View style={styles.workoutCardTop}>
                    <View style={[styles.workoutIconBg, { backgroundColor: (TYPE_CONFIG[currentWorkout.type]?.color || COLORS.primary) + '20' }]}>
                      <Ionicons name={TYPE_CONFIG[currentWorkout.type]?.icon || 'fitness-outline'} size={26} color={TYPE_CONFIG[currentWorkout.type]?.color || COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.workoutName}>{currentWorkout.name}</Text>
                      <View style={styles.workoutMeta}>
                        <View style={[styles.typePill, { backgroundColor: (TYPE_CONFIG[currentWorkout.type]?.color || COLORS.primary) + '20' }]}>
                          <Text style={[styles.typePillText, { color: TYPE_CONFIG[currentWorkout.type]?.color || COLORS.primary }]}>
                            {TYPE_CONFIG[currentWorkout.type]?.label || 'Egzersiz'}
                          </Text>
                        </View>
                        <View style={styles.durationPill}>
                          <Ionicons name="time-outline" size={12} color={COLORS.textLight} />
                          <Text style={styles.durationText}>{currentWorkout.duration} dk</Text>
                        </View>
                      </View>
                    </View>
                    {/* Tamamlandı rozeti */}
                    {currentActivity?.completed && (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={22} color="#51CF66" />
                      </View>
                    )}
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.workoutDetails}>{currentWorkout.details}</Text>

                  {/* Tamamla butonu */}
                  {currentDayStatus?.total > 0 && (
                    <Pressable
                      style={[styles.completeBtn, currentActivity?.completed && styles.completeBtnDone]}
                      onPress={handleToggleCurrentDay}
                    >
                      <Ionicons
                        name={currentActivity?.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                        size={20}
                        color={currentActivity?.completed ? '#51CF66' : COLORS.textLight}
                      />
                      <Text style={[styles.completeBtnText, currentActivity?.completed && styles.completeBtnTextDone]}>
                        {currentActivity?.completed ? 'Tamamlandı ✓' : 'Tamamlandı Olarak İşaretle'}
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* Günlük Nefes Egzersizi Kartı */}
                {(() => {
                  const breathDate = getWeekDate(selectedDay);
                  const breathId = `${breathDate}_breathing_daily`;
                  const breathActivity = weekStatus[breathDate]?.activities?.find(
                    (a) => a.id === breathId
                  );
                  return (
                    <View style={styles.breathCard}>
                      <View style={styles.breathHeader}>
                        <View style={styles.breathIconBg}>
                          <Ionicons name="wind-outline" size={20} color="#7C4DFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.breathTitle}>Günlük Nefes Egzersizi</Text>
                          <Text style={styles.breathSub}>5 dk · Stres azaltma +10 puan</Text>
                        </View>
                        {breathActivity?.completed && (
                          <Ionicons name="checkmark-circle" size={22} color="#51CF66" />
                        )}
                      </View>
                      <View style={styles.breathActions}>
                        {breathActivity ? (
                          <Pressable
                            style={[styles.breathToggleBtn, breathActivity.completed && styles.breathToggleDone]}
                            onPress={() => toggleActivity(user.uid, breathId, !breathActivity.completed, breathActivity).then(loadStatus)}
                          >
                            <Ionicons
                              name={breathActivity.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                              size={16}
                              color={breathActivity.completed ? '#51CF66' : COLORS.textLight}
                            />
                            <Text style={[styles.breathToggleText, breathActivity.completed && { color: '#51CF66' }]}>
                              {breathActivity.completed ? 'Tamamlandı' : 'Tamamlandı Olarak İşaretle'}
                            </Text>
                          </Pressable>
                        ) : (
                          <Text style={styles.breathHint}>Planı kaydet ardından burada görünür</Text>
                        )}
                        <Pressable style={styles.breathDoBtn} onPress={() => navigation.navigate('BreathingExercise')}>
                          <Text style={styles.breathDoBtnText}>Egzersizi Yap →</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })()}

                <View style={styles.tipsCard}>
                  <Text style={styles.tipsTitle}>💡 Antrenman İpuçları</Text>
                  {['Egzersizden önce 5-10 dk ısınma yap', 'Her set arasında 60-90 sn dinlen', 'Bol su içmeyi unutma', 'Antrenman sonrası protein al'].map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <View style={styles.tipDot} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            {/* Haftalık Özet Tablosu */}
            <View style={styles.weekTable}>
              <Text style={styles.weekTableTitle}>📅 Haftalık Program</Text>
              {workoutPlan.map((day, i) => {
                const date = getWeekDate(i);
                const dayData = weekStatus[date];
                const isSelected = selectedDay === i;
                const isCompleted = dayData && dayData.completed >= dayData.total && dayData.total > 0;
                const isPartial = dayData && dayData.completed > 0 && !isCompleted;

                return (
                  <Pressable
                    key={i}
                    style={[styles.tableRow, isSelected && styles.tableRowActive]}
                    onPress={() => setSelectedDay(i)}
                  >
                    <Text style={[styles.tableDay, isSelected && { color: COLORS.primary, fontWeight: 'bold' }]}>
                      {DAY_LABELS[i]}
                    </Text>
                    <View style={styles.tableInfo}>
                      {day.isRest ? (
                        <Text style={styles.tableRest}>😴 Dinlenme</Text>
                      ) : (
                        <>
                          <View style={[styles.tableDot, { backgroundColor: TYPE_CONFIG[day.type]?.color || COLORS.border }]} />
                          <Text style={[styles.tableName, isSelected && { color: COLORS.text, fontWeight: '600' }]} numberOfLines={1}>
                            {day.name}
                          </Text>
                          <Text style={styles.tableDuration}>{day.duration}dk</Text>
                        </>
                      )}
                    </View>
                    {/* Tamamlanma göstergesi */}
                    {isCompleted ? (
                      <Ionicons name="checkmark-circle" size={18} color="#51CF66" />
                    ) : isPartial ? (
                      <View style={styles.partialBadge}>
                        <Text style={styles.partialText}>{dayData.completed}/{dayData.total}</Text>
                      </View>
                    ) : dayData?.total > 0 ? (
                      <View style={styles.pendingDot} />
                    ) : (
                      <View style={styles.emptyDot} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* ── BESLENME PLANI ── */}
        {activeTab === 'meal' && currentMeal && (
          <>
            <View style={styles.kcalBadge}>
              <Ionicons name="flame" size={16} color="#FF6B6B" />
              <Text style={styles.kcalText}>Günlük tahmini: ~{currentMeal.kcal} kcal</Text>
            </View>

            {[
              { key: 'breakfast', label: '🌅 Kahvaltı', time: '07:00–08:00', color: '#FFD700' },
              { key: 'morningSnack', label: '🍎 Sabah Arası', time: '10:00–10:30', color: '#51CF66' },
              { key: 'lunch', label: '🌞 Öğle', time: '12:30–13:30', color: '#4A90E2' },
              { key: 'afternoonSnack', label: '🥜 Öğleden Sonra', time: '15:30–16:00', color: '#FF9800' },
              { key: 'dinner', label: '🌙 Akşam', time: '18:30–19:30', color: '#9C27B0' },
            ].map((meal) => (
              <View key={meal.key} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <View style={[styles.mealLine, { backgroundColor: meal.color }]} />
                  <View>
                    <Text style={styles.mealLabel}>{meal.label}</Text>
                    <Text style={styles.mealTime}>{meal.time}</Text>
                  </View>
                </View>
                <Text style={styles.mealContent}>{currentMeal[meal.key]}</Text>
              </View>
            ))}

            <View style={styles.weekTable}>
              <Text style={styles.weekTableTitle}>📅 Haftalık Kalori</Text>
              {mealPlan.map((day, i) => (
                <Pressable key={i} style={[styles.tableRow, selectedDay === i && styles.tableRowActive]} onPress={() => setSelectedDay(i)}>
                  <Text style={[styles.tableDay, selectedDay === i && { color: COLORS.primary, fontWeight: 'bold' }]}>{DAY_LABELS[i]}</Text>
                  <View style={styles.tableInfo}>
                    <Text style={styles.tableName}>~{day.kcal} kcal</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Alt Buton */}
      {activeTab === 'workout' && (
        <View style={styles.bottomBar}>
          {weekTotals.total === 0 ? (
            <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSaveToActivities} disabled={saving}>
              <LinearGradient colors={['#51CF66', '#2EAD4B']} style={styles.saveBtnGradient}>
                {saving ? <ActivityIndicator color={COLORS.white} size="small" /> : (
                  <>
                    <Ionicons name="add-circle-outline" size={22} color={COLORS.white} />
                    <Text style={styles.saveBtnText}>Haftalık Planı Aktivitelere Ekle</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          ) : (
            <View style={styles.bottomSummary}>
              <Pressable style={styles.reAddBtn} onPress={handleSaveToActivities} disabled={saving}>
                <Ionicons name="refresh-outline" size={18} color={COLORS.primary} />
                <Text style={styles.reAddText}>Planı Yenile</Text>
              </Pressable>
              <Pressable style={styles.goActivitiesBtn} onPress={() => navigation.navigate('Activities')}>
                <LinearGradient colors={['#4A90E2', '#2C6FBF']} style={styles.goActivitiesGradient}>
                  <Ionicons name="fitness-outline" size={18} color={COLORS.white} />
                  <Text style={styles.goActivitiesText}>Aktivitelere Git</Text>
                  <Text style={styles.goActivitiesCount}>{weekTotals.completed}/{weekTotals.total}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: 14, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  goalBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  goalBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  weekProgress: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  weekProgressText: { color: COLORS.white, fontWeight: 'bold', fontSize: FONT_SIZE.md },
  weekProgressLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
  weekBar: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.md, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  weekBarBg: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  weekBarFill: { height: 6, backgroundColor: '#51CF66', borderRadius: 3 },
  weekBarText: { fontSize: 11, color: COLORS.textLight, fontWeight: '600', width: 90, textAlign: 'right' },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.white, padding: 5, marginHorizontal: SPACING.md, marginTop: SPACING.sm, marginBottom: 4, borderRadius: BORDER_RADIUS.md, ...SHADOW.small },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: BORDER_RADIUS.sm },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabBtnText: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, fontWeight: '600' },
  tabBtnTextActive: { color: COLORS.white },
  dayBar: { flexDirection: 'row', paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, gap: 3 },
  dayBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.white, gap: 3, ...SHADOW.small },
  dayBtnActive: { backgroundColor: COLORS.primary },
  dayBtnLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textLight },
  dayBtnLabelActive: { color: COLORS.white },
  dayDot: { width: 5, height: 5, borderRadius: 3 },
  content: { flex: 1, paddingHorizontal: SPACING.md },
  statusBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  statusBarBg: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  statusBarFill: { height: 6, borderRadius: 3 },
  statusBarText: { fontSize: 11, color: COLORS.textLight, fontWeight: '600', width: 80, textAlign: 'right' },
  restCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.md, ...SHADOW.small },
  restEmoji: { fontSize: 48, marginBottom: 8 },
  restTitle: { fontSize: FONT_SIZE.xl, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  restText: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },
  workoutCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderLeftWidth: 4, ...SHADOW.small },
  workoutCardTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  workoutIconBg: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  workoutName: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  workoutMeta: { flexDirection: 'row', gap: 8 },
  typePill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  typePillText: { fontSize: 11, fontWeight: '700' },
  durationPill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  durationText: { fontSize: 12, color: COLORS.textLight },
  completedBadge: { marginLeft: 'auto' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  workoutDetails: { fontSize: FONT_SIZE.sm, color: COLORS.text, lineHeight: 22, marginBottom: SPACING.sm },
  completeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  completeBtnDone: { backgroundColor: '#F0FFF4', borderColor: '#51CF66' },
  completeBtnText: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, fontWeight: '600' },
  completeBtnTextDone: { color: '#51CF66' },
  tipsCard: { backgroundColor: '#FFF9E6', borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  tipsTitle: { fontSize: FONT_SIZE.sm, fontWeight: 'bold', color: '#856404', marginBottom: SPACING.sm },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD700', marginTop: 6 },
  tipText: { flex: 1, fontSize: FONT_SIZE.xs, color: '#6B5B00', lineHeight: 18 },
  weekTable: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.small },
  weekTableTitle: { fontSize: FONT_SIZE.md, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.border + '40', gap: SPACING.sm },
  tableRowActive: { backgroundColor: COLORS.primary + '08', borderRadius: BORDER_RADIUS.sm, paddingHorizontal: 4 },
  tableDay: { width: 30, fontSize: FONT_SIZE.sm, color: COLORS.textLight, fontWeight: '600' },
  tableInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  tableDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  tableName: { flex: 1, fontSize: FONT_SIZE.sm, color: COLORS.text },
  tableDuration: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },
  tableRest: { fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  partialBadge: { backgroundColor: '#FFF3CD', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  partialText: { fontSize: 11, color: '#856404', fontWeight: '700' },
  pendingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border },
  emptyDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: COLORS.border },
  kcalBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF0F0', borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm },
  kcalText: { fontSize: FONT_SIZE.sm, color: '#E53935', fontWeight: '600' },
  mealCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.small },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 8 },
  mealLine: { width: 4, height: 38, borderRadius: 2 },
  mealLabel: { fontSize: FONT_SIZE.md, fontWeight: 'bold', color: COLORS.text },
  mealTime: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, marginTop: 1 },
  mealContent: { fontSize: FONT_SIZE.sm, color: COLORS.text, lineHeight: 20, paddingLeft: SPACING.sm },
  bottomBar: { padding: SPACING.md, paddingBottom: 26, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  saveBtn: { borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
  saveBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  saveBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: FONT_SIZE.md },
  bottomSummary: { flexDirection: 'row', gap: SPACING.sm },
  reAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 12 },
  reAddText: { color: COLORS.primary, fontWeight: '600', fontSize: FONT_SIZE.sm },
  goActivitiesBtn: { flex: 1, borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
  goActivitiesGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  goActivitiesText: { color: COLORS.white, fontWeight: 'bold', fontSize: FONT_SIZE.sm },
  goActivitiesCount: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZE.sm, fontWeight: '700' },

  breathCard: {
    backgroundColor: '#F8F0FF', borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm, borderLeftWidth: 4, borderLeftColor: '#7C4DFF',
    ...SHADOW.small,
  },
  breathHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  breathIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7C4DFF20', alignItems: 'center', justifyContent: 'center' },
  breathTitle: { fontSize: FONT_SIZE.md, fontWeight: 'bold', color: '#4A148C' },
  breathSub: { fontSize: FONT_SIZE.xs, color: '#7C4DFF', marginTop: 2 },
  breathActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  breathToggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border, flex: 1 },
  breathToggleDone: { backgroundColor: '#F0FFF4', borderColor: '#51CF66' },
  breathToggleText: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, fontWeight: '600', flex: 1 },
  breathHint: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, flex: 1, fontStyle: 'italic' },
  breathDoBtn: { backgroundColor: '#7C4DFF', borderRadius: BORDER_RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 8 },
  breathDoBtnText: { color: COLORS.white, fontSize: FONT_SIZE.xs, fontWeight: 'bold' },
});

export default WeeklyPlanScreen;
