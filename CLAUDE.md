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
src/components/ui/  Reusable UI (Screen, StarField, AppText, Button, Chip, GlassCard, DreamCardView)
src/theme/          colors, typography, spacing tokens
src/data/           types, moods, sample dreams
src/store/          DreamsContext (AsyncStorage persistence)
src/utils/          generateCard (offline placeholder generator)
src/hooks/          custom hooks (empty for now)
```
Import with the `@/` alias (maps to `src/`).

## Design system
Midnight purple `#0B0720`, cosmic blue, lavender `#B9A7FF`, soft gold `#F5D78E`. Headings use Cormorant Garamond, body uses the system font. Always build screens with `<Screen>` (gradient + stars + safe area) and tokens from `@/theme` — no hard-coded colors in screens. Animations use RN `Animated` with `useNativeDriver: true`.

## Lint notes
React Compiler lint rules are on: don't read/write refs during render (hold `Animated.Value` in `useState(() => ...)`) and keep render pure.
