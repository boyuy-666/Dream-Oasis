import React from 'react';
import { SvgXml } from 'react-native-svg';

const P: Record<string, string> = {
  garden: '<path d="M12 21V11"/><path d="M12 13C12 8.5 9 6 5 6c0 4.5 3 7 7 7Z"/><path d="M12 11c0-4 2.6-6.5 6.5-6.5 0 4-2.6 6.5-6.5 6.5Z"/>',
  pen: '<path d="M5 19l1.2-4.4L16.4 4.4a2 2 0 0 1 2.9 2.9L9.1 17.5 5 19Z"/><path d="M14.5 6.3l3 3"/>',
  cards: '<rect x="4" y="7.5" width="11" height="13.5" rx="2"/><path d="M8.5 4.2h8.3a2 2 0 0 1 2 2V17"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
  sort: '<path d="M7 5v14M4 16l3 3 3-3M17 19V5M14 8l3-3 3 3"/>',
  sparkle: '<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8L12 3.5Z"/><path d="M19 16v4M17 18h4"/>',
  turn: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.6"/><path d="M20 4v4.6h-4.6"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.4"/><path d="M4 20v-4.6h4.6"/>',
  share: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5"/>',
  tap: '<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M12 10.5a1.5 1.5 0 0 1 3 0v1a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.5a5.5 5.5 0 0 1-4.6-2.5L4.6 15a1.5 1.5 0 0 1 2.4-1.8L9 15"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.2v.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  tag: '<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.4 6.4a1.4 1.4 0 0 1-2 0l-8.6-8Z"/><circle cx="8" cy="8" r="1.3"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
};
export type IconName = keyof typeof P;

const xmlFor = (name: IconName, weight: number) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${weight}" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${P[name]}</svg>`;

/** Line icons from the Night Garden prototype (1.7pt stroke, currentColor). */
export function Icon({ name, size = 20, color, weight = 1.7 }: { name: IconName; size?: number; color: string; weight?: number }) {
  return <SvgXml xml={xmlFor(name, weight)} width={size} height={size} color={color} />;
}
