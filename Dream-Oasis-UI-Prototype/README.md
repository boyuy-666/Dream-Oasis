# Dream Oasis — Night Garden UI Prototype

Interactive, high-fidelity iOS prototype of the approved **B — Night Garden** direction.
Plain HTML, CSS and JavaScript. No build step, no dependencies, no paid services.
It is separate from the production Expo app and does not touch it.

## Open it

**Option 1 — double-click:** open `index.html` in Chrome, Edge or Safari.

**Option 2 — local server** (recommended, matches the published version exactly):

```bash
cd Dream-Oasis-UI-Prototype
python -m http.server 8765
```

Then visit http://localhost:8765. On Windows use `py -m http.server 8765` if `python` is not on PATH.

To try it on your iPhone, run the server on your computer and open `http://<your-computer-ip>:8765`
in Safari on the same Wi-Fi. On a phone the device frame disappears and the app fills the screen.

## What you can do

- **Home:** greeting, pending card, Record CTA, stats (dreams, night streak, cards), recent dreams.
- **Card reveal:** tap *Reveal* on the waiting card (The Glass Orchard), then tap the card to flip it.
- **Record:** switch Quick / Detailed, tap *Use a sample dream*, pick up to 3 emotions,
  add people, place, symbols, vividness and lucid flag. Save with an empty entry to see validation.
  Saving grows a new card from your text and opens the reveal.
- **Collection:** two-column grid, rarity summary, rarity filters, sort menu, card detail sheet
  with *Turn card over*.
- Desktop side panel: jump to any screen, toggle the empty collection state, reset.

## Structure

```
index.html            App shell, screens and overlays (markup only)
css/tokens.css        Design tokens: palette, type scale, spacing, radius, motion
css/app.css           Device shell + shared components (buttons, chips, fields,
                      segmented control, tab bar, stat tiles, rows, sheet, toast)
css/cards.css         Dream Card system: container-query sizing, rarity treatments, flip
css/screens.css       Home, Record, Reveal, Collection, Detail layouts
js/data.js            Mock journal (8 dreams) and sample dream
js/art.js             Botanical SVG artwork engine (10 motifs) + card back + ornaments
js/components.js      Reusable render helpers (card, card back, row, chip, icons, dates)
js/app.js             State, navigation, recording, card growth, reveal, collection
```

## Design system summary

| Token | Value | Use |
|---|---|---|
| Moss Night | `#0F1613` | Background |
| Greenhouse | `#18221E` | Surfaces |
| Moth Paper | `#ECE7DA` | Primary text, selected chips |
| Glow | `#C9E86B` | Primary action, focus, legendary — used sparingly |
| Night Bloom | `#E8A0AE` | Flowers, epic rarity |
| Lichen | `#A9B3A7` | Secondary text |
| Fern | `#2F3E36` | Lines and borders |

Display: Instrument Serif · Body: Instrument Sans (Google Fonts; falls back to system fonts offline).

Rarity is shown by frame and finish, not only colour: **Common** single hairline, matte art ·
**Rare** double rule + leaf sprigs on two corners · **Epic** night-bloom vines on all corners + pearl sheen ·
**Legendary** living gradient frame, full vine border, moving foil, glow halo and more fireflies.
