import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Emphasised surface with a moonlight-blue border (e.g. primary CTA card). */
  accent?: boolean;
}

/** Elevated navy surface used for content panels. */
export function GlassCard({ children, style, accent }: Props) {
  return <View style={[styles.card, accent && styles.accent, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceGlass,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  accent: { backgroundColor: colors.surface, borderColor: colors.accentBorder },
});
