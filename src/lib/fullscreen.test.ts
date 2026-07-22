import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	isFullscreen,
	isFullscreenSupported,
	syncFullscreenState,
	toggleFullscreen,
	watchFullscreen,
	type FullscreenDocument
} from './fullscreen.js';

/**
 * Fullscreen is what turns a laptop on a table into a scoreboard on a wall, and
 * the room does not care whether a match is open yet: the operator hits it once,
 * when they open the page. These tests hold the API handling that makes that
 * work everywhere — the standard call, Safari's prefixed one, and the browsers
 * that simply say no.
 *
 * They run without a DOM on purpose. Every function takes the document it acts
 * on, so a plain object is enough to prove the branches.
 */

type Listener = () => void;

/** A stand-in document that records what the module asked the browser to do. */
function fakeDocument(
	options: {
		readonly prefixed?: boolean;
		readonly supported?: boolean;
		readonly rejects?: boolean;
	} = {}
) {
	const { prefixed = false, supported = true, rejects = false } = options;
	const listeners = new Map<string, Set<Listener>>();
	const calls = { request: 0, exit: 0 };

	const answer = () => (rejects ? Promise.reject(new Error('denied')) : Promise.resolve());

	const doc = {
		fullscreenElement: null as unknown,
		documentElement: {} as Record<string, unknown>,
		addEventListener(type: string, fn: Listener) {
			if (!listeners.has(type)) listeners.set(type, new Set());
			listeners.get(type)!.add(fn);
		},
		removeEventListener(type: string, fn: Listener) {
			listeners.get(type)?.delete(fn);
		}
	} as Record<string, unknown>;

	if (supported) {
		const requestKey = prefixed ? 'webkitRequestFullscreen' : 'requestFullscreen';
		const exitKey = prefixed ? 'webkitExitFullscreen' : 'exitFullscreen';
		(doc.documentElement as Record<string, unknown>)[requestKey] = () => {
			calls.request++;
			return answer();
		};
		doc[exitKey] = () => {
			calls.exit++;
			return answer();
		};
	}

	if (prefixed) {
		doc.fullscreenElement = undefined;
		doc.webkitFullscreenElement = null;
	}

	return {
		doc: doc as unknown as FullscreenDocument,
		calls,
		/** Pretend the browser entered or left fullscreen, and told the page. */
		setElement(element: unknown) {
			doc[prefixed ? 'webkitFullscreenElement' : 'fullscreenElement'] = element;
		},
		fire(type = 'fullscreenchange') {
			for (const fn of listeners.get(type) ?? []) fn();
		},
		listenerCount(type = 'fullscreenchange') {
			return listeners.get(type)?.size ?? 0;
		}
	};
}

beforeEach(() => {
	isFullscreen.set(false);
});

describe('detecting support', () => {
	it('says yes when the browser has the standard API', () => {
		expect(isFullscreenSupported(fakeDocument().doc)).toBe(true);
	});

	it('says yes when the browser only has the prefixed API', () => {
		expect(isFullscreenSupported(fakeDocument({ prefixed: true }).doc)).toBe(true);
	});

	it('says no where fullscreen does not exist, so no dead button is shown', () => {
		// An iPhone is the real case: no Fullscreen API on the phone at all
		expect(isFullscreenSupported(fakeDocument({ supported: false }).doc)).toBe(false);
	});
});

describe('toggling', () => {
	it('enters fullscreen when the page is not in it', async () => {
		// Arrange
		const browser = fakeDocument();

		// Act
		await toggleFullscreen(browser.doc);

		// Assert
		expect(browser.calls).toEqual({ request: 1, exit: 0 });
	});

	it('leaves fullscreen when the page is already in it', async () => {
		// Arrange — the browser reports an element owning the screen
		const browser = fakeDocument();
		browser.setElement({});

		// Act
		await toggleFullscreen(browser.doc);

		// Assert
		expect(browser.calls).toEqual({ request: 0, exit: 1 });
	});

	it('uses the prefixed API when that is all Safari offers', async () => {
		// Arrange
		const browser = fakeDocument({ prefixed: true });

		// Act
		await toggleFullscreen(browser.doc);

		// Assert
		expect(browser.calls.request).toBe(1);
	});

	it('reports the state the browser actually ended up in', async () => {
		// Arrange — entering fullscreen succeeds and the element appears
		const browser = fakeDocument();
		const request = browser.doc.documentElement.requestFullscreen!;
		browser.doc.documentElement.requestFullscreen = () => {
			browser.setElement({});
			return request.call(browser.doc.documentElement);
		};

		// Act
		await toggleFullscreen(browser.doc);

		// Assert — the store does not wait for the change event to catch up
		expect(get(isFullscreen)).toBe(true);
	});

	it('does not throw when the browser rejects the request', async () => {
		// Arrange — browsers refuse outside a user gesture, or when embedded
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const browser = fakeDocument({ rejects: true });

		// Act / Assert — the page keeps working, just not fullscreen
		await expect(toggleFullscreen(browser.doc)).resolves.toBeUndefined();
		expect(get(isFullscreen)).toBe(false);

		warn.mockRestore();
	});

	it('does nothing at all where the API is missing', async () => {
		// Arrange
		const browser = fakeDocument({ supported: false });

		// Act / Assert
		await expect(toggleFullscreen(browser.doc)).resolves.toBeUndefined();
		expect(get(isFullscreen)).toBe(false);
	});
});

describe('watching the browser', () => {
	it('follows fullscreen left by any other means, such as the Esc key', () => {
		// Arrange
		const browser = fakeDocument();
		const stop = watchFullscreen(browser.doc);
		browser.setElement({});
		browser.fire();
		expect(get(isFullscreen)).toBe(true);

		// Act — the user pressed Esc; the browser only tells us through the event
		browser.setElement(null);
		browser.fire();

		// Assert
		expect(get(isFullscreen)).toBe(false);
		stop();
	});

	it("also listens for Safari's prefixed event", () => {
		// Arrange
		const browser = fakeDocument({ prefixed: true });
		const stop = watchFullscreen(browser.doc);

		// Act
		browser.setElement({});
		browser.fire('webkitfullscreenchange');

		// Assert
		expect(get(isFullscreen)).toBe(true);
		stop();
	});

	it('removes its listeners when the component goes away', () => {
		// Arrange
		const browser = fakeDocument();

		// Act
		const stop = watchFullscreen(browser.doc);
		stop();

		// Assert — nothing left holding the store after a navigation
		expect(browser.listenerCount()).toBe(0);
		expect(browser.listenerCount('webkitfullscreenchange')).toBe(0);
	});

	it('starts from the state the page is already in', () => {
		// Arrange — a reload while fullscreen, or a second component mounting
		const browser = fakeDocument();
		browser.setElement({});

		// Act
		syncFullscreenState(browser.doc);

		// Assert
		expect(get(isFullscreen)).toBe(true);
	});
});
