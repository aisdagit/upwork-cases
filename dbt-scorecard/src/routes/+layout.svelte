<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="shell">
	<aside class="sidebar">
		<div class="brand">
			<span class="brand-mark" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="20" height="20" fill="none">
					<path
						d="M12 3c-3 2-6 2.6-6 2.6V12c0 4.4 2.6 7.4 6 8.6 3.4-1.2 6-4.2 6-8.6V5.6S15 5 12 3z"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linejoin="round"
					/>
					<path d="M9.3 12.2l1.9 1.9 3.4-3.9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</span>
			<div class="brand-text">
				<span class="brand-name">Fidelis</span>
				<span class="brand-sub">Clinical Quality</span>
			</div>
		</div>

		<nav class="nav">
			<a class="nav-item active" href="/">
				<svg viewBox="0 0 24 24" width="17" height="17" fill="none"><rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 9h17" stroke="currentColor" stroke-width="1.5"/><path d="M7.5 13h4M7.5 16.2h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
				<span>Sessions</span>
			</a>
			<div class="nav-item disabled" aria-disabled="true">
				<svg viewBox="0 0 24 24" width="17" height="17" fill="none"><path d="M12 3l7 3v5c0 4.6-3 8.4-7 9.6-4-1.2-7-5-7-9.6V6l7-3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
				<span>Scorecard Library</span>
				<span class="soon">Soon</span>
			</div>
			<div class="nav-item disabled" aria-disabled="true">
				<svg viewBox="0 0 24 24" width="17" height="17" fill="none"><path d="M12 2l1.6 4.2L18 8l-4.4 1.8L12 14l-1.6-4.2L6 8l4.4-1.8L12 2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
				<span>Coaching Library</span>
				<span class="soon">Soon</span>
			</div>
			<div class="nav-item disabled" aria-disabled="true">
				<svg viewBox="0 0 24 24" width="17" height="17" fill="none"><rect x="4" y="10" width="16" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.5"/></svg>
				<span>Audit Trail</span>
				<span class="soon">Soon</span>
			</div>
		</nav>

		<div class="sidebar-footer">
			<div class="security-note">
				<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><rect x="4.5" y="10.5" width="15" height="9.5" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.4"/></svg>
				Encrypted &amp; access-logged
			</div>
			<div class="role-card">
				<span class="role-avatar" aria-hidden="true">
					<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="8.5" r="3.2" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 19c1-3 3.7-4.6 6.5-4.6s5.5 1.6 6.5 4.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
				</span>
				<div class="role-meta">
					<span class="role-title">Clinical Supervisor</span>
					<span class="role-scope">Role-based access · Org: Demo Clinic</span>
				</div>
			</div>
		</div>
	</aside>

	<div class="main">
		{@render children()}

		<footer class="app-footer">
			Demo environment — all patient identifiers, transcripts, and notes are fictional. Session
			data is de-identified and access is logged for audit purposes. This prototype does not
			claim HIPAA compliance.
		</footer>
	</div>
</div>

<style>
	.shell {
		display: flex;
		min-height: 100vh;
	}

	.sidebar {
		width: 240px;
		flex-shrink: 0;
		background: var(--surface);
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		padding: 20px 14px;
		position: sticky;
		top: 0;
		height: 100vh;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 4px 8px 22px;
	}
	.brand-mark {
		width: 32px;
		height: 32px;
		border-radius: 9px;
		background: var(--accent-tint);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.brand-text {
		display: flex;
		flex-direction: column;
		line-height: 1.2;
	}
	.brand-name {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 16.5px;
	}
	.brand-sub {
		font-size: 11px;
		color: var(--ink-faint);
	}

	.nav {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.nav-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 10px;
		border-radius: var(--radius-sm);
		font-size: 13.5px;
		font-weight: 500;
		color: var(--ink-muted);
		text-decoration: none;
	}
	.nav-item svg {
		flex-shrink: 0;
		opacity: 0.85;
	}
	.nav-item.active {
		background: var(--accent-tint);
		color: var(--accent-strong);
		font-weight: 600;
	}
	.nav-item.disabled {
		color: var(--ink-faint);
		cursor: not-allowed;
	}
	.soon {
		margin-left: auto;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		background: var(--surface-sunken);
		color: var(--ink-faint);
		padding: 2px 6px;
		border-radius: 999px;
	}

	.sidebar-footer {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.security-note {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11.5px;
		color: var(--ink-faint);
		padding: 0 4px;
	}
	.role-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		background: var(--paper);
	}
	.role-avatar {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: var(--accent-tint);
		color: var(--accent-strong);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.role-meta {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.role-title {
		font-size: 12.5px;
		font-weight: 600;
		color: var(--ink);
	}
	.role-scope {
		font-size: 10.5px;
		color: var(--ink-faint);
	}

	.main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.app-footer {
		margin-top: auto;
		padding: 16px 40px 24px;
		font-size: 11.5px;
		color: var(--ink-faint);
		max-width: 760px;
		line-height: 1.5;
	}

	@media (max-width: 760px) {
		.sidebar {
			display: none;
		}
	}
</style>
