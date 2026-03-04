/**
 * ProgressBar.js - Reusable Progress Bar Component
 * Goals ekranında ilerleme göstergesi olarak kullanılır
 * Dinamik renk değişimi (tamamlanınca yeşil)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants/styles';

const ProgressBar = ({ current, total, label }) => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const isCompleted = current >= total;
  const barColor = isCompleted ? COLORS.success : COLORS.primary;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.percentage, { color: barColor }]}>
          {Math.round(percentage)}%
        </Text>
      </View>
      
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: barColor },
          ]}
        />
      </View>
      
      <Text style={styles.stats}>
        {current} / {total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  percentage: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  stats: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
});

export default ProgressBar;
