import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, GlassCard, Screen, StatTile } from '@/components/ui';
import { Dream } from '@/data/types';
import { useDreams } from '@/store/DreamsContext';
import { colors, radius, spacing } from '@/theme';
import { dreamStats } from '@/utils/stats';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'The night is still';
  if (h < 12) return 'Good morning, dreamer';
  if (h < 18) return 'Good afternoon, dreamer';
  return 'Good evening, dreamer';
}

function RecentRow({ dream, onPress }: { dream: Dream; onPress: () => void }) {
  const accent = colors.rarity[dream.card.rarity] ?? colors.rarity.common;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${dream.card.title}, ${dream.card.rarity} card`}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.rowGlyph, { borderColor: accent }]}>
        <AppText style={styles.rowGlyphText}>{dream.card.glyph}</AppText>
      </View>
      <View style={styles.rowBody}>
        <AppText variant="body" numberOfLines={1} style={styles.rowTitle}>{dream.card.title}</AppText>
        <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
          {new Date(dream.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · <AppText variant="caption" color={accent}>{dream.card.rarity}</AppText>
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { dreams } = useDreams();
  const stats = dreamStats(dreams);
  const recent = dreams.slice(0, 3);

  return (
    <Screen moon>
      <View style={styles.header}>
        <View style={styles.brand}>
          <Ionicons name="moon-outline" size={14} color={colors.accent} />
          <AppText variant="label" color={colors.accent}>Dream Oasis</AppText>
        </View>
        <AppText variant="hero">{greeting()}</AppText>
        <AppText color={colors.textSecondary}>A quiet place to remember what the night revealed.</AppText>
      </View>

      <GlassCard accent>
        <AppText variant="heading">Capture a dream</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          Write it down while it is still fresh, then unveil your Dream Card.
        </AppText>
        <View style={{ marginTop: spacing.sm }}>
          <Button label="Record a Dream" onPress={() => router.push('/record')} />
        </View>
      </GlassCard>

      <View style={styles.stats}>
        <StatTile value={stats.total} label="Dreams" />
        <StatTile value={stats.rarePlus} label="Rare+ cards" />
        <StatTile value={stats.thisWeek} label="This week" />
      </View>

      <View style={{ gap: spacing.md }}>
        <View style={styles.sectionHead}>
          <AppText variant="heading">Recent dreams</AppText>
          {dreams.length > 0 && (
            <Pressable onPress={() => router.push('/collection')} hitSlop={12} accessibilityRole="link">
              <AppText variant="caption" color={colors.accent}>View all</AppText>
            </Pressable>
          )}
        </View>
        {recent.length ? (
          <GlassCard style={styles.list}>
            {recent.map((d, i) => (
              <View key={d.id}>
                {i > 0 && <View style={styles.sep} />}
                <RecentRow dream={d} onPress={() => router.push(`/reveal/${d.id}`)} />
              </View>
            ))}
          </GlassCard>
        ) : (
          <GlassCard>
            <AppText color={colors.textSecondary}>No dreams yet. Your first card is waiting.</AppText>
          </GlassCard>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, marginTop: spacing.sm },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stats: { flexDirection: 'row', gap: spacing.sm },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  list: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, gap: 0 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 56 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 64, paddingVertical: spacing.sm },
  rowGlyph: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgDeep,
  },
  rowGlyphText: { fontSize: 18, lineHeight: 22 },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { fontWeight: '600' },
});
