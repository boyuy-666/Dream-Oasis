import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export function GlassCard({ children, style, gold }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; gold?: boolean }) {
  return <View style={[styles.card, gold && { borderColor: colors.borderGold }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
