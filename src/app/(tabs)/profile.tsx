import Constants from 'expo-constants';
import React from 'react';
import { View } from 'react-native';

import { AppText, GlassCard, Screen } from '@/components/ui';
import { useDreams } from '@/store/DreamsContext';
import { colors, spacing } from '@/theme';

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <GlassCard style={{ flex: 1, alignItems: 'center' }}>
      <AppText variant="title" color={colors.gold}>{value}</AppText>
      <AppText variant="caption" color={colors.textMuted}>{label}</AppText>
    </GlassCard>
  );
}

export default function ProfileScreen() {
  const { dreams } = useDreams();
  const rare = dreams.filter((d) => d.card.rarity !== 'common').length;

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: spacing.sm }}>
        <AppText style={{ fontSize: 64, lineHeight: 76 }}>🌌</AppText>
        <AppText variant="title">Dreamer</AppText>
        <AppText color={colors.textMuted}>Wanderer of the Oasis</AppText>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Stat value={dreams.length} label="Dreams" />
        <Stat value={rare} label="Rare+ cards" />
      </View>

      <GlassCard>
        <AppText variant="heading">About</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          Dream Oasis v{Constants.expoConfig?.version ?? '0.1.0'} · Your dreams are stored only on this device.
        </AppText>
      </GlassCard>
    </Screen>
  );
}
