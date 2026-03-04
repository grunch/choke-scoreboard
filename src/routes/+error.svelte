<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	let statusCode = $state(404);
	let statusMessage = $state('Page not found');

	$effect(() => {
		const unsub = page.subscribe((p) => {
			statusCode = p.status;
			statusMessage = p.error?.message ?? 'Page not found';
		});
		return unsub;
	});
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
	<span class="text-6xl">🥋</span>
	<h1 class="mt-4 text-4xl font-bold" style="color: var(--text-primary);">{statusCode}</h1>
	<p class="mt-2 text-lg" style="color: var(--text-secondary);">{statusMessage}</p>
	<a
		href="{base}/"
		class="mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:opacity-90"
		style="background-color: var(--color-green-live, #1BA34E);"
	>
		Back to Scoreboard
	</a>
</div>
