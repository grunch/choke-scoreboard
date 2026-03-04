# Architecture

## Project Structure

```text
src/
├── lib/
│   ├── types.ts          # TypeScript type definitions
│   ├── nostr.ts          # Nostr connection & event parsing
│   ├── scoring.ts        # Score calculation & timer logic
│   ├── debug-matches.ts  # 8 hardcoded demo matches
│   └── stores.ts         # Svelte writable stores
├── components/
│   ├── MatchCard.svelte  # Match display card (compact/broadcast)
│   ├── Header.svelte     # App header with theme toggle
│   ├── StatusBadge.svelte# Match status indicator
│   ├── Timer.svelte      # Countdown timer
│   └── PubkeyInput.svelte# Pubkey input & controls
├── routes/
│   ├── +layout.svelte    # Root layout with Header & Footer
│   ├── +layout.ts        # SPA config (prerender + no SSR)
│   ├── +page.svelte      # Home/scoreboard page
│   ├── match/[id]/
│   │   └── +page.svelte  # Match detail view
│   └── +error.svelte     # Error/404 page
└── app.html              # HTML shell
```

## Svelte 5 Runes

This project uses Svelte 5's rune system exclusively:

- **`$state`** — Reactive local state declarations
- **`$derived`** — Computed values that auto-update
- **`$effect`** — Side effects (store subscriptions, timers)
- **`$props`** — Component property declarations

No legacy `$:` reactive statements are used.

## State Management

State is managed via Svelte writable stores in `src/lib/stores.ts`:

| Store | Type | Purpose |
|-------|------|---------|
| `matchesMap` | `Map<string, MatchEvent>` | All loaded matches |
| `viewMode` | `'compact' \| 'broadcast'` | Current display mode |
| `debugMode` | `boolean` | Debug mode toggle |
| `activePubkey` | `string` | Connected organizer's pubkey |
| `isLoading` | `boolean` | Loading indicator |
| `theme` | `'dark' \| 'light'` | Current theme |

## Data Flow

```text
Nostr Relays → SimplePool → parseMatchEvent() → upsertMatch() → matchesMap store → Components
```

1. User enters a pubkey and clicks "Load"
2. `subscribeToMatches()` opens a SimplePool subscription
3. Incoming events are parsed via `parseMatchEvent()`
4. Valid matches are upserted into `matchesMap` (deduped by id, newest wins)
5. Components reactively re-render when the store updates

## Static SPA Mode

The app is configured as a static SPA:

- `adapter-static` with `fallback: '404.html'`
- `ssr = false` and `prerender = true` in `+layout.ts`
- All routing is client-side
