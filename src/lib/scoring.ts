import type { MatchEvent } from './types.js';

/**
 * Calculate total score for a fighter.
 * Total = pt2 * 2 + pt3 * 3 + pt4 * 4
 */
export function calculateScore(pt2: number, pt3: number, pt4: number): number {
	return pt2 * 2 + pt3 * 3 + pt4 * 4;
}

/** Get Fighter 1's total score */
export function getF1Score(match: MatchEvent): number {
	return calculateScore(match.f1_pt2, match.f1_pt3, match.f1_pt4);
}

/** Get Fighter 2's total score */
export function getF2Score(match: MatchEvent): number {
	return calculateScore(match.f2_pt2, match.f2_pt3, match.f2_pt4);
}

/**
 * Determine the winner (or tie).
 * Returns: 1 = fighter 1 leads, 2 = fighter 2 leads, 0 = tied
 *
 * Tiebreaker order: total score → advantages → fewer penalties
 */
export function getLeader(match: MatchEvent): 0 | 1 | 2 {
	const s1 = getF1Score(match);
	const s2 = getF2Score(match);

	if (s1 !== s2) return s1 > s2 ? 1 : 2;

	// Tiebreak by advantages
	if (match.f1_adv !== match.f2_adv) return match.f1_adv > match.f2_adv ? 1 : 2;

	// Tiebreak by fewer penalties
	if (match.f1_pen !== match.f2_pen) return match.f1_pen < match.f2_pen ? 1 : 2;

	return 0;
}

/**
 * Calculate remaining time in seconds for an in-progress match.
 * Returns 0 if time has expired.
 */
export function getRemainingSeconds(match: MatchEvent): number {
	if (match.status !== 'in-progress' || !match.start_at) return 0;

	const now = Math.floor(Date.now() / 1000);
	const endTime = match.start_at + match.duration;
	const remaining = endTime - now;

	return Math.max(0, remaining);
}

/**
 * Format seconds into MM:SS string.
 */
export function formatTime(totalSeconds: number): string {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get display time for a match based on its status.
 */
export function getDisplayTime(match: MatchEvent): string {
	switch (match.status) {
		case 'waiting':
			return formatTime(match.duration);
		case 'in-progress':
			return formatTime(getRemainingSeconds(match));
		case 'finished':
		case 'canceled':
			return '--:--';
	}
}

/**
 * Check if timer is in warning zone (last 30 seconds).
 */
export function isTimerWarning(match: MatchEvent): boolean {
	if (match.status !== 'in-progress') return false;
	const remaining = getRemainingSeconds(match);
	return remaining > 0 && remaining <= 30;
}
