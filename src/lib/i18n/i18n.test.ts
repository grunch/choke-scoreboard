import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';

import { en } from './en.js';
import { defineCatalog, LOCALES, locale, t, translate, type MessageKey } from './index.js';

/**
 * The scoreboard hangs on a wall in a room where nobody is reading English by
 * choice. These tests guard the two ways a translation system fails in public:
 * a message that never got translated, and a message that got translated but
 * lost the number inside it.
 */
describe('the message catalog', () => {
	it('has no empty message', () => {
		// Arrange — an empty string is worse than an untranslated one: it shows a
		// blank spot on the wall, and there is nothing to grep for
		const empty = (Object.keys(en) as MessageKey[]).filter((key) => {
			const message = en[key];
			return typeof message === 'string' && message.trim().length === 0;
		});

		expect(empty).toEqual([]);
	});

	it('ships English, and starts in English', () => {
		expect(LOCALES).toContain('en');
		expect(get(locale)).toBe('en');
	});
});

describe('translating', () => {
	it('returns the message for a key', () => {
		expect(get(t)('status.live')).toBe('LIVE');
	});

	it('puts the values inside the message, not around it', () => {
		// The whole point of a message function: the translator owns the word
		// order, so a language that says "Bob contra Carlos" can say it
		const title = get(t)('title.match', 'Bob', 'Carlos');

		expect(title).toContain('Bob');
		expect(title).toContain('Carlos');
	});

	it('works outside a component, where a store cannot be subscribed', () => {
		expect(translate()('status.paused')).toBe('PAUSED');
	});
});

/**
 * `1 match` / `2 matches` is not string concatenation. English needs two forms,
 * Spanish two, Polish three, Arabic six — so the count and its noun belong in
 * one message the translator owns, and the rule has to come from
 * Intl.PluralRules instead of a `!== 1 ? 'es' : ''` glued onto a template.
 */
/**
 * A missing key already fails the build; the harder failure is a key that is
 * present but dropped a parameter — `home.matchCount: () => 'matches'` typechecks
 * against a plain function type, and the number is gone. `defineCatalog` is what
 * closes that gap, and these `@ts-expect-error`s fail `svelte-check` if it ever
 * stops closing it. (Vitest strips types, so at runtime these calls just pass.)
 */
describe('defineCatalog enforces parameter arity', () => {
	it('accepts a catalog whose messages keep every parameter', () => {
		const catalog = defineCatalog({ ...en });

		expect(catalog['status.live']).toBe('LIVE');
	});

	it('rejects a message that dropped its count or a fighter', () => {
		// @ts-expect-error — home.matchCount lost its `count`
		defineCatalog({ ...en, 'home.matchCount': () => 'matches' });
		// @ts-expect-error — title.match lost its second fighter
		defineCatalog({ ...en, 'title.match': (f1: string) => f1 });

		expect(true).toBe(true);
	});
});

describe('counting matches', () => {
	it('says one match in the singular', () => {
		expect(get(t)('home.matchCount', 1)).toBe('1 match');
	});

	it('says the plural for everything else', () => {
		expect(get(t)('home.matchCount', 0)).toBe('0 matches');
		expect(get(t)('home.matchCount', 2)).toBe('2 matches');
		expect(get(t)('home.matchCount', 11)).toBe('11 matches');
	});
});
