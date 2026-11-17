import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  count?: number;
  size?: 'md' | 'tag';
  /** Show the leading dot / check affordance (filters hide it). */
  marker?: boolean;
  /** Overrides the spoken label (defaults to the visible label). */
  accessibilityLabel?: string;
}

/** Emotion, tag and filter chip. Selected = moth-paper fill (glow stays reserved for actions). */
export function Chip({ label, selected, onPress, count, size = 'md', marker = true, accessibilityLabel }: Props) {
  const fg = selected ? colors.mossNight : colors.textSecondary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (count !== undefined ? `${label}, ${count}` : label)}
      accessibilityState={{ selected: !!selected }}
      hitSlop={4}
      disabled={!onPress}
      onPress={() => { Haptics.selectionAsync().catch(() => {}); onPress?.(); }}
      style={({ pressed }) => [styles.chip, size === 'tag' && styles.tag, selected && styles.selected, pressed && { opacity: 0.8 }]}
    >
      {marker && (selected ? <Icon name="check" size={14} color={fg} weight={2.2} /> : <View style={[styles.dot, { backgroundColor: fg }]} />)}
      <AppText variant={size === 'tag' ? 'caption' : 'small'} color={fg} style={selected && styles.bold}>{label}</AppText>
      {count !== undefined && <AppText variant="small" color={fg} style={{ opacity: 0.7 }}>{count}</AppText>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  tag: { minHeight: 32, paddingHorizontal: 12 },
  selected: { backgroundColor: colors.mothPaper, borderColor: colors.mothPaper },
  dot: { width: 7, height: 7, borderRadius: 4, opacity: 0.6 },
  bold: { fontFamily: 'InstrumentSans_600SemiBold' },
});
