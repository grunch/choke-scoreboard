# Data Models

## MatchEvent

The core data model representing a single BJJ match.

```typescript
interface MatchEvent {
  /** Unique match identifier (maps to Nostr d-tag) */
  id: string;
  /** Current state of the match */
  status: MatchStatus;
  /** Unix timestamp (seconds) when the match started */
  start_at?: number;
  /** Match duration in seconds (default 300 = 5 minutes) */
  duration: number;
  /** Fighter 1 display name */
  f1_name: string;
  /** Fighter 2 display name */
  f2_name: string;
  /** Fighter 1 gi/panel color (CSS color) */
  f1_color?: string;
  /** Fighter 2 gi/panel color (CSS color) */
  f2_color?: string;
  /** Fighter 1 count of 2-point moves */
  f1_pt2: number;
  /** Fighter 2 count of 2-point moves */
  f2_pt2: number;
  /** Fighter 1 count of 3-point moves */
  f1_pt3: number;
  /** Fighter 2 count of 3-point moves */
  f2_pt3: number;
  /** Fighter 1 count of 4-point moves */
  f1_pt4: number;
  /** Fighter 2 count of 4-point moves */
  f2_pt4: number;
  /** Fighter 1 advantages */
  f1_adv: number;
  /** Fighter 2 advantages */
  f2_adv: number;
  /** Fighter 1 penalties */
  f1_pen: number;
  /** Fighter 2 penalties */
  f2_pen: number;
  /** Nostr event created_at timestamp */
  created_at?: number;
  /** Nostr event author pubkey (hex) */
  pubkey?: string;
}
```

## MatchStatus

```typescript
type MatchStatus = 'waiting' | 'in-progress' | 'finished' | 'canceled';
```

## ViewMode

```typescript
type ViewMode = 'compact' | 'broadcast';
```

## AppConfig

```typescript
interface AppConfig {
  pubkey: string;
  viewMode: ViewMode;
  debugMode: boolean;
}
```

## Score Calculation

Fields `f1_pt2`, `f1_pt3`, `f1_pt4` represent **counts** of moves, not point totals.

```typescript
// Fighter 1 total score
const f1Total = (f1_pt2 * 2) + (f1_pt3 * 3) + (f1_pt4 * 4);

// Fighter 2 total score
const f2Total = (f2_pt2 * 2) + (f2_pt3 * 3) + (f2_pt4 * 4);
```
