import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOW, FONT_SIZE } from '../constants/styles';
import { evaluateSugarLevel, getSugarStatusColor, getSugarStatusText } from '../utils/sugarEvaluator';
import { saveSugarRecord, getSugarRecords, deleteSugarRecord } from '../firebase/sugarService';
import { formatDateTime } from '../utils/dateFormatter';

const SugarScreen = () => {
  const { user } = useAuth();
  const [sugarValue, setSugarValue] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    if (!user) return;
    setLoading(true);
    const result = await getSugarRecords(user.uid);
    if (result.success) setRecords(result.data);
    else Alert.alert('Hata', 'Kayıtlar yüklenirken bir hata oluştu');
    setLoading(false);
  };

  const handleSaveRecord = async () => {
    if (!user) {
      Alert.alert('Hata', 'Oturum açmanız gerekiyor');
      return;
    }
    const value = parseFloat(sugarValue);
    if (!sugarValue || isNaN(value) || value <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir kan şekeri değeri girin');
      return;
    }
    if (value > 600) {
      Alert.alert('Uyarı', 'Bu değer çok yüksek görünüyor. Lütfen kontrol edin.');
      return;
    }
    setLoading(true);
    const result = await saveSugarRecord(user.uid, value);
    if (result.success) {
      setEvaluation(evaluateSugarLevel(value));
      setSugarValue('');
      await loadRecords();
      Alert.alert('Başarılı', 'Kan şekeri kaydedildi');
    } else {
      Alert.alert('Hata', 'Kayıt eklenirken bir hata oluştu');
    }
    setLoading(false);
  };

  const handleDeleteRecord = async (id) => {
    Alert.alert('Kaydı Sil', 'Bu kaydı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const result = await deleteSugarRecord(user.uid, id);
          if (result.success) await loadRecords();
          else Alert.alert('Hata', 'Kayıt silinirken bir hata oluştu');
          setLoading(false);
        },
      },
    ]);
  };

  const renderRecordItem = ({ item }) => {
    const statusColor = getSugarStatusColor(item.value);
    const statusText = getSugarStatusText(item.value);
    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordInfo}>
            <Text style={styles.recordValue}>{item.value} mg/dL</Text>
            <Text style={styles.recordDate}>{formatDateTime(item.date)}</Text>
          </View>
          <View style={styles.recordActions}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
            <Pressable onPress={() => handleDeleteRecord(item.id)} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Kan Şekeri Değeri</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Örn: 120"
            value={sugarValue}
            onChangeText={setSugarValue}
            keyboardType="numeric"
          />
          <Text style={styles.unit}>mg/dL</Text>
        </View>
        <Pressable
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSaveRecord}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="save" size={20} color={COLORS.white} />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </>
          )}
        </Pressable>
        <View style={styles.referenceCard}>
          <Text style={styles.referenceTitle}>📊 Referans Değerler</Text>
          {[
            { color: COLORS.danger, text: '< 70 mg/dL - Düşük (Hipoglisemi)' },
            { color: COLORS.success, text: '70-180 mg/dL - Normal' },
            { color: COLORS.warning, text: '> 180 mg/dL - Yüksek (Hiperglisemi)' },
          ].map((ref) => (
            <View key={ref.text} style={styles.referenceItem}>
              <View style={[styles.referenceDot, { backgroundColor: ref.color }]} />
              <Text style={styles.referenceText}>{ref.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {evaluation && (
        <View style={[styles.evaluationCard, { backgroundColor: evaluation.color + '20', borderColor: evaluation.color }]}>
          <Text style={[styles.evaluationMessage, { color: evaluation.color }]}>{evaluation.message}</Text>
          <Text style={styles.evaluationDescription}>{evaluation.description}</Text>
        </View>
      )}

      <View style={styles.recordsSection}>
        <Text style={styles.sectionTitle}>Geçmiş Kayıtlar</Text>
        {loading && records.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={records}
            renderItem={renderRecordItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyText}>Henüz kayıt yok</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inputSection: { backgroundColor: COLORS.white, padding: SPACING.md, ...SHADOW.small },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.md },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, marginBottom: SPACING.md,
  },
  input: { flex: 1, fontSize: FONT_SIZE.xl, fontWeight: '600', color: COLORS.text, paddingVertical: SPACING.md },
  unit: { fontSize: FONT_SIZE.md, color: COLORS.textLight, fontWeight: '600' },
  saveButton: {
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.md,
  },
  disabledButton: { opacity: 0.6 },
  saveButtonText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: '600', marginLeft: SPACING.sm },
  referenceCard: { backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md, padding: SPACING.md },
  referenceTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  referenceItem: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xs },
  referenceDot: { width: 12, height: 12, borderRadius: 6, marginRight: SPACING.sm },
  referenceText: { fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  evaluationCard: { margin: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 2 },
  evaluationMessage: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', marginBottom: SPACING.xs },
  evaluationDescription: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  recordsSection: { flex: 1, padding: SPACING.md },
  recordCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.small,
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordInfo: { flex: 1 },
  recordValue: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text },
  recordDate: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, marginTop: SPACING.xs },
  recordActions: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.sm, marginRight: SPACING.sm },
  statusText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  deleteButton: { padding: SPACING.xs },
  loadingContainer: { padding: SPACING.xl, alignItems: 'center' },
  emptyContainer: { padding: SPACING.xl, alignItems: 'center' },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textLight, marginTop: SPACING.sm },
});

export default SugarScreen;
