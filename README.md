# 🥋 Choke Scoreboard

Real-time BJJ (Brazilian Jiu-Jitsu) match scoreboard powered by [Nostr](https://nostr.com).

## What is this?

Choke Scoreboard is a **read-only scoreboard viewer** for BJJ tournaments. It subscribes to a tournament organizer's Nostr events (kind 31415) and displays match scores in real-time.

**It does NOT create matches** — it only displays them.

## Features

- 🔴 **Live scoring** — Real-time match updates via Nostr protocol
- ⏱️ **Countdown timer** — Automatic timer with warning animations
- 🏆 **Winner indication** — Visual highlighting of the leading fighter
- 📺 **Two view modes** — Compact grid and Broadcast (large) views
- 🌙 **Dark/Light theme** — Toggle between themes
- 🐛 **Debug mode** — 8 demo matches for testing
- 📱 **Responsive** — Works on mobile and desktop

## Tech Stack

- **[SvelteKit](https://svelte.dev)** with TypeScript and Svelte 5 runes
- **[TailwindCSS v4](https://tailwindcss.com)** for styling
- **[nostr-tools](https://github.com/nbd-wtf/nostr-tools)** for Nostr protocol
- **Static adapter** for GitHub Pages deployment

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How It Works

1. Enter a tournament organizer's Nostr public key (npub or hex)
2. The app subscribes to their kind 31415 events on default relays
3. Match scores update in real-time as the organizer publishes events
4. Click any match card to see the full detail view

## BJJ Scoring

| Move | Points |
|------|--------|
| Takedown / Sweep | 2 |
| Guard Pass | 3 |
| Mount / Back Take | 4 |

**Total Score** = (2pt moves × 2) + (3pt moves × 3) + (4pt moves × 4)

Tiebreakers: Advantages → Fewer Penalties

## Nostr Protocol

- **Event kind:** 31415 (parameterized replaceable)
- **d-tag:** Match ID
- **Content:** JSON with match fields

Default relays:
- `wss://relay.mostro.network` (kind 31415 is non-standard; most relays reject it)

## Documentation

See the [docs/](./docs/) folder for detailed technical documentation.

## Deployment

This project deploys automatically to GitHub Pages via GitHub Actions on push to `main`.

## License

MIT
