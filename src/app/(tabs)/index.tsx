import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Button, DreamCardView, GlassCard, Screen } from '@/components/ui';
import { useDreams } from '@/store/DreamsContext';
import { colors, spacing } from '@/theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'The night is deep';
  if (h < 12) return 'Good morning, dreamer';
  if (h < 18) return 'Good afternoon, dreamer';
  return 'Good evening, dreamer';
}

export default function HomeScreen() {
  const router = useRouter();
  const { dreams } = useDreams();
  const latest = dreams[0];

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="label" color={colors.gold}>Dream Oasis</AppText>
        <AppText variant="hero">{greeting()}</AppText>
        <AppText color={colors.textMuted}>What did the night show you?</AppText>
      </View>

      <GlassCard gold>
        <AppText variant="heading">Capture a dream</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          Write it down while it is fresh and unveil your Dream Card.
        </AppText>
        <View style={{ marginTop: spacing.sm }}>
          <Button label="Record a dream" onPress={() => router.push('/record')} />
        </View>
      </GlassCard>

      <View style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <AppText variant="heading">Latest card</AppText>
          <Pressable onPress={() => router.push('/collection')} hitSlop={12}>
            <AppText variant="caption" color={colors.lavender}>View all ({dreams.length})</AppText>
          </Pressable>
        </View>
        {latest ? (
          <Pressable onPress={() => router.push(`/reveal/${latest.id}`)}>
            <DreamCardView dream={latest} />
          </Pressable>
        ) : (
          <GlassCard><AppText color={colors.textMuted}>No dreams yet. Your first card awaits.</AppText></GlassCard>
        )}
      </View>
    </Screen>
  );
}
