import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { renderEmptyArt } from '@/art/botanical';
import { AppText, Art, Button, CalendarGrid, DreamRow, Icon, MonthHeader } from '@/components/ui';
import { useDreams } from '@/store/DreamsContext';
import { colors, fonts, radius, spacing } from '@/theme';
import {
  addMonths, compareMonths, currentMonth, DateKey, formatKeyWeekday, groupByDreamDate, MonthRef, monthOf, todayKey,
} from '@/utils/dreamDates';
import { toDreamViews } from '@/utils/dreamView';

/** Dream Calendar: browse dreams by the day they were dreamed. Opened from Collection. */
export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dreams } = useDreams();
  const views = useMemo(() => toDreamViews(dreams), [dreams]);
  // Effective dream date per record; each day's list is newest-recorded first.
  const byDay = useMemo(() => groupByDreamDate(views), [views]);
  const counts = useMemo(() => new Map([...byDay].map(([k, list]) => [k, list.length])), [byDay]);
  const emptyXml = useMemo(() => renderEmptyArt(), []);

  const now = new Date();
  const today = todayKey(now);
  const [month, setMonth] = useState<MonthRef>(() => currentMonth());
  const [selected, setSelected] = useState<DateKey>(() => todayKey());
  const canNext = compareMonths(month, currentMonth(now)) < 0;

  const dayDreams = byDay.get(selected) ?? [];
  const monthTotal = [...counts].filter(([k]) => k.startsWith(`${month.year}-${String(month.month).padStart(2, '0')}-`)).reduce((n, [, c]) => n + c, 0);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/collection'));
  const goToday = () => { setMonth(monthOf(today)); setSelected(today); };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xl }]} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <Pressable onPress={back} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back to Collection" hitSlop={8}>
            <Icon name="back" size={20} color={colors.textSecondary} />
            <AppText color={colors.textSecondary} style={{ fontFamily: fonts.bodyMedium }}>Collection</AppText>
          </Pressable>
          {selected !== today || compareMonths(month, monthOf(today)) !== 0 ? (
            <Pressable onPress={goToday} style={styles.todayBtn} accessibilityRole="button" accessibilityLabel="Jump to today" hitSlop={6}>
              <AppText variant="caption" color={colors.text} style={{ fontFamily: fonts.bodySemibold }}>Today</AppText>
            </Pressable>
          ) : null}
        </View>

        <View style={{ gap: 6 }}>
          <AppText variant="label" color={colors.textSecondary}>Your nights</AppText>
          <AppText variant="title" accessibilityRole="header">Dream Calendar</AppText>
          <AppText variant="small" color={colors.textSecondary}>
            {dreams.length === 0 ? 'No dreams recorded yet.' : `${monthTotal} ${monthTotal === 1 ? 'dream' : 'dreams'} this month`}
          </AppText>
        </View>

        <View style={styles.panel}>
          <MonthHeader month={month} onPrev={() => setMonth(addMonths(month, -1))} onNext={() => canNext && setMonth(addMonths(month, 1))} canNext={canNext} />
          <CalendarGrid month={month} selected={selected} today={today} onSelect={setSelected} counts={counts} />
        </View>

        <View style={styles.daySection}>
          <View style={styles.dayHead}>
            <AppText variant="heading" accessibilityRole="header">{formatKeyWeekday(selected)}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {dayDreams.length === 0 ? 'No dreams' : dayDreams.length === 1 ? '1 dream' : `${dayDreams.length} dreams`}
            </AppText>
          </View>

          {dayDreams.length ? (
            <View>
              {dayDreams.map((v, i) => <DreamRow key={v.id} dream={v} first={i === 0} onPress={() => router.push(`/card/${v.id}`)} />)}
            </View>
          ) : (
            <View style={styles.empty}>
              <Art xml={emptyXml} width={96} height={96} />
              <AppText variant="body" color={colors.text} center>No dreams recorded on this day.</AppText>
              {dreams.length === 0 ? (
                <>
                  <AppText variant="small" color={colors.textSecondary} center>Dreams you record will bloom here, on the nights you had them.</AppText>
                  <View style={{ marginTop: 4 }}><Button label="Record a dream" onPress={() => router.push('/record')} /></View>
                </>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, gap: 22 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
  todayBtn: { minHeight: 36, paddingHorizontal: 14, borderRadius: radius.pill, justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.paperA06 },
  panel: { gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  daySection: { gap: 10 },
  dayHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: spacing.lg, paddingHorizontal: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
