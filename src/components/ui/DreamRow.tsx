import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { renderArt } from '@/art/botanical';
import { colors, fonts } from '@/theme';
import { fmtRelative } from '@/utils/dates';
import { capitalize, DreamView } from '@/utils/dreamView';
import { AppText } from './AppText';
import { Art } from './Art';

export function RarityTag({ rarity }: { rarity: DreamView['rarity'] }) {
  const c = colors.rarity[rarity];
  return (
    <View style={styles.tag}>
      <View style={[styles.tagDot, { backgroundColor: c }, rarity === 'legendary' && styles.tagGlow]} />
      <AppText variant="label" color={c} style={styles.tagText}>{capitalize(rarity)}</AppText>
    </View>
  );
}

/** Recent-dream row: specimen thumbnail, serif title, date · emotion, rarity tag. */
export function DreamRow({ dream, onPress, first }: { dream: DreamView; onPress: () => void; first?: boolean }) {
  const xml = useMemo(() => renderArt(dream.motif, dream.rarity, dream.id), [dream.motif, dream.rarity, dream.id]);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${dream.title}, ${dream.rarity} card`} style={({ pressed }) => [styles.row, !first && styles.border, pressed && { opacity: 0.8 }]}>
      <View style={styles.thumb}><Art xml={xml} /></View>
      <View style={styles.body}>
        <AppText style={styles.title} numberOfLines={1}>{dream.title}</AppText>
        <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>{fmtRelative(dream.createdAt)} · {dream.emotion}</AppText>
      </View>
      <RarityTag rarity={dream.rarity} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  border: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  thumb: { width: 52, height: 64, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSunk },
  body: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontFamily: fonts.display, fontSize: 20, lineHeight: 23, color: colors.text },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tagDot: { width: 7, height: 7, borderRadius: 4 },
  tagGlow: { shadowColor: colors.glow, shadowOpacity: 0.9, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  tagText: { letterSpacing: 1.3 },
});
