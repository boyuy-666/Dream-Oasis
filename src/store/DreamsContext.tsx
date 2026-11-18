import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { SAMPLE_DREAMS } from '@/data/sampleDreams';
import { Dream, DreamEdit, NewDreamInput } from '@/data/types';
import { createDreamRecord, findByDraftId } from '@/utils/dreamCreate';
import { removeDream } from '@/utils/dreamDelete';
import { applyDreamEdit } from '@/utils/dreamEdit';

const KEY = 'dream-oasis:dreams:v1';

interface DreamsValue {
  dreams: Dream[];
  ready: boolean;
  /**
   * Creates one dream (one card, one rarity roll from the primary emotion). Resolves only after
   * storage accepted the record; rejects without changing anything on invalid input
   * (DreamValidationError), a failed write, or while another creation is still in progress.
   * With a `draftId` it is idempotent: a dream already committed from that draft is returned as-is.
   */
  addDream: (input: NewDreamInput) => Promise<Dream>;
  getDream: (id: string) => Dream | undefined;
  /** True when a dream created from this draft is already stored (the draft is stale). */
  isDraftCommitted: (draftId: string) => boolean;
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
  // The latest committed list. Only the initial load and `mutate` set it, so an operation always
  // starts from the result of the one before it (never from a stale render snapshot).
  const dreamsRef = useRef<Dream[]>([]);
  // Every change (create, edit, delete) is one read-modify-write step run strictly in order:
  // a step computes its list from the previous step's result, persists it, and only then updates
  // state. An older write can never land after, or be computed without, a newer change.
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const loaded = useRef<Promise<void> | null>(null);
  const deletingRef = useRef(new Set<string>());
  const creatingRef = useRef(false);

  const enqueue = useCallback(<T,>(op: () => Promise<T>): Promise<T> => {
    const run = queue.current.catch(() => {}).then(op);
    queue.current = run;
    return run;
  }, []);

  useEffect(() => {
    loaded.current = (async () => {
      let list: Dream[] = SAMPLE_DREAMS;
      let firstLaunch = false;
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) list = JSON.parse(raw) as Dream[];
        else firstLaunch = true;
      } catch {
        // Unreadable storage: show samples in memory, but never overwrite what is stored.
      }
      dreamsRef.current = list;
      setDreams(list);
      setReady(true);
      if (firstLaunch) enqueue(() => AsyncStorage.setItem(KEY, JSON.stringify(list))).catch(() => {});
    })();
  }, [enqueue]);

  /** Runs one ordered change: `fn` sees the latest list; its result is persisted before state changes. */
  const mutate = useCallback(<T,>(fn: (current: Dream[]) => { next: Dream[]; result: T }): Promise<T> => enqueue(async () => {
    await loaded.current;
    const { next, result } = fn(dreamsRef.current);
    if (next !== dreamsRef.current) {
      await AsyncStorage.setItem(KEY, JSON.stringify(next)); // throws -> nothing below runs
      dreamsRef.current = next;
      setDreams(next);
    }
    return result;
  }), [enqueue]);

  const addDream = useCallback(async (input: NewDreamInput) => {
    if (creatingRef.current) throw new Error('A dream is already being saved');
    creatingRef.current = true;
    try {
      return await mutate((current) => {
        const { next, dream } = createDreamRecord(current, input, new Date());
        return { next, result: dream };
      });
    } finally {
      creatingRef.current = false;
    }
  }, [mutate]);

  const getDream = useCallback((id: string) => dreams.find((d) => d.id === id), [dreams]);
  const isDraftCommitted = useCallback((draftId: string) => !!findByDraftId(dreamsRef.current, draftId), []);

  const updateDream = useCallback((id: string, edit: DreamEdit) => mutate((current) => {
    const index = current.findIndex((d) => d.id === id);
    if (index < 0) throw new Error(`Dream ${id} not found`);
    const updated = applyDreamEdit(current[index], edit);
    return { next: current.map((d, i) => (i === index ? updated : d)), result: updated };
  }), [mutate]);

  const deleteDream = useCallback(async (id: string) => {
    if (deletingRef.current.has(id)) throw new Error(`Dream ${id} is already being deleted`);
    deletingRef.current.add(id);
    try {
      await mutate((current) => ({ next: removeDream(current, id), result: undefined })); // throws if missing
    } finally {
      deletingRef.current.delete(id);
    }
  }, [mutate]);

  const value = useMemo(
    () => ({ dreams, ready, addDream, getDream, isDraftCommitted, updateDream, deleteDream }),
    [dreams, ready, addDream, getDream, isDraftCommitted, updateDream, deleteDream],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDreams(): DreamsValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDreams must be used inside DreamsProvider');
  return v;
}
