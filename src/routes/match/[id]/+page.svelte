<script lang="ts">
	import { page } from '$app/stores';
	import { matchesMap } from '$lib/stores.js';
	import { getF1Score, getF2Score, getLeader } from '$lib/scoring.js';
	import StatusBadge from '../../../components/StatusBadge.svelte';
	import Timer from '../../../components/Timer.svelte';
	import type { MatchEvent } from '$lib/types.js';
	import { base } from '$app/paths';

	let matchId = $state('');
	let match = $state<MatchEvent | undefined>(undefined);

	$effect(() => {
		const unsub = page.subscribe((p) => {
			matchId = p.params.id ?? '';
		});
		return unsub;
	});

	$effect(() => {
		const unsub = matchesMap.subscribe((map) => {
			if (matchId) {
				match = map.get(matchId);
			}
		});
		return unsub;
	});

	let f1Score = $derived(match ? getF1Score(match) : 0);
	let f2Score = $derived(match ? getF2Score(match) : 0);
	let leader = $derived(match ? getLeader(match) : 0);
</script>

<svelte:head>
	<title>{match ? `${match.f1_name} vs ${match.f2_name}` : 'Match'} — Choke Scoreboard</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-6">
	<!-- Back navigation -->
	<a
		href="{base}/"
		class="mb-6 inline-flex items-center gap-1 text-sm no-underline transition-colors hover:opacity-80"
		style="color: var(--text-secondary);"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="15 18 9 12 15 6" />
		</svg>
		Back to scoreboard
	</a>

	{#if match}
		<div class="rounded-xl border p-6 md:p-8" style="background-color: var(--bg-card); border-color: {match.status === 'in-progress' ? 'var(--color-green-live)' : 'var(--border-color)'};">
			<!-- Status & Timer -->
			<div class="mb-6 flex items-center justify-between">
				<StatusBadge status={match.status} />
				<Timer {match} large={true} />
			</div>

			<!-- Fighters -->
			<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8">
				<!-- Fighter 1 -->
				<div class="text-center">
					<div
						class="mx-auto mb-3 h-2 w-24 rounded-full"
						style="background-color: {match.f1_color || '#2563eb'};"
					></div>
					<p class="text-lg font-bold md:text-xl" style="color: var(--text-primary);">
						{match.f1_name}
					</p>
					<div class="mt-2 flex items-center justify-center gap-2">
						<span
							class="font-mono text-6xl font-extrabold md:text-7xl {leader === 1 && (match.status === 'in-progress' || match.status === 'finished') ? 'animate-pulse-live' : ''}"
							style="color: var(--text-primary);"
						>
							{f1Score}
						</span>
						{#if match.status === 'finished' && leader === 1}
							<span class="animate-bounce text-3xl">🏆</span>
						{/if}
					</div>
					<!-- Detail stats -->
					<div class="mt-4 space-y-1 text-sm" style="color: var(--text-secondary);">
						<div class="flex justify-center gap-4">
							<span>2pt: <strong>{match.f1_pt2}</strong></span>
							<span>3pt: <strong>{match.f1_pt3}</strong></span>
							<span>4pt: <strong>{match.f1_pt4}</strong></span>
						</div>
						<div class="flex justify-center gap-3">
							{#if match.f1_adv > 0}
								<span class="rounded px-2 py-0.5 text-xs font-medium" style="background-color: var(--color-gold, #F5B800); color: #000;">
									ADV {match.f1_adv}
								</span>
							{/if}
							{#if match.f1_pen > 0}
								<span class="rounded px-2 py-0.5 text-xs font-medium text-white" style="background-color: var(--color-red-penalty, #C0392B);">
									PEN {match.f1_pen}
								</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- VS -->
				<div class="text-center text-2xl font-bold" style="color: var(--text-secondary);">VS</div>

				<!-- Fighter 2 -->
				<div class="text-center">
					<div
						class="mx-auto mb-3 h-2 w-24 rounded-full"
						style="background-color: {match.f2_color || '#dc2626'};"
					></div>
					<p class="text-lg font-bold md:text-xl" style="color: var(--text-primary);">
						{match.f2_name}
					</p>
					<div class="mt-2 flex items-center justify-center gap-2">
						<span
							class="font-mono text-6xl font-extrabold md:text-7xl {leader === 2 && (match.status === 'in-progress' || match.status === 'finished') ? 'animate-pulse-live' : ''}"
							style="color: var(--text-primary);"
						>
							{f2Score}
						</span>
						{#if match.status === 'finished' && leader === 2}
							<span class="animate-bounce text-3xl">🏆</span>
						{/if}
					</div>
					<!-- Detail stats -->
					<div class="mt-4 space-y-1 text-sm" style="color: var(--text-secondary);">
						<div class="flex justify-center gap-4">
							<span>2pt: <strong>{match.f2_pt2}</strong></span>
							<span>3pt: <strong>{match.f2_pt3}</strong></span>
							<span>4pt: <strong>{match.f2_pt4}</strong></span>
						</div>
						<div class="flex justify-center gap-3">
							{#if match.f2_adv > 0}
								<span class="rounded px-2 py-0.5 text-xs font-medium" style="background-color: var(--color-gold, #F5B800); color: #000;">
									ADV {match.f2_adv}
								</span>
							{/if}
							{#if match.f2_pen > 0}
								<span class="rounded px-2 py-0.5 text-xs font-medium text-white" style="background-color: var(--color-red-penalty, #C0392B);">
									PEN {match.f2_pen}
								</span>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<span class="text-5xl">🤷</span>
			<p class="mt-4 text-lg font-medium" style="color: var(--text-secondary);">Match not found</p>
			<p class="mt-1 text-sm" style="color: var(--text-secondary);">
				This match may not exist or hasn't been loaded yet.
			</p>
		</div>
	{/if}
</div>
