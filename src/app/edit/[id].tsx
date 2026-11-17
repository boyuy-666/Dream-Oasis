import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, usePreventRemove, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Chip, DreamDatePicker, Icon, MoodSelector, TextField, UnsavedChangesDialog } from '@/components/ui';
import { MIN_DREAM_LENGTH, SUGGESTED_TAGS } from '@/data/dreamForm';
import { Dream, DreamEdit, Mood } from '@/data/types';
import { useDreams } from '@/store/DreamsContext';
import { colors, fonts, gradients, radius, spacing } from '@/theme';
import { DateKey, effectiveDreamDate, formatKeyLong } from '@/utils/dreamDates';
import { capitalize, padNo, toDreamViews } from '@/utils/dreamView';
import { effectiveMoods, moodSelectionError, sameMoods } from '@/utils/moodSelection';

interface FormState {
  text: string;
  title: string;
  /** Ordered emotions; the first is the primary. Legacy records start as `[mood]`. */
  moods: Mood[];
  people: string[];
  place: string;
  tags: string[];
  vividness?: number;
  lucid?: boolean;
  /** Effective dream date shown in the picker (stored dreamDate, else local day of createdAt). */
  dreamDate: DateKey;
}

/** Form values for an existing record. Missing optional fields stay unset (no empty defaults). */
function formFromDream(d: Dream): FormState {
  return {
    text: d.text,
    title: d.title ?? d.card.title,
    moods: effectiveMoods(d),
    people: d.details?.people ?? [],
    place: d.details?.place ?? '',
    tags: d.details?.tags ?? [],
    vividness: d.details?.vividness,
    lucid: d.details?.lucid,
    dreamDate: effectiveDreamDate(d),
  };
}

/** Comparable snapshot: whitespace, tag order and an unset lucid flag do not count as edits. */
const snapshot = (f: FormState) => JSON.stringify({
  text: f.text.trim(), title: f.title.trim(), moods: f.moods, people: f.people, place: f.place.trim(),
  tags: [...f.tags].sort(), vividness: f.vividness ?? null, lucid: f.lucid ?? false, dreamDate: f.dreamDate,
});

/** Splits a typed entry on commas, trims each part and drops empties. */
const entries = (raw: string) => raw.split(',').map((x) => x.trim()).filter(Boolean);

/** Adds entries to a list without duplicates (case-insensitive); reuses an existing label's spelling. */
function addEntries(list: string[], raw: string, known: string[] = []): string[] {
  const next = [...list];
  for (const value of entries(raw)) {
    const label = [...next, ...known].find((x) => x.toLowerCase() === value.toLowerCase()) ?? value;
    if (!next.some((x) => x.toLowerCase() === label.toLowerCase())) next.push(label);
  }
  return next;
}

/** The form as it would be saved, with any unconfirmed People / Tags input committed. */
const withPending = (f: FormState, personDraft: string, tagDraft: string): FormState => ({
  ...f,
  people: addEntries(f.people, personDraft),
  tags: addEntries(f.tags, tagDraft, SUGGESTED_TAGS),
});

function toEdit(f: FormState, original: Dream): DreamEdit {
  const t = f.title.trim();
  // An untouched card title stays a fallback rather than becoming a stored custom title.
  const title = !t || (!original.title && t === original.card.title) ? null : t;
  const lucid = f.lucid === false && original.details?.lucid === undefined ? undefined : f.lucid;
  return {
    text: f.text,
    // Only a changed selection (set, order or primary) writes moods, so untouched legacy records keep their shape.
    moods: sameMoods(f.moods, effectiveMoods(original)) ? undefined : f.moods,
    title,
    details: { people: f.people, place: f.place, tags: f.tags, vividness: f.vividness, lucid },
    // Only an actual date change writes dreamDate, so older records are not rewritten needlessly.
    dreamDate: f.dreamDate !== effectiveDreamDate(original) ? f.dreamDate : undefined,
  };
}

export default function EditDreamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getDream } = useDreams();
  const dream = id ? getDream(id) : undefined;

  if (!dream) {
    return (
      <View style={[styles.root, styles.center]}>
        <AppText variant="title" center>Dream not found</AppText>
        <AppText variant="small" color={colors.textSecondary} center>This dream may have been removed.</AppText>
        <Button label="Go back" variant="secondary" onPress={() => (router.canGoBack() ? router.back() : router.replace('/collection'))} />
      </View>
    );
  }
  return <EditForm dream={dream} />;
}

function EditForm({ dream }: { dream: Dream }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dreams, updateDream } = useDreams();
  const no = useMemo(() => toDreamViews(dreams).find((v) => v.id === dream.id)?.no ?? 0, [dreams, dream.id]);

  const [initial] = useState(() => formFromDream(dream));
  const [form, setForm] = useState<FormState>(initial);
  const [customTags, setCustomTags] = useState(() => initial.tags.filter((t) => !SUGGESTED_TAGS.includes(t)));
  const [personDraft, setPersonDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [textError, setTextError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'saving' | 'saved'>('idle');
  /** Set once the user chose to leave: turns the guard off before navigation continues. */
  const [exitReason, setExitReason] = useState<'saved' | 'discarded' | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const savingRef = useRef(false);
  /** Continues the navigation that was blocked when the dialog opened (null if none pending). */
  const pendingExitRef = useRef<(() => void) | null>(null);

  const hasDrafts = personDraft.trim().length > 0 || tagDraft.trim().length > 0;
  const dirty = hasDrafts || snapshot(form) !== snapshot(initial);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  /** Validates and persists. Resolves true only after storage accepted the change. */
  const save = async (): Promise<boolean> => {
    if (savingRef.current) return false;
    // Commit any People / Tags the user typed but did not confirm with Return or +.
    const final = withPending(form, personDraft, tagDraft);
    if (personDraft || tagDraft) {
      setForm(final);
      setCustomTags((c) => addEntries(c, final.tags.filter((t) => !SUGGESTED_TAGS.includes(t)).join(',')));
      setPersonDraft('');
      setTagDraft('');
    }
    if (final.text.trim().length < MIN_DREAM_LENGTH) {
      setTextError('Write a few words so your card has something to grow from.');
      return false;
    }
    const moodError = moodSelectionError(final.moods);
    if (moodError) { setSaveError(moodError); return false; }
    savingRef.current = true;
    setPhase('saving');
    setSaveError(null);
    try {
      await updateDream(dream.id, toEdit(final, dream));
      setPhase('saved');
      return true;
    } catch {
      setSaveError('Your changes could not be saved. Your edits are still here, so please try again.');
      setPhase('idle');
      return false;
    } finally {
      savingRef.current = false;
    }
  };

  // Guard every exit (Cancel, Android back, programmatic back) while edits are unsaved.
  // The guard turns off as soon as an exit is chosen, so the continued navigation is never re-intercepted.
  const disablePrevention = usePreventRemove(dirty && exitReason === null, ({ repeat }) => {
    if (savingRef.current || dialogOpen) return; // one dialog at a time
    pendingExitRef.current = repeat;
    setDialogOpen(true);
  });

  /** Leaves Edit Dream once: continues the blocked action, or goes back to the card. */
  const leave = (reason: 'saved' | 'discarded') => {
    setExitReason(reason);
    setDialogOpen(false);
    const pending = pendingExitRef.current;
    pendingExitRef.current = null;
    if (pending) {
      pending(); // `repeat` disables prevention synchronously, then re-dispatches the original action
      return;
    }
    disablePrevention();
    if (router.canGoBack()) router.back();
    else router.replace(`/card/${dream.id}`);
  };

  const onSavePress = async () => {
    if (await save()) leave('saved');
  };
  const onDialogSave = async () => {
    if (await save()) leave('saved');
    else { setDialogOpen(false); pendingExitRef.current = null; } // show the error on the form; edits stay
  };
  const onKeepEditing = () => { setDialogOpen(false); pendingExitRef.current = null; };
  // Discard never touches storage: the stored dream is left exactly as it was.
  const onDiscard = () => leave('discarded');

  // Values are passed explicitly (never read from a just-set draft) to avoid stale state.
  const addPerson = (raw: string = personDraft) => {
    setForm((f) => ({ ...f, people: addEntries(f.people, raw) }));
    setPersonDraft('');
  };
  const onPersonChange = (v: string) => {
    if (!v.includes(',')) { setPersonDraft(v); return; }
    const cut = v.lastIndexOf(',');
    addPerson(v.slice(0, cut)); // commit everything before the last comma
    setPersonDraft(v.slice(cut + 1).trimStart());
  };
  const addTag = (raw: string = tagDraft) => {
    const tags = addEntries(form.tags, raw, SUGGESTED_TAGS);
    const added = tags.filter((t) => !form.tags.includes(t) && !SUGGESTED_TAGS.includes(t));
    set('tags', tags);
    if (added.length) setCustomTags((c) => addEntries(c, added.join(',')));
    setTagDraft('');
  };
  const toggleTag = (t: string) => set('tags', form.tags.includes(t) ? form.tags.filter((x) => x !== t) : [...form.tags, t]);

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
            <Pressable onPress={() => router.back()} style={styles.cancel} accessibilityRole="button" accessibilityLabel="Cancel editing" hitSlop={8}>
              <Icon name="back" size={20} color={colors.textSecondary} />
              <AppText color={colors.textSecondary} style={{ fontFamily: fonts.bodyMedium }}>Cancel</AppText>
            </Pressable>
            <View style={styles.idChip}>
              <AppText variant="caption" color={colors.textSecondary}>Nº {padNo(no)} · {capitalize(dream.card.rarity)}</AppText>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <AppText variant="label" color={colors.textSecondary}>Editing dream</AppText>
            <AppText variant="title">Edit dream</AppText>
          </View>

          <View style={styles.note}>
            <Icon name="sparkle" size={16} color={colors.glow} />
            <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1 }}>
              Your card keeps its rarity and artwork. Only the details you write change.
            </AppText>
          </View>

          <View style={styles.field}>
            <AppText variant="label" color={colors.textSecondary}>Dreamed on</AppText>
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => [styles.dateBox, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel={`Dreamed on ${formatKeyLong(form.dreamDate)}`}
              accessibilityHint="Change the day you had this dream"
            >
              <Icon name="calendar" size={18} color={colors.textMuted} />
              <AppText style={{ flex: 1 }}>{formatKeyLong(form.dreamDate)}</AppText>
              <Icon name="chevron" size={16} color={colors.textMuted} />
            </Pressable>
          </View>

          <TextField label="Title" value={form.title} onChangeText={(v) => set('title', v)} placeholder={dream.card.title} returnKeyType="next" />
          <TextField
            label="What happened"
            hint="Required"
            multiline
            value={form.text}
            onChangeText={(v) => { set('text', v); if (textError && v.trim().length >= MIN_DREAM_LENGTH) setTextError(null); }}
            placeholder="Describe the dream in as much detail as you can recall."
            error={textError}
          />

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <AppText variant="label" color={colors.textSecondary}>People</AppText>
              <AppText variant="caption" color={colors.textMuted}>Press return to add</AppText>
            </View>
            <View style={styles.tokenField}>
              {form.people.map((p) => (
                <Pressable key={p} style={styles.token} onPress={() => set('people', form.people.filter((x) => x !== p))} accessibilityRole="button" accessibilityLabel={`Remove ${p}`}>
                  <AppText variant="caption" color={colors.text}>{p}</AppText>
                  <Icon name="close" size={12} color={colors.textSecondary} />
                </Pressable>
              ))}
              <TextInput
                value={personDraft}
                onChangeText={onPersonChange}
                onSubmitEditing={() => addPerson()}
                submitBehavior="submit"
                placeholder="Who was there?"
                placeholderTextColor={colors.placeholder}
                selectionColor={colors.glow}
                keyboardAppearance="dark"
                returnKeyType="done"
                style={styles.tokenInput}
                accessibilityLabel="Add a person"
              />
              <Pressable onPress={() => addPerson()} style={styles.addBtn} accessibilityRole="button" accessibilityLabel="Add person"><Icon name="plus" size={16} color={colors.text} /></Pressable>
            </View>
          </View>

          <TextField label="Place" icon="pin" value={form.place} onChangeText={(v) => set('place', v)} placeholder="Where did it happen?" returnKeyType="done" />

          <MoodSelector value={form.moods} onChange={(m) => set('moods', m)} />

          <View style={styles.field}>
            <AppText variant="label" color={colors.textSecondary}>Symbols & tags</AppText>
            <View style={styles.chips}>
              {[...SUGGESTED_TAGS, ...customTags].map((t) => <Chip key={t} size="tag" label={t} selected={form.tags.includes(t)} onPress={() => toggleTag(t)} />)}
            </View>
            <TextField label="Add your own" icon="tag" value={tagDraft} onChangeText={setTagDraft} onSubmitEditing={() => addTag()} submitBehavior="submit" placeholder="Type a symbol and press return" returnKeyType="done" />
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <AppText variant="label" color={colors.textSecondary}>Vividness</AppText>
              <AppText variant="caption" color={colors.textMuted}>1 faint · 5 like real life</AppText>
            </View>
            <View style={styles.scale} accessibilityRole="radiogroup">
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => set('vividness', n)} style={[styles.scaleBtn, form.vividness === n && styles.scaleOn]} accessibilityRole="radio" accessibilityState={{ selected: form.vividness === n }} accessibilityLabel={`Vividness ${n}`}>
                  <AppText variant="small" color={form.vividness === n ? colors.mossNight : colors.textSecondary} style={{ fontFamily: fonts.bodySemibold }}>{n}</AppText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <AppText style={{ fontFamily: fonts.bodySemibold }}>Lucid dream</AppText>
              <AppText variant="caption" color={colors.textMuted}>You knew you were dreaming</AppText>
            </View>
            <Switch value={form.lucid ?? false} onValueChange={(v) => set('lucid', v)} trackColor={{ false: colors.border, true: colors.glow }} ios_backgroundColor={colors.border} accessibilityLabel="Lucid dream" />
          </View>
        </ScrollView>

        <View style={[styles.saveBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <LinearGradient colors={gradients.saveBar} style={styles.saveFade} pointerEvents="none" />
          {saveError ? (
            <View style={styles.errorRow} accessibilityLiveRegion="assertive">
              <Icon name="alert" size={16} color={colors.danger} />
              <AppText variant="caption" color={colors.danger} style={{ flex: 1 }}>{saveError}</AppText>
            </View>
          ) : null}
          <Button
            label={phase === 'saved' ? 'Changes saved' : 'Save Changes'}
            icon={phase === 'saved' ? 'check' : undefined}
            onPress={() => { onSavePress().catch(() => {}); }}
            disabled={!dirty && phase === 'idle'}
            loading={phase === 'saving'}
            loadingLabel="Saving changes…"
            accessibilityHint="Saves your edits to this dream"
          />
          <AppText variant="caption" color={colors.textMuted} center>
            {dirty ? 'Rarity and artwork stay the same.' : 'No changes yet.'}
          </AppText>
        </View>
      </KeyboardAvoidingView>
      <UnsavedChangesDialog
        visible={dialogOpen}
        saving={phase === 'saving'}
        onSave={() => { onDialogSave().catch(() => {}); }}
        onKeepEditing={onKeepEditing}
        onDiscard={onDiscard}
      />
      <DreamDatePicker
        visible={pickerOpen}
        value={form.dreamDate}
        onConfirm={(key) => { set('dreamDate', key); setPickerOpen(false); }}
        onCancel={() => setPickerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: 22 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  cancel: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
  idChip: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  dateBox: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 50, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.surfaceSunk, borderWidth: 1, borderColor: colors.border },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  field: { gap: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  errorRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
});
