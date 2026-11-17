import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { SAMPLE_DREAMS } from '@/data/sampleDreams';
import { Dream, DreamEdit, Mood, NewDreamExtras } from '@/data/types';
import { removeDream } from '@/utils/dreamDelete';
import { isFutureKey, isValidDateKey, toDateKey } from '@/utils/dreamDates';
import { applyDreamEdit } from '@/utils/dreamEdit';
import { assertValidMoods } from '@/utils/moodSelection';
import { generateCard } from '@/utils/generateCard';

const KEY = 'dream-oasis:dreams:v1';

interface DreamsValue {
  dreams: Dream[];
  ready: boolean;
  /**
   * Creates a dream from ordered emotions (1–3, unique; first = primary). Throws on a malformed
   * selection instead of saving it. Generates exactly one card from the primary emotion.
   */
  addDream: (text: string, moods: Mood[], extras?: NewDreamExtras) => Dream;
  getDream: (id: string) => Dream | undefined;
  /**
   * Edits an existing dream in place (same id, createdAt and generated card).
   * Resolves only after the change is written to storage; rejects (and changes nothing)
   * if the dream is missing or the write fails.
   */
  updateDream: (id: string, edit: DreamEdit) => Promise<Dream>;
  /**
   * Permanently deletes exactly one dream (and its card). Resolves only after storage accepted
   * the change; rejects (and changes nothing) for a missing id, a duplicate request or a failed write.
   * Deleting the last dream stores `[]`, so sample dreams never return.
   */
  deleteDream: (id: string) => Promise<void>;
}

const Ctx = createContext<DreamsValue | null>(null);

export function DreamsProvider({ children }: { children: React.ReactNode }) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [ready, setReady] = useState(false);
  // Latest list for async operations (kept in sync after each commit).
  const dreamsRef = useRef<Dream[]>([]);
  useEffect(() => { dreamsRef.current = dreams; }, [dreams]);
  // All storage writes run one after another in the order issued, so an older write can never
  // land after (and overwrite) a newer one such as an edit or a deletion.
  const writeChain = useRef<Promise<unknown>>(Promise.resolve());
  // The list an explicit operation already persisted; the sync effect skips re-writing it.
  const persistedRef = useRef<Dream[] | null>(null);
  const deletingRef = useRef(new Set<string>());
  const persist = useCallback((list: Dream[]) => {
    const run = writeChain.current.catch(() => {}).then(() => AsyncStorage.setItem(KEY, JSON.stringify(list)));
    writeChain.current = run;
    return run;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        setDreams(raw ? (JSON.parse(raw) as Dream[]) : SAMPLE_DREAMS);
      } catch {
        setDreams(SAMPLE_DREAMS);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready || dreams === persistedRef.current) return;
    persist(dreams).catch(() => {});
  }, [dreams, ready, persist]);

  /** Persists `next` first; only then commits it to state. */
  const commit = useCallback(async (next: Dream[]) => {
    await persist(next);
    persistedRef.current = next;
    dreamsRef.current = next;
    setDreams(next);
  }, [persist]);

  const addDream = useCallback((text: string, moods: Mood[], extras?: NewDreamExtras) => {
    assertValidMoods(moods);
    const mood = moods[0];
    const now = new Date();
    const chosen = extras?.dreamDate;
    const dream: Dream = {
      id: `${now.getTime()}`,
      text: text.trim(),
      mood,
      moods: [...moods],
      createdAt: now.toISOString(),
      card: generateCard(text, mood),
      // Every new dream gets a valid, non-future calendar date.
      dreamDate: isValidDateKey(chosen) && !isFutureKey(chosen, now) ? chosen : toDateKey(now),
    };
    const title = extras?.title?.trim();
    if (title) dream.title = title;
    if (extras?.details) dream.details = extras.details;
    setDreams((d) => [dream, ...d]);
    return dream;
  }, []);

  const getDream = useCallback((id: string) => dreams.find((d) => d.id === id), [dreams]);

  const updateDream = useCallback(async (id: string, edit: DreamEdit) => {
    const current = dreamsRef.current;
    const index = current.findIndex((d) => d.id === id);
    if (index < 0) throw new Error(`Dream ${id} not found`);
    const updated = applyDreamEdit(current[index], edit);
    const next = current.map((d, i) => (i === index ? updated : d));
    // Persist first: the UI must not report success unless storage accepted the change.
    await commit(next);
    return updated;
  }, [commit]);

  const deleteDream = useCallback(async (id: string) => {
    if (deletingRef.current.has(id)) throw new Error(`Dream ${id} is already being deleted`);
    deletingRef.current.add(id);
    try {
      await commit(removeDream(dreamsRef.current, id)); // throws if the id is missing
    } finally {
      deletingRef.current.delete(id);
    }
  }, [commit]);

  const value = useMemo(
    () => ({ dreams, ready, addDream, getDream, updateDream, deleteDream }),
    [dreams, ready, addDream, getDream, updateDream, deleteDream],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDreams(): DreamsValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDreams must be used inside DreamsProvider');
  return v;
}
