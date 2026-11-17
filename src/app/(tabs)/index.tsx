import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BRAND_EMBLEM, renderArt, renderCtaArt, renderHomeDecor } from '@/art/botanical';
import { AppText, Art, Button, DreamRow, GlassCard, StatTile, Screen } from '@/components/ui';
import { useDreams } from '@/store/DreamsContext';
import { colors, fonts, radius, spacing } from '@/theme';
import { fmtRelative, fmtTime, fmtWeekday, greeting } from '@/utils/dates';
import { toDreamViews } from '@/utils/dreamView';
import { dreamStats } from '@/utils/stats';

export default function HomeScreen() {
  const router = useRouter();
  const { dreams } = useDreams();
  const views = useMemo(() => toDreamViews(dreams), [dreams]);
  const recent = useMemo(() => [...views].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3), [views]);
  const stats = dreamStats(dreams);
  const latest = recent[0];
  const quote = views.find((v) => v.rarity === 'legendary') ?? latest;
  const decorXml = useMemo(() => renderHomeDecor(), []);
  const ctaXml = useMemo(() => renderCtaArt(), []);
  const latestXml = useMemo(() => (latest ? renderArt(latest.motif, latest.rarity, latest.id) : ''), [latest]);

  return (
    <Screen decor={<View pointerEvents="none" style={styles.decor}><Art xml={decorXml} /></View>}>
      <View style={styles.top}>
        <View style={styles.brand}>
          <Art xml={BRAND_EMBLEM} width={26} height={26} />
          <AppText style={styles.brandText}>Dream Oasis</AppText>
        </View>
        <Pressable style={styles.avatar} onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel="Profile" hitSlop={6}>
          <AppText style={styles.avatarText}>D</AppText>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <AppText variant="label" color={colors.textSecondary}>{fmtWeekday(new Date())}</AppText>
        <AppText variant="hero">
          {greeting()},{'\n'}
          <AppText variant="hero" color={colors.nightBloom} style={{ fontFamily: fonts.displayItalic }}>dreamer</AppText>
        </AppText>
        <AppText color={colors.textSecondary} style={styles.lede}>
          The garden grew quietly while you slept. Write down what you remember while it is still close.
        </AppText>
      </View>

      {latest && (
        <Pressable onPress={() => router.push(`/reveal/${latest.id}`)} style={({ pressed }) => [styles.latest, pressed && { opacity: 0.9 }]} accessibilityRole="button" accessibilityLabel={`Latest bloom, ${latest.title}. Reveal again`}>
          <View style={styles.latestThumb}><Art xml={latestXml} /></View>
          <View style={styles.latestBody}>
            <AppText variant="label" color={colors.glow}>Latest bloom</AppText>
            <AppText style={styles.latestTitle} numberOfLines={1}>{latest.title}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Recorded {fmtRelative(latest.createdAt).toLowerCase()} at {fmtTime(latest.createdAt)}
            </AppText>
          </View>
          <View style={styles.pill}><AppText variant="small" color={colors.glow} style={{ fontFamily: fonts.bodySemibold }}>Reveal</AppText></View>
        </Pressable>
      )}

      <View style={styles.cta}>
        <View pointerEvents="none" style={styles.ctaArt}><Art xml={ctaXml} /></View>
        <View style={styles.ctaCopy}>
          <AppText variant="label" color={colors.textSecondary}>Before it fades</AppText>
          <AppText style={styles.ctaTitle}>What did the night leave behind?</AppText>
          <AppText variant="small" color={colors.textSecondary}>Most dreams fade within minutes of waking. A few lines are enough.</AppText>
        </View>
        <Button label="Record a dream" icon="pen" onPress={() => router.push('/record')} />
        <Pressable onPress={() => router.push({ pathname: '/record', params: { mode: 'detailed' } })} style={styles.alt} hitSlop={6} accessibilityRole="button">
          <AppText variant="small" color={colors.textSecondary}>or write a <AppText variant="small" color={colors.textSecondary} style={styles.underline}>detailed entry</AppText></AppText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <AppText variant="label" color={colors.textSecondary}>Your garden</AppText>
        <View style={styles.stats}>
          <StatTile value={stats.total} label="Dreams" sub={`${stats.thisWeek} this week`} />
          <StatTile value={stats.streak} label="Night streak" spark={stats.week} />
          <StatTile value={stats.rarePlus} label="Rare+ cards" sub={stats.legendary ? `${stats.legendary} legendary` : `${stats.epic} epic`} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <AppText variant="heading">Recent dreams</AppText>
          {views.length > 0 && (
            <Pressable onPress={() => router.push('/collection')} hitSlop={10} accessibilityRole="link">
              <AppText variant="small" color={colors.textSecondary} style={styles.underline}>See all</AppText>
            </Pressable>
          )}
        </View>
        {recent.length ? (
          <View>{recent.map((v, i) => <DreamRow key={v.id} dream={v} first={i === 0} onPress={() => router.push(`/reveal/${v.id}`)} />)}</View>
        ) : (
          <GlassCard><AppText color={colors.textSecondary}>No dreams yet. Your first card is a few sentences away.</AppText></GlassCard>
        )}
      </View>

      {quote && (
        <View style={styles.quote}>
          <AppText variant="label" color={colors.textSecondary}>From your garden · {quote.title}</AppText>
          <AppText style={styles.quoteText}>“{quote.reflection.split('. ')[0].replace(/\.$/, '')}.”</AppText>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  decor: { position: 'absolute', top: 0, right: -24, width: 250, height: 300 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontFamily: fonts.display, fontSize: 21, color: colors.text },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
  avatarText: { fontFamily: fonts.display, fontSize: 19, color: colors.text },
  hero: { gap: 12, paddingTop: 6 },
  lede: { maxWidth: 330, lineHeight: 25 },
  latest: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 14, paddingRight: 16, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(201,232,107,0.22)' },
  latestThumb: { width: 54, height: 72, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderStrong },
  latestBody: { flex: 1, minWidth: 0, gap: 3 },
  latestTitle: { fontFamily: fonts.display, fontSize: 21, lineHeight: 24, color: colors.text },
  pill: { minHeight: 36, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.glowA16, justifyContent: 'center' },
  cta: { overflow: 'hidden', paddingHorizontal: 20, paddingTop: 22, paddingBottom: 14, borderRadius: radius.xl, backgroundColor: '#1C2823', borderWidth: 1, borderColor: colors.border, gap: 16 },
  ctaArt: { position: 'absolute', right: -10, top: -6, width: 150, height: 170 },
  ctaCopy: { gap: 8, maxWidth: 220 },
  ctaTitle: { fontFamily: fonts.display, fontSize: 26, lineHeight: 28, color: colors.text },
  alt: { alignSelf: 'center', minHeight: 32, justifyContent: 'center' },
  underline: { textDecorationLine: 'underline', textDecorationColor: colors.borderStrong },
  section: { gap: spacing.sm + 4 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  stats: { flexDirection: 'row', gap: 10 },
  quote: { paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, gap: 8 },
  quoteText: { fontFamily: fonts.displayItalic, fontSize: 20, lineHeight: 27, color: colors.text },
});
