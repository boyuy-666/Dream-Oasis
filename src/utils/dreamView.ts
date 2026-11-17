import { hashString, Motif, MOTIFS } from '@/art/botanical';
import { MOODS } from '@/data/moods';
import { Dream, DreamDetails, Rarity } from '@/data/types';

/**
 * Presentation model for Night Garden cards. Everything here is derived from the
 * stored dream at render time — stored records are never rewritten.
 */
export interface DreamView {
  id: string;
  no: number;
  title: string;
  motif: Motif;
  rarity: Rarity;
  element: string;
  emotion: string;
  reflection: string;
  symbols: string[];
  text: string;
  createdAt: string;
  details?: DreamDetails;
}

const RULES: [RegExp, Motif][] = [
  [/\b(library|libraries|books?|underwater|swim\w*|lakes?)\b/, 'lake'],
  [/\b(fly|flying|flew|flight|wings?|moths?|butterfl\w+|birds?|choir|sing\w*)\b/, 'moths'],
  [/\b(oceans?|seas?|water\w*|rivers?|pools?|stair\w*|tides?|flood\w*|waves?)\b/, 'tide'],
  [/\b(doors?|gates?|keys?|threshold)\b/, 'door'],
  [/\b(house|houses|home|grand\w*|greenhouse|roses?|garden\w*)\b/, 'greenhouse'],
  [/\b(forests?|ferns?|lanterns?|path\w*|woods|stars?)\b/, 'lantern'],
  [/\b(fall\w*|fell|petals?|drop\w*)\b/, 'petals'],
  [/\b(clocks?|late|time|hours?|mushrooms?)\b/, 'mushrooms'],
  [/\b(trees?|orchards?|glass|fruit\w*|bells?|fire)\b/, 'orchard'],
];

export function motifFor(d: Dream): Motif {
  const hay = `${d.title ?? ''} ${d.text} ${d.card.symbols.join(' ')}`.toLowerCase();
  const hit = RULES.find(([re]) => re.test(hay));
  // Unmatched dreams still get varied art, chosen stably from the dream id.
  return hit ? hit[1] : MOTIFS[hashString(d.id) % (MOTIFS.length - 1)];
}

const moodLabel = (m: Dream['mood']) => MOODS.find((x) => x.key === m)?.label ?? 'Curious';

export function toDreamView(d: Dream, no: number): DreamView {
  return {
    id: d.id,
    no,
    title: d.title || d.card.title,
    motif: motifFor(d),
    rarity: d.card.rarity,
    element: d.card.element,
    emotion: moodLabel(d.mood),
    reflection: d.card.interpretation,
    symbols: d.card.symbols,
    text: d.text,
    createdAt: d.createdAt,
    details: d.details,
  };
}

/** Views for all dreams; card numbers follow recording order (oldest = Nº 001). */
export function toDreamViews(dreams: Dream[]): DreamView[] {
  const order = [...dreams].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const no = new Map(order.map((d, i) => [d.id, i + 1]));
  return dreams.map((d) => toDreamView(d, no.get(d.id) ?? 0));
}

export const padNo = (n: number) => String(n).padStart(3, '0');
export const RARITY_RANK: Record<Rarity, number> = { legendary: 4, epic: 3, rare: 2, common: 1 };
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
