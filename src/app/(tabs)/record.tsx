import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  AccessibilityInfo, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, ScrollViewInstance, StyleSheet, Switch, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppText, Button, Chip, DraftRecoveryDialog, DreamDatePicker, Icon, MoodSelector, RecordExitDraftDialog, Segmented, TextField,
} from '@/components/ui';
import { MIN_DREAM_LENGTH, SUGGESTED_TAGS } from '@/data/dreamForm';
import { Mood } from '@/data/types';
import { useDreams } from '@/store/DreamsContext';
import { DraftStatus, useDreamDraft } from '@/store/useDreamDraft';
import { colors, fonts, gradients, radius, spacing } from '@/theme';
import { DreamValidationError } from '@/utils/dreamCreate';
import { formatDreamDateChip } from '@/utils/dreamDates';
import { buildDreamInput, commitPending, DraftFields, RecordMode } from '@/utils/dreamDraft';
import { moodSelectionError } from '@/utils/moodSelection';

const MIN_LENGTH = MIN_DREAM_LENGTH;
const SAMPLE = {
  title: 'The Library Under the Lake',
  text: 'I swam down into a quiet lake and found a library on the bottom. The books were dry, and one of them was open to a page about me, glowing softly in the dark water.',
};
const SAVE_FAILED = "Your dream couldn't be saved yet. Everything you wrote is still here, so please try again.";
const words = (t: string) => (t.trim().match(/\S+/g) || []).length;
const wait = (ms: number) => new Promise<void>((resolve) => { setTimeout(resolve, ms); });

/** Subtle auto-save state next to the "New dream" label. */
function DraftStatusLine({ status }: { status: DraftStatus }) {
  if (status === 'hidden') return null;
  if (status === 'error') {
    return (
      <View style={styles.status} accessibilityLiveRegion="polite" accessibilityLabel="Couldn't save draft">
        <Icon name="alert" size={14} color={colors.danger} />
        <AppText variant="caption" color={colors.danger}>Couldn&apos;t save draft</AppText>
      </View>
    );
  }
  return (
    <View style={styles.status}>
      {status === 'saved' ? <Icon name="check" size={14} color={colors.textMuted} /> : null}
      <AppText variant="caption" color={colors.textMuted}>{status === 'saved' ? 'Draft saved' : 'Saving draft…'}</AppText>
    </View>
  );
}

export default function RecordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const requestedMode: RecordMode | null = params.mode === 'detailed' || params.mode === 'quick' ? params.mode : null;
  const { addDream, isDraftCommitted } = useDreams();

  const [phase, setPhase] = useState<'idle' | 'saving' | 'saved'>('idle');
  const draft = useDreamDraft({ preferredMode: requestedMode ?? 'quick', isDraftCommitted, paused: phase !== 'idle' });
  // Quick and Detailed are two views of this one form; switching views keeps every value.
  const { form, setForm } = draft;
  const set = <K extends keyof DraftFields>(key: K, value: DraftFields[K]) => setForm((f) => ({ ...f, [key]: value }));

  const [error, setError] = useState<string | null>(null);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [exitBusy, setExitBusy] = useState<'keeping' | 'discarding' | null>(null);
  const [exitError, setExitError] = useState<string | null>(null);
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const moodY = useRef(0);

  const { onFocus } = draft;
  useFocusEffect(useCallback(() => {
    // Honour "or write a detailed entry" links; a restored draft later keeps its own view.
    if (requestedMode) setForm((f) => (f.mode === requestedMode ? f : { ...f, mode: requestedMode }));
    onFocus();
  }, [requestedMode, setForm, onFocus]));

  const clearMessages = () => {
    setError(null); setMoodError(null); setSaveError(null); setPickerOpen(false);
    setExitOpen(false); setExitBusy(null); setExitError(null); setRecoveryBusy(false); setRecoveryError(null);
  };
  const goToGarden = () => router.navigate('/');

  /** Cancel / Android back: ask before leaving an unfinished dream. */
  const requestExit = () => {
    if (phase !== 'idle') return;
    if (draft.gate === 'editing' && draft.meaningful) { setExitError(null); setExitOpen(true); return; }
    goToGarden();
  };
  const needsPrompt = draft.gate === 'editing' && draft.meaningful;
  useFocusEffect(useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase !== 'idle') return true;
      if (!needsPrompt) return false;
      setExitError(null);
      setExitOpen(true);
      return true;
    });
    return () => sub.remove();
  }, [needsPrompt, phase]));

  const keepDraftAndExit = async () => {
    if (exitBusy) return;
    setExitBusy('keeping'); setExitError(null);
    try {
      await draft.flush(); // leave only after storage confirmed the draft
    } catch {
      setExitBusy(null);
      setExitError("Couldn't save your draft. Your dream is still here, so please try again.");
      return;
    }
    clearMessages();
    draft.leave();
    goToGarden();
  };
  const discardAndExit = async () => {
    if (exitBusy) return;
    setExitBusy('discarding'); setExitError(null);
    try {
      await draft.discardCurrent();
    } catch {
      setExitBusy(null);
      setExitError("Couldn't discard the draft. Please try again.");
      return;
    }
    clearMessages();
    goToGarden();
  };

  const continueDraft = () => { clearMessages(); draft.continueDraft(); };
  const notNow = () => { clearMessages(); draft.notNow(); goToGarden(); };
  const discardFound = async () => {
    if (recoveryBusy) return;
    setRecoveryBusy(true); setRecoveryError(null);
    try {
      await draft.discardFound();
      clearMessages();
    } catch {
      setRecoveryBusy(false);
      setRecoveryError("Couldn't discard the draft. It is still saved, so please try again.");
    }
  };

  const addPerson = (raw?: string) => setForm((f) => {
    const v = (raw ?? f.personDraft).trim().replace(/,$/, '').trim();
    return { ...f, people: v && !f.people.includes(v) ? [...f.people, v] : f.people, personDraft: '' };
  });
  const onPersonChange = (v: string) => (v.endsWith(',') ? addPerson(v) : set('personDraft', v));
  const addTag = () => setForm((f) => {
    const v = f.tagDraft.trim();
    if (!v) return { ...f, tagDraft: '' };
    return {
      ...f,
      customTags: !SUGGESTED_TAGS.includes(v) && !f.customTags.includes(v) ? [...f.customTags, v] : f.customTags,
      tags: f.tags.includes(v) ? f.tags : [...f.tags, v],
      tagDraft: '',
    };
  });
  const toggleTag = (t: string) => setForm((f) => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] }));

  const save = async () => {
    if (phase !== 'idle' || draft.gate !== 'editing') return;
    // Both checks run so every problem is shown at once; nothing is created unless both pass.
    const textOk = form.text.trim().length >= MIN_LENGTH;
    if (!textOk) setError('Write a few words so your card has something to grow from.');
    const moodProblem = moodSelectionError(form.moods);
    if (moodProblem) {
      setMoodError(moodProblem);
      AccessibilityInfo.announceForAccessibility(moodProblem);
      if (textOk) scrollRef.current?.scrollTo({ y: Math.max(0, moodY.current - spacing.lg), animated: true });
    }
    if (!textOk || moodProblem) return;

    // Unconfirmed People / Tags are kept, and Detailed values survive saving from the Quick view.
    const final = commitPending(form);
    if (final.personDraft !== form.personDraft || final.tagDraft !== form.tagDraft) setForm(final);
    const draftId = draft.draftId;
    const input = buildDreamInput(final, draftId);
    setSaveError(null);
    setPhase('saving');
    draft.flush().catch(() => {}); // the newest words stay recoverable until the dream is stored

    let dream;
    try {
      // The dream is reported saved only after storage accepted it (same card, one rarity roll).
      [dream] = await Promise.all([addDream(input), wait(900)]);
    } catch (e) {
      setPhase('idle');
      const message = e instanceof DreamValidationError ? e.message : SAVE_FAILED;
      setSaveError(message);
      AccessibilityInfo.announceForAccessibility(message);
      return; // form and draft are untouched; retrying cannot duplicate (same draftId)
    }
    setPhase('saved');
    await draft.finalize(draftId); // remove the draft only now; interrupted cleanup is reconciled later
    await wait(450);
    clearMessages();
    draft.leave();
    setPhase('idle');
    router.push(`/reveal/${dream.id}`);
  };

  if (draft.gate !== 'editing') {
    // Until storage has been checked, no editable form exists that could overwrite a stored draft.
    return (
      <View style={styles.root}>
        <DraftRecoveryDialog
          draft={draft.gate === 'recovery' ? draft.found : null}
          discarding={recoveryBusy}
          error={recoveryError}
          onContinue={continueDraft}
          onNotNow={notNow}
          onDiscard={() => { discardFound().catch(() => {}); }}
        />
      </View>
    );
  }

  const count = words(form.text);
  const textField = (hero: boolean) => (
    <TextField
      label={hero ? 'Your dream' : 'What happened'}
      hint="Required"
      hero={hero}
      multiline
      value={form.text}
      onChangeText={(v) => { set('text', v); if (error && v.trim().length >= MIN_LENGTH) setError(null); }}
      placeholder={hero ? 'Start anywhere: a place, a feeling, a colour…' : 'Describe the dream in as much detail as you can recall.'}
      error={error}
      footer={
        <View style={styles.meta}>
          <Pressable style={styles.sample} onPress={() => { setForm((f) => ({ ...f, text: SAMPLE.text, title: f.title || SAMPLE.title })); setError(null); }} accessibilityRole="button" hitSlop={4}>
            <Icon name="sparkle" size={14} color={colors.glow} />
            <AppText variant="caption" color={colors.textSecondary}>Use a sample dream</AppText>
          </Pressable>
          <AppText variant="caption" color={colors.textMuted}>{count} {count === 1 ? 'word' : 'words'}</AppText>
        </View>
      }
    />
  );
  const moodChips = (
    <View onLayout={(e) => { moodY.current = e.nativeEvent.layout.y; }}>
      <MoodSelector
        value={form.moods}
        onChange={(next: Mood[]) => { set('moods', next); if (next.length) setMoodError(null); }}
        error={moodError}
      />
    </View>
  );

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.top}>
            <Pressable onPress={requestExit} style={styles.cancel} accessibilityRole="button" hitSlop={8}>
              <Icon name="back" size={20} color={colors.textSecondary} />
              <AppText color={colors.textSecondary} style={{ fontFamily: fonts.bodyMedium }}>Cancel</AppText>
            </Pressable>
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => [styles.dateChip, pressed && { opacity: 0.8 }]}
              accessibilityRole="button"
              accessibilityLabel={`Dream date: ${formatDreamDateChip(form.dreamDate)}`}
              accessibilityHint="Choose the day you had this dream"
              hitSlop={4}
            >
              <Icon name="calendar" size={16} color={colors.textSecondary} />
              <AppText variant="caption" color={colors.textSecondary}>{formatDreamDateChip(form.dreamDate)}</AppText>
            </Pressable>
          </View>

          <View style={{ gap: 6 }}>
            <View style={styles.eyebrow}>
              <AppText variant="label" color={colors.textSecondary}>New dream</AppText>
              <DraftStatusLine status={draft.status} />
            </View>
            <AppText variant="title">What do you remember?</AppText>
          </View>

          <Segmented
            accessibilityLabel="Recording mode"
            options={[{ key: 'quick', label: 'Quick record' }, { key: 'detailed', label: 'Detailed record' }]}
            value={form.mode}
            onChange={(m: RecordMode) => set('mode', m)}
          />

          {form.mode === 'quick' ? (
            <>
              {textField(true)}
              <TextField label="Title" hint="Optional" value={form.title} onChangeText={(v) => set('title', v)} placeholder="Name it later" returnKeyType="done" />
              {moodChips}
            </>
          ) : (
            <>
              <TextField label="Title" value={form.title} onChangeText={(v) => set('title', v)} placeholder="e.g. The Library Under the Lake" returnKeyType="next" />
              {textField(false)}
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
                    value={form.personDraft}
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
              {moodChips}
              <View style={styles.field}>
                <AppText variant="label" color={colors.textSecondary}>Symbols & tags</AppText>
                <View style={styles.chips}>
                  {[...SUGGESTED_TAGS, ...form.customTags].map((t) => <Chip key={t} size="tag" label={t} selected={form.tags.includes(t)} onPress={() => toggleTag(t)} />)}
                </View>
                <TextField label="Add your own" icon="tag" value={form.tagDraft} onChangeText={(v) => set('tagDraft', v)} onSubmitEditing={addTag} submitBehavior="submit" placeholder="Type a symbol and press return" returnKeyType="done" />
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
                <Switch value={form.lucid} onValueChange={(v) => set('lucid', v)} trackColor={{ false: colors.border, true: colors.glow }} ios_backgroundColor={colors.border} accessibilityLabel="Lucid dream" />
              </View>
            </>
          )}
        </ScrollView>

        <View style={[styles.saveBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <LinearGradient colors={gradients.saveBar} style={styles.saveFade} pointerEvents="none" />
          {saveError ? (
            <View style={styles.errorRow} accessibilityRole="alert" accessibilityLiveRegion="assertive">
              <Icon name="alert" size={16} color={colors.danger} />
              <AppText variant="caption" color={colors.danger} style={{ flex: 1 }}>{saveError}</AppText>
            </View>
          ) : null}
          <Button
            label={phase === 'saved' ? 'Saved to your journal' : form.mode === 'quick' ? 'Save & reveal card' : 'Save dream & reveal card'}
            icon={phase === 'saved' ? 'check' : undefined}
            onPress={() => { save().catch(() => {}); }}
            loading={phase === 'saving'}
            loadingLabel="Planting your dream…"
            accessibilityHint="Saves your dream and reveals its Dream Card"
          />
          <AppText variant="caption" color={colors.textMuted} center>
            {form.mode === 'quick' ? 'Your card grows from the words you write.' : 'Every detail helps your card grow.'}
          </AppText>
        </View>
      </KeyboardAvoidingView>
      <DreamDatePicker
        visible={pickerOpen}
        value={form.dreamDate}
        onConfirm={(key) => { setForm((f) => ({ ...f, dreamDate: key, dateTouched: true })); setPickerOpen(false); }}
        onCancel={() => setPickerOpen(false)}
      />
      <RecordExitDraftDialog
        visible={exitOpen}
        busy={exitBusy}
        error={exitError}
        onKeepDraft={() => { keepDraftAndExit().catch(() => {}); }}
        onKeepEditing={() => { setExitOpen(false); setExitError(null); }}
        onDiscard={() => { discardAndExit().catch(() => {}); }}
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
  eyebrow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 18 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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
  errorRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
});
