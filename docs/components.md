# Components

## Header (`src/components/Header.svelte`)

Top navigation bar with the app title and theme toggle.

**Features:**
- App title "🥋 Choke Scoreboard" (links to home)
- Dark/Light theme toggle button
- Sticky positioning with backdrop blur

**Props:** None

## PubkeyInput (`src/components/PubkeyInput.svelte`)

Input form for the organizer's Nostr public key.

**Features:**
- Text input accepting npub or hex pubkey
- "Load" button to start subscription
- "Debug Mode" button to load demo matches
- "Disconnect" button when connected
- Error display for invalid input
- Enter key support

**Props:** None

**State:** Connected/disconnected view modes

## MatchCard (`src/components/MatchCard.svelte`)

Main match display card with fighter scores.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `match` | `MatchEvent` | Match data |
| `mode` | `ViewMode` | `'compact'` or `'broadcast'` |

**Features:**
- Fighter names with colored panels
- Calculated total scores (large, mono font)
- Advantage (gold) and penalty (red) badges
- Status badge
- Countdown timer
- Winner indication (pulsing score, bouncing trophy)
- Point breakdown in broadcast mode
- Clickable → navigates to match detail
- Green glow border for live matches
- Dimmed appearance for canceled matches

## StatusBadge (`src/components/StatusBadge.svelte`)

Visual indicator for match status.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `status` | `MatchStatus` | Current match status |

**Renders:**
- `waiting` → Gray badge with clock icon
- `in-progress` → Green "LIVE" badge with pinging dot
- `finished` → Amber badge with bouncing trophy
- `canceled` → Red "CANCELED" badge

## Timer (`src/components/Timer.svelte`)

Countdown timer display.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `match` | `MatchEvent` | — | Match data for timer calculation |
| `large` | `boolean` | `false` | Large text mode for detail view |

**Behavior:**
- `waiting` → Shows total duration (e.g., "5:00")
- `in-progress` → Counts down every 1 second
- `finished`/`canceled` → Shows "--:--"
- Last 30 seconds → Gold color + pulse animation
