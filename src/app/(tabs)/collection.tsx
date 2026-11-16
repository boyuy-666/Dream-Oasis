import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppText, Button, DreamCardView, GlassCard, Screen } from '@/components/ui';
import { useDreams } from '@/store/DreamsContext';
import { colors, spacing } from '@/theme';

export default function CollectionScreen() {
  const router = useRouter();
  const { dreams } = useDreams();
  const { width } = useWindowDimensions();
  const cellWidth = (width - spacing.lg * 2 - spacing.md) / 2;

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="title">Dream Collection</AppText>
        <AppText color={colors.textSecondary}>
          {dreams.length} {dreams.length === 1 ? 'card' : 'cards'} gathered
        </AppText>
      </View>

      {dreams.length === 0 ? (
        <GlassCard style={styles.empty}>
          <Ionicons name="albums-outline" size={32} color={colors.accent} />
          <AppText variant="heading" center>Your collection awaits</AppText>
          <AppText color={colors.textSecondary} center>
            Record a dream and its card will appear here.
          </AppText>
          <View style={{ alignSelf: 'stretch', marginTop: spacing.sm }}>
            <Button label="Record a Dream" onPress={() => router.push('/record')} />
          </View>
        </GlassCard>
      ) : (
        <View style={styles.grid}>
          {dreams.map((d) => (
            <Pressable
              key={d.id}
              style={({ pressed }) => [{ width: cellWidth, gap: spacing.sm }, pressed && { opacity: 0.85 }]}
              onPress={() => router.push(`/reveal/${d.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`${d.card.title}, ${d.card.rarity} card`}
            >
              <View style={styles.cardSlot}>
                <DreamCardView dream={d} compact />
              </View>
              <AppText variant="caption" color={colors.textSecondary} center>
                {new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cardSlot: { aspectRatio: 0.7 },
  empty: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
});
