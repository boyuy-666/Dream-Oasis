import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts } from '@/theme';
import {
  compareKeys, DateKey, formatKeyLong, formatMonth, monthGrid, MonthRef, parseKey, WEEKDAY_LABELS, WEEKDAY_NAMES, weekdayIndex,
} from '@/utils/dreamDates';
import { AppText } from './AppText';
import { Icon } from './Icon';

/** Month title with previous / next buttons. `canNext` is false at the current month. */
export function MonthHeader({ month, onPrev, onNext, canNext }: { month: MonthRef; onPrev: () => void; onNext: () => void; canNext: boolean }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onPrev} style={styles.navBtn} accessibilityRole="button" accessibilityLabel="Previous month" hitSlop={6}>
        <Icon name="back" size={18} color={colors.text} />
      </Pressable>
      <AppText variant="heading" accessibilityRole="header" style={styles.monthTitle}>{formatMonth(month)}</AppText>
      <Pressable
        onPress={onNext}
        disabled={!canNext}
        style={[styles.navBtn, !canNext && styles.navDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Next month"
        accessibilityState={{ disabled: !canNext }}
        hitSlop={6}
      >
        <Icon name="chevron" size={18} color={canNext ? colors.text : colors.textMuted} />
      </Pressable>
    </View>
  );
}

interface GridProps {
  month: MonthRef;
  selected: DateKey;
  today: DateKey;
  onSelect: (key: DateKey) => void;
  /** Dreams per day; shows a moonlight count badge under days that have dreams. */
  counts?: Map<DateKey, number>;
}

/** Monday-first month grid. Future days are disabled; row count follows the month. */
export function CalendarGrid({ month, selected, today, onSelect, counts }: GridProps) {
  const rows = monthGrid(month);
  return (
    <View style={styles.grid}>
      <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {WEEKDAY_LABELS.map((w) => <AppText key={w} variant="caption" color={colors.textMuted} style={styles.weekday}>{w}</AppText>)}
      </View>
      {rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((key, c) => {
            if (!key) return <View key={`e${c}`} style={styles.cell} />;
            const future = compareKeys(key, today) > 0;
            const isSelected = key === selected;
            const isToday = key === today;
            const n = counts?.get(key) ?? 0;
            const label = `${WEEKDAY_NAMES[weekdayIndex(key)]}, ${formatKeyLong(key)}${isToday ? ', today' : ''}${counts ? `, ${n === 0 ? 'no dreams' : n === 1 ? '1 dream' : `${n} dreams`}` : ''}`;
            return (
              <Pressable
                key={key}
                style={styles.cell}
                disabled={future}
                onPress={() => { Haptics.selectionAsync().catch(() => {}); onSelect(key); }}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected: isSelected, disabled: future }}
              >
                <View style={[styles.day, isToday && !isSelected && styles.today, isSelected && styles.selected]}>
                  <AppText
                    style={[styles.dayText, isSelected && styles.selectedText, future && styles.futureText]}
                  >
                    {parseKey(key)?.day}
                  </AppText>
                </View>
                <View style={styles.countSlot}>
                  {n > 0 ? (
                    <View style={styles.badge}>
                      <View style={styles.dot} />
                      <AppText style={styles.countText}>{n}</AppText>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  monthTitle: { flex: 1, textAlign: 'center' },
  navBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paperA06, borderWidth: 1, borderColor: colors.border },
  navDisabled: { opacity: 0.4 },
  grid: { gap: 2 },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontFamily: fonts.bodySemibold, paddingBottom: 6 },
  cell: { flex: 1, alignItems: 'center', minHeight: 50 },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1, borderColor: colors.glowA32 },
  selected: { backgroundColor: colors.glow },
  dayText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text, fontVariant: ['tabular-nums'] },
  selectedText: { fontFamily: fonts.bodyBold, color: colors.onAccent },
  futureText: { color: colors.textMuted, opacity: 0.45 },
  countSlot: { height: 13, justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.glow },
  countText: { fontFamily: fonts.bodySemibold, fontSize: 10, lineHeight: 12, color: colors.glow },
});
