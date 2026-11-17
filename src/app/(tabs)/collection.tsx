import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useRef, useState } from 'react';
import { FlatList, HostInstance, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { renderEmptyArt } from '@/art/botanical';
import { DreamCard } from '@/components/card';
import { AppText, Art, Button, Chip, Icon } from '@/components/ui';
import { Rarity } from '@/data/types';
import { useDreams } from '@/store/DreamsContext';
import { colors, fonts, radius, spacing } from '@/theme';
import { capitalize, DreamView, RARITY_RANK, toDreamViews } from '@/utils/dreamView';

type Filter = 'all' | Rarity;
type Sort = 'newest' | 'oldest' | 'rarity';
const SORT_LABEL: Record<Sort, string> = { newest: 'Newest first', oldest: 'Oldest first', rarity: 'Rarest first' };
const ORDER: Rarity[] = ['legendary', 'epic', 'rare', 'common'];
const STAGGER = 34;

export default function CollectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();
  const { dreams } = useDreams();
  const views = useMemo(() => toDreamViews(dreams), [dreams]);

  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('newest');
  const [menu, setMenu] = useState<{ top: number; right: number } | null>(null);
  const sortRef = useRef<HostInstance>(null);
  const emptyXml = useMemo(() => renderEmptyArt(), []);

  const counts = useMemo(() => {
    const c: Record<Rarity, number> = { legendary: 0, epic: 0, rare: 0, common: 0 };
    views.forEach((v) => { c[v.rarity] += 1; });
    return c;
  }, [views]);
  const list = useMemo(() => {
    const filtered = filter === 'all' ? views : views.filter((v) => v.rarity === filter);
    return [...filtered].sort((a, b) =>
      sort === 'newest' ? b.createdAt.localeCompare(a.createdAt)
        : sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt)
          : RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity] || b.createdAt.localeCompare(a.createdAt));
  }, [views, filter, sort]);
  const cellW = (width - spacing.lg * 2 - 14) / 2;

  const openMenu = () => {
    sortRef.current?.measureInWindow((x: number, y: number, w: number, h: number) => setMenu({ top: y + h + 6, right: width - (x + w) }));
  };

  const header = (
    <View style={styles.header}>
      <View style={{ gap: 8 }}>
        <AppText variant="label" color={colors.textSecondary}>Collection</AppText>
        <View style={styles.headRow}>
          <AppText variant="title">Your night{'\n'}garden</AppText>
          <View style={{ alignItems: 'flex-end' }}>
            <AppText style={styles.count}>{views.length}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>{views.length === 1 ? 'card' : 'cards'} collected</AppText>
          </View>
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <View style={styles.bar} accessibilityLabel={`Rarity: ${ORDER.map((r) => `${counts[r]} ${r}`).join(', ')}`}>
          {views.length
            ? ORDER.filter((r) => counts[r]).map((r) => <View key={r} style={{ flex: counts[r], backgroundColor: colors.rarity[r] }} />)
            : <View style={{ flex: 1, backgroundColor: colors.border }} />}
        </View>
        <View style={styles.legend}>
          {ORDER.map((r) => (
            <AppText key={r} variant="caption" color={colors.textSecondary}>
              <AppText variant="caption" color={colors.text} style={{ fontFamily: fonts.bodySemibold }}>{counts[r]}</AppText> {capitalize(r)}
            </AppText>
          ))}
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters} style={styles.filterScroll}>
        {(['all', ...ORDER] as Filter[]).map((f) => (
          <Chip key={f} marker={false} label={f === 'all' ? 'All' : capitalize(f)} count={f === 'all' ? views.length : counts[f]} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>
      <View style={styles.toolbar}>
        <AppText variant="caption" color={colors.textSecondary}>{filter === 'all' ? `Showing all ${list.length}` : `${list.length} ${filter}`}</AppText>
        <Pressable ref={sortRef} onPress={openMenu} style={styles.sortBtn} accessibilityRole="button" accessibilityLabel={`Sort: ${SORT_LABEL[sort]}`} hitSlop={6}>
          <Icon name="sort" size={16} color={colors.textSecondary} />
          <AppText variant="small" color={colors.textSecondary}>{SORT_LABEL[sort]}</AppText>
        </Pressable>
      </View>
    </View>
  );

  const empty = (
    <View style={styles.empty}>
      <Art xml={emptyXml} width={132} height={132} />
      <AppText variant="heading" center>{views.length ? `No ${filter} blooms yet` : 'Your garden is waiting'}</AppText>
      <AppText variant="small" color={colors.textSecondary} center style={{ maxWidth: 270 }}>
        {views.length
          ? filter === 'legendary' ? 'Legendary cards are rare. Vivid, detailed entries give them a better chance to appear.' : 'Keep recording. New cards appear here as your garden grows.'
          : 'Every dream you record grows into a card. Your first one is a few sentences away.'}
      </AppText>
      <View style={{ marginTop: 6 }}>
        {views.length
          ? <Button label="Show all cards" variant="secondary" onPress={() => setFilter('all')} />
          : <Button label="Record a dream" onPress={() => router.push('/record')} />}
      </View>
    </View>
  );

  const renderItem = ({ item, index }: { item: DreamView; index: number }) => (
    <Pressable
      onPress={() => router.push(`/card/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      style={({ pressed }) => [{ width: cellW, transform: [{ translateY: index % 2 ? STAGGER : 0 }, { scale: pressed ? 0.975 : 1 }] }]}
    >
      {({ pressed }) => (
        <View>
          <DreamCard dream={item} width={cellW} still />
          {(highlight === item.id || pressed) && (
            <View pointerEvents="none" style={[styles.outline, { borderRadius: cellW * 0.05 + 5, borderColor: highlight === item.id ? colors.glow : colors.mothPaper }]} />
          )}
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <FlatList
        data={list}
        keyExtractor={(d) => d.id}
        numColumns={2}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={<View style={{ height: STAGGER + spacing.xl }} />}
        columnWrapperStyle={styles.column}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        windowSize={7}
      />
      {menu && (
        <Pressable style={[StyleSheet.absoluteFill, { height }]} onPress={() => setMenu(null)} accessibilityLabel="Close sort menu">
          <View style={[styles.menu, { top: menu.top, right: menu.right }]} accessibilityRole="menu">
            {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
              <Pressable key={s} onPress={() => { setSort(s); setMenu(null); }} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.paperA06 }]} accessibilityRole="menuitem" accessibilityState={{ checked: sort === s }}>
                <AppText variant="small" color={sort === s ? colors.text : colors.textSecondary}>{SORT_LABEL[s]}</AppText>
                {sort === s && <Icon name="check" size={16} color={colors.glow} weight={2.2} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, gap: 18 },
  column: { gap: 14 },
  header: { gap: 22, marginBottom: 4 },
  headRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  count: { fontFamily: fonts.display, fontSize: 48, lineHeight: 52, color: colors.text, fontVariant: ['tabular-nums'] },
  bar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', gap: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 6 },
  filterScroll: { marginHorizontal: -spacing.lg },
  filters: { gap: 8, paddingHorizontal: spacing.lg },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -8 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36 },
  outline: { position: 'absolute', top: -5, left: -5, right: -5, bottom: -5, borderWidth: 2 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 34, paddingHorizontal: 20, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  menu: { position: 'absolute', minWidth: 196, padding: 6, borderRadius: radius.md, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.borderStrong, shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: 12, borderRadius: radius.sm },
});
