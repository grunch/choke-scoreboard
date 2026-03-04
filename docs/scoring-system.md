# Scoring System

## BJJ Point Values

| Move | Points | Examples |
|------|--------|----------|
| 2-point moves | 2 | Takedown, Sweep |
| 3-point moves | 3 | Guard Pass |
| 4-point moves | 4 | Mount, Back Take |

## Score Calculation

```typescript
totalScore = (pt2 * 2) + (pt3 * 3) + (pt4 * 4)
```

The data model stores **counts of moves**, not raw point totals:
- `f1_pt2 = 2` means Fighter 1 scored two 2-point moves = 4 points
- `f1_pt3 = 1` means Fighter 1 scored one 3-point move = 3 points
- `f1_pt4 = 1` means Fighter 1 scored one 4-point move = 4 points
- **Total: 4 + 3 + 4 = 11 points**

## Advantages & Penalties

- **Advantages (adv):** Near-successful attacks or better positional play. Displayed in gold.
- **Penalties (pen):** Rule infractions. Displayed in red.

These are supplementary indicators — they don't add to the point total but serve as tiebreakers.

## Winner Determination

The leader is determined in this order:

1. **Total score** — Higher score wins
2. **Advantages** — More advantages wins (tiebreaker)
3. **Fewer penalties** — Fewer penalties wins (tiebreaker)
4. **Tied** — If all equal, match is a draw

```typescript
function getLeader(match: MatchEvent): 0 | 1 | 2 {
  // 0 = tied, 1 = fighter 1 leads, 2 = fighter 2 leads
}
```

## Visual Indicators

- **Leading fighter's score** pulses with `animate-pulse-live` animation
- **Trophy icon (🏆)** bounces next to the winner on finished matches
- **Advantage badges** shown in gold (`#F5B800`)
- **Penalty badges** shown in red (`#C0392B`)
