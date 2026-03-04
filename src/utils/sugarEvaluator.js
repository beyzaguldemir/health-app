/**
 * sugarEvaluator.js - Kan şekeri değerlendirme utility fonksiyonu
 * Kan şekeri değerlerini analiz eder ve durum döndürür
 */

import { COLORS } from '../constants/colors';

export const evaluateSugarLevel = (value) => {
  if (value < 70) {
    return {
      status: 'low',
      message: '⚠️ Düşük Kan Şekeri',
      description: 'Kan şekeriniz normalin altında. Hemen bir şeyler yiyin ve doktorunuza başvurun.',
      color: COLORS.danger,
      icon: 'warning',
    };
  } else if (value >= 70 && value <= 180) {
    return {
      status: 'normal',
      message: '✅ Normal Seviye',
      description: 'Kan şekeriniz normal aralıkta. Harika iş çıkarıyorsunuz!',
      color: COLORS.success,
      icon: 'checkmark-circle',
    };
  } else {
    return {
      status: 'high',
      message: '⚠️ Yüksek Kan Şekeri',
      description: 'Kan şekeriniz normalin üzerinde. Diyetinize dikkat edin ve doktorunuza danışın.',
      color: COLORS.warning,
      icon: 'alert-circle',
    };
  }
};

export const getSugarStatusColor = (value) => {
  if (value < 70) return COLORS.danger;
  if (value >= 70 && value <= 180) return COLORS.success;
  return COLORS.warning;
};

export const getSugarStatusText = (value) => {
  if (value < 70) return 'Düşük';
  if (value >= 70 && value <= 180) return 'Normal';
  return 'Yüksek';
};
