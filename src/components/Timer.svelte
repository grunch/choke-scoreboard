<script lang="ts">
	import type { MatchEvent } from '$lib/types.js';
	import { formatTime, getRemainingSeconds, isTimerWarning } from '$lib/scoring.js';

	interface Props {
		match: MatchEvent;
		large?: boolean;
	}

	let { match, large = false }: Props = $props();

	let displayTime = $state(computeDisplay());
	let warning = $state(false);
	let expired = $state(false);

	function computeDisplay(): string {
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

	function updateTimer(): void {
		displayTime = computeDisplay();
		warning = isTimerWarning(match);
		expired = match.status === 'in-progress' && getRemainingSeconds(match) === 0;
	}

	// Manage the countdown interval reactively.
	// Runs whenever status, start_at or duration changes (e.g. waiting → in-progress).
	// Starts the interval when in-progress, clears it on any other status change.
	$effect(() => {
		void match.status;
		void match.start_at;
		void match.duration;

		updateTimer();

		if (match.status !== 'in-progress') return;

		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	});
</script>

<div
	class="font-mono font-bold tracking-wider {large ? 'text-4xl' : 'text-xl'} {warning ? 'animate-pulse-live' : ''}"
	style="color: {warning ? 'var(--color-gold, #F5B800)' : expired ? 'var(--color-red-penalty, #C0392B)' : 'var(--text-secondary)'}"
>
	{displayTime}
</div>
