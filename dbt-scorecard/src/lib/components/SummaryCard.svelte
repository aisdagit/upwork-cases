<script lang="ts">
	let {
		label,
		value,
		hint
	}: { label: string; value: string; hint?: string } = $props();
</script>

<div class="card summary-card">
	<span class="summary-label">{label}</span>
	<span class="summary-value mono">{value}</span>
	{#if hint}
		<span class="summary-hint">{hint}</span>
	{/if}
</div>

<style>
	.summary-card {
		padding: 18px 20px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.summary-label {
		font-size: 12.5px;
		font-weight: 600;
		color: var(--ink-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	.summary-value {
		font-size: 26px;
		font-weight: 600;
		color: var(--ink);
	}
	.summary-hint {
		font-size: 12.5px;
		color: var(--ink-faint);
	}
</style>
