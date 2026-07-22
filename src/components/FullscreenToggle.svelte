<script lang="ts">
	import { isFullscreen, isFullscreenSupported, toggleFullscreen } from '$lib/fullscreen.js';
	import { t } from '$lib/i18n/index.js';

	// Support can only be answered in the browser; on the server the button stays
	// out of the markup rather than flashing in and then disappearing.
	let supported = $state(false);

	$effect(() => {
		supported = isFullscreenSupported();
	});

	let label = $derived($isFullscreen ? $t('fullscreen.exit') : $t('fullscreen.enter'));
</script>

{#if supported}
	<button
		type="button"
		onclick={() => toggleFullscreen()}
		class="flex items-center justify-center transition-colors hover:opacity-80"
		style="width: 40px; height: 40px; border-radius: 10px; background: var(--pill-bg); border: 1px solid var(--pill-border); color: var(--icon-muted);"
		aria-label={label}
		title={label}
	>
		{#if $isFullscreen}
			<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
			</svg>
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
			</svg>
		{/if}
	</button>
{/if}
