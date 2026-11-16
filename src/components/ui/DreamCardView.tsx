import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Dream } from '@/data/types';
import { colors, elevation, gradients, radius, spacing } from '@/theme';
import { AppText } from './AppText';

/** Concentric moon-halo rings drawn behind the glyph. */
function MoonHalo({ tint, size, strong }: { tint: string; size: number; strong?: boolean }) {
  return (
    <View pointerEvents="none" style={[styles.haloWrap, { width: size, height: size }]}>
      {[1, 0.74, 0.5].map((k, i) => (
        <View
          key={k}
          style={{
            position: 'absolute',
            width: size * k,
            height: size * k,
            borderRadius: size,
            borderWidth: 1,
            borderColor: tint,
            opacity: (strong ? 0.32 : 0.2) - i * 0.04,
          }}
        />
      ))}
      <View style={{ position: 'absolute', width: size * 0.42, height: size * 0.42, borderRadius: size, backgroundColor: tint, opacity: strong ? 0.12 : 0.07 }} />
    </View>
  );
}

export function DreamCardView({ dream, compact }: { dream: Dream; compact?: boolean }) {
  const { card } = dream;
  const accent = colors.rarity[card.rarity] ?? colors.rarity.common;
  const legendary = card.rarity === 'legendary';
  const haloSize = compact ? 92 : 168;

  return (
    <View
      style={[
        styles.shadow,
        compact && styles.flex,
        legendary && { shadowColor: colors.highlight, shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } },
      ]}
    >
      <View style={[styles.frame, { borderColor: accent, borderWidth: legendary ? 1.5 : 1 }, compact && styles.flex]}>
        <LinearGradient colors={gradients.card} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[styles.inner, compact && styles.innerCompact]}>
          <LinearGradient colors={gradients.sheen} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 0.6 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
          {/* Inset silver hairline frame */}
          <View pointerEvents="none" style={[styles.insetFrame, compact && styles.insetCompact]} />

          <View style={styles.row}>
            <View style={[styles.rarityPill, { borderColor: accent }]}>
              <AppText variant="label" color={accent} style={compact && styles.smallLabel}>{card.rarity}</AppText>
            </View>
            {!compact && <AppText variant="label" color={colors.textSecondary}>{card.element}</AppText>}
          </View>

          <View style={[styles.glyphStage, { height: haloSize }]}>
            <MoonHalo tint={accent} size={haloSize} strong={legendary} />
            <AppText style={compact ? styles.glyphCompact : styles.glyph}>{card.glyph}</AppText>
          </View>

          <AppText variant="heading" center numberOfLines={2} style={compact && styles.titleCompact}>
            {card.title}
          </AppText>

          {!compact && (
            <>
              <View style={[styles.divider, { backgroundColor: accent }]} />
              <View style={styles.symbols}>
                {card.symbols.map((s) => (
                  <View key={s} style={styles.symbol}>
                    <AppText variant="caption" color={colors.highlight}>{s}</AppText>
                  </View>
                ))}
              </View>
              <AppText variant="quote" color={colors.textSecondary} center>
                {card.interpretation}
              </AppText>
            </>
          )}
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  shadow: { borderRadius: radius.lg, ...elevation.card },
  frame: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.bgDeep },
  inner: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.md, alignItems: 'center' },
  innerCompact: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm, justifyContent: 'space-between' },
  insetFrame: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: radius.lg - 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  insetCompact: { top: 5, left: 5, right: 5, bottom: 5, borderRadius: radius.lg - 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch' },
  rarityPill: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  smallLabel: { fontSize: 10, letterSpacing: 1.2 },
  glyphStage: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  haloWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  glyph: { fontSize: 64, lineHeight: 78 },
  glyphCompact: { fontSize: 36, lineHeight: 44 },
  titleCompact: { fontSize: 19, lineHeight: 23 },
  divider: { width: 40, height: 1, opacity: 0.6 },
  symbols: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  symbol: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.accentSoft,
  },
});
