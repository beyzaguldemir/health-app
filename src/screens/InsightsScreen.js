import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { getSugarRecords } from '../firebase/sugarService';
import { getSugarStatusColor } from '../utils/sugarEvaluator';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, FONT_SIZE, SHADOW } from '../constants/styles';

const InsightsScreen = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    const result = await getSugarRecords(user.uid);
    if (result.success) setRecords(result.data);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const last7 = records.slice(0, 7).reverse();
  const avg = last7.length > 0
    ? Math.round(last7.reduce((s, r) => s + r.value, 0) / last7.length)
    : null;
  const minVal = last7.length > 0 ? Math.min(...last7.map((r) => r.value)) : null;
  const maxVal = last7.length > 0 ? Math.max(...last7.map((r) => r.value)) : null;

  const normalCount = records.filter((r) => r.value >= 70 && r.value <= 180).length;
  const highCount = records.filter((r) => r.value > 180).length;
  const lowCount = records.filter((r) => r.value < 70).length;

  const chartMax = last7.length > 0 ? Math.max(maxVal, 200) : 200;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
      <LinearGradient colors={['#4A90E2', '#7BB8F7']} style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Sağlık İçgörüleri</Text>
        <Text style={styles.headerSub}>Kan şekeri trendleriniz ve istatistikler</Text>
      </LinearGradient>

      <View style={styles.body}>
        {records.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="bar-chart-outline" size={56} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Henüz veri yok</Text>
            <Text style={styles.emptyText}>Kan şekeri ekranından değer girerek istatistiklerinizi görün</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              {[
                { label: 'Ortalama', value: avg ? `${avg}` : '-', unit: 'mg/dL', color: COLORS.primary },
                { label: 'En Düşük', value: minVal ? `${minVal}` : '-', unit: 'mg/dL', color: COLORS.success },
                { label: 'En Yüksek', value: maxVal ? `${maxVal}` : '-', unit: 'mg/dL', color: COLORS.danger },
              ].map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statUnit}>{s.unit}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {last7.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.cardTitle}>Son 7 Ölçüm</Text>
                <View style={styles.chart}>
                  {last7.map((r, i) => {
                    const barH = Math.max(((r.value / chartMax) * 150), 8);
                    const barColor = getSugarStatusColor(r.value);
                    return (
                      <View key={i} style={styles.barWrapper}>
                        <Text style={styles.barLabel}>{r.value}</Text>
                        <View style={[styles.bar, { height: barH, backgroundColor: barColor }]} />
                        <Text style={styles.barDate}>
                          {new Date(r.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.chartLegend}>
                  {[
                    { color: COLORS.danger, label: 'Düşük (<70)' },
                    { color: COLORS.success, label: 'Normal (70-180)' },
                    { color: COLORS.warning, label: 'Yüksek (>180)' },
                  ].map((l) => (
                    <View key={l.label} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                      <Text style={styles.legendText}>{l.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.distributionCard}>
              <Text style={styles.cardTitle}>Dağılım ({records.length} ölçüm)</Text>
              {[
                { label: 'Normal', count: normalCount, color: COLORS.success },
                { label: 'Yüksek', count: highCount, color: COLORS.warning },
                { label: 'Düşük', count: lowCount, color: COLORS.danger },
              ].map((d) => (
                <View key={d.label} style={styles.distRow}>
                  <Text style={styles.distLabel}>{d.label}</Text>
                  <View style={styles.distBarBg}>
                    <View
                      style={[
                        styles.distBar,
                        {
                          width: records.length > 0 ? `${(d.count / records.length) * 100}%` : '0%',
                          backgroundColor: d.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.distCount, { color: d.color }]}>{d.count}</Text>
                </View>
              ))}
            </View>

            <View style={styles.tipsCard}>
              <Text style={styles.cardTitle}>📊 Değerlendirme</Text>
              {avg && avg > 180 && (
                <View style={styles.tipRow}>
                  <Ionicons name="warning" size={18} color={COLORS.warning} />
                  <Text style={styles.tipText}>Ortalama kan şekeriniz yüksek. Karbonhidrat tüketimini azaltın.</Text>
                </View>
              )}
              {avg && avg < 70 && (
                <View style={styles.tipRow}>
                  <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                  <Text style={styles.tipText}>Ortalama kan şekeriniz düşük. Düzenli öğün yemeye özen gösterin.</Text>
                </View>
              )}
              {avg && avg >= 70 && avg <= 140 && (
                <View style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                  <Text style={styles.tipText}>Harika! Kan şekeriniz iyi aralıkta. Böyle devam edin.</Text>
                </View>
              )}
              {normalCount === records.length && records.length > 0 && (
                <View style={styles.tipRow}>
                  <Ionicons name="trophy" size={18} color="#FFD700" />
                  <Text style={styles.tipText}>Tüm ölçümleriniz normal aralıkta. Mükemmel!</Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerGradient: { paddingTop: 54, paddingBottom: 28, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  headerSub: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.85)' },
  body: { padding: SPACING.md },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOW.small,
  },
  emptyTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text, marginTop: SPACING.md },
  emptyText: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOW.small,
  },
  statValue: { fontSize: FONT_SIZE.xl, fontWeight: 'bold' },
  statUnit: { fontSize: 10, color: COLORS.textLight },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, marginTop: 2 },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.small,
  },
  cardTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.md },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 200, gap: 4, paddingBottom: 28 },
  barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barLabel: { fontSize: 9, color: COLORS.textLight, marginBottom: 3 },
  bar: { width: '80%', borderRadius: 4, minHeight: 8 },
  barDate: { fontSize: 9, color: COLORS.textLight, marginTop: 3, position: 'absolute', bottom: 0 },
  chartLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: SPACING.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },
  distributionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.small,
  },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  distLabel: { width: 50, fontSize: FONT_SIZE.sm, color: COLORS.text },
  distBarBg: { flex: 1, height: 12, backgroundColor: COLORS.border, borderRadius: 6, overflow: 'hidden' },
  distBar: { height: '100%', borderRadius: 6 },
  distCount: { width: 28, textAlign: 'right', fontSize: FONT_SIZE.sm, fontWeight: 'bold' },
  tipsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.small,
  },
  tipRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start', marginBottom: SPACING.sm },
  tipText: { flex: 1, fontSize: FONT_SIZE.sm, color: COLORS.text, lineHeight: 20 },
});

export default InsightsScreen;
