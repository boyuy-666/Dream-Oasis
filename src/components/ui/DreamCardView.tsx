import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Dream, Rarity } from '@/data/types';
import { colors, gradients, radius, spacing } from '@/theme';
import { AppText } from './AppText';

const RARITY_COLOR: Record<Rarity, string> = {
  common: colors.lavender,
  rare: colors.cosmicBlueSoft,
  epic: '#C77DFF',
  legendary: colors.gold,
};

export function DreamCardView({ dream, compact }: { dream: Dream; compact?: boolean }) {
  const { card } = dream;
  const accent = RARITY_COLOR[card.rarity];
  return (
    <View style={[styles.frame, { borderColor: accent, shadowColor: accent }, compact && styles.frameCompact]}>
      <LinearGradient colors={gradients.card} style={styles.inner}>
        <View style={styles.row}>
          <AppText variant="label" color={accent}>{card.rarity}</AppText>
          <AppText variant="label" color={colors.textMuted}>{card.element}</AppText>
        </View>
        <AppText style={[styles.glyph, compact && { fontSize: 48 }]}>{card.glyph}</AppText>
        <AppText variant={compact ? 'heading' : 'title'} center>{card.title}</AppText>
        {!compact && (
          <>
            <View style={styles.symbols}>
              {card.symbols.map((s) => (
                <AppText key={s} variant="caption" color={colors.lavenderSoft} style={styles.symbol}>{s}</AppText>
              ))}
            </View>
            <AppText variant="quote" color={colors.textMuted} center>{card.interpretation}</AppText>
          </>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderWidth: 1.5, borderRadius: radius.lg, overflow: 'hidden', shadowOpacity: 0.6, shadowRadius: 18, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  frameCompact: { flex: 1 },
  inner: { padding: spacing.lg, gap: spacing.md, alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' },
  glyph: { fontSize: 76, lineHeight: 92 },
  symbols: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  symbol: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
});
