/**
 * AccordionItem.js - Reusable Accordion Component
 * FAQ ekranında kullanılır
 * Başlığa tıklayınca içerik açılır/kapanır
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOW, FONT_SIZE } from '../constants/styles';

const AccordionItem = ({ title, content }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={COLORS.primary}
        />
      </Pressable>
      
      {isExpanded && (
        <View style={styles.content}>
          <Text style={styles.contentText}>{content}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOW.small,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  contentText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    lineHeight: 22,
    marginTop: SPACING.sm,
  },
});

export default AccordionItem;
