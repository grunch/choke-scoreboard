import { writable } from 'svelte/store';

/**
 * Fullscreen, for the whole app rather than one match.
 *
 * The operator sets a laptop in front of the mats and wants the browser out of
 * the way BEFORE anything is happening — while the list is still empty, waiting
 * for the first match. So the toggle lives here, next to a store any component
 * can read, instead of inside the match view that used to own it.
 *
 * Every function takes the document it acts on so the branches can be tested
 * without a DOM; in the app, nobody passes it.
 */

/** What a document offers, standard first, Safari's prefix second. */
export type FullscreenDocument = Document & {
	readonly webkitFullscreenElement?: Element | null;
	webkitExitFullscreen?: () => Promise<void> | void;
	documentElement: HTMLElement & {
		webkitRequestFullscreen?: () => Promise<void> | void;
	};
};

/** Whether the page currently owns the screen. */
export const isFullscreen = writable<boolean>(false);

function activeDocument(doc?: FullscreenDocument): FullscreenDocument | null {
	if (doc) return doc;
	return typeof document === 'undefined' ? null : (document as FullscreenDocument);
}

/** The element holding the screen, under whichever name the browser uses. */
function fullscreenElement(doc: FullscreenDocument): Element | null {
	return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

/**
 * Whether this browser can go fullscreen at all. An iPhone cannot — Safari on
 * the phone ships no Fullscreen API — and a button that does nothing is worse
 * than no button, so callers hide it when this is false.
 */
export function isFullscreenSupported(doc?: FullscreenDocument): boolean {
	const target = activeDocument(doc);
	if (!target) return false;
	const root = target.documentElement;
	return (
		typeof root?.requestFullscreen === 'function' ||
		typeof root?.webkitRequestFullscreen === 'function'
	);
}

/** Read the browser's actual state into the store. */
export function syncFullscreenState(doc?: FullscreenDocument): void {
	const target = activeDocument(doc);
	isFullscreen.set(!!target && !!fullscreenElement(target));
}

/**
 * Enter fullscreen, or leave it if the page is already there.
 *
 * Browsers reject this outside a user gesture, inside a cross-origin frame, or
 * by policy. The page works either way — it is a scoreboard with browser chrome
 * around it — so a refusal is logged and swallowed rather than surfaced.
 */
export async function toggleFullscreen(doc?: FullscreenDocument): Promise<void> {
	const target = activeDocument(doc);
	if (!target) return;

	try {
		if (fullscreenElement(target)) {
			const exit = target.exitFullscreen ?? target.webkitExitFullscreen;
			if (exit) await exit.call(target);
		} else {
			const root = target.documentElement;
			const request = root.requestFullscreen ?? root.webkitRequestFullscreen;
			if (request) await request.call(root);
		}
	} catch (err) {
		console.warn('Fullscreen request rejected:', err);
	}

	// The change event is the source of truth, but it can arrive a frame later;
	// reading the state now keeps the label from lagging behind the click.
	syncFullscreenState(target);
}

/**
 * Keep the store honest about fullscreen the app did not ask for: Esc, F11, the
 * browser's own control. Returns the cleanup a Svelte `$effect` hands back.
 */
export function watchFullscreen(doc?: FullscreenDocument): () => void {
	const target = activeDocument(doc);
	if (!target) return () => {};

	const onChange = () => syncFullscreenState(target);
	target.addEventListener('fullscreenchange', onChange);
	target.addEventListener('webkitfullscreenchange', onChange);
	syncFullscreenState(target);

	return () => {
		target.removeEventListener('fullscreenchange', onChange);
		target.removeEventListener('webkitfullscreenchange', onChange);
	};
}
