import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

/** Compact statistic: moonlight-silver number over a secondary label. */
export function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${value} ${label}`}>
      <AppText variant="title" color={colors.text}>{value}</AppText>
      <AppText variant="caption" color={colors.textSecondary} center numberOfLines={1}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceGlass,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.border,
  },
});
