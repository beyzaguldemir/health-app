/**
 * Card.js - Reusable Card Component
 * Home ekranında kullanılan pressable kartlar için
 * Modern tasarım, shadow, icon ve text içerir
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOW, FONT_SIZE } from '../constants/styles';

const Card = ({ title, icon, iconColor, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={32} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    ...SHADOW.medium,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default Card;
