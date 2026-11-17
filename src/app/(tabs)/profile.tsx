import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BRAND_EMBLEM } from '@/art/botanical';
import { AppText, Art, GlassCard, Icon, Screen, StatTile } from '@/components/ui';
import { useDreams } from '@/store/DreamsContext';
import { colors, fonts, radius, spacing } from '@/theme';
import { dreamStats } from '@/utils/stats';

export default function ProfileScreen() {
  const router = useRouter();
  const { dreams } = useDreams();
  const stats = dreamStats(dreams);

  return (
    <Screen>
      <Pressable onPress={() => router.navigate('/')} style={styles.back} accessibilityRole="button" hitSlop={8}>
        <Icon name="back" size={20} color={colors.textSecondary} />
        <AppText color={colors.textSecondary} style={{ fontFamily: fonts.bodyMedium }}>Garden</AppText>
      </Pressable>
      <View style={styles.header}>
        <View style={styles.avatar}><Art xml={BRAND_EMBLEM} width={44} height={44} /></View>
        <AppText variant="title">Dreamer</AppText>
        <AppText color={colors.textSecondary}>Keeper of a night garden</AppText>
      </View>

      <View style={styles.stats}>
        <StatTile value={stats.total} label="Dreams" sub={`${stats.thisWeek} this week`} />
        <StatTile value={stats.streak} label="Night streak" spark={stats.week} />
        <StatTile value={stats.rarePlus} label="Rare+ cards" sub={stats.legendary ? `${stats.legendary} legendary` : `${stats.epic} epic`} />
      </View>

      <GlassCard>
        <AppText variant="label" color={colors.textSecondary}>About</AppText>
        <AppText variant="body">Dream Oasis v{Constants.expoConfig?.version ?? '0.1.0'}</AppText>
        <View style={styles.privacy}>
          <Icon name="lock" size={14} color={colors.glow} />
          <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1 }}>Your dreams are stored only on this device.</AppText>
        </View>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, alignSelf: 'flex-start' },
  header: { alignItems: 'center', gap: spacing.sm },
  avatar: { width: 84, height: 84, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(201,232,107,0.3)', marginBottom: spacing.xs },
  stats: { flexDirection: 'row', gap: 10 },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
