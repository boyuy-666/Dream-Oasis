import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import {
  addMonths, compareMonths, currentMonth, DateKey, formatKeyWeekday, isFutureKey, isValidDateKey, monthOf, todayKey, yesterdayKey,
} from '@/utils/dreamDates';
import { AppText } from './AppText';
import { Button } from './Button';
import { CalendarGrid, MonthHeader } from './CalendarGrid';
import { Chip } from './Chip';

interface Props {
  visible: boolean;
  /** The committed date (YYYY-MM-DD). The picker edits a draft copy of it. */
  value: DateKey;
  onConfirm: (key: DateKey) => void;
  onCancel: () => void;
  title?: string;
}

/**
 * Night Garden date picker for "when did you dream?".
 * Draft-based: selecting a day only changes the draft; Confirm Date commits, Cancel / backdrop /
 * Android back discard the draft. Future days are disabled.
 */
export function DreamDatePicker({ visible, value, onConfirm, onCancel, title = 'When did you dream?' }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      {/* Mounted only while open, so each opening starts a fresh draft from the committed value. */}
      {visible ? <PickerBody value={value} onConfirm={onConfirm} onCancel={onCancel} title={title} /> : null}
    </Modal>
  );
}

function PickerBody({ value, onConfirm, onCancel, title }: Omit<Props, 'visible'> & { title: string }) {
  const now = new Date();
  const today = todayKey(now);
  const start = isValidDateKey(value) && !isFutureKey(value, now) ? value : yesterdayKey(now);
  const [draft, setDraft] = useState<DateKey>(start);
  const [month, setMonth] = useState(() => monthOf(start));
  const [enter] = useState(() => new Animated.Value(0));
  const canNext = compareMonths(month, currentMonth(now)) < 0;

  useEffect(() => {
    let anim: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        anim = Animated.timing(enter, { toValue: 1, duration: reduced ? 0 : 240, easing: Easing.out(Easing.cubic), useNativeDriver: true });
        anim.start();
      })
      .catch(() => enter.setValue(1));
    return () => anim?.stop();
  }, [enter]);

  const jump = (key: DateKey) => { setDraft(key); setMonth(monthOf(key)); };
  const yesterday = yesterdayKey(now);

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Cancel date selection" accessibilityRole="button" />
      <Animated.View
        accessibilityViewIsModal
        style={[styles.panel, { opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}
      >
        <View style={styles.copy}>
          <AppText variant="title" accessibilityRole="header">{title}</AppText>
          <AppText variant="small" color={colors.textSecondary} accessibilityLiveRegion="polite">{formatKeyWeekday(draft)}</AppText>
        </View>

        <MonthHeader month={month} onPrev={() => setMonth(addMonths(month, -1))} onNext={() => canNext && setMonth(addMonths(month, 1))} canNext={canNext} />
        <CalendarGrid month={month} selected={draft} today={today} onSelect={setDraft} />

        <View style={styles.shortcuts}>
          <Chip label="Yesterday" marker={false} selected={draft === yesterday} onPress={() => jump(yesterday)} />
          <Chip label="Today" marker={false} selected={draft === today} onPress={() => jump(today)} />
        </View>

        <View style={styles.actions}>
          <Button label="Confirm Date" onPress={() => onConfirm(isFutureKey(draft) ? todayKey() : draft)} />
          <Button label="Cancel" variant="secondary" onPress={onCancel} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, backgroundColor: colors.scrim },
  panel: {
    width: '100%',
    maxWidth: 390,
    padding: spacing.lg - 4,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
  copy: { gap: 4 },
  shortcuts: { flexDirection: 'row', gap: 8 },
  actions: { gap: 10 },
});
