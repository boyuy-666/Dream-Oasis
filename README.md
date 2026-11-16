# 🌙 Dream Oasis

An AI-powered dream journal and Dream Card collection app. Record a dream, unveil a collectible card, and build your collection.

**Stack:** React Native · Expo SDK 58 · TypeScript · Expo Router

## Screens
Home · Dream Recording · Dream Card Reveal · Dream Collection · Profile

## Getting started
Requires Node 20+ and the **Expo Go** app on your iPhone (App Store).

```bash
npm install
npm start
```
Scan the QR code with the iPhone Camera app (opens Expo Go). Phone and computer must be on the same Wi-Fi; otherwise use `npm run tunnel`.

## Scripts
| Command | Purpose |
|---|---|
| `npm start` | Start Metro dev server |
| `npm run tunnel` | Start with a tunnel (different networks / strict Wi-Fi) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Project structure
See [CLAUDE.md](CLAUDE.md). Roadmap: [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md).

## Privacy
Dreams are stored locally on-device (AsyncStorage). No accounts, no paid services.
