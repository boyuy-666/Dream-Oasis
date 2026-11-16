import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, GlassCard, Screen, StatTile } from '@/components/ui';
import { useDreams } from '@/store/DreamsContext';
import { colors, radius, spacing } from '@/theme';
import { dreamStats } from '@/utils/stats';

export default function ProfileScreen() {
  const { dreams } = useDreams();
  const stats = dreamStats(dreams);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="moon" size={34} color={colors.highlight} />
        </View>
        <AppText variant="title">Dreamer</AppText>
        <AppText color={colors.textSecondary}>Wanderer of the Oasis</AppText>
      </View>

      <View style={styles.stats}>
        <StatTile value={stats.total} label="Dreams" />
        <StatTile value={stats.rarePlus} label="Rare+ cards" />
      </View>

      <GlassCard>
        <AppText variant="label" color={colors.textSecondary}>About</AppText>
        <AppText variant="body">Dream Oasis v{Constants.expoConfig?.version ?? '0.1.0'}</AppText>
        <View style={styles.privacy}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.accent} />
          <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1 }}>
            Your dreams are stored only on this device.
          </AppText>
        </View>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    marginBottom: spacing.xs,
  },
  stats: { flexDirection: 'row', gap: spacing.md },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
