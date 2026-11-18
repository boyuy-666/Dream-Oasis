import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';

import { yesterdayKey } from '@/utils/dreamDates';
import {
  blankFields, DraftFields, DreamDraft, fieldsKey, isMeaningful, newDraftId, pickFields, RecordMode, toDraft,
} from '@/utils/dreamDraft';
import { createDraftStore, SaveResult } from '@/utils/draftStore';

/** One app-wide, ordered draft store: its write order survives screen remounts. */
export const draftStore = createDraftStore(AsyncStorage);
export const DRAFT_DEBOUNCE_MS = 1000;

/**
 * - `checking`: looking for a stored draft; no editable form is shown, so nothing can overwrite it.
 * - `recovery`: a stored draft was found and the user is deciding what to do with it.
 * - `editing`: the form is live and auto-saves.
 * - `away`: Record was left (draft kept or discarded); the next visit checks storage again.
 */
export type DraftGate = 'checking' | 'recovery' | 'editing' | 'away';
export type DraftStatus = 'hidden' | 'saving' | 'saved' | 'error';

interface Options {
  /** View for a fresh blank form (a restored draft keeps its own). */
  preferredMode: RecordMode;
  /** True if a dream from this draft is already stored (interrupted cleanup). */
  isDraftCommitted: (draftId: string) => boolean;
  /** While the permanent dream is being saved, auto-save stands still. */
  paused: boolean;
}

/**
 * Auto-save and recovery for the single unfinished new dream. The draft is local only; it never
 * becomes a Dream, card or rarity roll. All writes go through `draftStore`, which keeps them in
 * order and drops writes that were overtaken by a newer write, a discard or a finished save.
 */
export function useDreamDraft({ preferredMode, isDraftCommitted, paused }: Options) {
  const [form, setForm] = useState<DraftFields>(() => blankFields(preferredMode));
  const [draftId, setDraftId] = useState(() => newDraftId());
  const [gate, setGate] = useState<DraftGate>('checking');
  const [found, setFound] = useState<DreamDraft | null>(null);
  /** fieldsKey of the form as last confirmed by storage. */
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [writeFailed, setWriteFailed] = useState(false);
  /** Storage could not be read (or an unreadable draft could not be set aside): never write over it. */
  const [blocked, setBlocked] = useState(false);
  /** Time reference for render-time checks (kept in state so rendering stays pure). */
  const [clock, setClock] = useState(() => new Date());

  // Latest values for timers, AppState and async callbacks (updated after every render).
  const live = useRef({ form, draftId, gate, blocked, paused, savedKey, preferredMode, isDraftCommitted });
  useEffect(() => {
    live.current = { form, draftId, gate, blocked, paused, savedKey, preferredMode, isDraftCommitted };
  });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const token = useRef(0); // only the newest write may update the status
  const issued = useRef(false); // a write was requested for the current draftId (it may be stored)
  const retired = useRef(new Set<string>()); // discarded / committed drafts are never written again
  const mounted = useRef(true);
  const checking = useRef(false);
  const failed = useRef(false);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const write = useCallback(async (fields: DraftFields, id: string): Promise<SaveResult> => {
    if (retired.current.has(id)) return 'cancelled';
    const key = fieldsKey(fields);
    const my = ++token.current;
    issued.current = true;
    try {
      const result = await draftStore.save(toDraft(fields, id));
      if (result === 'saved' && mounted.current && my === token.current) {
        failed.current = false;
        setSavedKey(key);
        setWriteFailed(false);
      }
      return result;
    } catch (e) {
      if (mounted.current && my === token.current) {
        if (!failed.current) AccessibilityInfo.announceForAccessibility("Couldn't save draft");
        failed.current = true;
        setWriteFailed(true);
      }
      throw e;
    }
  }, []);

  // Debounced auto-save: about a second after the last meaningful change.
  useEffect(() => {
    if (gate !== 'editing' || paused || blocked) { clearTimer(); return; }
    if (!isMeaningful(form)) {
      clearTimer();
      if (issued.current) {
        // Cleared back to a blank form: remove its stored draft; queued writes are cancelled.
        issued.current = false;
        token.current += 1;
        draftStore.removeIfOwned(draftId).catch(() => { issued.current = true; });
      }
      return;
    }
    if (fieldsKey(form) === savedKey) return;
    clearTimer();
    timer.current = setTimeout(() => {
      timer.current = null;
      const cur = live.current;
      if (cur.gate !== 'editing' || cur.paused || cur.blocked || !isMeaningful(cur.form)) return;
      write(cur.form, cur.draftId).catch(() => {});
    }, DRAFT_DEBOUNCE_MS);
  }, [form, gate, paused, blocked, draftId, savedKey, write, clearTimer]);

  /** Writes the latest form now. Resolves once storage accepted it (or there is nothing to keep). */
  const flush = useCallback(async () => {
    clearTimer();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const cur = live.current;
      if (cur.gate !== 'editing' || !isMeaningful(cur.form)) return;
      if (cur.blocked) throw new Error('Draft storage is unavailable');
      const result = await write(cur.form, cur.draftId);
      if (result === 'saved') return;
      if (result === 'cancelled') throw new Error('This draft was already discarded or saved');
      // superseded: a newer write was requested meanwhile; write the latest form again
    }
    throw new Error('Draft could not be saved');
  }, [clearTimer, write]);

  // Best-effort immediate write when the app goes to the background (not guaranteed if the OS
  // terminates the app before AsyncStorage finishes).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'inactive' && next !== 'background') return;
      const cur = live.current;
      if (cur.paused || (timer.current === null && fieldsKey(cur.form) === cur.savedKey)) return;
      flush().catch(() => {});
    });
    return () => sub.remove();
  }, [flush]);

  useEffect(() => {
    mounted.current = true;
    const retiredIds = retired.current;
    return () => {
      mounted.current = false;
      clearTimer();
      const cur = live.current;
      // Unmounting with unsaved words: one last best-effort write (no state updates after this).
      if (cur.gate === 'editing' && !cur.paused && !cur.blocked && isMeaningful(cur.form)
        && fieldsKey(cur.form) !== cur.savedKey && !retiredIds.has(cur.draftId)) {
        draftStore.save(toDraft(cur.form, cur.draftId)).catch(() => {});
      }
    };
  }, [clearTimer]);

  const resetTo = useCallback((nextGate: DraftGate) => {
    clearTimer();
    token.current += 1;
    issued.current = false;
    failed.current = false;
    const now = new Date();
    setForm(blankFields(live.current.preferredMode, now));
    setDraftId(newDraftId(now));
    setSavedKey(null);
    setWriteFailed(false);
    setFound(null);
    setClock(now);
    setGate(nextGate);
  }, [clearTimer]);

  /** Fresh blank form (yesterday's date, no moods), ready to edit. */
  const startBlank = useCallback(() => resetTo('editing'), [resetTo]);
  /** Record was left: clear the in-memory form; the next visit checks storage again. */
  const leave = useCallback(() => resetTo('away'), [resetTo]);

  const check = useCallback(async () => {
    const g = live.current.gate;
    if (checking.current || g === 'editing' || g === 'recovery') return;
    checking.current = true;
    setGate('checking');
    try {
      const res = await draftStore.load();
      if (res.kind === 'ok' && isMeaningful(res.draft)) {
        setBlocked(false);
        if (live.current.isDraftCommitted(res.draft.draftId)) {
          // The dream was saved but cleanup was interrupted: quietly finish it, never offer it again.
          retired.current.add(res.draft.draftId);
          await draftStore.removeIfOwned(res.draft.draftId).catch(() => {});
          startBlank();
        } else {
          setFound(res.draft);
          setGate('recovery');
        }
      } else if (res.kind === 'invalid') {
        // Not restorable, but not ours to destroy: set it aside before the slot is reused.
        try { await draftStore.backupInvalid(res.raw); setBlocked(false); } catch { setBlocked(true); }
        startBlank();
      } else {
        setBlocked(false);
        startBlank();
      }
    } catch {
      setBlocked(true); // could not read: do not auto-save over whatever is stored
      startBlank();
    } finally {
      checking.current = false;
    }
  }, [startBlank]);

  /** Call whenever Record gains focus. */
  const onFocus = useCallback(() => {
    const cur = live.current;
    if (cur.gate === 'editing') {
      // An untouched blank form left open overnight follows the new "yesterday".
      const now = new Date();
      if (!isMeaningful(cur.form, now) && !cur.form.dateTouched && cur.form.dreamDate !== yesterdayKey(now)) {
        setClock(now);
        setForm((f) => ({ ...f, dreamDate: yesterdayKey(now) }));
      }
      return;
    }
    check().catch(() => {});
  }, [check]);

  /** Restores every field of the found draft exactly (no rewrite, no card, no rarity). */
  const continueDraft = useCallback(() => {
    if (!found) return;
    const fields = pickFields(found);
    clearTimer();
    token.current += 1;
    issued.current = true; // this form's draft is the stored one
    setForm(fields);
    setDraftId(found.draftId);
    setSavedKey(fieldsKey(fields));
    setWriteFailed(false);
    setClock(new Date());
    setFound(null);
    setGate('editing');
  }, [found, clearTimer]);

  /** Not Now: keep the stored draft for the next visit. */
  const notNow = useCallback(() => { setFound(null); setGate('away'); }, []);

  /** Removes the found draft, then starts a blank form. Rejects (draft kept) if storage fails. */
  const discardFound = useCallback(async () => {
    if (!found) return;
    await draftStore.removeIfOwned(found.draftId);
    retired.current.add(found.draftId);
    startBlank();
  }, [found, startBlank]);

  /** Discards the form being edited: cancels pending writes and removes its stored draft. */
  const discardCurrent = useCallback(async () => {
    clearTimer();
    const id = live.current.draftId;
    retired.current.add(id); // no write for this draft may start from now on
    try {
      await draftStore.removeIfOwned(id);
    } catch (e) {
      retired.current.delete(id); // still editable and auto-saved
      throw e;
    }
    leave();
  }, [clearTimer, leave]);

  /** After the permanent dream is stored: retire and remove its draft. Never throws. */
  const finalize = useCallback(async (id: string) => {
    retired.current.add(id);
    clearTimer();
    token.current += 1;
    issued.current = false;
    try {
      await draftStore.removeIfOwned(id);
    } catch {
      // The dream carries this draftId, so the next check recognises and removes the stale draft.
    }
  }, [clearTimer]);

  const meaningful = isMeaningful(form, clock);
  const key = fieldsKey(form);
  const status: DraftStatus = gate !== 'editing' || paused || !meaningful ? 'hidden'
    : writeFailed || blocked ? 'error'
      : key === savedKey ? 'saved' : 'saving';

  return {
    form, setForm, draftId, gate, found, status, meaningful,
    onFocus, continueDraft, notNow, discardFound, discardCurrent, flush, finalize, leave,
  };
}
