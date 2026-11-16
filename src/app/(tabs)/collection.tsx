import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, DreamCardView, GlassCard, Screen } from '@/components/ui';
import { useDreams } from '@/store/DreamsContext';
import { colors, spacing } from '@/theme';

export default function CollectionScreen() {
  const router = useRouter();
  const { dreams } = useDreams();

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="title">Dream Collection</AppText>
        <AppText color={colors.textMuted}>{dreams.length} {dreams.length === 1 ? 'card' : 'cards'} gathered</AppText>
      </View>

      {dreams.length === 0 ? (
        <GlassCard><AppText color={colors.textMuted}>Record a dream and your first card will appear here.</AppText></GlassCard>
      ) : (
        <View style={styles.grid}>
          {dreams.map((d) => (
            <Pressable key={d.id} style={styles.cell} onPress={() => router.push(`/reveal/${d.id}`)}>
              <DreamCardView dream={d} compact />
              <AppText variant="caption" color={colors.textDim} center>{new Date(d.createdAt).toLocaleDateString()}</AppText>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cell: { width: '47%', gap: spacing.xs },
});
