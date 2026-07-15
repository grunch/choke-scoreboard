<script lang="ts">
	import { ALL_MATCH_STATUSES, statusFilter, toggleStatusFilter } from '$lib/stores.js';
	import { t } from '$lib/i18n/index.js';
	import type { MatchStatus } from '$lib/types.js';

	/**
	 * The chips reuse the same words the badges use, so the filter and the cards
	 * say a match is LIVE with the same label. `in-progress` is LIVE here too.
	 */
	const STATUS_LABEL_KEYS = {
		'in-progress': 'status.live',
		waiting: 'status.waiting',
		finished: 'status.finished',
		canceled: 'status.canceled'
	} as const satisfies Record<MatchStatus, string>;
</script>

<div class="flex flex-wrap items-center gap-2" role="group" aria-label={$t('filter.label')}>
	<span class="text-xs font-medium" style="color: var(--text-secondary);">{$t('filter.label')}:</span>
	{#each ALL_MATCH_STATUSES as status (status)}
		{@const active = $statusFilter.has(status)}
		<button
			type="button"
			onclick={() => toggleStatusFilter(status)}
			aria-pressed={active}
			class="rounded-full px-3 py-1 text-xs font-semibold transition-colors hover:opacity-80"
			style={active
				? 'background-color: var(--color-green-live, #1BA34E); color: #fff;'
				: 'background-color: var(--bg-input); color: var(--text-secondary);'}
		>
			{$t(STATUS_LABEL_KEYS[status])}
		</button>
	{/each}
</div>
