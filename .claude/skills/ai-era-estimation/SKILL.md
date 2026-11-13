---
name: "ai-era-estimation"
description: "Estimate software work at real AI-assisted speed and fill SDA's estimate template. Use for estimates, solution-doc reviews, roadmaps, phases, budgets and pricing (оцени, таймлайн, скоуп, кошторис)."
---

# AI-era estimation

Your default instinct for estimates is calibrated on how a human developer typed code in roughly 2021. That instinct is now wrong by an order of magnitude. At SDA the code is written by coding agents (Claude Code and similar) driven by a developer: a large scope is often one prompt and 15-60 minutes of agent time. A task that used to be "3-5 days" is now a few hours, and a task you would instinctively call "6-8h" is often 30 minutes. That exact overestimate is the main complaint this skill exists to fix.

Clients know this too. Nobody pays for monotonous typing anymore, and an inflated estimate loses the deal or signals the team doesn't work with AI.

## Where time actually goes

Every feature has three components:

1. **Agent generation.** Code, migrations, tests, types and wiring in one pass. Minutes to about an hour per coherent feature. Tests are part of generation, not a separate line.
2. **Human review.** A person reads the diff, clicks through, fixes what the agent got wrong. Up to 1h of review per 1h of generation, never more; usually less for small items.
3. **Client communication.** Clarifications, demos, approvals, waiting for feedback or access. This drives calendar time, not effort.

The feature hours you write are generation + review. Nothing else goes into them.

**Minimum unit: 1-2h per ticket**, not per sub-bullet. Bundle the small pieces of one module into one ticket (one agent prompt). Nine micro-tasks with a 1.5h floor each turn a 20-minute module into 13 hours, which is the old overestimate by another route.

## Calibration: real SDA data

From the git history of SDA's own ERP (repo sda-feedback-assistant), built by a couple of people with agents:

| What was built | Real time |
|---|---|
| Time-off module: migrations, RLS, hooks with TDD, request form, approvals page, routes | ~20 min |
| HR profile sections (skills, education, certificates, teams): table + sync + hook + component + tests each | ~5-10 min each |
| Multi-level approval chains, layoff workflow, bonuses CRUD, row-level access scopes, Jira worklog sync PoC | one evening, ~10-20 min each |
| Finance reports: cashflow, AR aging, budgets, overhead distribution | one commit, under an hour |
| Bank reconciliation page with tests (~1500 lines) | ~1h core, ~4h with later fixes |
| Contract registry: migration, page, tests (~1500 lines) | ~1.5h |
| Customer portal as a separate app (~2600 lines) | ~2h core, ~3h total |
| Change Requests with money flow, invoice linking, budget plan-vs-fact, import | one working day |
| Chrome extension (~11k lines, largest single piece) | ~18h first 3 days, ~35h overall |

Rule of thumb: a CRUD-ish feature with DB, API, UI and tests is **0.5-2h**. A module with several screens and business rules is **half a day to a day**. A genuinely large, novel piece (new app, browser extension, hard integration) is **a few days**, not weeks.

## The SDA estimate template

SDA estimates go into a Google Sheets template (sheets Summary, Scope, Config). The template already adds all overhead and risk on top of the Scope rows, so your job is only the Scope rows. Know what it adds so you never add it twice:

| Layer | How the template computes it |
|---|---|
| Uncertainty | Each role's hours = PERT on min/max: average + (max - min) / 6 |
| Communication | Per role per week of work: ~5h/week for devs and QA, ~10h/week BA, ~7.5h/week UX, scaled by allocation |
| Bugfixing, tech debt, edits | +10% of FE, BE and Mobile feature hours |
| Unit tests | Optional +10% row, normally off because agents write tests with the code |
| QA | 15% of FE + BE + Mobile hours (the Scope QA column is not used in the total) |
| BA | 4% of FE + BE + QA hours, plus communication |
| PM | 2h per day of the longest role's duration (hours / hours-per-day) |
| Risk | Optimistic x1.05, Pessimistic x1.2, Realistic = average of the two |
| Warranty | 30 working days of free support after release, not costed separately |

So in Scope you write, per feature, **min and max hours per role for generation + review only**. Do not add rows or hours for: communication, meetings, PM, QA passes, bug fixing, beta fixes, buffers, risk, warranty, unit tests. The template covers them.

Scope columns (min/max each): Business Analyst, UI/UX Designer, Front-End, Back-End, Mobile, QA, DevOps, AI/ML. Column A is a checkbox (TRUE includes the row), B is the feature name, S the description. Rows are grouped under "PART N" headers. Descriptions should say what is in and what is deferred, since the client reads them.

When editing the .xlsx with openpyxl: the formulas are Google Sheets functions wrapped in `__xludf.DUMMYFUNCTION`, so the file recalculates only after re-import into Google Sheets. Header rows use merged A:B cells; unmerge before writing and re-merge after. Keep rows inside the ranges the formulas use (Scope rows 8-31) or extend the ranges.

When you give totals in chat, replicate the template math above and say the sheet will give the exact number.

## Rates

| Role | $/h |
|---|---|
| Business Analyst | 30 |
| UI/UX Designer | 30 |
| Front-End Engineer | 35 |
| Back-End Engineer | 40 |
| Mobile Engineer | 40 |
| QA Engineer | 20 |
| Project Manager | 40 |
| Solution Architect | 50 |
| DevOps Engineer | 50 |
| AI / ML Engineer | 50 |

SDA prices either T&M or fixed price depending on the project. Both come from the template budget (hours x rate per role, with the risk multipliers). Don't invent a separate fixed-price markup and don't pick a price "by market feel": the template already carries the risk. If a quote comes out far from what Alex expects, show the hours and let him decide.

## The tail: real work the template does not model

These are not 2021 padding. They are feature rows that are easy to forget because they aren't "coding a screen". Add them as explicit Scope rows when the project has them:

- **Quality iterations** when quality is a stated requirement (matching accuracy, recommendation relevance, extraction precision): a validation tool plus several tuning rounds against client-labeled data.
- **Per-source integration grind**: when there are many sources (brands, sites, suppliers), each one needs its own tuning, beyond the generic adapter.
- **Store release**: builds, Google Play closed testing for new accounts (12 testers for 14 days), App Store submission, listings, privacy policy. Mandatory App Store items such as account deletion.
- **Data migration or import** of the client's existing data.
- **Client-facing docs** the client explicitly needs (for example a non-technical onboarding manual).

Beta feedback fixes, QA and PM are already in the template, so they are not tail rows.

## How to estimate

1. Split scope into features a developer would give an agent as one prompt each. Don't split by layer (backend / frontend / tests / setup): an agent does all layers at once.
2. For each feature, estimate generation + review per role as min/max, anchored to the calibration table. Apply the 1-2h floor per ticket.
3. Walk the tail checklist and add the rows that apply.
4. Name real risks and client dependencies (unknown third-party API, access the client must provide, annotation on the client side, store review) in the description or risks list. Don't pad hours for them.
5. Calendar comes from client dependencies and external waits (feedback rounds, data access, store testing periods), not from dividing hours by 8.
6. Show only the AI-era estimate. No "traditional" column and no "without AI it would take" comparison: it anchors everyone on the old numbers.

## Output

For a quick estimate in chat: a table of features with role and min/max hours, then template-style totals (hours and budget, optimistic / realistic / pessimistic), calendar with what drives it, and a short list of real risks. For a formal estimate, fill a copy of the template and send the file.

## Reviewing a solution doc or someone else's estimate

For each line ask what one agent prompt plus review would actually take, then report:

- Inflated items, with the AI-era number and a one-line reason ("mobile auth with delete-account: 2-4h, not 12-16h; solved pattern").
- Lines that shouldn't exist on their own: setup phases, separate testing phases, generic buffers. If the doc uses the SDA template, also flag hand-added overhead that duplicates what the template computes.
- Anything underestimated or missing, especially tail items and client dependencies.
- A recalculated total.

Be direct. The point is to catch old-world thinking, not to be polite about it.

## Roadmaps and phases

Phases are defined by what the client needs to see and approve: a usable slice, a demo, feedback, the next slice. Development inside a phase is usually days. A roadmap of several months for a typical project is a red flag unless the client's own process is the bottleneck, and then say so.