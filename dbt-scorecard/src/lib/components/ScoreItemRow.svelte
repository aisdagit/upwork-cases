<script lang="ts">
	import { scoreStatus, scoreStatusLabel, scoreStatusPillClass } from '$lib/types';
	import type { ScoreItem } from '$lib/types';

	let { item, onselect }: { item: ScoreItem; onselect: (id: string) => void } = $props();

	const status = $derived(scoreStatus(item.score));
	const barColor: Record<string, string> = {
		strong: 'var(--status-strong)',
		meets: 'var(--status-meets)',
		attention: 'var(--status-attention)'
	};
</script>

<button class="score-row" onclick={() => onselect(item.id)}>
	<div class="score-row-main">
		<span class="score-row-label">{item.label}</span>
		<div class="score-row-bar" role="presentation">
			<div class="score-row-bar-fill" style:width="{item.score}%" style:background={barColor[status]}></div>
		</div>
	</div>
	<span class="score-row-value mono">{item.score}%</span>
	<span class="pill {scoreStatusPillClass[status]}">{scoreStatusLabel[status]}</span>
	<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" class="score-row-chevron"
		><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg
	>
</button>

<style>
	.score-row {
		display: grid;
		grid-template-columns: 1fr auto auto auto;
		align-items: center;
		gap: 18px;
		width: 100%;
		padding: 16px 22px;
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--border);
		text-align: left;
		cursor: pointer;
		font-family: inherit;
		color: inherit;
	}
	.score-row:last-child {
		border-bottom: none;
	}
	.score-row:hover {
		background: var(--paper);
	}
	.score-row-main {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}
	.score-row-label {
		font-size: 14px;
		font-weight: 600;
	}
	.score-row-bar {
		width: 100%;
		max-width: 320px;
		height: 6px;
		border-radius: 999px;
		background: var(--surface-sunken);
		overflow: hidden;
	}
	.score-row-bar-fill {
		height: 100%;
		border-radius: 999px;
	}
	.score-row-value {
		font-size: 15px;
		font-weight: 600;
		width: 44px;
		text-align: right;
	}
	.score-row-chevron {
		color: var(--ink-faint);
	}
</style>
