import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, DreamCardView, Screen } from '@/components/ui';
import { useDreams } from '@/store/DreamsContext';
import { colors, gradients, radius, spacing } from '@/theme';

/** Moonlit card back: concentric halo rings around a crescent. */
function CardBack() {
  return (
    <LinearGradient colors={gradients.cardBack} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.back}>
      <LinearGradient colors={gradients.sheen} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 0.6 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View pointerEvents="none" style={styles.backInset} />
      <View style={styles.rings}>
        {[220, 160, 104].map((d, i) => (
          <View key={d} style={[styles.ring, { width: d, height: d, opacity: 0.18 + i * 0.07 }]} />
        ))}
        <View style={styles.moonDisc} />
        <Ionicons name="moon" size={40} color={colors.highlight} />
      </View>
      <View style={{ gap: spacing.xs, alignItems: 'center' }}>
        <AppText variant="heading" center>Tap to reveal</AppText>
        <AppText variant="caption" color={colors.textSecondary} center>A Dream Card awaits</AppText>
      </View>
    </LinearGradient>
  );
}

export default function RevealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getDream } = useDreams();
  const dream = getDream(id);
  const [flip] = useState(() => new Animated.Value(0));
  const [revealed, setRevealed] = useState(false);

  if (!dream) {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <AppText variant="title" center>Dream not found</AppText>
        <Button label="Back home" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.timing(flip, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };

  const backRot = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontRot = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const scale = flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.08, 1] });

  return (
    <Screen contentStyle={styles.center}>
      <AppText variant="label" color={colors.accent}>{revealed ? 'Your Dream Card' : 'A dream has taken form'}</AppText>

      <Pressable onPress={reveal} style={styles.stage} accessibilityRole="button" accessibilityLabel={revealed ? `${dream.card.title}, ${dream.card.rarity} card` : 'Reveal dream card'}>
        <Animated.View style={[styles.face, StyleSheet.absoluteFill, { transform: [{ perspective: 1000 }, { rotateY: backRot }, { scale }] }]}>
          <CardBack />
        </Animated.View>
        <Animated.View style={[styles.face, { transform: [{ perspective: 1000 }, { rotateY: frontRot }, { scale }] }]}>
          <DreamCardView dream={dream} />
        </Animated.View>
      </Pressable>

      {revealed && (
        <View style={styles.actions}>
          <Button label="View collection" onPress={() => router.replace('/collection')} />
          <Button label="Back home" variant="secondary" onPress={() => router.replace('/')} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  stage: { width: '100%', maxWidth: 340, minHeight: 420 },
  face: { backfaceVisibility: 'hidden', width: '100%' },
  back: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    overflow: 'hidden',
  },
  backInset: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: radius.lg - 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rings: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: colors.accent },
  moonDisc: { position: 'absolute', width: 72, height: 72, borderRadius: 999, backgroundColor: colors.highlight, opacity: 0.08 },
  actions: { width: '100%', maxWidth: 340, gap: 12 },
});
