<script lang="ts">
	import { decodePubkey, subscribeToMatches, closeSubscription } from '$lib/nostr.js';
	import { activePubkey, clearMatches, debugMode, isLoading, matchesMap } from '$lib/stores.js';
	import { getDebugMatches } from '$lib/debug-matches.js';
	import type { MatchEvent } from '$lib/types.js';

	let inputValue = $state('');
	let error = $state('');

	function handleLoad(): void {
		error = '';
		try {
			const hex = decodePubkey(inputValue);
			clearMatches();
			debugMode.set(false);
			activePubkey.set(hex);
			subscribeToMatches(hex);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Invalid pubkey';
		}
	}

	function handleDebug(): void {
		error = '';
		closeSubscription();
		clearMatches();
		debugMode.set(true);
		activePubkey.set('debug');
		isLoading.set(false);

		const matches = getDebugMatches();
		matchesMap.set(new Map<string, MatchEvent>(matches.map((m) => [m.id, m])));
	}

	function handleDisconnect(): void {
		closeSubscription();
		clearMatches();
		debugMode.set(false);
		activePubkey.set('');
		inputValue = '';
		error = '';
	}

	let connected = $state(false);

	$effect(() => {
		const unsub = activePubkey.subscribe((pk) => {
			connected = pk !== '';
		});
		return unsub;
	});
</script>

<div class="mx-auto w-full max-w-2xl space-y-3">
	{#if !connected}
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={inputValue}
				placeholder="Enter organizer npub or hex pubkey..."
				class="flex-1 rounded-lg border px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2"
				style="background-color: var(--bg-input); border-color: var(--border-color); color: var(--text-primary); --tw-ring-color: var(--color-green-live);"
				onkeydown={(e) => e.key === 'Enter' && handleLoad()}
			/>
			<button
				onclick={handleLoad}
				class="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
				style="background-color: var(--color-green-live, #1BA34E);"
			>
				Load
			</button>
		</div>
		<div class="flex items-center justify-between">
			{#if error}
				<p class="text-sm" style="color: var(--color-red-penalty);">{error}</p>
			{:else}
				<div></div>
			{/if}
			<button
				onclick={handleDebug}
				class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
				style="background-color: var(--bg-input); color: var(--text-secondary);"
			>
				🐛 Debug Mode
			</button>
		</div>
	{:else}
		<div class="flex items-center justify-between rounded-lg border px-4 py-2" style="background-color: var(--bg-input); border-color: var(--border-color);">
			<div class="flex items-center gap-2 text-sm" style="color: var(--text-secondary);">
				<span class="h-2 w-2 rounded-full" style="background-color: var(--color-green-live);"></span>
				<span>Connected</span>
			</div>
			<button
				onclick={handleDisconnect}
				class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
				style="background-color: var(--color-red-penalty, #C0392B); color: white;"
			>
				Disconnect
			</button>
		</div>
	{/if}
</div>
