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
  /**
   * Calendar day the dream happened (`YYYY-MM-DD`, a date — not a timestamp). Set on new dreams;
   * absent on older records, whose effective date is the local day of `createdAt`.
   */
  dreamDate?: string;
  /**
   * Botanical artwork motif frozen on the first edit, so editing text/title never changes
   * the card's illustration. Absent on unedited records (motif is then derived as before).
   */
  motif?: string;
}

export interface NewDreamExtras {
  title?: string;
  details?: DreamDetails;
  /** `YYYY-MM-DD`; defaults to the local day of creation when absent/invalid. */
  dreamDate?: string;
}

/**
 * Changes from the Edit Dream screen. The generated `card`, `id` and `createdAt` are never editable.
 * - `title`: new custom title; `null` removes it (the card title shows); `undefined` keeps it.
 * - `details`: the full editable detail state; editable keys left undefined/empty are removed,
 *   other (non-editable) detail keys are preserved. `undefined` keeps details untouched.
 */
export interface DreamEdit {
  text: string;
  mood: Mood;
  title?: string | null;
  details?: DreamDetails;
  /** New dream date (`YYYY-MM-DD`, not in the future); `undefined` keeps the current date state. */
  dreamDate?: string;
}
