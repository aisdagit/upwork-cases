---
name: "sda-proposal-copy"
description: "Write the texts for an SDA business proposal (slide-by-slide copy in SDA's voice) from an estimate, audit, brief or call notes, ready for the sda-standard-deck skill or to paste into a deck."
---

# SDA proposal texts

Use when the user asks for proposal texts / тексти для пропоузалу / контент для деку, or as the content step before building a deck with `sda-standard-deck`. Talk to the user in their language (usually Ukrainian); write the proposal itself in English unless they ask otherwise.

## Inputs (use what is attached)

- Estimate .xlsx (SDA template): read with `openpyxl` `data_only=True`. `Summary` (roles, hours, rates, cost, Optimistic/Realistic/Pessimistic totals, start date, duration, tech stack, risks, footnotes), `Scope` (included items + descriptions), `Findings` (audit), `Config` (role start/end, release date).
- Spec / brief / audit report / call notes / client emails.
- Cases PDF ("All Cases 1 page"): to pick relevant cases and write "Why it matters here".
- A previous SDA proposal for tone.

If the client's business goal or the main problem is unclear and nothing attached answers it, ask one short question before writing. Otherwise write straight away.

## Rules

- **Only real facts.** Every number, date, integration, tool and claim comes from the inputs. No invented metrics, timelines, guarantees, team sizes or support terms. If you add your own structure (week split, milestones, decisions list), flag it to the user in the reply.
- **Numbers must match the estimate** exactly: hours per role, rates, costs, the three totals, start date, duration. Realistic is the headline figure; show the range. Skip "Monthly budget" for projects under a month.
- **Client-first.** Write to the client ("you", "your team"), about their outcome, then how we get there. SDA appears as "we".
- **Plain and concrete.** Short sentences, active voice, specific nouns ("invoice total checked on the server" not "enhanced payment security"). No buzzwords: avoid "seamless", "cutting-edge", "robust solution", "leverage", "synergy", "end-to-end excellence", "unlock", "empower".
- **Each slide makes one point.** Title says the point; body supports it; the lead line (bottom takeaway) states why it matters in one sentence.
- **Titles**: 2–6 words, uppercase in the deck, mark 1–2 accent words with `**`, e.g. `What changes **per insurer**`, `The fixes that **can't wait**`, `Off Polsia, onto **your accounts**`.
- **Length limits** (they keep the deck readable at large font): card title ≤ 4 words; card body ≤ 25 words; table cell ≤ 15 words; lead line ≤ 22 words; overview paragraphs 45–65 words each; bullets ≤ 8 words.
- Name the client's real things: their product name, integrations, roles, data, markets. Generic text that could fit any client is a rewrite signal.
- Risks are stated neutrally with the consequence ("If Polsia is the Stripe Connect platform, the payments move grows"), never as blame.
- Out-of-scope / later items get a trigger ("We add it when …") and hours if the estimate has them.

## Slide-by-slide copy (pick what fits; typical 15–20 content slides)

1. **Cover** — project name ("FieldPulse AI: audit fixes", "Insurance comparison platform, V1") + one-line subtitle (what it is, for whom).
2. **Overview** — one bold goal line (≤ 20 words, the outcome for the client) + paragraph 1: where the client is now / what they are launching; paragraph 2: what this proposal covers and roughly how long.
3. **Business needs / What we found** — 2 short paragraphs on what wins or hurts in their market/product + one goal line. For audits: totals by severity with one-line examples each.
4. **Concept / platform slide** — 3 cards: now, the shared core, what comes next.
5. **Journey or flow** — 6–8 numbered steps (title ≤ 3 words + one line) or a list of back-office operations.
6. **Scope of work** — 6–9 cards: area title + what is built/fixed (≤ 25 words). Include an "Out of scope" card when something is excluded.
7. **Detail tables** — e.g. Finding → Fix, Today → After, Element → Changes → Where it lives.
8. **Architecture** — 4 cards: layer label, stack in one line, what it does in one line + lead about ownership / no lock-in (only if true).
9. **Decisions for day one** (optional) — numbered decision + "If we skip it now" consequence.
10. **Estimate summary** — role table values, three totals, "Realistic budget" card text: "N hours, about X weeks. Start D, release D.", footnotes copied from the sheet in plain English.
11. **Roadmap** — phases with dates and one line each; 2–3 milestones; lead line on the real bottleneck.
12. **Risks & assumptions** — 3–6 items: short label + one sentence.
13. **Estimate & assumptions** (optional) — what the estimate is based on, what's not included, what discovery confirms.
14. **Engagement model** — Delivery approach, Communication, After release / Post-launch, Commercial models, Team setup (roles from the estimate). Use only terms SDA actually offers in the inputs.
15. **What discovery confirms / What we need from you** — numbered open questions or access items.
16. **Next steps** — 5 steps, label (1–3 words) + one line: e.g. Confirm scope → Access → Accounts → Kick-off → Release.
17. **Relevant cases** — for each chosen case: why it is relevant in one sentence that names the shared problem ("Payment amounts checked on the server and money flows that reconcile: the same work as the Stripe move").

## Voice examples

- Goal line: "Make FieldPulse AI safe to run with real customers, on your own accounts and infrastructure."
- Lead line: "The expensive part, compliance and orchestration, is written once. A new insurer is a connector; a new vertical is a schema."
- Lead line: "None of the seven adds real scope. All seven are expensive to add once the first insurers are live."
- Card: "**Independence from Polsia** — Email, Stripe payments, AI, job schedules, hosting and CI moved to your own accounts."
- Risk: "**Live database access** — Needed to rebuild the schema: 25 of 55 tables have no migration."

## Output

- Default: reply with the copy as markdown, one `###` per slide with the slide number and type, fields labelled (Title, Body, Cards, Table, Lead). Keep it scannable.
- If the user wants a file to keep or share, make a doc (Docs artifact) with the same structure.
- If the user then asks for the deck, hand the copy to the `sda-standard-deck` skill.
- End the reply with a short list of what the user should confirm: anything you assumed or structured yourself, missing facts (links, dates, terms), and numbers you couldn't find.