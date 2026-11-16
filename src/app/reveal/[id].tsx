import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, DreamCardView, Screen } from '@/components/ui';
import { useDreams } from '@/store/DreamsContext';
import { colors, gradients, radius } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';

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
      <AppText variant="label" color={colors.gold}>{revealed ? 'Your Dream Card' : 'A dream has taken form'}</AppText>

      <Pressable onPress={reveal} style={styles.stage} accessibilityRole="button" accessibilityLabel="Reveal dream card">
        <Animated.View style={[styles.face, StyleSheet.absoluteFill, { transform: [{ perspective: 1000 }, { rotateY: backRot }, { scale }] }]}>
          <LinearGradient colors={gradients.card} style={styles.back}>
            <AppText style={{ fontSize: 72, lineHeight: 88 }}>🔮</AppText>
            <AppText variant="heading" center>Tap to reveal</AppText>
          </LinearGradient>
        </Animated.View>
        <Animated.View style={[styles.face, { transform: [{ perspective: 1000 }, { rotateY: frontRot }, { scale }] }]}>
          <DreamCardView dream={dream} />
        </Animated.View>
      </Pressable>

      {revealed && (
        <View style={styles.actions}>
          <Button label="View collection" onPress={() => router.replace('/collection')} />
          <Button label="Back home" variant="ghost" onPress={() => router.replace('/')} />
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
    borderWidth: 1.5,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  actions: { width: '100%', maxWidth: 340, gap: 12 },
});
