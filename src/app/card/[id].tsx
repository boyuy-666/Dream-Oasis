import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardBack, CardFlip, DreamCard } from '@/components/card';
import { AppText, Button, Chip, Icon, RarityTag } from '@/components/ui';
import { useDreams } from '@/store/DreamsContext';
import { colors, fonts, radius, spacing } from '@/theme';
import { fmtLong, fmtTime } from '@/utils/dates';
import { capitalize, padNo, toDreamViews } from '@/utils/dreamView';

const CARD_W = 252;

/** Card detail, presented as an iOS sheet from the collection. */
export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dreams } = useDreams();
  const dream = useMemo(() => toDreamViews(dreams).find((d) => d.id === id), [dreams, id]);
  const [faceUp, setFaceUp] = useState(true);

  if (!dream) {
    return (
      <View style={[styles.root, styles.center]}>
        <AppText variant="title" center>Card not found</AppText>
        <Button label="Close" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const d = dream.details;
  const symbols = [...dream.symbols, ...(d?.tags ?? []).filter((t) => !dream.symbols.includes(t))];
  const facts: [string, string][] = [
    ['Emotion', dream.emotion],
    ['Element', dream.element],
    ['People', d?.people?.length ? d.people.join(', ') : 'Just you'],
    ['Place', d?.place || 'Not noted'],
    ...(d?.vividness ? [['Vividness', `${d.vividness} of 5`] as [string, string]] : []),
    ...(d?.lucid !== undefined ? [['Lucid', d.lucid ? 'Yes' : 'No'] as [string, string]] : []),
  ];
  const share = () => Share.share({ message: `${dream.title}\n\n${dream.text}\n\n${dream.reflection}\n\nDream Oasis · Nº ${padNo(dream.no)}` }).catch(() => {});

  return (
    <View style={styles.root}>
      <View style={styles.grabber} />
      <View style={styles.bar}>
        <AppText variant="label" color={colors.textSecondary}>Nº {padNo(dream.no)} · {capitalize(dream.rarity)}</AppText>
        <View style={styles.barActions}>
          <Pressable onPress={() => router.push(`/edit/${dream.id}`)} style={styles.edit} accessibilityRole="button" accessibilityLabel="Edit dream" hitSlop={6}>
            <Icon name="pen" size={16} color={colors.text} />
            <AppText variant="small" style={{ fontFamily: fonts.bodySemibold }}>Edit</AppText>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={6}>
            <Icon name="close" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing.xl }]} showsVerticalScrollIndicator={false}>
        <View style={styles.cardWrap}>
          <CardFlip width={CARD_W} flipped={faceUp} front={<DreamCard dream={dream} width={CARD_W} />} back={<CardBack width={CARD_W} />} duration={800} />
        </View>
        <Pressable onPress={() => setFaceUp(!faceUp)} style={styles.turn} accessibilityRole="button">
          <Icon name="turn" size={16} color={colors.textSecondary} />
          <AppText variant="caption" color={colors.textSecondary}>Turn card over</AppText>
        </Pressable>

        <View style={{ gap: 6 }}>
          <AppText variant="title">{dream.title}</AppText>
          <View style={styles.metaRow}>
            <AppText variant="caption" color={colors.textSecondary}>{fmtLong(dream.createdAt)} · {fmtTime(dream.createdAt)} ·</AppText>
            <RarityTag rarity={dream.rarity} />
          </View>
        </View>

        <View style={styles.block}>
          <AppText variant="label" color={colors.textSecondary}>The dream</AppText>
          <AppText style={styles.dreamText}>{dream.text}</AppText>
        </View>
        <View style={styles.block}>
          <AppText variant="label" color={colors.textSecondary}>Reflection</AppText>
          <AppText variant="quote" color={colors.textSecondary}>{dream.reflection}</AppText>
        </View>
        <View style={styles.block}>
          <AppText variant="label" color={colors.textSecondary}>Symbols</AppText>
          <View style={styles.chips}>{symbols.map((s) => <Chip key={s} size="tag" label={s} marker={false} />)}</View>
        </View>
        <View style={[styles.block, styles.facts]}>
          {facts.map(([k, v]) => (
            <View key={k} style={styles.fact}>
              <AppText variant="label" color={colors.textMuted}>{k}</AppText>
              <AppText variant="small">{v}</AppText>
            </View>
          ))}
        </View>
        <Button label="Share this card" icon="share" variant="secondary" onPress={share} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  grabber: { alignSelf: 'center', width: 38, height: 5, borderRadius: 3, backgroundColor: colors.fernStrong, marginTop: 8 },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: spacing.lg, paddingRight: spacing.md, paddingTop: 8, paddingBottom: 4 },
  barActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  edit: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.paperA06, borderWidth: 1, borderColor: colors.border },
  close: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paperA06, borderWidth: 1, borderColor: colors.border },
  body: { paddingHorizontal: spacing.lg, paddingTop: 8, gap: 22 },
  cardWrap: { alignItems: 'center', marginTop: 6 },
  turn: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, marginTop: -6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  block: { gap: 10, paddingTop: 18, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  dreamText: { fontFamily: fonts.display, fontSize: 20, lineHeight: 29, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, rowGap: 14 },
  fact: { width: '50%', gap: 3, paddingRight: 12 },
});
