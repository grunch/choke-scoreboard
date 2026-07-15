import { describe, expect, it } from 'vitest';

import {
	ALL_MATCH_STATUSES,
	DEFAULT_STATUS_FILTER,
	getSortedMatches
} from './stores.js';
import type { MatchEvent, MatchStatus } from './types.js';

/**
 * The list has to show two things at once: the matches that are happening and
 * the matches about to happen — and NOT the pile of finished ones from earlier
 * in the day. The status filter is what keeps a live wall from drowning in
 * `FINISHED` cards, and its default is the whole reason it exists: waiting and
 * in-progress, nothing else, until somebody asks for more.
 */
const NOW = 1_700_000_000;

function match(over: Partial<MatchEvent> = {}): MatchEvent {
	return {
		id: 'abcd',
		status: 'in-progress',
		duration: 300,
		f1_name: 'Bob',
		f2_name: 'Carlos',
		f1_pt2: 0,
		f2_pt2: 0,
		f1_pt3: 0,
		f2_pt3: 0,
		f1_pt4: 0,
		f2_pt4: 0,
		f1_adv: 0,
		f2_adv: 0,
		f1_pen: 0,
		f2_pen: 0,
		created_at: NOW,
		...over
	};
}

function mapOf(...matches: MatchEvent[]): Map<string, MatchEvent> {
	return new Map(matches.map((m) => [m.id, m]));
}

describe('the default status filter', () => {
	it('is exactly waiting and in-progress', () => {
		// Arrange / Act — the set every fresh visit starts from
		const set = new Set(DEFAULT_STATUS_FILTER);

		// Assert — the live and about-to-be-live matches, and nothing done
		expect(set).toEqual(new Set<MatchStatus>(['waiting', 'in-progress']));
		expect(set.has('finished')).toBe(false);
		expect(set.has('canceled')).toBe(false);
	});

	it('lists every status the board knows how to show', () => {
		expect(new Set(ALL_MATCH_STATUSES)).toEqual(
			new Set<MatchStatus>(['in-progress', 'waiting', 'finished', 'canceled'])
		);
	});
});

describe('getSortedMatches with a status filter', () => {
	it('shows only matches whose status is allowed', () => {
		// Arrange — one of each status, all fresh
		const map = mapOf(
			match({ id: 'live', status: 'in-progress' }),
			match({ id: 'next', status: 'waiting' }),
			match({ id: 'done', status: 'finished' }),
			match({ id: 'gone', status: 'canceled' })
		);

		// Act — the default filter
		const result = getSortedMatches(map, NOW, new Set(DEFAULT_STATUS_FILTER));

		// Assert — the two done ones are hidden
		expect(result.map((m) => m.id)).toEqual(['live', 'next']);
	});

	it('adds finished matches once the filter allows them', () => {
		// Arrange
		const map = mapOf(
			match({ id: 'live', status: 'in-progress' }),
			match({ id: 'done', status: 'finished' })
		);

		// Act — the user turned FINISHED on
		const result = getSortedMatches(
			map,
			NOW,
			new Set<MatchStatus>(['in-progress', 'finished'])
		);

		// Assert
		expect(result.map((m) => m.id)).toEqual(['live', 'done']);
	});

	it('shows nothing when the filter is empty', () => {
		// Arrange
		const map = mapOf(match({ id: 'live', status: 'in-progress' }));

		// Act — every status turned off
		const result = getSortedMatches(map, NOW, new Set<MatchStatus>());

		// Assert
		expect(result).toEqual([]);
	});

	it('shows every fresh match when no filter is passed', () => {
		// Arrange
		const map = mapOf(
			match({ id: 'live', status: 'in-progress' }),
			match({ id: 'done', status: 'finished' })
		);

		// Act — the old two-argument call site
		const result = getSortedMatches(map, NOW);

		// Assert — nothing filtered out
		expect(result.map((m) => m.id).sort()).toEqual(['done', 'live']);
	});

	it('still sorts in-progress before waiting inside the filtered set', () => {
		// Arrange — waiting added before live, both allowed
		const map = mapOf(
			match({ id: 'next', status: 'waiting', created_at: NOW }),
			match({ id: 'live', status: 'in-progress', created_at: NOW - 100 })
		);

		// Act
		const result = getSortedMatches(map, NOW, new Set(DEFAULT_STATUS_FILTER));

		// Assert — status order wins over recency
		expect(result.map((m) => m.id)).toEqual(['live', 'next']);
	});

	it('drops aged-out matches even when their status is allowed', () => {
		// Arrange — an in-progress match older than the visible window
		const map = mapOf(
			match({ id: 'stale', status: 'in-progress', created_at: NOW - 90_000 }),
			match({ id: 'live', status: 'in-progress', created_at: NOW })
		);

		// Act
		const result = getSortedMatches(map, NOW, new Set(DEFAULT_STATUS_FILTER));

		// Assert — freshness and status filter both apply
		expect(result.map((m) => m.id)).toEqual(['live']);
	});
});
