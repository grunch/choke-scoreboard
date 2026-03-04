import { writable } from 'svelte/store';
import type { MatchEvent, ViewMode } from './types.js';

/** Map of match id → MatchEvent, reactive store */
export const matchesMap = writable<Map<string, MatchEvent>>(new Map());

/** Current view mode */
export const viewMode = writable<ViewMode>('compact');

/** Whether debug mode is active */
export const debugMode = writable<boolean>(false);

/** Currently subscribed organizer pubkey (hex) */
export const activePubkey = writable<string>('');

/** Loading state for Nostr subscription */
export const isLoading = writable<boolean>(false);

/** Theme: 'dark' | 'light' */
export const theme = writable<'dark' | 'light'>('dark');

/**
 * Upsert a match into the store.
 * Only replaces if the new event has a newer created_at.
 */
export function upsertMatch(match: MatchEvent): void {
	matchesMap.update((map) => {
		const existing = map.get(match.id);
		if (!existing || (match.created_at ?? 0) >= (existing.created_at ?? 0)) {
			map.set(match.id, match);
		}
		return new Map(map); // new reference for reactivity
	});
}

/** Clear all matches */
export function clearMatches(): void {
	matchesMap.set(new Map());
}

/** Get sorted matches array (in-progress first, then by created_at desc) */
export function getSortedMatches(map: Map<string, MatchEvent>): MatchEvent[] {
	const arr = Array.from(map.values());

	const statusOrder: Record<string, number> = {
		'in-progress': 0,
		waiting: 1,
		finished: 2,
		canceled: 3
	};

	return arr.sort((a, b) => {
		const statusDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
		if (statusDiff !== 0) return statusDiff;
		return (b.created_at ?? 0) - (a.created_at ?? 0);
	});
}
