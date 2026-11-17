import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';

import { renderArt, renderOrnament } from '@/art/botanical';
import { AppText, Art } from '@/components/ui';
import { Rarity } from '@/data/types';
import { colors, fonts, gradients } from '@/theme';
import { formatKeyCardLong, formatKeyCardShort } from '@/utils/dreamDates';
import { capitalize, DreamView, padNo } from '@/utils/dreamView';

/** Card proportions shared by every size (300 × 452 reference). */
export const CARD_RATIO = 452 / 300;

const RARITY: Record<Rarity, { frame: string; inner: string; ornament: string; ink: string; corners: ('tl' | 'tr' | 'bl' | 'br')[]; shadow: ViewStyle }> = {
  common: { frame: colors.fern, inner: 'transparent', ornament: colors.lichen, ink: colors.rarity.common, corners: [], shadow: { shadowColor: '#000', shadowOpacity: 0.55 } },
  rare: { frame: '#56685C', inner: 'rgba(201,211,196,0.26)', ornament: colors.rareSilver, ink: colors.rarity.rare, corners: ['tl', 'br'], shadow: { shadowColor: '#000', shadowOpacity: 0.55 } },
  epic: { frame: colors.bloomA45, inner: 'rgba(232,160,174,0.30)', ornament: colors.nightBloom, ink: colors.rarity.epic, corners: ['tl', 'tr', 'bl', 'br'], shadow: { shadowColor: colors.nightBloom, shadowOpacity: 0.3 } },
  legendary: { frame: 'transparent', inner: 'rgba(201,232,107,0.35)', ornament: colors.glow, ink: colors.glowInk, corners: ['tl', 'tr', 'bl', 'br'], shadow: { shadowColor: colors.glow, shadowOpacity: 0.38 } },
};
const CORNER_TRANSFORM = { tl: [], tr: [{ scaleX: -1 }], bl: [{ scaleY: -1 }], br: [{ scaleX: -1 }, { scaleY: -1 }] } as const;

/** Moving foil sweep for legendary cards (native-driver loop). */
function Foil({ w, h }: { w: number; h: number }) {
  const [x] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) return;
      loop = Animated.loop(Animated.sequence([
        Animated.timing(x, { toValue: 1, duration: 3300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.delay(2200),
        Animated.timing(x, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]));
      loop.start();
    }).catch(() => {});
    return () => loop?.stop();
  }, [x]);
  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [-w * 1.1, w * 1.1] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top: -h * 0.3, height: h * 1.6, width: w * 0.9, left: w * 0.05, transform: [{ translateX }, { rotate: '18deg' }] }}>
      <LinearGradient colors={gradients.foil} locations={[0, 0.45, 0.55, 1]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

interface Props {
  dream: DreamView;
  width: number;
  /** Disable continuous animation (e.g. many cards in a grid). */
  still?: boolean;
}

/** Botanical specimen card. Below 230pt it switches to the compact grid layout. */
export function DreamCard({ dream, width, still }: Props) {
  const cq = width / 100;
  const height = width * CARD_RATIO;
  const compact = width < 230;
  const fx = RARITY[dream.rarity];
  const legendary = dream.rarity === 'legendary';
  const artXml = useMemo(() => renderArt(dream.motif, dream.rarity, dream.id), [dream.motif, dream.rarity, dream.id]);
  const ornament = useMemo(() => renderOrnament(dream.rarity), [dream.rarity]);

  const border = legendary ? 1.5 : 0;
  const pad = 3 * cq;
  const innerW = width - 2 * border - 2 * pad;
  const innerH = height - 2 * border - 2 * pad;
  const artH = innerH * (compact ? 0.67 : 0.595);
  const outerR = 5 * cq;
  const innerR = 3.4 * cq;
  const titleSize = compact ? Math.max(15, 10.6 * cq) : 9.6 * cq;
  const badgeSize = Math.max(8.5, 3.4 * cq);

  const badgeLabel = <AppText style={[styles.badgeText, { fontSize: badgeSize, letterSpacing: badgeSize * 0.16, color: fx.ink }]}>{capitalize(dream.rarity)}</AppText>;

  return (
    <View
      style={[{ width, height, borderRadius: outerR, shadowRadius: legendary ? 24 : 20, shadowOffset: { width: 0, height: 14 } }, fx.shadow]}
      accessible
      accessibilityLabel={`${dream.title}, ${dream.rarity} card, ${dream.emotion}`}
    >
      {legendary && <LinearGradient colors={gradients.legendaryFrame} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: outerR }]} />}
      <View style={[styles.frame, { top: border, left: border, right: border, bottom: border, borderRadius: outerR - border, padding: pad, borderWidth: legendary ? 0 : 1, borderColor: fx.frame }]}>
        <View style={[styles.inner, { borderRadius: innerR, borderWidth: fx.inner === 'transparent' ? 0 : 1, borderColor: fx.inner }]}>
          <View style={{ height: artH, overflow: 'hidden', borderTopLeftRadius: innerR, borderTopRightRadius: innerR }}>
            <Art xml={artXml} />
            {dream.rarity === 'epic' && (
              <LinearGradient colors={gradients.sheen} locations={[0.3, 0.45, 0.6]} start={{ x: 0, y: 0.1 }} end={{ x: 1, y: 0.9 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
            )}
            {legendary && !still && <Foil w={innerW} h={artH} />}
            <LinearGradient colors={gradients.artFade} style={[styles.fade, { height: artH * 0.22 }]} pointerEvents="none" />
          </View>

          <View style={[styles.head, fx.corners.includes('tr') ? { top: 5 * cq, left: 7 * cq, right: 7 * cq } : { top: 3.4 * cq, left: 3.4 * cq, right: 3.4 * cq }]}>
            <AppText style={[styles.no, { fontSize: Math.max(11, 5.2 * cq) }]}>Nº {padNo(dream.no)}</AppText>
            {legendary ? (
              <LinearGradient colors={gradients.legendaryBadge} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[styles.badge, styles.badgeGlow, { paddingHorizontal: 3 * cq, paddingVertical: 1.1 * cq }]}>
                <View style={[styles.badgeDot, { backgroundColor: fx.ink }]} />{badgeLabel}
              </LinearGradient>
            ) : (
              <View style={[styles.badge, styles.badgeDark, { paddingHorizontal: 3 * cq, paddingVertical: 1.1 * cq }]}>
                <View style={[styles.badgeDot, { backgroundColor: fx.ink }]} />{badgeLabel}
              </View>
            )}
          </View>

          <View style={[styles.body, compact ? { paddingHorizontal: 6 * cq, paddingTop: 4.5 * cq, paddingBottom: 5 * cq, gap: 2 * cq, justifyContent: 'space-between' } : { paddingHorizontal: 5 * cq, paddingTop: 4 * cq, paddingBottom: 3 * cq, gap: 2.4 * cq }]}>
            <AppText style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.04 }, legendary && { color: '#F4F0E6' }]} numberOfLines={2}>{dream.title}</AppText>
            {!compact && (
              <>
                <View style={[styles.facts, { gap: 5 * cq }]}>
                  {[['Element', dream.element], ['Emotion', dream.emotion]].map(([k, v]) => (
                    <View key={k} style={{ gap: 0.4 * cq }}>
                      <AppText style={[styles.dt, { fontSize: Math.max(8, 3.1 * cq), letterSpacing: Math.max(8, 3.1 * cq) * 0.16 }]}>{k}</AppText>
                      <AppText style={[styles.dd, { fontSize: 4.6 * cq, lineHeight: 6 * cq }]} numberOfLines={1}>{v}</AppText>
                    </View>
                  ))}
                </View>
                <AppText style={[styles.reflection, { fontSize: 5.3 * cq, lineHeight: 7 * cq }]} numberOfLines={2}>{dream.reflection}</AppText>
              </>
            )}
            <View style={[styles.foot, { gap: 3 * cq }, !compact && { marginTop: 'auto' }]}>
              {compact ? (
                <AppText style={[styles.footCompact, { fontSize: Math.max(10.5, 6.4 * cq) }]} numberOfLines={1}>{dream.emotion} · {formatKeyCardShort(dream.dreamDate)}</AppText>
              ) : (
                <>
                  <View style={[styles.rule, { backgroundColor: fx.ornament }]} />
                  <AppText style={[styles.footText, { fontSize: 3.6 * cq, letterSpacing: 3.6 * cq * 0.08 }]}>{formatKeyCardLong(dream.dreamDate)}</AppText>
                  <View style={[styles.rule, { backgroundColor: fx.ornament }]} />
                </>
              )}
            </View>
          </View>
        </View>

        {ornament ? fx.corners.map((c) => (
          <View key={c} pointerEvents="none" style={[styles.corner, { width: 21 * cq, height: 21 * cq, transform: [...CORNER_TRANSFORM[c]] }, c[0] === 't' ? { top: 1.2 * cq } : { bottom: 1.2 * cq }, c[1] === 'l' ? { left: 1.2 * cq } : { right: 1.2 * cq }]}>
            <Art xml={ornament} color={fx.ornament} />
          </View>
        )) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { position: 'absolute', backgroundColor: colors.surface },
  inner: { flex: 1, overflow: 'hidden' },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  head: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  no: { fontFamily: fonts.displayItalic, color: colors.text, opacity: 0.85, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 99 },
  badgeDark: { backgroundColor: colors.badgeBg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.paperA12 },
  badgeGlow: { shadowColor: colors.glow, shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontFamily: fonts.bodyBold, textTransform: 'uppercase' },
  body: { flex: 1, minHeight: 0 },
  title: { fontFamily: fonts.display, color: colors.text },
  facts: { flexDirection: 'row' },
  dt: { fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase' },
  dd: { fontFamily: fonts.body, color: colors.textSecondary },
  reflection: { fontFamily: fonts.displayItalic, color: colors.text, opacity: 0.9 },
  foot: { flexDirection: 'row', alignItems: 'center' },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, opacity: 0.7 },
  footText: { fontFamily: fonts.body, color: colors.textMuted },
  footCompact: { fontFamily: fonts.body, color: colors.textSecondary },
  corner: { position: 'absolute' },
});
