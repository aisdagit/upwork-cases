<script lang="ts">
	import { page } from '$app/state';
	import { getSessionDetail, getAlternativeApproach } from '$lib/data';
	import { scoreStatus, scoreStatusLabel, scoreStatusPillClass } from '$lib/types';
	import ScoreRing from '$lib/components/ScoreRing.svelte';
	import ScoreItemRow from '$lib/components/ScoreItemRow.svelte';

	const detail = $derived(getSessionDetail(page.params.id ?? ''));

	type Tab = 'overview' | 'transcript' | 'notes' | 'score' | 'coaching';
	const tabs: { id: Tab; label: string }[] = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'transcript', label: 'Transcript' },
		{ id: 'notes', label: 'Clinical Notes' },
		{ id: 'score', label: 'Quality Score' },
		{ id: 'coaching', label: 'Coaching' }
	];

	let activeTab = $state<Tab>('overview');
	let selectedItemId = $state<string | null>(null);
	let generating = $state(false);
	let altAttempt = $state<Record<string, number>>({});
	let showAlternative = $state<Record<string, boolean>>({});

	const selectedItem = $derived(detail?.scoreItems.find((i) => i.id === selectedItemId));
	const coachingItem = $derived(
		selectedItem ?? (detail ? [...detail.scoreItems].sort((a, b) => a.score - b.score)[0] : undefined)
	);

	function goTab(tab: Tab) {
		activeTab = tab;
	}

	function openItem(id: string) {
		selectedItemId = id;
		activeTab = 'score';
	}

	function backToScorecard() {
		selectedItemId = null;
		activeTab = 'score';
	}

	function viewCoaching() {
		activeTab = 'coaching';
	}

	function generateAlternative() {
		if (!coachingItem || generating) return;
		generating = true;
		setTimeout(() => {
			altAttempt = { ...altAttempt, [coachingItem.id]: (altAttempt[coachingItem.id] ?? 0) + 1 };
			showAlternative = { ...showAlternative, [coachingItem.id]: true };
			generating = false;
		}, 650);
	}
</script>

<svelte:head>
	<title>{detail ? detail.patientLabel : 'Session'} — Fidelis</title>
</svelte:head>

{#if !detail}
	<div class="page">
		<a class="back-link" href="/">← Back to Sessions</a>
		<div class="card empty-state">
			<h2>Session data not available in this demo</h2>
			<p>
				This prototype includes a full AI analysis for <strong>Patient #1842</strong> only. Return to
				the sessions list to open that session.
			</p>
			<a class="btn btn-primary" href="/">Back to Sessions</a>
		</div>
	</div>
{:else}
	<div class="page">
		<a class="back-link" href="/">← Back to Sessions</a>

		<header class="session-header">
			<div>
				<div class="session-title-row">
					<h1>{detail.patientLabel}</h1>
					<span class="pill pill-strong">Processing complete</span>
				</div>
				<p class="session-meta mono">{detail.dateLabel} · {detail.durationLabel}</p>
			</div>
		</header>

		<nav class="tabs" aria-label="Session sections">
			{#each tabs as tab (tab.id)}
				<button class="tab" class:active={activeTab === tab.id} onclick={() => goTab(tab.id)}>
					{tab.label}
				</button>
			{/each}
		</nav>

		{#if activeTab === 'overview'}
			<div class="overview-grid">
				<div class="col-main">
					<section class="card pad">
						<div class="section-label-row">
							<h2>AI Session Summary</h2>
							<span class="pill pill-neutral">AI-generated</span>
						</div>
						<p class="summary-text">{detail.summary}</p>
					</section>

					<section class="card pad">
						<h2>Key Observations</h2>
						<ul class="bullet-list">
							{#each detail.keyObservations as observation}
								<li>{observation}</li>
							{/each}
						</ul>
					</section>
				</div>

				<div class="col-side">
					<section class="card pad">
						<h2>Session Details</h2>
						<dl class="meta-list">
							<div><dt>Date</dt><dd>{detail.dateLabel}</dd></div>
							<div><dt>Duration</dt><dd class="mono">{detail.durationLabel}</dd></div>
							<div><dt>Modality</dt><dd>{detail.modality}</dd></div>
							<div><dt>Framework</dt><dd>{detail.framework}</dd></div>
							<div><dt>Processed</dt><dd class="mono">{detail.processedAtLabel}</dd></div>
						</dl>
					</section>

					<section class="card pad status-card">
						<h2>Processing Status</h2>
						<ul class="check-list">
							<li>{@render CheckIcon()} Transcription complete</li>
							<li>{@render CheckIcon()} Clinical notes generated</li>
							<li>{@render CheckIcon()} Quality score calculated</li>
						</ul>
						<div class="divider"></div>
						<div class="score-summary">
							<ScoreRing
								score={detail.overallScore}
								size={92}
								stroke={8}
								color={`var(--status-${scoreStatus(detail.overallScore)})`}
								label="Overall DBT adherence score"
							/>
							<div>
								<span class="score-summary-label">Overall DBT Adherence</span>
								<span class="pill {scoreStatusPillClass[scoreStatus(detail.overallScore)]}">
									{scoreStatusLabel[scoreStatus(detail.overallScore)]}
								</span>
							</div>
						</div>
						<button class="btn btn-primary full-width" onclick={() => goTab('score')}>
							Review Quality Score →
						</button>
					</section>
				</div>
			</div>
		{:else if activeTab === 'transcript'}
			<section class="card pad">
				<div class="section-label-row">
					<h2>Session Transcript</h2>
					<span class="pill pill-neutral">Fictional demo data</span>
				</div>
				<p class="fine-print">
					Highlighted tags mark DBT strategies the AI detected in the therapist's language and feed
					directly into the Quality Score assessment.
				</p>
				<ol class="transcript">
					{#each detail.transcript as line}
						<li class="transcript-line" class:therapist={line.speaker === 'Therapist'}>
							<span class="transcript-time mono">{line.timestamp}</span>
							<div class="transcript-body">
								<div class="transcript-speaker-row">
									<span class="transcript-speaker">{line.speaker}</span>
									{#if line.tag}
										<span class="tag-chip">{line.tag}</span>
									{/if}
								</div>
								<p>{line.text}</p>
							</div>
						</li>
					{/each}
				</ol>
			</section>
		{:else if activeTab === 'notes'}
			<section class="card pad notes-card">
				<div class="section-label-row">
					<h2>AI-Generated Clinical Note</h2>
					<span class="pill pill-attention">Pending clinician sign-off</span>
				</div>
				<p class="fine-print">
					Generated automatically from the session transcript. Clinical judgment and final
					sign-off remain with the treating clinician.
				</p>

				<div class="note-section">
					<h3>Session Summary</h3>
					<p>{detail.clinicalNote.sessionSummary}</p>
				</div>
				<div class="note-section">
					<h3>Interventions</h3>
					<ul class="bullet-list">
						{#each detail.clinicalNote.interventions as item}
							<li>{item}</li>
						{/each}
					</ul>
				</div>
				<div class="note-section">
					<h3>Patient Response</h3>
					<p>{detail.clinicalNote.patientResponse}</p>
				</div>
				<div class="note-section">
					<h3>Plan</h3>
					<ul class="bullet-list">
						{#each detail.clinicalNote.plan as item}
							<li>{item}</li>
						{/each}
					</ul>
				</div>
			</section>
		{:else if activeTab === 'score'}
			{#if selectedItem}
				{@const status = scoreStatus(selectedItem.score)}
				<section class="card pad">
					<button class="back-link inline" onclick={backToScorecard}>← Back to Scorecard</button>

					<div class="item-header">
						<div>
							<h2>{selectedItem.label}</h2>
							<div class="item-header-meta">
								<span class="item-score mono">{selectedItem.score}%</span>
								<span class="pill {scoreStatusPillClass[status]}">{scoreStatusLabel[status]}</span>
							</div>
						</div>
					</div>

					<h3 class="sub-heading">Why this score was given</h3>
					<p class="rationale">{selectedItem.rationale}</p>

					<h3 class="sub-heading">Evidence from session</h3>
					<p class="fine-print">Fictional transcript excerpts for demonstration purposes only.</p>
					<div class="evidence-list">
						{#each selectedItem.evidence as ev}
							<div class="evidence-card">
								<span class="evidence-time mono">{ev.timestamp}</span>
								<p><span class="evidence-speaker">{ev.speaker}:</span> "{ev.text}"</p>
							</div>
						{/each}
					</div>

					<div class="worked-grid">
						<div>
							<h3 class="sub-heading positive">What worked well</h3>
							<ul class="bullet-list">
								{#each selectedItem.workedWell as point}
									<li>{point}</li>
								{/each}
							</ul>
						</div>
						<div>
							<h3 class="sub-heading attention">What could improve</h3>
							<ul class="bullet-list">
								{#each selectedItem.couldImprove as point}
									<li>{point}</li>
								{/each}
							</ul>
						</div>
					</div>

					<button class="btn btn-primary" onclick={viewCoaching}>View Coaching Suggestions →</button>
				</section>
			{:else}
				<section class="card pad scorecard-summary">
					<div class="scorecard-overall">
						<ScoreRing
							score={detail.overallScore}
							size={140}
							stroke={12}
							color={`var(--status-${scoreStatus(detail.overallScore)})`}
							label="Overall DBT adherence score"
						/>
						<div>
							<span class="overall-eyebrow">Overall DBT Adherence Score</span>
							<span class="pill {scoreStatusPillClass[scoreStatus(detail.overallScore)]} overall-pill">
								{scoreStatusLabel[scoreStatus(detail.overallScore)]}
							</span>
							<p class="overall-note">
								This session met or exceeded criteria in
								{detail.scoreItems.filter((i) => i.score >= 70).length} of {detail.scoreItems.length}
								assessed DBT competencies.
							</p>
						</div>
					</div>
				</section>

				<div class="notice-banner">
					<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"
						><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" /><path
							d="M12 8v.01M12 11v5"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linecap="round"
						/></svg
					>
					AI-generated assessment. Clinical judgment remains with the reviewer.
				</div>

				<section class="card scorecard-list">
					{#each detail.scoreItems as item (item.id)}
						<ScoreItemRow {item} onselect={openItem} />
					{/each}
				</section>
			{/if}
		{:else if activeTab === 'coaching' && coachingItem}
			<section class="card pad">
				<div class="section-label-row">
					<h2>Coaching Suggestions</h2>
					<span class="pill pill-neutral">AI-generated</span>
				</div>
				<p class="fine-print">
					Based on: {coachingItem.label} — <span class="mono">{coachingItem.score}%</span>
				</p>

				<ol class="coaching-list">
					{#each coachingItem.coaching as suggestion, i}
						<li class="coaching-card">
							<span class="coaching-number">{i + 1}</span>
							<div>
								<h3>{suggestion.title}</h3>
								<p>{suggestion.description}</p>
							</div>
						</li>
					{/each}
				</ol>

				<div class="coaching-actions">
					<button class="btn btn-secondary" onclick={generateAlternative} disabled={generating}>
						{generating ? 'Generating…' : 'Generate Alternative Approach'}
					</button>
				</div>

				{#if showAlternative[coachingItem.id] && !generating}
					<div class="alternative-card">
						<span class="pill pill-neutral">Alternative Approach</span>
						<p>{getAlternativeApproach(coachingItem.id, (altAttempt[coachingItem.id] ?? 1) - 1)}</p>
					</div>
				{/if}

				<button class="btn btn-ghost back-to-scorecard" onclick={backToScorecard}>
					← Back to Scorecard
				</button>
			</section>
		{/if}
	</div>
{/if}

{#snippet CheckIcon()}
	<svg viewBox="0 0 24 24" width="15" height="15" fill="none" class="check-icon" aria-hidden="true"
		><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg
	>
{/snippet}

<style>
	.page {
		padding: 28px 40px 40px;
		max-width: 1180px;
		width: 100%;
	}

	.back-link {
		display: inline-flex;
		background: none;
		border: none;
		padding: 0;
		font-size: 13px;
		color: var(--ink-muted);
		cursor: pointer;
		margin-bottom: 16px;
		text-decoration: none;
		font-family: inherit;
	}
	.back-link:hover {
		color: var(--accent-strong);
	}
	.back-link.inline {
		margin-bottom: 20px;
	}

	.empty-state {
		padding: 32px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		align-items: flex-start;
		max-width: 520px;
	}

	.session-header {
		margin-bottom: 18px;
	}
	.session-title-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.session-title-row h1 {
		font-size: 22px;
	}
	.session-meta {
		font-size: 13px;
		color: var(--ink-muted);
		margin-top: 5px;
	}

	.tabs {
		display: flex;
		gap: 4px;
		border-bottom: 1px solid var(--border);
		margin-bottom: 22px;
	}
	.tab {
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		padding: 10px 6px;
		margin-right: 18px;
		font-size: 14px;
		font-weight: 500;
		color: var(--ink-muted);
		cursor: pointer;
		font-family: inherit;
	}
	.tab:hover {
		color: var(--ink);
	}
	.tab.active {
		color: var(--accent-strong);
		border-bottom-color: var(--accent);
		font-weight: 600;
	}

	.pad {
		padding: 22px 24px;
	}

	h2 {
		font-size: 16.5px;
	}

	.section-label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 12px;
	}

	.summary-text {
		font-size: 14.5px;
		line-height: 1.65;
		color: var(--ink);
		max-width: 62ch;
	}

	.bullet-list {
		display: flex;
		flex-direction: column;
		gap: 9px;
		padding-left: 18px;
		font-size: 13.5px;
		line-height: 1.55;
		color: var(--ink);
	}
	.bullet-list li::marker {
		color: var(--accent);
	}

	.overview-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 16px;
		align-items: start;
	}
	.col-main,
	.col-side {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 0;
	}

	.meta-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 0;
	}
	.meta-list > div {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 13px;
	}
	.meta-list dt {
		color: var(--ink-faint);
	}
	.meta-list dd {
		margin: 0;
		color: var(--ink);
		font-weight: 500;
		text-align: right;
	}

	.status-card {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.check-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 9px;
		font-size: 13px;
	}
	.check-list li {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	:global(.check-icon) {
		color: var(--status-strong);
		flex-shrink: 0;
	}
	.divider {
		height: 1px;
		background: var(--border);
	}
	.score-summary {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.score-summary-label {
		display: block;
		font-size: 12.5px;
		color: var(--ink-muted);
		margin-bottom: 6px;
	}
	.full-width {
		width: 100%;
	}

	.fine-print {
		font-size: 12px;
		color: var(--ink-faint);
		margin-bottom: 16px;
	}

	.transcript {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}
	.transcript-line {
		display: grid;
		grid-template-columns: 56px 1fr;
		gap: 16px;
		padding: 12px 0;
		border-top: 1px solid var(--border);
	}
	.transcript-line:first-child {
		border-top: none;
	}
	.transcript-time {
		font-size: 12px;
		color: var(--ink-faint);
		padding-top: 2px;
	}
	.transcript-speaker-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}
	.transcript-speaker {
		font-size: 12.5px;
		font-weight: 700;
		color: var(--ink-muted);
	}
	.transcript-line.therapist .transcript-speaker {
		color: var(--accent-strong);
	}
	.tag-chip {
		font-size: 10.5px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--accent-strong);
		border: 1px solid var(--accent-tint-strong);
		background: var(--accent-tint);
		padding: 2px 7px;
		border-radius: 999px;
	}
	.transcript-body p {
		font-size: 13.5px;
		line-height: 1.5;
	}

	.notes-card {
		max-width: 760px;
	}
	.note-section {
		padding-top: 16px;
		margin-top: 16px;
		border-top: 1px solid var(--border);
	}
	.note-section:first-of-type {
		padding-top: 0;
		margin-top: 0;
		border-top: none;
	}
	.note-section h3 {
		font-size: 11.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--ink-faint);
		margin-bottom: 8px;
	}
	.note-section p {
		font-size: 13.5px;
		line-height: 1.6;
	}

	.item-header {
		margin-bottom: 18px;
	}
	.item-header h2 {
		font-size: 19px;
	}
	.item-header-meta {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 8px;
	}
	.item-score {
		font-size: 18px;
		font-weight: 700;
	}

	.sub-heading {
		font-size: 12.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--ink-faint);
		margin: 20px 0 8px;
	}
	.sub-heading.positive {
		color: var(--status-strong);
	}
	.sub-heading.attention {
		color: var(--status-attention);
	}
	.rationale {
		font-size: 14px;
		line-height: 1.6;
		max-width: 68ch;
	}

	.evidence-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.evidence-card {
		background: var(--paper);
		border: 1px solid var(--border);
		border-left: 3px solid var(--accent);
		border-radius: var(--radius-sm);
		padding: 12px 14px;
		display: flex;
		gap: 12px;
		align-items: baseline;
	}
	.evidence-time {
		font-size: 12px;
		color: var(--ink-faint);
		flex-shrink: 0;
	}
	.evidence-card p {
		font-size: 13.5px;
		font-style: italic;
		line-height: 1.5;
	}
	.evidence-speaker {
		font-style: normal;
		font-weight: 700;
		color: var(--accent-strong);
	}

	.worked-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		margin-bottom: 24px;
	}

	.scorecard-summary {
		margin-bottom: 14px;
	}
	.scorecard-overall {
		display: flex;
		align-items: center;
		gap: 24px;
	}
	.overall-eyebrow {
		display: block;
		font-size: 12.5px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--ink-faint);
		margin-bottom: 8px;
	}
	.overall-pill {
		font-size: 13px;
		padding: 4px 12px;
	}
	.overall-note {
		font-size: 13px;
		color: var(--ink-muted);
		margin-top: 10px;
		max-width: 46ch;
	}

	.notice-banner {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12.5px;
		color: var(--ink-muted);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 10px 14px;
		margin-bottom: 16px;
	}
	.notice-banner svg {
		color: var(--accent);
		flex-shrink: 0;
	}

	.scorecard-list {
		overflow: hidden;
	}

	.coaching-list {
		list-style: none;
		margin: 0 0 22px;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.coaching-card {
		display: flex;
		gap: 14px;
		background: var(--paper);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 14px 16px;
	}
	.coaching-number {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: var(--accent-tint);
		color: var(--accent-strong);
		font-weight: 700;
		font-size: 13px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.coaching-card h3 {
		font-size: 14px;
		margin-bottom: 4px;
	}
	.coaching-card p {
		font-size: 13.5px;
		line-height: 1.55;
		color: var(--ink-muted);
	}

	.coaching-actions {
		margin-bottom: 4px;
	}

	.alternative-card {
		margin-top: 16px;
		background: var(--accent-tint);
		border: 1px solid var(--accent-tint-strong);
		border-radius: var(--radius-md);
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.alternative-card p {
		font-size: 13.5px;
		line-height: 1.55;
	}

	.back-to-scorecard {
		display: block;
		margin-top: 22px;
	}

	@media (max-width: 980px) {
		.overview-grid {
			grid-template-columns: 1fr;
		}
		.worked-grid {
			grid-template-columns: 1fr;
			gap: 18px;
		}
	}
	@media (max-width: 640px) {
		.page {
			padding: 20px 18px 32px;
		}
		.tabs {
			overflow-x: auto;
		}
		.scorecard-overall {
			flex-direction: column;
			align-items: flex-start;
			gap: 14px;
		}
	}
</style>
