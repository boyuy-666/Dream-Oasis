export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type Mood = 'peaceful' | 'joyful' | 'curious' | 'anxious' | 'eerie';

export interface DreamCard {
  title: string;
  rarity: Rarity;
  element: string;
  glyph: string;
  symbols: string[];
  interpretation: string;
}

/** Optional fields captured by Detailed record (added in Night Garden; absent on older dreams). */
export interface DreamDetails {
  people?: string[];
  place?: string;
  tags?: string[];
  vividness?: number; // 1–5
  lucid?: boolean;
}

export interface Dream {
  id: string;
  text: string;
  mood: Mood;
  createdAt: string; // ISO date
  card: DreamCard;
  /** User-chosen title; falls back to card.title when absent. */
  title?: string;
  details?: DreamDetails;
}

export interface NewDreamExtras {
  title?: string;
  details?: DreamDetails;
}
