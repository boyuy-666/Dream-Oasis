import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { SAMPLE_DREAMS } from '@/data/sampleDreams';
import { Dream, DreamEdit, Mood, NewDreamExtras } from '@/data/types';
import { applyDreamEdit } from '@/utils/dreamEdit';
import { generateCard } from '@/utils/generateCard';

const KEY = 'dream-oasis:dreams:v1';

interface DreamsValue {
  dreams: Dream[];
  ready: boolean;
  addDream: (text: string, mood: Mood, extras?: NewDreamExtras) => Dream;
  getDream: (id: string) => Dream | undefined;
  /**
   * Edits an existing dream in place (same id, createdAt and generated card).
   * Resolves only after the change is written to storage; rejects (and changes nothing)
   * if the dream is missing or the write fails.
   */
  updateDream: (id: string, edit: DreamEdit) => Promise<Dream>;
}

const Ctx = createContext<DreamsValue | null>(null);

export function DreamsProvider({ children }: { children: React.ReactNode }) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [ready, setReady] = useState(false);
  // Latest list for async operations (kept in sync after each commit).
  const dreamsRef = useRef<Dream[]>([]);
  useEffect(() => { dreamsRef.current = dreams; }, [dreams]);

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
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(dreams)).catch(() => {});
  }, [dreams, ready]);

  const addDream = useCallback((text: string, mood: Mood, extras?: NewDreamExtras) => {
    const dream: Dream = {
      id: `${Date.now()}`,
      text: text.trim(),
      mood,
      createdAt: new Date().toISOString(),
      card: generateCard(text, mood),
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
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    dreamsRef.current = next;
    setDreams(next);
    return updated;
  }, []);

  const value = useMemo(() => ({ dreams, ready, addDream, getDream, updateDream }), [dreams, ready, addDream, getDream, updateDream]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDreams(): DreamsValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDreams must be used inside DreamsProvider');
  return v;
}
