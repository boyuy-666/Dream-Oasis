import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { SAMPLE_DREAMS } from '@/data/sampleDreams';
import { Dream, Mood } from '@/data/types';
import { generateCard } from '@/utils/generateCard';

const KEY = 'dream-oasis:dreams:v1';

interface DreamsValue {
  dreams: Dream[];
  ready: boolean;
  addDream: (text: string, mood: Mood) => Dream;
  getDream: (id: string) => Dream | undefined;
}

const Ctx = createContext<DreamsValue | null>(null);

export function DreamsProvider({ children }: { children: React.ReactNode }) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [ready, setReady] = useState(false);

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

  const addDream = useCallback((text: string, mood: Mood) => {
    const dream: Dream = {
      id: `${Date.now()}`,
      text: text.trim(),
      mood,
      createdAt: new Date().toISOString(),
      card: generateCard(text, mood),
    };
    setDreams((d) => [dream, ...d]);
    return dream;
  }, []);

  const getDream = useCallback((id: string) => dreams.find((d) => d.id === id), [dreams]);

  const value = useMemo(() => ({ dreams, ready, addDream, getDream }), [dreams, ready, addDream, getDream]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDreams(): DreamsValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDreams must be used inside DreamsProvider');
  return v;
}
