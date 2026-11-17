import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MAX_MOODS, MORE_MOODS, MoodOption, PRIMARY_MOODS } from '@/data/moods';
import { Mood } from '@/data/types';
import { colors, fonts, radius } from '@/theme';
import { moodLabel, toggleMood } from '@/utils/moodSelection';
import { AppText } from './AppText';
import { Chip } from './Chip';
import { Icon } from './Icon';

interface Props {
  /** Ordered form selection (0–3); the first is the primary feeling. Empty until the user chooses. */
  value: Mood[];
  onChange: (next: Mood[]) => void;
  label?: string;
  /** Validation message from a save attempt (e.g. no feeling chosen), shown under the chips. */
  error?: string | null;
}

/**
 * Multi-select emotion picker (up to 3). Selection order is kept; the first is the primary.
 * The form may be empty while choosing; saving requires 1–3 (checked by the screen and store).
 * Five familiar feelings are always shown; thirteen more expand inline under "+ More".
 * A summary line always shows the full selection, including feelings hidden by a collapsed More.
 */
export function MoodSelector({ value, onChange, label = 'How did it feel?', error }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const flash = (message: string) => {
    setNotice(message);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 2600);
  };

  const press = (mood: Mood) => {
    const { moods, outcome } = toggleMood(value, mood);
    if (outcome === 'limit') return flash(`Up to ${MAX_MOODS} feelings. Remove one to choose another.`);
    setNotice(null);
    onChange(moods);
  };

  const hiddenSelected = MORE_MOODS.filter((m) => value.includes(m.key)).length;
  const chip = (m: MoodOption) => {
    const index = value.indexOf(m.key);
    const selected = index >= 0;
    const role = index === 0 ? ', primary feeling' : selected ? `, feeling ${index + 1}` : '';
    return <Chip key={m.key} label={m.label} selected={selected} onPress={() => press(m.key)} accessibilityLabel={`${m.label}${role}`} />;
  };

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <AppText variant="label" color={colors.textSecondary}>{label}</AppText>
        <AppText variant="caption" color={colors.textMuted}>Select up to {MAX_MOODS}</AppText>
      </View>

      {value.length ? (
        <View style={styles.summary} accessible accessibilityLiveRegion="polite"
          accessibilityLabel={`Selected feelings: ${value.map((m, i) => `${moodLabel(m)}${i === 0 ? ' (primary)' : ''}`).join(', ')}`}>
          <AppText variant="caption" color={colors.textMuted}>Primary</AppText>
          <AppText variant="caption" color={colors.text} style={styles.primary}>{moodLabel(value[0])}</AppText>
          {value.slice(1).map((m) => (
            <AppText key={m} variant="caption" color={colors.textSecondary}>· {moodLabel(m)}</AppText>
          ))}
        </View>
      ) : (
        <View style={styles.summary} accessible accessibilityLiveRegion="polite" accessibilityLabel="Selected feelings: none yet">
          <AppText variant="caption" color={colors.textMuted}>No feelings selected yet</AppText>
        </View>
      )}

      <View style={styles.chips}>
        {PRIMARY_MOODS.map(chip)}
        {expanded && MORE_MOODS.map(chip)}
        <Pressable
          onPress={() => setExpanded(!expanded)}
          style={({ pressed }) => [styles.more, pressed && { opacity: 0.8 }]}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={expanded ? 'Show fewer feelings' : `More feelings${hiddenSelected ? `, ${hiddenSelected} selected` : ''}`}
        >
          <Icon name={expanded ? 'close' : 'plus'} size={14} color={colors.textSecondary} />
          <AppText variant="small" color={colors.textSecondary}>
            {expanded ? 'Fewer' : hiddenSelected ? `More · ${hiddenSelected} selected` : 'More'}
          </AppText>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorRow} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Icon name="alert" size={16} color={colors.danger} />
          <AppText variant="caption" color={colors.danger} style={{ flex: 1 }}>{error}</AppText>
        </View>
      ) : null}
      {notice ? (
        <AppText variant="caption" color={colors.textSecondary} accessibilityLiveRegion="polite">{notice}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  summary: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 6, rowGap: 2 },
  primary: { fontFamily: fonts.bodySemibold },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  errorRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  more: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderStrong },
});
