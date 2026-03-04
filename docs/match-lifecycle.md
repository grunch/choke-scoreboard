# Match Lifecycle

## State Machine

```text
┌─────────┐    start    ┌─────────────┐    end     ┌──────────┐
│ waiting  │───────────→│ in-progress  │──────────→│ finished  │
└─────────┘             └─────────────┘            └──────────┘
     │                        │
     │       cancel           │ cancel
     └────────────────────────┴────────→ ┌──────────┐
                                         │ canceled  │
                                         └──────────┘
```

## States

### `waiting`
- Match created but not yet started
- Timer shows the total duration (e.g., "5:00")
- Gray status badge with clock icon
- No score animations

### `in-progress`
- Match is live, `start_at` timestamp is set
- Timer counts down: `start_at + duration - now`
- Updates every 1 second
- Green "LIVE" badge with pulsing dot
- Leading fighter's score pulses
- **Last 30 seconds:** Timer turns gold and pulses
- Card border glows green

### `finished`
- Match ended normally
- Timer shows "--:--"
- Trophy icon (🏆) badge
- Winner's trophy icon bounces
- Winner's score pulses

### `canceled`
- Match called off
- Timer shows "--:--"
- Red "CANCELED" badge
- Entire card is dimmed (50% opacity)

## Timer Logic

```typescript
// For in-progress matches:
remaining = start_at + duration - Math.floor(Date.now() / 1000)
remaining = Math.max(0, remaining)

// Format as MM:SS
display = `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')}`
```

## Real-Time Updates

Matches update in real-time via Nostr subscriptions:
1. The organizer publishes updated kind 31415 events
2. The subscriber receives them via SimplePool
3. Events are deduped by match ID (d-tag), keeping the newest `created_at`
4. The Svelte store triggers reactive re-renders
