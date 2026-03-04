import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  TextInput, Modal, ActivityIndicator, Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import {
  getTodayActivities, toggleActivity, deleteActivity, addManualActivity,
} from '../firebase/activityService';
import { getMotivationMessage, calcDailyStats } from '../utils/progressUtils';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, FONT_SIZE, SHADOW } from '../constants/styles';

const TYPE_COLORS = {
  cardio: { bg: '#FF6B6B20', text: '#E53935', icon: 'flame-outline' },
  strength: { bg: '#4A90E220', text: '#1565C0', icon: 'barbell-outline' },
  flexibility: { bg: '#51CF6620', text: '#2E7D32', icon: 'body-outline' },
  manual: { bg: '#9C27B020', text: '#7B1FA2', icon: 'add-circle-outline' },
  other: { bg: '#FF980020', text: '#E65100', icon: 'fitness-outline' },
};

const ActivityScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualDuration, setManualDuration] = useState('');

  const loadActivities = useCallback(async () => {
    if (!user) return;
    const result = await getTodayActivities(user.uid);
    if (result.success) setActivities(result.data);
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { loadActivities(); }, [loadActivities]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const handleToggle = async (activity) => {
    const newStatus = !activity.completed;
    const updatedList = activities.map((a) =>
      a.id === activity.id ? { ...a, completed: newStatus } : a
    );
    setActivities(updatedList);
    await toggleActivity(user.uid, activity.id, newStatus, { ...activity, completed: newStatus });

    if (newStatus) {
      const stats = calcDailyStats(updatedList);
      const msg = getMotivationMessage(stats.completionRate, 0);
      // Kısa motivasyon toast benzeri Alert (sadece tamamlandığında)
      if (stats.completionRate >= 100) {
        Alert.alert('🎉 Tebrikler!', msg.text);
      }
    }
  };

  const handleDelete = (activityId) => {
    Alert.alert('Sil', 'Bu aktiviteyi silmek istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          setActivities((prev) => prev.filter((a) => a.id !== activityId));
          await deleteActivity(user.uid, activityId);
        },
      },
    ]);
  };

  const handleAddManual = async () => {
    if (!manualName.trim()) { Alert.alert('Hata', 'Aktivite adı girin'); return; }
    const dur = parseInt(manualDuration) || 30;
    await addManualActivity(user.uid, manualName.trim(), dur);
    setManualName('');
    setManualDuration('');
    setAddModalVisible(false);
    await loadActivities();
  };

  const completed = activities.filter((a) => a.completed).length;
  const total = activities.length;
  const progress = total > 0 ? completed / total : 0;

  const renderItem = ({ item }) => {
    const typeStyle = TYPE_COLORS[item.type] || TYPE_COLORS.other;
    return (
      <Pressable
        style={[styles.activityCard, item.completed && styles.activityCardDone]}
        onPress={() => handleToggle(item)}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={[styles.checkCircle, item.completed && styles.checkCircleDone]}>
          {item.completed && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
        </View>
        <View style={styles.activityInfo}>
          <Text style={[styles.activityName, item.completed && styles.activityNameDone]}>{item.name}</Text>
          <View style={styles.activityMeta}>
            <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
              <Ionicons name={typeStyle.icon} size={11} color={typeStyle.text} />
              <Text style={[styles.typeBadgeText, { color: typeStyle.text }]}>{item.type}</Text>
            </View>
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={11} color={COLORS.textLight} />
              <Text style={styles.durationText}>{item.duration} dk</Text>
            </View>
          </View>
          {item.description && item.description !== 'Manuel eklendi' && (
            <Text style={styles.activityDesc}>{item.description}</Text>
          )}
        </View>
        {item.completed && <Ionicons name="trophy" size={18} color="#FFD700" />}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4A90E2', '#7BB8F7']} style={styles.header}>
        <Text style={styles.headerTitle}>Aktiviteler</Text>
        <Text style={styles.headerSub}>
          {completed}/{total} tamamlandı • {Math.round(progress * 100)}%
        </Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListHeaderComponent={
            <View style={styles.featureRow}>
              <Pressable style={styles.featureCard} onPress={() => navigation.navigate('WeeklyPlan')}>
                <LinearGradient colors={['#4A90E2', '#7BB8F7']} style={styles.featureGradient}>
                  <View style={styles.featureIconBg}>
                    <Ionicons name="calendar-outline" size={26} color="#4A90E2" />
                  </View>
                  <Text style={styles.featureTitle}>Haftalık Spor{'\n'}Planım</Text>
                  <View style={styles.featureArrow}>
                    <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.8)" />
                  </View>
                </LinearGradient>
              </Pressable>

              <Pressable style={styles.featureCard} onPress={() => navigation.navigate('BreathingExercise')}>
                <LinearGradient colors={['#7C4DFF', '#B39DDB']} style={styles.featureGradient}>
                  <View style={styles.featureIconBg}>
                    <Ionicons name="wind-outline" size={26} color="#7C4DFF" />
                  </View>
                  <Text style={styles.featureTitle}>Nefes{'\n'}Egzersizi</Text>
                  <View style={styles.featureArrow}>
                    <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.8)" />
                  </View>
                </LinearGradient>
              </Pressable>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="fitness-outline" size={52} color={COLORS.border} />
              <Text style={styles.emptyTitle}>Aktivite yok</Text>
              <Text style={styles.emptyText}>Aşağıdaki "+" butonuyla aktivite ekleyebilirsin.</Text>
            </View>
          }
        />
      )}

      <Pressable style={styles.fab} onPress={() => setAddModalVisible(true)}>
        <LinearGradient colors={['#4A90E2', '#2C6FBF']} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color={COLORS.white} />
        </LinearGradient>
      </Pressable>

      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Aktivite Ekle</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Aktivite adı (örn: Yürüyüş)"
              value={manualName}
              onChangeText={setManualName}
              placeholderTextColor={COLORS.textLight}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Süre (dakika, varsayılan 30)"
              value={manualDuration}
              onChangeText={setManualDuration}
              keyboardType="numeric"
              placeholderTextColor={COLORS.textLight}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancel} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.modalCancelText}>İptal</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={handleAddManual}>
                <LinearGradient colors={['#4A90E2', '#2C6FBF']} style={styles.modalSaveGradient}>
                  <Text style={styles.modalSaveText}>Ekle</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 54, paddingBottom: 24, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZE.sm, marginBottom: 12 },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 },
  progressBarFill: { height: 8, backgroundColor: COLORS.white, borderRadius: 4 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: SPACING.md, paddingBottom: 100 },
  activityCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOW.small,
  },
  activityCardDone: { opacity: 0.7, borderColor: '#51CF66', backgroundColor: '#F9FFF9' },
  checkCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  checkCircleDone: { backgroundColor: '#51CF66', borderColor: '#51CF66' },
  activityInfo: { flex: 1 },
  activityName: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  activityNameDone: { textDecorationLine: 'line-through', color: COLORS.textLight },
  activityMeta: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  durationText: { fontSize: 11, color: COLORS.textLight },
  activityDesc: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, marginTop: 4, lineHeight: 16 },
  featureRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  featureCard: { flex: 1, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOW.medium },
  featureGradient: { padding: SPACING.md, minHeight: 120, justifyContent: 'space-between' },
  featureIconBg: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  featureTitle: { color: COLORS.white, fontWeight: 'bold', fontSize: FONT_SIZE.sm, lineHeight: 20 },
  featureArrow: { alignSelf: 'flex-end' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.textLight, marginTop: SPACING.md },
  emptyText: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: SPACING.lg },
  fab: { position: 'absolute', bottom: 24, right: 20, borderRadius: 28, overflow: 'hidden', ...SHADOW.medium },
  fabGradient: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.lg, paddingBottom: 40 },
  modalTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.md },
  modalInput: { backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  modalButtons: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  modalCancel: { flex: 1, padding: 14, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  modalCancelText: { color: COLORS.text, fontWeight: '600' },
  modalSave: { flex: 1, borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
  modalSaveGradient: { padding: 14, alignItems: 'center' },
  modalSaveText: { color: COLORS.white, fontWeight: 'bold' },
});

export default ActivityScreen;
