/**
 * Core data model for a BJJ match event received from Nostr.
 *
 * This represents a single match in a tournament. All scoring fields
 * are counts of specific point-value moves, not raw point totals.
 *
 * Total score = pt2 * 2 + pt3 * 3 + pt4 * 4
 */
export interface MatchEvent {
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
	/** Fighter 1 gi/panel color */
	f1_color?: string;
	/** Fighter 2 gi/panel color */
	f2_color?: string;
	/** Fighter 1 count of 2-point moves (takedown, sweep) */
	f1_pt2: number;
	/** Fighter 2 count of 2-point moves */
	f2_pt2: number;
	/** Fighter 1 count of 3-point moves (guard pass) */
	f1_pt3: number;
	/** Fighter 2 count of 3-point moves */
	f2_pt3: number;
	/** Fighter 1 count of 4-point moves (mount, back take) */
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

export type MatchStatus = 'waiting' | 'in-progress' | 'finished' | 'canceled';

export type ViewMode = 'compact' | 'broadcast';

export interface AppConfig {
	pubkey: string;
	viewMode: ViewMode;
	debugMode: boolean;
}
