import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';
import { AppText } from './AppText';

/** Garden statistic: serif number, label, and either a sub-line or a 7-night spark row. */
export function StatTile({ value, label, sub, spark }: { value: string | number; label: string; sub?: string; spark?: boolean[] }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${value} ${label}${sub ? `, ${sub}` : ''}`}>
      <AppText style={styles.value}>{value}</AppText>
      <AppText variant="caption" color={colors.textSecondary}>{label}</AppText>
      {spark ? (
        <View style={styles.spark}>{spark.map((on, i) => <View key={i} style={[styles.sparkDot, on && styles.sparkOn]} />)}</View>
      ) : sub ? (
        <AppText style={styles.sub} numberOfLines={1}>{sub}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, minWidth: 0, gap: 2, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  value: { fontFamily: fonts.display, fontSize: 34, lineHeight: 36, color: colors.text, fontVariant: ['tabular-nums'] },
  sub: { fontFamily: fonts.body, fontSize: 11, lineHeight: 14, color: colors.textMuted, marginTop: 6 },
  spark: { flexDirection: 'row', gap: 3, marginTop: 9 },
  sparkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  sparkOn: { backgroundColor: colors.glow, shadowColor: colors.glow, shadowOpacity: 0.6, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } },
});
