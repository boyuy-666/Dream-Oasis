import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Chip, DreamDatePicker, Icon, MoodSelector, Segmented, TextField } from '@/components/ui';
import { MIN_DREAM_LENGTH, SUGGESTED_TAGS } from '@/data/dreamForm';
import { DEFAULT_MOODS } from '@/data/moods';
import { DreamDetails, Mood } from '@/data/types';
import { useDreams } from '@/store/DreamsContext';
import { colors, fonts, gradients, radius, spacing } from '@/theme';
import { DateKey, formatDreamDateChip, yesterdayKey } from '@/utils/dreamDates';
import { moodSelectionError } from '@/utils/moodSelection';

type Mode = 'quick' | 'detailed';
const MIN_LENGTH = MIN_DREAM_LENGTH;
const SAMPLE = {
  title: 'The Library Under the Lake',
  text: 'I swam down into a quiet lake and found a library on the bottom. The books were dry, and one of them was open to a page about me, glowing softly in the dark water.',
};
const words = (t: string) => (t.trim().match(/\S+/g) || []).length;

export default function RecordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { addDream } = useDreams();

  const [mode, setMode] = useState<Mode>(params.mode === 'detailed' ? 'detailed' : 'quick');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  // Ordered emotions shared by Quick and Detailed; the first is the primary.
  const [moods, setMoods] = useState<Mood[]>(() => [...DEFAULT_MOODS]);
  const [people, setPeople] = useState<string[]>([]);
  const [personDraft, setPersonDraft] = useState('');
  const [place, setPlace] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [vividness, setVividness] = useState(3);
  const [lucid, setLucid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'saving' | 'saved'>('idle');
  // One dream date shared by Quick and Detailed; a new entry starts on the local "yesterday".
  const [dreamDate, setDreamDate] = useState<DateKey>(() => yesterdayKey());
  const [dateTouched, setDateTouched] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pristine = !text && !title && !dateTouched;

  // Honour "or write a detailed entry" links each time the tab is focused with a mode param.
  useFocusEffect(useCallback(() => {
    if (params.mode === 'detailed' || params.mode === 'quick') setMode(params.mode);
  }, [params.mode]));

  // An untouched, empty form left open overnight follows the new "yesterday"; an entry in progress never changes date.
  useFocusEffect(useCallback(() => {
    if (pristine) setDreamDate(yesterdayKey());
  }, [pristine]));

  const reset = () => {
    setText(''); setTitle(''); setMoods([...DEFAULT_MOODS]); setPeople([]); setPersonDraft(''); setPlace('');
    setTags([]); setTagDraft(''); setVividness(3); setLucid(false); setError(null); setPhase('idle');
    setDreamDate(yesterdayKey()); setDateTouched(false); setPickerOpen(false);
  };

  const addPerson = () => {
    const v = personDraft.trim().replace(/,$/, '');
    if (v && !people.includes(v)) setPeople([...people, v]);
    setPersonDraft('');
  };
  const addTag = () => {
    const v = tagDraft.trim();
    if (v) {
      if (!SUGGESTED_TAGS.includes(v) && !customTags.includes(v)) setCustomTags([...customTags, v]);
      if (!tags.includes(v)) setTags([...tags, v]);
    }
    setTagDraft('');
  };
  const toggleTag = (t: string) => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);

  const save = () => {
    if (phase !== 'idle') return;
    if (text.trim().length < MIN_LENGTH) {
      setError('Write a few words so your card has something to grow from.');
      return;
    }
    const details: DreamDetails | undefined = mode === 'detailed' ? {
      ...(people.length ? { people } : {}),
      ...(place.trim() ? { place: place.trim() } : {}),
      ...(tags.length ? { tags } : {}),
      vividness,
      lucid,
    } : undefined;
    const moodError = moodSelectionError(moods);
    if (moodError) { setError(moodError); return; }
    const chosenDate = dreamDate; // captured now; the save completes after a short animation
    const chosenMoods = [...moods];
    setPhase('saving');
    setTimeout(() => {
      setPhase('saved');
      setTimeout(() => {
        let dream;
        try {
          dream = addDream(text, chosenMoods, { title, details, dreamDate: chosenDate });
        } catch (e) {
          setPhase('idle');
          setError(e instanceof Error ? e.message : 'This dream could not be saved.');
          return;
        }
        reset();
        router.push(`/reveal/${dream.id}`);
      }, 450);
    }, 900);
  };

  const count = words(text);
  const textField = (hero: boolean) => (
    <TextField
      label={hero ? 'Your dream' : 'What happened'}
      hint="Required"
      hero={hero}
      multiline
      value={text}
      onChangeText={(v) => { setText(v); if (error && v.trim().length >= MIN_LENGTH) setError(null); }}
      placeholder={hero ? 'Start anywhere: a place, a feeling, a colour…' : 'Describe the dream in as much detail as you can recall.'}
      error={error}
      footer={
        <View style={styles.meta}>
          <Pressable style={styles.sample} onPress={() => { setText(SAMPLE.text); if (!title) setTitle(SAMPLE.title); setError(null); }} accessibilityRole="button" hitSlop={4}>
            <Icon name="sparkle" size={14} color={colors.glow} />
            <AppText variant="caption" color={colors.textSecondary}>Use a sample dream</AppText>
          </Pressable>
          <AppText variant="caption" color={colors.textMuted}>{count} {count === 1 ? 'word' : 'words'}</AppText>
        </View>
      }
    />
  );
  const moodChips = <MoodSelector value={moods} onChange={setMoods} />;

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.top}>
            <Pressable onPress={() => router.navigate('/')} style={styles.cancel} accessibilityRole="button" hitSlop={8}>
              <Icon name="back" size={20} color={colors.textSecondary} />
              <AppText color={colors.textSecondary} style={{ fontFamily: fonts.bodyMedium }}>Cancel</AppText>
            </Pressable>
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => [styles.dateChip, pressed && { opacity: 0.8 }]}
              accessibilityRole="button"
              accessibilityLabel={`Dream date: ${formatDreamDateChip(dreamDate)}`}
              accessibilityHint="Choose the day you had this dream"
              hitSlop={4}
            >
              <Icon name="calendar" size={16} color={colors.textSecondary} />
              <AppText variant="caption" color={colors.textSecondary}>{formatDreamDateChip(dreamDate)}</AppText>
            </Pressable>
          </View>

          <View style={{ gap: 6 }}>
            <AppText variant="label" color={colors.textSecondary}>New dream</AppText>
            <AppText variant="title">What do you remember?</AppText>
          </View>

          <Segmented
            accessibilityLabel="Recording mode"
            options={[{ key: 'quick', label: 'Quick record' }, { key: 'detailed', label: 'Detailed record' }]}
            value={mode}
            onChange={setMode}
          />

          {mode === 'quick' ? (
            <>
              {textField(true)}
              <TextField label="Title" hint="Optional" value={title} onChangeText={setTitle} placeholder="Name it later" returnKeyType="done" />
              {moodChips}
            </>
          ) : (
            <>
              <TextField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. The Library Under the Lake" returnKeyType="next" />
              {textField(false)}
              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <AppText variant="label" color={colors.textSecondary}>People</AppText>
                  <AppText variant="caption" color={colors.textMuted}>Press return to add</AppText>
                </View>
                <View style={styles.tokenField}>
                  {people.map((p) => (
                    <Pressable key={p} style={styles.token} onPress={() => setPeople(people.filter((x) => x !== p))} accessibilityRole="button" accessibilityLabel={`Remove ${p}`}>
                      <AppText variant="caption" color={colors.text}>{p}</AppText>
                      <Icon name="close" size={12} color={colors.textSecondary} />
                    </Pressable>
                  ))}
                  <TextInput
                    value={personDraft}
                    onChangeText={(v) => (v.endsWith(',') ? (setPersonDraft(v), addPerson()) : setPersonDraft(v))}
                    onSubmitEditing={addPerson}
                    submitBehavior="submit"
                    placeholder="Who was there?"
                    placeholderTextColor={colors.placeholder}
                    selectionColor={colors.glow}
                    keyboardAppearance="dark"
                    returnKeyType="done"
                    style={styles.tokenInput}
                    accessibilityLabel="Add a person"
                  />
                  <Pressable onPress={addPerson} style={styles.addBtn} accessibilityRole="button" accessibilityLabel="Add person"><Icon name="plus" size={16} color={colors.text} /></Pressable>
                </View>
              </View>
              <TextField label="Place" icon="pin" value={place} onChangeText={setPlace} placeholder="Where did it happen?" returnKeyType="done" />
              {moodChips}
              <View style={styles.field}>
                <AppText variant="label" color={colors.textSecondary}>Symbols & tags</AppText>
                <View style={styles.chips}>
                  {[...SUGGESTED_TAGS, ...customTags].map((t) => <Chip key={t} size="tag" label={t} selected={tags.includes(t)} onPress={() => toggleTag(t)} />)}
                </View>
                <TextField label="Add your own" icon="tag" value={tagDraft} onChangeText={setTagDraft} onSubmitEditing={addTag} submitBehavior="submit" placeholder="Type a symbol and press return" returnKeyType="done" />
              </View>
              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <AppText variant="label" color={colors.textSecondary}>Vividness</AppText>
                  <AppText variant="caption" color={colors.textMuted}>1 faint · 5 like real life</AppText>
                </View>
                <View style={styles.scale} accessibilityRole="radiogroup">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Pressable key={n} onPress={() => setVividness(n)} style={[styles.scaleBtn, vividness === n && styles.scaleOn]} accessibilityRole="radio" accessibilityState={{ selected: vividness === n }} accessibilityLabel={`Vividness ${n}`}>
                      <AppText variant="small" color={vividness === n ? colors.mossNight : colors.textSecondary} style={{ fontFamily: fonts.bodySemibold }}>{n}</AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontFamily: fonts.bodySemibold }}>Lucid dream</AppText>
                  <AppText variant="caption" color={colors.textMuted}>You knew you were dreaming</AppText>
                </View>
                <Switch value={lucid} onValueChange={setLucid} trackColor={{ false: colors.border, true: colors.glow }} ios_backgroundColor={colors.border} accessibilityLabel="Lucid dream" />
              </View>
            </>
          )}
        </ScrollView>

        <View style={[styles.saveBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <LinearGradient colors={gradients.saveBar} style={styles.saveFade} pointerEvents="none" />
          <Button
            label={phase === 'saved' ? 'Saved to your journal' : mode === 'quick' ? 'Save & reveal card' : 'Save dream & reveal card'}
            icon={phase === 'saved' ? 'check' : undefined}
            onPress={save}
            loading={phase === 'saving'}
            loadingLabel="Planting your dream…"
            accessibilityHint="Saves your dream and reveals its Dream Card"
          />
          <AppText variant="caption" color={colors.textMuted} center>
            {mode === 'quick' ? 'Your card grows from the words you write.' : 'Every detail helps your card grow.'}
          </AppText>
        </View>
      </KeyboardAvoidingView>
      <DreamDatePicker
        visible={pickerOpen}
        value={dreamDate}
        onConfirm={(key) => { setDreamDate(key); setDateTouched(true); setPickerOpen(false); }}
        onCancel={() => setPickerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: 22 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  cancel: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
  dateChip: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 36, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  field: { gap: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sample: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.paperA06, borderWidth: 1, borderColor: colors.border },
  tokenField: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, padding: 8, borderRadius: radius.md, backgroundColor: colors.surfaceSunk, borderWidth: 1, borderColor: colors.border },
  token: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32, paddingLeft: 12, paddingRight: 10, borderRadius: radius.pill, backgroundColor: colors.paperA06, borderWidth: 1, borderColor: colors.border },
  tokenInput: { flex: 1, minWidth: 120, minHeight: 36, paddingHorizontal: 8, fontFamily: fonts.body, fontSize: 16, color: colors.text },
  addBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paperA06, borderWidth: 1, borderColor: colors.border },
  scale: { flexDirection: 'row', gap: 6 },
  scaleBtn: { flex: 1, minHeight: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  scaleOn: { backgroundColor: colors.mothPaper, borderColor: colors.mothPaper },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 52 },
  saveBar: { paddingHorizontal: spacing.lg, paddingTop: 10, gap: 8, backgroundColor: colors.bg },
  saveFade: { position: 'absolute', left: 0, right: 0, top: -28, height: 28 },
});
