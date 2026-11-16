import { DreamCard, Mood, Rarity } from '@/data/types';

/**
 * Phase 1 placeholder: deterministic, fully offline "card generator".
 * Free by design (no network, no paid API). Phase 2+ can swap this for an
 * on-device or free-tier AI provider behind the same signature.
 */
const SYMBOLS: Record<string, { word: string; glyph: string; element: string; meaning: string }> = {
  fly: { word: 'Flight', glyph: '🕊️', element: 'Air', meaning: 'a longing for freedom and perspective' },
  flying: { word: 'Flight', glyph: '🕊️', element: 'Air', meaning: 'a longing for freedom and perspective' },
  water: { word: 'Water', glyph: '🌊', element: 'Water', meaning: 'deep emotions moving beneath the surface' },
  ocean: { word: 'Ocean', glyph: '🌊', element: 'Water', meaning: 'the vastness of your inner world' },
  fire: { word: 'Fire', glyph: '🔥', element: 'Fire', meaning: 'transformation and passion' },
  forest: { word: 'Forest', glyph: '🌲', element: 'Earth', meaning: 'the unknown parts of yourself, waiting to be explored' },
  house: { word: 'House', glyph: '🏛️', element: 'Earth', meaning: 'the structure of your sense of self' },
  moon: { word: 'Moon', glyph: '🌙', element: 'Spirit', meaning: 'intuition and cycles of change' },
  star: { word: 'Stars', glyph: '⭐', element: 'Spirit', meaning: 'guidance and distant hopes' },
  stars: { word: 'Stars', glyph: '⭐', element: 'Spirit', meaning: 'guidance and distant hopes' },
  falling: { word: 'Falling', glyph: '🍂', element: 'Air', meaning: 'a wish to let go of control' },
  door: { word: 'Door', glyph: '🚪', element: 'Earth', meaning: 'a new opportunity or threshold' },
};

const FALLBACK = {
  glyph: '🌌',
  element: 'Spirit',
  meaning: 'a quiet message from your subconscious',
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickRarity(text: string): Rarity {
  const roll = hash(text) % 100;
  if (roll >= 96) return 'legendary';
  if (roll >= 82) return 'epic';
  if (roll >= 50) return 'rare';
  return 'common';
}

export function generateCard(text: string, mood: Mood): DreamCard {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  const found: (typeof SYMBOLS)[string][] = [];
  for (const w of words) {
    const s = SYMBOLS[w];
    if (s && !found.some((f) => f.word === s.word)) found.push(s);
  }
  const lead = found[0];
  const symbols = found.length ? found.map((f) => f.word).slice(0, 3) : ['Mystery'];
  const first = text.trim().split(/[.!?\n]/)[0].trim();
  const title = lead
    ? `The ${lead.word} ${mood === 'eerie' || mood === 'anxious' ? 'Whisper' : 'Reverie'}`
    : first.length > 3
      ? first.split(/\s+/).slice(0, 4).join(' ')
      : 'Unnamed Dream';
  const meaning = (lead ?? FALLBACK).meaning;
  return {
    title,
    rarity: pickRarity(text),
    element: (lead ?? FALLBACK).element,
    glyph: (lead ?? FALLBACK).glyph,
    symbols,
    interpretation: `This dream speaks of ${meaning}. Its ${mood} tone suggests your mind is processing something meaningful — notice how it echoes in your waking days.`,
  };
}
