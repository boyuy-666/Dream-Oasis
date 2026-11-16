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

export interface Dream {
  id: string;
  text: string;
  mood: Mood;
  createdAt: string; // ISO date
  card: DreamCard;
}
