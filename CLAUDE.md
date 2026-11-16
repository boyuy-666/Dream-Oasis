# CLAUDE.md — Dream Oasis

AI-powered dream journaling and Dream Card collection app. React Native + Expo (SDK 58) + TypeScript + Expo Router. Tested on a physical iPhone via Expo Go.

## Commands
```bash
npm start            # expo start (Metro + QR code)
npm run tunnel       # expo start --tunnel (when LAN does not work)
npm run typecheck    # tsc --noEmit
npm run lint         # expo lint
npx expo export --platform ios --output-dir <tmp>   # verifies the iOS bundle compiles
```
Run `typecheck` and `lint` before declaring any task done.

## Rules
- **Never push to GitHub without the owner's explicit approval.** Develop on the designated feature branch; do not commit unless asked.
- **No paid APIs or services.** Anything AI-related must be free/offline or behind an interface so it can be swapped later.
- **Expo Go compatible only**: use libraries bundled in Expo Go. Anything needing native code requires a dev build — ask first.
- Install Expo-managed packages with `npx expo install <pkg>`. If the Expo API is unreachable, take versions from `node_modules/expo/bundledNativeModules.json`.
- Do not create or hand-edit `ios/` or `android/` (Continuous Native Generation).
- Expo changes every SDK: check https://docs.expo.dev/versions/v58.0.0/ rather than trusting memory.
- Do not overwrite existing files without reading them first.

## Layout
```
src/app/            Expo Router routes only
  _layout.tsx         root: fonts, splash, DreamsProvider, Stack
  (tabs)/             Home, Record, Collection, Profile
  reveal/[id].tsx     Dream Card Reveal (full-screen flip animation)
src/components/ui/  Reusable UI (Screen, StarField, AppText, Button, Chip, GlassCard, StatTile, DreamCardView)
src/theme/          colors, typography, spacing tokens
src/data/           types, moods, sample dreams
src/store/          DreamsContext (AsyncStorage persistence)
src/utils/          generateCard (offline placeholder generator), stats
src/hooks/          custom hooks (empty for now)
```
Import with the `@/` alias (maps to `src/`).

## Design system — Midnight Blue & Moonlight Silver (approved Phase 1.5)
Calm, elegant, minimal nighttime sanctuary — not astrology/fantasy-game styling. **No purple or gold anywhere** (buttons, stars, rarity, accents).

| Token (`colors.*`) | Hex | Use |
|---|---|---|
| `bg` | `#10283F` | Primary background |
| `bgDeep` | `#071521` | Deep night background, splash |
| `surface` | `#19374C` | Elevated surface, inputs |
| `surfaceAlt` | `#24485D` | Secondary surface, disabled bg |
| `accent` | `#85B7CE` | Moonlight Blue — primary buttons, links, focus |
| `onAccent` | `#10283F` | Text on accent |
| `text` | `#EDF2F2` | Moonlight silver, primary text |
| `textSecondary` | `#B1C6D3` | Secondary text |
| `border` | `#345266` | Silver borders |
| `highlight` | `#D9E9F0` | Soft moonlight highlight |
| `textMuted` | `#6E899A` | Disabled / muted, inactive tabs |
| `placeholder` | `#8EA6B5` | Input placeholders (≥4.5:1 on surface) |

Background gradient `#071521 → #10283F → #173B50` (`gradients.background`).
Rarity (`colors.rarity`): common `#A9BEC9`, rare `#85B7CE`, epic `#6DD2DF`, legendary `#EDF2F2`.
Buttons: primary = accent fill + `onAccent` text; secondary = navy glass + silver border; disabled = `surfaceAlt` + `textSecondary`.

Rules: use semantic tokens from `@/theme` only — no raw hex/rgba outside `src/theme/`. Build screens with `<Screen>` (gradient + restrained silver stars + safe area; `moon` prop for a faint halo). Restrained elevation (`elevation.card`), no neon glows. Headings: Cormorant Garamond; body: system font. Icons: Ionicons from `@expo/vector-icons` (tintable). Animations use RN `Animated` with `useNativeDriver: true`. Keep text contrast ≥ 4.5:1.

## Lint notes
React Compiler lint rules are on: don't read/write refs during render (hold `Animated.Value` in `useState(() => ...)`) and keep render pure.
