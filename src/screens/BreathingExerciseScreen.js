import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../auth/AuthContext';
import { saveBreathingSession } from '../firebase/activityService';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, FONT_SIZE, SHADOW } from '../constants/styles';

let Haptics = null;
if (Platform.OS !== 'web') {
  try { Haptics = require('expo-haptics'); } catch (_) {}
}

const TECHNIQUES = {
  box: {
    id: 'box',
    name: '4-4-4 Kutu Nefesi',
    description: 'Her aşama 4 saniye — odaklanma ve sakinleşme için ideal',
    color: '#4A90E2',
    gradients: ['#4A90E2', '#7BB8F7'],
    phases: [
      { label: 'Nefes Al', emoji: '🫁', seconds: 4 },
      { label: 'Nefesi Tut', emoji: '⏸️', seconds: 4 },
      { label: 'Nefes Ver', emoji: '💨', seconds: 4 },
    ],
  },
  '478': {
    id: '478',
    name: '4-7-8 Tekniği',
    description: '4 al · 7 tut · 8 ver — uykuya dalmak ve stresi azaltmak için',
    color: '#7C4DFF',
    gradients: ['#7C4DFF', '#B39DDB'],
    phases: [
      { label: 'Nefes Al', emoji: '🫁', seconds: 4 },
      { label: 'Nefesi Tut', emoji: '⏸️', seconds: 7 },
      { label: 'Nefes Ver', emoji: '💨', seconds: 8 },
    ],
  },
};

const BreathingExerciseScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [saving, setSaving] = useState(false);
  const sessionStartRef = useRef(null);

  const intervalRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animRef = useRef(null);

  const technique = selectedTechnique ? TECHNIQUES[selectedTechnique] : null;

  const triggerHaptic = useCallback(() => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, []);

  const startPhaseAnimation = useCallback((phaseIdx, tech) => {
    if (animRef.current) animRef.current.stop();
    const phase = tech.phases[phaseIdx];
    const isInhale = phaseIdx === 0;
    const isHold = phaseIdx === 1;
    const toScale = isInhale ? 1.35 : isHold ? 1.35 : 1;

    animRef.current = Animated.timing(scaleAnim, {
      toValue: toScale,
      duration: phase.seconds * 1000,
      useNativeDriver: true,
    });
    animRef.current.start();
  }, [scaleAnim]);

  const stopAll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }
    Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const startExercise = useCallback((techId) => {
    const tech = TECHNIQUES[techId];
    setSelectedTechnique(techId);
    setRunning(true);
    setPhaseIndex(0);
    setRounds(0);
    setCountdown(tech.phases[0].seconds);
    sessionStartRef.current = Date.now();
    triggerHaptic();
    startPhaseAnimation(0, tech);
  }, [triggerHaptic, startPhaseAnimation]);

  const handleStop = useCallback(() => {
    stopAll();
    setRunning(false);
  }, [stopAll]);

  const handleSaveSession = useCallback(async (completedRounds, techId) => {
    if (!user || completedRounds === 0 || saving) return;
    setSaving(true);
    const elapsed = sessionStartRef.current
      ? Math.round((Date.now() - sessionStartRef.current) / 60000)
      : 5;
    const techName = TECHNIQUES[techId]?.name || techId;
    await saveBreathingSession(user.uid, {
      rounds: completedRounds,
      technique: techName,
      durationMinutes: Math.max(elapsed, 1),
    });
    setSaving(false);
  }, [user, saving]);

  const handleReset = useCallback(() => {
    if (rounds > 0) {
      handleSaveSession(rounds, selectedTechnique);
    }
    stopAll();
    setRunning(false);
    setPhaseIndex(0);
    setRounds(0);
    setCountdown(0);
    setSelectedTechnique(null);
    sessionStartRef.current = null;
  }, [stopAll, rounds, selectedTechnique, handleSaveSession]);

  useEffect(() => {
    if (!running || !technique) return;

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPhaseIndex((pIdx) => {
            const nextIdx = (pIdx + 1) % technique.phases.length;
            if (nextIdx === 0) {
              setRounds((r) => r + 1);
              triggerHaptic();
            } else {
              triggerHaptic();
            }
            const nextSeconds = technique.phases[nextIdx].seconds;
            startPhaseAnimation(nextIdx, technique);
            return nextIdx;
          });
          return technique.phases[0].seconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, technique, triggerHaptic, startPhaseAnimation]);

  useEffect(() => {
    if (running && technique) {
      setCountdown(technique.phases[phaseIndex].seconds);
    }
  }, [phaseIndex]);

  // Her 3 turda bir Firestore'a kaydet
  useEffect(() => {
    if (rounds > 0 && rounds % 3 === 0 && running && selectedTechnique) {
      handleSaveSession(rounds, selectedTechnique);
    }
  }, [rounds]);

  const currentPhase = technique?.phases[phaseIndex];

  if (!running && !selectedTechnique) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#4A90E2', '#7BB8F7']} style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Nefes Egzersizi</Text>
            <Text style={styles.headerSub}>Stres azaltma · Odaklanma · Uyku</Text>
          </View>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <View style={styles.selectContainer}>
          <Text style={styles.selectTitle}>Teknik Seç</Text>
          <Text style={styles.selectSub}>Amacına uygun nefes tekniğini seç</Text>

          {Object.values(TECHNIQUES).map((tech) => (
            <Pressable key={tech.id} style={styles.techniqueCard} onPress={() => startExercise(tech.id)}>
              <LinearGradient colors={tech.gradients} style={styles.techniqueGradient}>
                <View style={styles.techniqueTop}>
                  <View style={styles.techPhases}>
                    {tech.phases.map((p, i) => (
                      <View key={i} style={styles.techPhaseChip}>
                        <Text style={styles.techPhaseEmoji}>{p.emoji}</Text>
                        <Text style={styles.techPhaseLabel}>{p.label}</Text>
                        <Text style={styles.techPhaseSec}>{p.seconds}sn</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.techniqueDivider} />
                <Text style={styles.techniqueName}>{tech.name}</Text>
                <Text style={styles.techniqueDesc}>{tech.description}</Text>
                <View style={styles.startRow}>
                  <Text style={styles.startText}>Başlat</Text>
                  <Ionicons name="play-circle" size={22} color={COLORS.white} />
                </View>
              </LinearGradient>
            </Pressable>
          ))}

          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>💡 Nefes Egzersizinin Faydaları</Text>
            {[
              'Kan şekerini dengelemeye yardımcı olur',
              'Stresi ve kortizol seviyesini düşürür',
              'Kalp ritmini düzenler',
              'Uyku kalitesini artırır',
            ].map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={technique?.gradients || ['#4A90E2', '#7BB8F7']} style={styles.header}>
        <Pressable onPress={handleReset} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Nefes Egzersizi</Text>
          <Text style={styles.headerSub}>{technique?.name}</Text>
        </View>
        <View style={styles.roundBadge}>
          <Text style={styles.roundNum}>{rounds}</Text>
          <Text style={styles.roundLabel}>tur</Text>
        </View>
      </LinearGradient>

      <View style={styles.exerciseArea}>
        {/* Faz etiketi */}
        <Text style={styles.phaseEmoji}>{currentPhase?.emoji}</Text>
        <Text style={styles.phaseLabel}>{currentPhase?.label}</Text>

        {/* Animasyonlu daire */}
        <View style={styles.circleWrapper}>
          <Animated.View style={[styles.circleOuter, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={technique?.gradients || ['#4A90E2', '#7BB8F7']}
              style={styles.circleInner}
            >
              <Text style={styles.countdownNum}>{countdown}</Text>
              <Text style={styles.countdownSub}>saniye</Text>
            </LinearGradient>
          </Animated.View>

          {/* Halka efekti */}
          <Animated.View style={[styles.ringEffect, {
            transform: [{ scale: scaleAnim }],
            borderColor: (technique?.color || COLORS.primary) + '40',
          }]} />
        </View>

        {/* Faz göstergeleri */}
        <View style={styles.phaseIndicators}>
          {technique?.phases.map((p, i) => (
            <View key={i} style={styles.phaseIndicatorItem}>
              <View style={[
                styles.phaseIndicatorDot,
                {
                  backgroundColor: i === phaseIndex
                    ? technique.color
                    : i < phaseIndex
                      ? technique.color + '60'
                      : COLORS.border,
                },
              ]} />
              <Text style={[
                styles.phaseIndicatorText,
                i === phaseIndex && { color: technique.color, fontWeight: '700' },
              ]}>
                {p.label}
              </Text>
              <Text style={styles.phaseIndicatorSec}>{p.seconds}sn</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Kontrol butonları */}
      <View style={styles.controls}>
        {running ? (
          <Pressable style={styles.stopBtn} onPress={handleStop}>
            <Ionicons name="pause-circle" size={20} color={COLORS.danger} />
            <Text style={styles.stopBtnText}>Durdur</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.stopBtn, { borderColor: COLORS.success }]} onPress={() => {
            setRunning(true);
            startPhaseAnimation(phaseIndex, technique);
          }}>
            <Ionicons name="play-circle" size={20} color={COLORS.success} />
            <Text style={[styles.stopBtnText, { color: COLORS.success }]}>Devam Et</Text>
          </Pressable>
        )}
        <Pressable style={styles.resetBtn} onPress={handleReset}>
          <LinearGradient colors={technique?.gradients || ['#4A90E2', '#7BB8F7']} style={styles.resetBtnGradient}>
            <Ionicons name="refresh" size={20} color={COLORS.white} />
            <Text style={styles.resetBtnText}>Sıfırla</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {rounds > 0 && (
        <View style={styles.roundSummary}>
          <Ionicons name="trophy" size={18} color="#FFD700" />
          <Text style={styles.roundSummaryText}>
            {rounds} tur tamamlandı · Harika gidiyorsun!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 50, paddingBottom: 14, paddingHorizontal: SPACING.md,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn: { padding: 4, width: 36 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZE.xs, marginTop: 2 },
  roundBadge: {
    width: 44, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10, paddingVertical: 4,
  },
  roundNum: { color: COLORS.white, fontWeight: 'bold', fontSize: FONT_SIZE.lg },
  roundLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },

  selectContainer: { flex: 1, padding: SPACING.md },
  selectTitle: { fontSize: FONT_SIZE.xl, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  selectSub: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, marginBottom: SPACING.lg },

  techniqueCard: {
    borderRadius: BORDER_RADIUS.lg, overflow: 'hidden',
    marginBottom: SPACING.md, ...SHADOW.medium,
  },
  techniqueGradient: { padding: SPACING.md },
  techniqueTop: { marginBottom: SPACING.sm },
  techPhases: { flexDirection: 'row', gap: SPACING.sm },
  techPhaseChip: {
    flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.sm, paddingVertical: 8,
  },
  techPhaseEmoji: { fontSize: 20, marginBottom: 2 },
  techPhaseLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '600' },
  techPhaseSec: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  techniqueDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: SPACING.sm },
  techniqueName: { color: COLORS.white, fontSize: FONT_SIZE.lg, fontWeight: 'bold', marginBottom: 4 },
  techniqueDesc: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZE.sm, lineHeight: 20, marginBottom: SPACING.sm },
  startRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  startText: { color: COLORS.white, fontWeight: 'bold', fontSize: FONT_SIZE.md },

  benefitsCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginTop: SPACING.sm, ...SHADOW.small,
  },
  benefitsTitle: { fontSize: FONT_SIZE.sm, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 8 },
  benefitText: { fontSize: FONT_SIZE.sm, color: COLORS.text, flex: 1, lineHeight: 20 },

  exerciseArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg,
  },
  phaseEmoji: { fontSize: 44, marginBottom: 8 },
  phaseLabel: {
    fontSize: 28, fontWeight: 'bold', color: COLORS.text,
    marginBottom: SPACING.xl, letterSpacing: 1,
  },

  circleWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  circleOuter: {
    width: 200, height: 200, borderRadius: 100,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOW.medium,
  },
  circleInner: {
    width: 200, height: 200, borderRadius: 100,
    alignItems: 'center', justifyContent: 'center',
  },
  ringEffect: {
    position: 'absolute', width: 230, height: 230, borderRadius: 115,
    borderWidth: 3,
  },
  countdownNum: { fontSize: 64, fontWeight: 'bold', color: COLORS.white },
  countdownSub: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.sm, marginTop: -4 },

  phaseIndicators: {
    flexDirection: 'row', gap: SPACING.md, backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, ...SHADOW.small,
  },
  phaseIndicatorItem: { alignItems: 'center', flex: 1 },
  phaseIndicatorDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 6 },
  phaseIndicatorText: { fontSize: 11, color: COLORS.textLight, fontWeight: '600', textAlign: 'center' },
  phaseIndicatorSec: { fontSize: 10, color: COLORS.textLight, marginTop: 2 },

  controls: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingBottom: 30, paddingTop: SPACING.sm,
  },
  stopBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.danger, borderRadius: BORDER_RADIUS.md, paddingVertical: 14,
    backgroundColor: COLORS.white,
  },
  stopBtnText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.danger },
  resetBtn: { flex: 1, borderRadius: BORDER_RADIUS.md, overflow: 'hidden', ...SHADOW.small },
  resetBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  resetBtnText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.white },

  roundSummary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFF9E6', paddingVertical: 10,
    marginHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md, ...SHADOW.small,
  },
  roundSummaryText: { fontSize: FONT_SIZE.sm, color: '#856404', fontWeight: '600' },
});

export default BreathingExerciseScreen;
