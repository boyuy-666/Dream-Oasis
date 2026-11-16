import { Dream } from './types';
import { generateCard } from '@/utils/generateCard';

const seed = (id: string, text: string, mood: Dream['mood'], daysAgo: number): Dream => ({
  id,
  text,
  mood,
  createdAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
  card: generateCard(text, mood),
});

export const SAMPLE_DREAMS: Dream[] = [
  seed('s1', 'I was flying over a silver ocean under two moons.', 'peaceful', 1),
  seed('s2', 'A door appeared in the middle of a dark forest and it was humming.', 'curious', 3),
  seed('s3', 'My old house was on fire but nothing burned, and stars fell from the ceiling.', 'eerie', 6),
];
