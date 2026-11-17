import { DreamCard, Mood, Rarity } from '@/data/types';

/**
 * Phase 1 placeholder: fully offline "card generator".
 * Title, symbols, element and interpretation are derived from the dream text;
 * rarity is a genuine random roll (see RARITY_ODDS).
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

/** Odds for a new Dream Card's rarity, in percent. Must sum to 100. */
export const RARITY_ODDS: readonly { rarity: Rarity; percent: number }[] = [
  { rarity: 'common', percent: 50 },
  { rarity: 'rare', percent: 32 },
  { rarity: 'epic', percent: 14 },
  { rarity: 'legendary', percent: 4 },
];

/**
 * One independent rarity roll. `random` must return a number in [0, 1), like Math.random.
 * Boundaries on the 0–100 scale: common [0, 50) · rare [50, 82) · epic [82, 96) · legendary [96, 100).
 */
export function rollRarity(random: () => number = Math.random): Rarity {
  const roll = random() * 100;
  let ceiling = 0;
  for (const { rarity, percent } of RARITY_ODDS) {
    ceiling += percent;
    if (roll < ceiling) return rarity;
  }
  return RARITY_ODDS[RARITY_ODDS.length - 1].rarity; // floating-point guard
}

/**
 * Builds the card for a NEW dream. Rarity is rolled here exactly once; the caller must
 * persist the returned card with the dream and never call this again for an existing dream.
 */
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
    rarity: rollRarity(),
    element: (lead ?? FALLBACK).element,
    glyph: (lead ?? FALLBACK).glyph,
    symbols,
    interpretation: `This dream speaks of ${meaning}. Its ${mood} tone suggests your mind is processing something meaningful — notice how it echoes in your waking days.`,
  };
}
