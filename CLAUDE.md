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
  _layout.tsx         root: Instrument fonts, splash, DreamsProvider, Stack
  (tabs)/             Garden (index), Record, Collection, Profile (via Home avatar)
  reveal/[id].tsx     Card reveal (full-screen; float → charge → 3D flip → burst)
  card/[id].tsx       Card detail (iOS modal sheet)
src/art/botanical.ts  Night Garden SVG engine: 10 motifs, card back, ornaments, decor
src/components/ui/    AppText, Art, Button, Chip, DreamRow, GlassCard, Icon, Screen, Segmented, StatTile, TextField
src/components/card/  DreamCard (size-aware, rarity treatments), CardBack, CardFlip
src/components/navigation/TabBar.tsx  custom tab bar (hidden on Record)
src/theme/            colors, typography, spacing tokens
src/data/             types, moods, sample dreams
src/store/            DreamsContext (AsyncStorage key `dream-oasis:dreams:v1` — never change)
src/utils/            generateCard (rarity/content logic), dreamView (derived card view model), stats, dates
Dream-Oasis-UI-Prototype/  (only on branch prototype/night-garden-ui) approved HTML reference
```
Import with the `@/` alias (maps to `src/`).

## Data rules
- Stored dreams are never rewritten. Card display fields (motif, card number, element/emotion labels) are derived in `utils/dreamView.ts`.
- New optional fields (`title`, `details`) are additive; keep older records valid.
- `generateCard` owns rarity and generated content — UI work must not change it.

## Design system — Night Garden (approved)
Nocturnal botanical sanctuary: moss-black calm, moth-paper type, rare bioluminescent glow, night-bloom flowers. No celestial/astrology clichés, no neon overload.

| Token (`colors.*`) | Hex | Use |
|---|---|---|
| `mossNight` / `bg` | `#0F1613` | Background |
| `greenhouse` / `surface` | `#18221E` | Surfaces, sheets |
| `mothPaper` / `text` | `#ECE7DA` | Primary text, selected chips |
| `glow` / `accent` | `#C9E86B` | Primary action, focus, legendary — use sparingly |
| `nightBloom` | `#E8A0AE` | Flowers, epic rarity, name accent |
| `lichen` / `textSecondary` | `#A9B3A7` | Secondary text |
| `fern` / `border` | `#2F3E36` | Lines and borders |

Derived: `surfaceSunk #131B17` (inputs), `surfaceRaised #1D2924`, `borderStrong #3C5045`, `textMuted #7E8A80` (5.1:1), `onAccent #14200F`, `danger #F2A7A0`.
Type: display **Instrument Serif** (`fonts.display`, `fonts.displayItalic`), body **Instrument Sans** (`fonts.body*`). Use `type.*` variants via `<AppText variant>`.
Rarity is shown by frame + finish, not only colour: common hairline; rare double rule + leaf sprigs; epic night-bloom vines + pearl sheen; legendary gradient frame, full vines, moving foil.
Rules: semantic tokens only (raw hex allowed only inside `src/theme` and the art engine). Glows are radial gradients, not blur filters. Animations use RN `Animated` with `useNativeDriver: true` and respect Reduce Motion. Keep text contrast ≥ 4.5:1.

## Lint notes
React Compiler lint rules are on: don't read/write refs during render (hold `Animated.Value` in `useState(() => ...)`) and keep render pure. RN 0.88: no `StyleSheet.absoluteFillObject`; type host refs with `HostInstance`. Custom tab bars receive `emitter` + `navigateToTab` (no `navigation`).
