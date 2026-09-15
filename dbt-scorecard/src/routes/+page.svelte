<script lang="ts">
	import { sessionList } from '$lib/data';
	import { scoreStatus, scoreStatusPillClass } from '$lib/types';
	import SummaryCard from '$lib/components/SummaryCard.svelte';

	const processingPill: Record<string, string> = {
		Processed: 'pill-strong',
		Processing: 'pill-processing'
	};
	const notesPill: Record<string, string> = {
		Ready: 'pill-strong',
		Processing: 'pill-processing',
		'Needs Review': 'pill-attention'
	};
</script>

<svelte:head>
	<title>Sessions — Fidelis</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>Sessions</h1>
		<p class="page-sub">Recently processed therapy sessions and their DBT adherence scores.</p>
	</header>

	<div class="summary-grid">
		<SummaryCard label="Sessions This Week" value="18" />
		<SummaryCard label="Average DBT Score" value="84%" hint="Across processed sessions" />
		<SummaryCard label="Sessions Reviewed" value="12" hint="Signed off by a clinician" />
		<SummaryCard label="Awaiting Review" value="6" hint="Clinical notes pending sign-off" />
	</div>

	<div class="card table-card">
		<div class="table-card-header">
			<h2>Recent Sessions</h2>
			<span class="table-card-sub">Patients shown by de-identified session ID only</span>
		</div>
		<div class="table-scroll">
			<table>
				<thead>
					<tr>
						<th>Patient</th>
						<th>Session Date</th>
						<th>Duration</th>
						<th>Processing Status</th>
						<th>DBT Adherence</th>
						<th>Clinical Notes</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each sessionList as session (session.id)}
						{@const clickable = session.hasDetail}
						<tr class:clickable>
							<td class="patient-cell">
								{#if clickable}
									<a href="/sessions/{session.id}" class="patient-link">
										{session.patientLabel}
										<svg viewBox="0 0 24 24" width="11" height="11" fill="none" aria-hidden="true"
											><rect x="4.5" y="10.5" width="15" height="9.5" rx="1.5" stroke="currentColor" stroke-width="1.6" /><path
												d="M8 10.5V7.5a4 4 0 0 1 8 0v3"
												stroke="currentColor"
												stroke-width="1.6"
											/></svg
										>
									</a>
								{:else}
									<span class="patient-plain">
										{session.patientLabel}
										<svg viewBox="0 0 24 24" width="11" height="11" fill="none" aria-hidden="true"
											><rect x="4.5" y="10.5" width="15" height="9.5" rx="1.5" stroke="currentColor" stroke-width="1.6" /><path
												d="M8 10.5V7.5a4 4 0 0 1 8 0v3"
												stroke="currentColor"
												stroke-width="1.6"
											/></svg
										>
									</span>
								{/if}
							</td>
							<td>{session.dateLabel}</td>
							<td class="mono">{session.durationLabel}</td>
							<td><span class="pill {processingPill[session.status]}">{session.status}</span></td>
							<td>
								{#if session.dbtScore !== null}
									<span class="pill {scoreStatusPillClass[scoreStatus(session.dbtScore)]} mono">
										{session.dbtScore}%
									</span>
								{:else}
									<span class="dash mono">—</span>
								{/if}
							</td>
							<td><span class="pill {notesPill[session.notesStatus]}">{session.notesStatus}</span></td>
							<td class="chevron-cell">
								{#if clickable}
									<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"
										><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg
									>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="table-footer">Showing 7 of 41 sessions this month</div>
	</div>
</div>

<style>
	.page {
		padding: 32px 40px 12px;
		max-width: 1180px;
		width: 100%;
	}
	.page-header {
		margin-bottom: 22px;
	}
	.page-header h1 {
		font-size: 24px;
	}
	.page-sub {
		font-size: 13.5px;
		color: var(--ink-muted);
		margin-top: 5px;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
		margin-bottom: 22px;
	}

	.table-card {
		overflow: hidden;
	}
	.table-card-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		padding: 16px 22px;
		border-bottom: 1px solid var(--border);
	}
	.table-card-header h2 {
		font-size: 15.5px;
	}
	.table-card-sub {
		font-size: 12px;
		color: var(--ink-faint);
		white-space: nowrap;
	}

	.table-scroll {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	thead th {
		text-align: left;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--ink-faint);
		padding: 10px 22px;
		border-bottom: 1px solid var(--border);
		white-space: nowrap;
	}
	tbody tr {
		border-bottom: 1px solid var(--border);
	}
	tbody tr:last-child {
		border-bottom: none;
	}
	tbody tr.clickable:hover {
		background: var(--paper);
	}
	td {
		padding: 12px 22px;
		font-size: 13.5px;
		vertical-align: middle;
		white-space: nowrap;
	}
	.patient-cell {
		font-weight: 600;
	}
	.patient-link,
	.patient-plain {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--ink);
		text-decoration: none;
	}
	.patient-link {
		color: var(--accent-strong);
	}
	.patient-link:hover {
		text-decoration: underline;
	}
	.patient-plain svg,
	.patient-link svg {
		color: var(--ink-faint);
	}
	.dash {
		color: var(--ink-faint);
	}
	.chevron-cell {
		color: var(--ink-faint);
		width: 20px;
	}
	.table-footer {
		padding: 12px 22px;
		font-size: 12px;
		color: var(--ink-faint);
		border-top: 1px solid var(--border);
	}

	@media (max-width: 900px) {
		.summary-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 640px) {
		.page {
			padding: 22px 18px 12px;
		}
		.summary-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
