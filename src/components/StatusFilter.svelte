<script lang="ts">
	import { ALL_MATCH_STATUSES, statusFilter, toggleStatusFilter } from '$lib/stores.js';
	import { t, type MessageKey } from '$lib/i18n/index.js';
	import type { MatchStatus } from '$lib/types.js';

	/**
	 * The chips reuse the same words the badges use, so the filter and the cards
	 * say a match is LIVE with the same label. `in-progress` is LIVE here too.
	 *
	 * Each status keeps its identity color when the chip is ON (design 2A);
	 * turned OFF, every chip goes to the same ghost outline — the color IS the
	 * on/off signal, which is why it cannot stay on an inactive chip.
	 */
	const CHIP_STYLES = {
		'in-progress': {
			labelKey: 'status.live',
			on: 'background: rgba(22,192,95,.16); border-color: rgba(22,192,95,.55); color: #3ee08a;'
		},
		waiting: {
			labelKey: 'status.waiting',
			on: 'background: rgba(244,180,0,.14); border-color: rgba(244,180,0,.5); color: #f4c453;'
		},
		finished: {
			labelKey: 'status.finished',
			on: 'background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.2); color: #cdd8ef;'
		},
		canceled: {
			labelKey: 'status.canceled',
			on: 'background: rgba(239,68,68,.14); border-color: rgba(239,68,68,.5); color: #fca5a5;'
		}
	} as const satisfies Record<MatchStatus, { labelKey: MessageKey; on: string }>;

	const CHIP_OFF = 'background: transparent; border-color: rgba(255,255,255,.12); color: #6b7890;';
</script>

<div class="flex flex-wrap items-center" style="gap: 10px;" role="group" aria-label={$t('filter.label')}>
	<span
		class="uppercase"
		style="font-family: 'Barlow Condensed', system-ui, sans-serif; font-weight: 600; font-size: 16px; letter-spacing: .1em; color: #5f6d8a; margin-right: 4px;"
		>{$t('filter.label')}</span
	>
	{#each ALL_MATCH_STATUSES as status (status)}
		{@const active = $statusFilter.has(status)}
		<button
			type="button"
			onclick={() => toggleStatusFilter(status)}
			aria-pressed={active}
			class="inline-flex cursor-pointer items-center transition-colors hover:opacity-80"
			style="gap: 7px; padding: 8px 16px; border-radius: 999px; border: 1px solid; font-family: 'Barlow Condensed', system-ui, sans-serif; font-weight: 700; font-size: 15px; letter-spacing: .1em; {active
				? CHIP_STYLES[status].on
				: CHIP_OFF}"
		>
			{#if status === 'in-progress' && active}
				<span
					class="animate-liveblink rounded-full"
					style="width: 7px; height: 7px; background: #2ee08a;"
				></span>
			{/if}
			{$t(CHIP_STYLES[status].labelKey)}
		</button>
	{/each}
</div>
