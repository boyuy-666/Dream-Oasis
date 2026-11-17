import { Dream } from '@/data/types';

/**
 * Returns a new list without the dream whose id matches (exactly one record removed).
 * Other records are kept as the same objects, untouched. Throws if the id is missing/invalid.
 */
export function removeDream(list: Dream[], id: string): Dream[] {
  if (!id) throw new Error('Missing dream id');
  const index = list.findIndex((d) => d.id === id);
  if (index < 0) throw new Error(`Dream ${id} not found`);
  return list.filter((_, i) => i !== index);
}
