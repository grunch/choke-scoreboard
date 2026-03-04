# Nostr Protocol

## Event Kind

BJJ match events use **kind 31415** — a parameterized replaceable event kind.

### Why Parameterized Replaceable?

Parameterized replaceable events (kinds 30000-39999) are identified by `(pubkey, kind, d-tag)`. When the organizer publishes an update to a match, the relay replaces the old event with the new one (same d-tag). This ensures clients always see the latest state.

## Event Structure

```json
{
  "kind": 31415,
  "pubkey": "<organizer hex pubkey>",
  "created_at": 1709568000,
  "tags": [
    ["d", "<match-id>"]
  ],
  "content": "{\"id\":\"match-1\",\"status\":\"in-progress\",\"f1_name\":\"Fighter A\",\"f2_name\":\"Fighter B\",\"f1_pt2\":1,\"f2_pt2\":0,...}",
  "id": "<event-id>",
  "sig": "<signature>"
}
```

## Subscription Filter

```json
{
  "kinds": [31415],
  "authors": ["<organizer-pubkey-hex>"],
  "since": "<now minus 24 hours>",
  "limit": 1000
}
```

## Deduplication

Since multiple relays may send the same event:

1. Each match is identified by its `d-tag` value (match ID)
2. When a duplicate arrives, we compare `created_at` timestamps
3. Only the newest version is kept in the store

## Default Relays

| Relay | Purpose |
|-------|---------|
| `wss://relay.mostro.network` | Primary relay — kind 31415 is non-standard, most relays reject it |

## Connection Management

- `SimplePool` from nostr-tools manages connections to multiple relays
- Subscriptions are cleaned up on disconnect or component unmount
- A 10-second timeout ensures loading state resolves even if EOSE never fires

## Pubkey Input

The app accepts:
- **npub** format (e.g., `npub1abc...`) — decoded via `nip19.decode()`
- **Hex** format (64-character hex string) — used directly
