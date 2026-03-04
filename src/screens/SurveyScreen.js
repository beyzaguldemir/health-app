/**
 * SurveyScreen.js - Risk Anketi Ekranı
 * 4 soruluk diyabet risk değerlendirmesi
 * Radio button sistemi
 * Dinamik puanlama ve sonuç gösterimi (düşük/orta/yüksek risk)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOW, FONT_SIZE } from '../constants/styles';

const SurveyScreen = () => {
  const [answers, setAnswers] = useState({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
  });
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      id: 'q1',
      question: '1. Yaşınız kaç?',
      options: [
        { label: '45 yaş altı', value: 0 },
        { label: '45-64 yaş arası', value: 1 },
        { label: '65 yaş ve üzeri', value: 2 },
      ],
    },
    {
      id: 'q2',
      question: '2. Vücut kitle indeksiniz (BMI) nedir?',
      options: [
        { label: 'Normal (18.5-24.9)', value: 0 },
        { label: 'Fazla kilolu (25-29.9)', value: 1 },
        { label: 'Obez (30+)', value: 2 },
      ],
    },
    {
      id: 'q3',
      question: '3. Ailenizde diyabet hastalığı var mı?',
      options: [
        { label: 'Hayır', value: 0 },
        { label: 'Evet, uzak akraba', value: 1 },
        { label: 'Evet, yakın akraba', value: 2 },
      ],
    },
    {
      id: 'q4',
      question: '4. Düzenli fiziksel aktivite yapıyor musunuz?',
      options: [
        { label: 'Evet, haftada 3+ gün', value: 0 },
        { label: 'Bazen', value: 1 },
        { label: 'Hayır', value: 2 },
      ],
    },
  ];

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    setShowResult(false);
  };

  const calculateRisk = () => {
    const allAnswered = Object.values(answers).every((ans) => ans !== null);
    
    if (!allAnswered) {
      Alert.alert('Uyarı', 'Lütfen tüm soruları cevaplayın');
      return;
    }

    setShowResult(true);
  };

  const getTotalScore = () => {
    return Object.values(answers).reduce((sum, value) => sum + (value || 0), 0);
  };

  const getRiskLevel = (score) => {
    if (score <= 3) {
      return {
        level: 'Düşük Risk',
        color: COLORS.lowRisk,
        icon: 'checkmark-circle',
        description: 'Harika! Diyabet riskiniz düşük görünüyor. Sağlıklı yaşam tarzınızı sürdürün.',
        recommendations: [
          'Düzenli egzersiz yapmaya devam edin',
          'Dengeli beslenme alışkanlığınızı koruyun',
          'Yılda bir kez kan şekeri kontrolü yaptırın',
        ],
      };
    } else if (score <= 6) {
      return {
        level: 'Orta Risk',
        color: COLORS.mediumRisk,
        icon: 'warning',
        description: 'Dikkat! Orta derecede diyabet riskiniz var. Yaşam tarzı değişiklikleri önemli.',
        recommendations: [
          'Haftada en az 150 dakika egzersiz yapın',
          'Sağlıklı beslenme planı uygulayın',
          '6 ayda bir kan şekeri kontrolü yaptırın',
          'Kilo vermeye çalışın (fazla kiloluysan)',
        ],
      };
    } else {
      return {
        level: 'Yüksek Risk',
        color: COLORS.highRisk,
        icon: 'alert-circle',
        description: 'Önemli! Diyabet riskiniz yüksek. Mutlaka doktora başvurun.',
        recommendations: [
          'En kısa sürede bir doktora görünün',
          'Kan şekeri testleri yaptırın',
          'Düzenli fiziksel aktivite başlatın',
          'Sağlıklı beslenme planı oluşturun',
          'Kilo vermeye başlayın',
          '3 ayda bir kontrol yaptırın',
        ],
      };
    }
  };

  const totalScore = getTotalScore();
  const riskLevel = getRiskLevel(totalScore);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="clipboard" size={40} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Diyabet Risk Anketi</Text>
        <Text style={styles.headerSubtitle}>
          Aşağıdaki soruları cevaplayarak diyabet riskinizi değerlendirin
        </Text>
      </View>

      {questions.map((q, index) => (
        <View key={q.id} style={styles.questionCard}>
          <Text style={styles.questionText}>{q.question}</Text>
          
          {q.options.map((option, optionIndex) => (
            <Pressable
              key={optionIndex}
              style={styles.optionButton}
              onPress={() => handleAnswer(q.id, option.value)}
            >
              <View style={styles.radioContainer}>
                <View style={styles.radioOuter}>
                  {answers[q.id] === option.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.optionText}>{option.label}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ))}

      <Pressable style={styles.submitButton} onPress={calculateRisk}>
        <Ionicons name="calculator" size={24} color={COLORS.white} />
        <Text style={styles.submitButtonText}>Sonucu Hesapla</Text>
      </Pressable>

      {showResult && (
        <View style={[styles.resultCard, { borderColor: riskLevel.color }]}>
          <View style={[styles.resultHeader, { backgroundColor: riskLevel.color }]}>
            <Ionicons name={riskLevel.icon} size={48} color={COLORS.white} />
            <Text style={styles.resultTitle}>{riskLevel.level}</Text>
            <Text style={styles.resultScore}>Toplam Puan: {totalScore}/8</Text>
          </View>

          <View style={styles.resultBody}>
            <Text style={styles.resultDescription}>{riskLevel.description}</Text>

            <Text style={styles.recommendationsTitle}>📋 Öneriler:</Text>
            {riskLevel.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Bu anket sadece genel bir değerlendirmedir. Kesin tanı için mutlaka bir sağlık profesyoneline danışın.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOW.small,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.small,
  },
  questionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  optionButton: {
    paddingVertical: SPACING.sm,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOW.medium,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 3,
    ...SHADOW.medium,
  },
  resultHeader: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
  resultScore: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  resultBody: {
    padding: SPACING.lg,
  },
  resultDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  recommendationsTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  bullet: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  recommendationText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
});

export default SurveyScreen;
