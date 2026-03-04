<script lang="ts">
	import { onMount } from 'svelte';
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

	onMount(() => {
		updateTimer();
		if (match.status !== 'in-progress') return;

		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	});

	// Re-compute when match prop changes externally
	$effect(() => {
		// Access match fields to create dependency
		void match.status;
		void match.start_at;
		void match.duration;
		updateTimer();
	});
</script>

<div
	class="font-mono font-bold tracking-wider {large ? 'text-4xl' : 'text-xl'} {warning ? 'animate-pulse-live' : ''}"
	style="color: {warning ? 'var(--color-gold, #F5B800)' : expired ? 'var(--color-red-penalty, #C0392B)' : 'var(--text-secondary)'}"
>
	{displayTime}
</div>
