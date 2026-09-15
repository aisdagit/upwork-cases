<script lang="ts">
	let {
		score,
		size = 128,
		stroke = 10,
		color,
		label
	}: { score: number; size?: number; stroke?: number; color: string; label?: string } = $props();

	const radius = $derived((size - stroke) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const offset = $derived(circumference * (1 - score / 100));
</script>

<div class="ring" style:width="{size}px" style:height="{size}px">
	<svg viewBox="0 0 {size} {size}" width={size} height={size} role="img" aria-label={label ?? `Score ${score} percent`}>
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke="var(--surface-sunken)"
			stroke-width={stroke}
		/>
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke={color}
			stroke-width={stroke}
			stroke-linecap="round"
			stroke-dasharray={circumference}
			stroke-dashoffset={offset}
			transform="rotate(-90 {size / 2} {size / 2})"
		/>
	</svg>
	<div class="ring-value">
		<span class="ring-number mono">{score}</span>
		<span class="ring-percent">%</span>
	</div>
</div>

<style>
	.ring {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.ring svg {
		display: block;
		transition: stroke-dashoffset 0.6s ease;
	}
	.ring-value {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 2px;
	}
	.ring-number {
		font-size: 1.7em;
		font-weight: 600;
		color: var(--ink);
	}
	.ring-percent {
		font-size: 0.85em;
		color: var(--ink-muted);
	}
</style>
