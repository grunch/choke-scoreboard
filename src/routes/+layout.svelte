<script lang="ts">
	import '../app.css';
	import Header from '../components/Header.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Header />
	<main class="flex-1">
		{@render children()}
	</main>
	<footer class="border-t py-4 text-center text-xs" style="border-color: var(--border-color); color: var(--text-secondary);">
		<p>🥋 Choke Scoreboard — Real-time BJJ scoring via <a href="https://nostr.com" target="_blank" class="underline hover:opacity-80" style="color: var(--color-green-live);">Nostr</a></p>
	</footer>
</div>
