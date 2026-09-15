# Ignite — AI Sales & Revenue Platform (Prototype)

A clickable prototype of an autonomous AI sales and revenue platform. Static HTML/CSS/JS, no build step, no backend — all data is mocked. Visual direction adapted from the provided design reference (light warm-neutral background, orange accent, dense clean cards and tables).

## Run it

Open `index.html` directly in a browser, or serve the folder:

```
cd ignite-revenue
python3 -m http.server 8080
```

## Demo flow (60–90s)

1. **Revenue Command Center** — top metrics, the reactivation funnel (30,247 records → 23 meetings), pipeline chart, Nutshell CRM status, recent AI activity, and opportunities needing attention. Click **View Reactivation Opportunities**.
2. **AI Opportunity Queue** — filterable table of dormant CRM opportunities (All / A-Tier / B-Tier / Needs Review / In Conversation). Click **Northstar Dental**.
3. **Lead Intelligence** — CRM history, AI enrichment signals, an explainable score breakdown (25+20+19+17+10 = 91), and the Next Best Action. Click **Generate Outreach**, or **View AI Decision Log** to see the full audit trail for this lead.
4. **AI Reactivation** — a personalized outreach message (no contact info anywhere) with a strategy brief and confidence score. Try **Regenerate** (cycles a second variation) or **Edit** (inline textarea), then **Approve & Send**.
5. **AI Sales Conversation** — the prospect's reply, an automatic intent/signal analysis, and the AI's drafted response. **Continue Automatically** qualifies the opportunity; **Take Over Conversation** demonstrates human escalation instead.
6. **Qualified Opportunity** — updated score (96/100), deal estimate, the full activity timeline, and confirmation that Nutshell CRM was updated automatically. **View Opportunity in Pipeline** opens the kanban board.

Sidebar navigation (Command Center, Opportunities, Conversations, Pipeline, AI Decisions, Integrations) all work independently of the guided flow above.

## Privacy

No email addresses, phone numbers, physical addresses, or URLs appear anywhere — including in the fictional demo data.
