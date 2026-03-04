import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput, Modal, ActivityIndicator, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../auth/AuthContext';
import { updateUserProfile } from '../firebase/userService';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, FONT_SIZE, SHADOW } from '../constants/styles';

const GOAL_LABELS = {
  lose_weight: '⚖️ Kilo Vermek',
  gain_muscle: '💪 Kas Kazanmak',
  control_blood_sugar: '🩸 Kan Şekeri Kontrolü',
};
const ACTIVITY_LABELS = {
  sedentary: 'Hareketsiz',
  moderate: 'Orta Aktif',
  active: 'Çok Aktif',
};

const ProfileScreen = () => {
  const { user, userProfile, refreshProfile, logout } = useAuth();
  const [editModal, setEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});

  const openEdit = () => {
    setEditData({
      name: userProfile?.name || '',
      age: String(userProfile?.age || ''),
      height: String(userProfile?.height || ''),
      weight: String(userProfile?.weight || ''),
    });
    setEditModal(true);
  };

  const handleSave = async () => {
    if (!editData.name?.trim()) {
      Alert.alert('Hata', 'İsim boş olamaz');
      return;
    }
    setSaving(true);
    const result = await updateUserProfile(user.uid, {
      name: editData.name.trim(),
      age: parseInt(editData.age) || userProfile?.age,
      height: parseFloat(editData.height) || userProfile?.height,
      weight: parseFloat(editData.weight) || userProfile?.weight,
    });
    if (result.success) {
      await refreshProfile();
      setEditModal(false);
      Alert.alert('Başarılı', 'Profil güncellendi');
    } else {
      Alert.alert('Hata', 'Güncelleme başarısız');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Hesabınızdan çıkmak istiyor musunuz?');
      if (!confirmed) return;
      try {
        await logout();
      } catch (e) {
        window.alert('Çıkış yapılamadı, tekrar deneyin.');
      }
    } else {
      Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istiyor musunuz?', [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (e) {
              Alert.alert('Hata', 'Çıkış yapılamadı, tekrar deneyin.');
            }
          },
        },
      ]);
    }
  };

  const bmi = userProfile?.height && userProfile?.weight
    ? (userProfile.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1)
    : null;
  const bmiCategory = bmi
    ? bmi < 18.5 ? 'Zayıf' : bmi <= 24.9 ? 'Normal' : bmi <= 29.9 ? 'Kilolu' : 'Obez'
    : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#4A90E2', '#7BB8F7']} style={styles.headerGradient}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        </View>
        <Text style={styles.profileName}>{userProfile?.name || 'Kullanıcı'}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.cardTitle}>Kişisel Bilgiler</Text>
            <Pressable onPress={openEdit} style={styles.editBtn}>
              <Ionicons name="pencil" size={16} color={COLORS.primary} />
              <Text style={styles.editBtnText}>Düzenle</Text>
            </Pressable>
          </View>

          {[
            { icon: 'person-outline', label: 'Ad Soyad', value: userProfile?.name },
            { icon: 'calendar-outline', label: 'Yaş', value: userProfile?.age ? `${userProfile.age} yaş` : '-' },
            { icon: 'male-female-outline', label: 'Cinsiyet', value: userProfile?.gender === 'male' ? 'Erkek' : userProfile?.gender === 'female' ? 'Kadın' : 'Diğer' },
            { icon: 'resize-outline', label: 'Boy', value: userProfile?.height ? `${userProfile.height} cm` : '-' },
            { icon: 'scale-outline', label: 'Kilo', value: userProfile?.weight ? `${userProfile.weight} kg` : '-' },
          ].map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <View style={styles.infoIconBg}>
                <Ionicons name={item.icon} size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value || '-'}</Text>
              </View>
            </View>
          ))}
        </View>

        {bmi && (
          <View style={styles.bmiCard}>
            <Text style={styles.cardTitle}>Vücut Kitle İndeksi</Text>
            <View style={styles.bmiContent}>
              <Text style={styles.bmiNumber}>{bmi}</Text>
              <View>
                <Text style={styles.bmiCategory}>{bmiCategory}</Text>
                <Text style={styles.bmiSub}>BMI değeriniz</Text>
              </View>
            </View>
            <View style={styles.bmiBar}>
              {[
                { label: 'Zayıf', color: '#74C0FC', range: '< 18.5' },
                { label: 'Normal', color: COLORS.success, range: '18.5-25' },
                { label: 'Kilolu', color: COLORS.warning, range: '25-30' },
                { label: 'Obez', color: COLORS.danger, range: '> 30' },
              ].map((b) => (
                <View key={b.label} style={styles.bmiBarItem}>
                  <View style={[styles.bmiBarColor, { backgroundColor: b.color }]} />
                  <Text style={styles.bmiBarLabel}>{b.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.goalsCard}>
          <Text style={styles.cardTitle}>Hedef ve Aktivite</Text>
          <View style={styles.goalRow}>
            <View style={[styles.goalIconBg, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="flag" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.goalLabel}>Sağlık Hedefi</Text>
              <Text style={styles.goalValue}>{GOAL_LABELS[userProfile?.healthGoal] || '-'}</Text>
            </View>
          </View>
          <View style={styles.goalRow}>
            <View style={[styles.goalIconBg, { backgroundColor: COLORS.secondary + '20' }]}>
              <Ionicons name="fitness" size={20} color={COLORS.secondary} />
            </View>
            <View>
              <Text style={styles.goalLabel}>Aktivite Seviyesi</Text>
              <Text style={styles.goalValue}>{ACTIVITY_LABELS[userProfile?.activityLevel] || '-'}</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </Pressable>
      </View>

      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profili Düzenle</Text>
              <Pressable onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </Pressable>
            </View>
            {[
              { key: 'name', label: 'Ad Soyad', keyboard: 'default' },
              { key: 'age', label: 'Yaş', keyboard: 'numeric' },
              { key: 'height', label: 'Boy (cm)', keyboard: 'numeric' },
              { key: 'weight', label: 'Kilo (kg)', keyboard: 'numeric' },
            ].map((f) => (
              <View key={f.key} style={styles.modalField}>
                <Text style={styles.modalLabel}>{f.label}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editData[f.key]}
                  onChangeText={(v) => setEditData({ ...editData, [f.key]: v })}
                  keyboardType={f.keyboard}
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            ))}
            <Pressable
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <LinearGradient colors={['#4A90E2', '#2C6FBF']} style={styles.saveBtnGradient}>
                {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerGradient: { paddingTop: 54, paddingBottom: 28, alignItems: 'center' },
  avatarContainer: { marginBottom: SPACING.md },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: COLORS.white,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.white },
  profileName: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  profileEmail: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.85)' },
  body: { padding: SPACING.md },
  infoCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.small,
  },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  cardTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: SPACING.xs },
  editBtnText: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border + '50' },
  infoIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },
  infoValue: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  bmiCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.small,
  },
  bmiContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  bmiNumber: { fontSize: 48, fontWeight: 'bold', color: COLORS.primary },
  bmiCategory: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text },
  bmiSub: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },
  bmiBar: { flexDirection: 'row', gap: 4 },
  bmiBarItem: { flex: 1, alignItems: 'center' },
  bmiBarColor: { height: 8, width: '100%', borderRadius: 4, marginBottom: 4 },
  bmiBarLabel: { fontSize: 10, color: COLORS.textLight },
  goalsCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.small,
  },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm },
  goalIconBg: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  goalLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },
  goalValue: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, padding: SPACING.md, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.danger, marginBottom: SPACING.xl,
  },
  logoutText: { color: COLORS.danger, fontSize: FONT_SIZE.md, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.lg, paddingBottom: 36,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: 'bold', color: COLORS.text },
  modalField: { marginBottom: SPACING.md },
  modalLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textLight, marginBottom: 6 },
  modalInput: {
    backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, paddingVertical: 12,
    fontSize: FONT_SIZE.md, color: COLORS.text,
  },
  saveBtn: { borderRadius: BORDER_RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  saveBtnGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: COLORS.white, fontSize: FONT_SIZE.lg, fontWeight: 'bold' },
});

export default ProfileScreen;
