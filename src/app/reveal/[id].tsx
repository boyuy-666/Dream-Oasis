import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { renderAura } from '@/art/botanical';
import { CardBack, CardFlip, DreamCard } from '@/components/card';
import { AppText, Art, Button, Icon } from '@/components/ui';
import { Rarity } from '@/data/types';
import { useDreams } from '@/store/DreamsContext';
import { colors, spacing } from '@/theme';
import { fmtRelative, fmtTime } from '@/utils/dates';
import { padNo, toDreamViews } from '@/utils/dreamView';

type Phase = 'idle' | 'charging' | 'flipping' | 'revealed';
const CARD_W = 268;
const COPY: Record<Rarity, string> = { common: 'A quiet bloom', rare: 'A rare bloom', epic: 'An epic bloom', legendary: 'A legendary bloom' };
const AURA: Record<Rarity, [string, number]> = { common: [colors.glow, 0.16], rare: [colors.glow, 0.18], epic: [colors.nightBloom, 0.22], legendary: [colors.glow, 0.32] };
const BURST: Record<Rarity, number> = { common: 10, rare: 16, epic: 22, legendary: 34 };

interface Spark { dx: number; dy: number; size: number; delay: number; pink: boolean }

function Particle({ s }: { s: Spark }) {
  const [p] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(p, { toValue: 1, duration: 2000, delay: s.delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [p, s.delay]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.particle, {
        width: s.size, height: s.size, borderRadius: s.size,
        backgroundColor: s.pink ? colors.bloomLight : colors.glowPale, shadowColor: s.pink ? colors.nightBloom : colors.glow,
        opacity: p.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
        transform: [{ translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, s.dx] }) }, { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, s.dy] }) }],
      }]}
    />
  );
}

export default function RevealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dreams } = useDreams();
  const dream = useMemo(() => toDreamViews(dreams).find((d) => d.id === id), [dreams, id]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [reduced, setReduced] = useState(false);
  const [float] = useState(() => new Animated.Value(0));
  const [charge] = useState(() => new Animated.Value(0));
  const [aura] = useState(() => new Animated.Value(0));
  const [flash] = useState(() => new Animated.Value(0));
  const auraXml = useMemo(() => (dream ? renderAura(...AURA[dream.rarity]) : ''), [dream]);
  const flashXml = useMemo(() => renderAura(colors.glowPale, 0.45), []);

  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {}); }, []);

  // Idle: gentle float + breathing aura until the card is tapped.
  useEffect(() => {
    if (phase !== 'idle' || reduced) return;
    const loop = Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(aura, { toValue: 0.6, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(aura, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ]));
    loop.start();
    return () => loop.stop();
  }, [phase, reduced, float, aura]);

  if (!dream) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <AppText variant="title" center>Dream not found</AppText>
        <Button label="Back to the garden" variant="secondary" onPress={() => router.replace('/')} />
      </View>
    );
  }

  const reveal = () => {
    if (phase !== 'idle') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPhase('charging');
    Animated.parallel([
      Animated.timing(charge, { toValue: 1, duration: reduced ? 0 : 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(aura, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start(() => {
      setPhase('flipping');
      Animated.timing(charge, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
      if (!reduced) {
        flash.setValue(0);
        Animated.sequence([
          Animated.timing(flash, { toValue: 1, duration: 260, useNativeDriver: true }),
          Animated.timing(flash, { toValue: 0, duration: 640, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
        setTimeout(() => {
          setSparks(Array.from({ length: BURST[dream.rarity] }, (_, i) => {
            const a = Math.random() * Math.PI * 2; const dist = 110 + Math.random() * 120;
            return { dx: Math.cos(a) * dist, dy: Math.sin(a) * dist - 60, size: 3 + Math.random() * 4, delay: Math.random() * 300, pink: dream.rarity === 'epic' && i % 2 === 1 };
          }));
        }, 420);
      }
      setTimeout(() => {
        setPhase('revealed');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }, 950);
    });
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const revealed = phase === 'revealed';
  const flipped = phase === 'flipping' || revealed;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.bar}>
        <Pressable onPress={close} style={styles.close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={6}>
          <Icon name="close" size={20} color={colors.text} />
        </Pressable>
        <AppText variant="label" color={colors.textSecondary} numberOfLines={1} style={{ flexShrink: 1 }}>
          {revealed ? `Nº ${padNo(dream.no)} · added to your garden` : 'New card'}
        </AppText>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.copy} accessibilityLiveRegion="polite">
        <AppText variant="title" center>{revealed ? COPY[dream.rarity] : 'A dream has taken root'}</AppText>
        <AppText variant="caption" color={colors.textSecondary} center>
          {revealed ? `${dream.element} · ${dream.emotion}` : `${dream.title} · recorded ${fmtRelative(dream.createdAt).toLowerCase()} at ${fmtTime(dream.createdAt)}`}
        </AppText>
      </View>

      <View style={styles.stage}>
        <Animated.View pointerEvents="none" style={[styles.aura, {
          opacity: aura.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.75, 1, 1] }),
          transform: [{ scale: aura.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.94, 1.04, 1.4] }) }],
        }]}>
          <Art xml={auraXml} />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash, transform: [{ scale: flash.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.3] }) }] }]}>
          <Art xml={flashXml} />
        </Animated.View>
        <Pressable onPress={reveal} disabled={phase !== 'idle'} accessibilityRole="button" accessibilityLabel={revealed ? `${dream.title}, ${dream.rarity} card` : 'Reveal card'}>
          <Animated.View style={{ transform: [
            { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
            { rotate: float.interpolate({ inputRange: [0, 1], outputRange: ['-0.6deg', '0.6deg'] }) },
            { scale: charge.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
          ] }}>
            <CardFlip width={CARD_W} flipped={flipped} back={<CardBack width={CARD_W} />} front={<DreamCard dream={dream} width={CARD_W} />} />
          </Animated.View>
        </Pressable>
        <View pointerEvents="none" style={styles.burst}>{sparks.map((s, i) => <Particle key={i} s={s} />)}</View>
      </View>

      {revealed ? (
        <View style={styles.actions}>
          <Button label="See it in your collection" onPress={() => router.replace({ pathname: '/collection', params: { highlight: dream.id } })} />
          <Button label="Back to the garden" variant="secondary" onPress={() => router.replace('/')} />
        </View>
      ) : (
        <View style={[styles.hint, phase !== 'idle' && { opacity: 0 }]}>
          <Icon name="tap" size={18} color={colors.glow} />
          <AppText variant="small" color={colors.textSecondary}>Tap the card to reveal it</AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg, alignItems: 'center' },
  center: { justifyContent: 'center', gap: spacing.lg },
  bar: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, gap: 8 },
  close: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paperA06, borderWidth: 1, borderColor: colors.border },
  copy: { marginTop: 14, gap: 6, minHeight: 72, alignItems: 'center' },
  stage: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  aura: { position: 'absolute', width: 380, height: 380 },
  flash: { position: 'absolute', width: 340, height: 340 },
  burst: { position: 'absolute', left: '50%', top: '50%' },
  particle: { position: 'absolute', shadowOpacity: 0.9, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
  actions: { alignSelf: 'stretch', gap: 10 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52 },
});
