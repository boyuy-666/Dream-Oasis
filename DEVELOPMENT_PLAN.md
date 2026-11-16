# Dream Oasis — Development Plan

## Phase 1 — Project initialization ✅
- Expo SDK 58 + TypeScript + Expo Router scaffolded in the existing repo
- Theme tokens, starry background, reusable UI kit
- 5 screens with working navigation: Home, Record, Reveal, Collection, Profile
- Local persistence of dreams; offline placeholder card generator
- Validation: `tsc`, `expo lint`, iOS bundle export all pass

## Phase 1.5 — Visual identity: Midnight Blue & Moonlight Silver ✅
- Replaced purple/lavender/gold with the approved palette (see CLAUDE.md → Design system):
  bg `#10283F`, deep `#071521`, surface `#19374C`/`#24485D`, accent `#85B7CE`,
  text `#EDF2F2`/`#B1C6D3`, border `#345266`, highlight `#D9E9F0`, muted `#6E899A`
- Semantic tokens in `src/theme/colors.ts`; no raw colors outside the theme
- Cool-toned rarity colors; redesigned Dream Card, card back, tabs (Ionicons), Home stats + recent dreams
- Visual-only: storage keys, dream records and card generation unchanged

## Phase 2 — Core journaling
- Dream detail/edit/delete; search and filter by mood/rarity/date
- Voice-to-text capture (free, on-device where possible)
- Streaks and a morning reminder (local notifications)
- Empty/loading/error states; accessibility pass (Dynamic Type, VoiceOver)

## Phase 3 — Dream Cards & AI
- Replace `generateCard` with a free-tier or on-device model behind the same interface
- Card art (procedural/SVG first), rarity rules, element sets, collection progress
- Share a card as an image

## Phase 4 — Polish
- Onboarding, settings, theme refinements, haptics/sound
- App icon + splash artwork, performance profiling
- Optional backup/sync (free tier) and export

## Phase 5 — Release prep
- Development build via EAS, TestFlight, privacy policy, App Store assets
- Note: App Store distribution requires an Apple Developer account (paid, Apple-side).

## Open decisions
- Which free AI provider / on-device model to use for interpretations
- Whether to add cloud sync
