---
name: "sda-case-copy"
description: "Use when writing the texts for an SDA case study page on the redesigned site (Single case template): collects everything known about the case (Notion projects export, current site page, case presentation in Figma, cases table), writes selling, SEO- and AI-search-friendly copy that fits the Figma slots, and delivers it as a Claude Doc for the developer. Triggers: «тексти для кейсу», «перепиши кейс під новий дизайн», «зроби тексти кейсу», «кейс <назва> під сайт», «наступний кейс», «тексти для Single Case»."
---

# SDA case page copy

Writes the full copy for one case study page on the redesigned SDA site: every block of the Single case template, in English, short enough for the Figma slots, written to sell and to rank (Google + AI search). Output is a Claude Doc for the developer who builds the page. Talk to the user in Ukrainian.

The finished reference case is Samata Health: `references/example-samata.md`. Read it before writing; match its tone, density and document format.

## Sources

Gather everything first, then write. State in one line what was found and what is missing.

1. **Cases table** `Контекст SDA/Кейси — сайт, Notion, Figma.csv` — one row per case: site URL and current title, industry, number of Solution tabs, Notion row name, NDA, Real/Fake, presentation link, link to the ready images section (column «Картинки для сторінки (Figma)»).
2. **Notion projects export** `Контекст SDA/База знань про компанію/Projects SDA …_all.csv` — the richest source. Columns to read: Description, Client profile, Client and company, Country, Industry / Sub-industry, Type, З чим прийшов клієнт, Pains, Pain Type, Solutions, Key Services Provided, Hook, Tech Stack, Team Size (SDA), Current team, Start date / End date, Status, **AWS** (`+` = project on AWS), **NDA**, Real or Fake, Client Feedback/Quote, Sales Notes/Talking Points.
3. **Current site page** (sda.company URL from the table; WebFetch) — current tags, Overview features, Challenges, Provided Solutions tabs, results, and the long SEO title (a keyword source).
4. **Case presentation** in Figma file `pIWSeoboE8cJuUW6jr4TXt` (link in the table) — headline numbers and results phrasing. Read slide texts with `use_figma` (`findAll` TEXT nodes) on the case section.
5. **Ready images** for the case in website file `BPgoVTWRXLaYqIGFeeMwES`, page «Case Pics», section «Updated cases» → «Case images · <Product>» (the links in the cases table point to the old place and are dead). List its frames: Hero, Challenges 1–3, Solution N — desktop and mobile. Their links go into the doc. Solution image names show the tab order the images were made for; keep the Solution steps in that order unless there is a reason not to.

Figma calls: if a call with `sessionId` keeps failing, call `use_figma` without it — that works.

## The template

Single case page in `BPgoVTWRXLaYqIGFeeMwES`, page «💻📱Single Case», section «Single case new text structure», frame `398:28800` (mobile `3866:33295`). It is filled with a sample case (Local Food Business Marketplace). Block order, slot widths and character limits: `references/template.md`. The template changes: at the start of every session list the frame's visible blocks and texts (one `use_figma` call) and compare with `references/template.md`. If something changed, follow Figma, tell the user what changed, and update `references/template.md`.

## Writing rules

**Facts and gaps.** Compile all sources into one story. These are real SDA projects and the clients know SDA writes its cases this way, so you write as SDA's marketer: where a source is thin, add what fits the project, the industry and SDA's usual work (a 4th and 5th challenge, a missing goal, plausible numbers, the features such a product has). Every block must be full; never leave a slot empty or write «not available». When sources disagree, pick the version that positions SDA best and is believable; never show a disagreement, an assumption or a «to confirm» note in the doc. In the final report a short line per case on what was added from your side is enough; no PM confirmation list. Never invent named people, client quotes, reviews or ratings.

**NDA.** Most cases are under NDA: never name the client anywhere (H1, Client paragraph, meta, related cards). Describe the company by type and market: «a US employee mental health platform», «a German logistics scale-up». NDA «Yes» in Notion is a ban by default; the only known exception is Samata Health (name allowed). NDA «No»: the client may be named in the Client paragraph (still not in H1). Empty NDA field: no client name (the product idea is described, not the company). AWS: Notion `AWS` = `+`, or AWS in the Notion tech stack, the site tags or the ready images (e.g. «Cloud Infrastructure on AWS») → AWS card. SDA's own products (Atlas ERP) are named.

**Real or Fake.** Fake/internal cases (concept projects) are written the same way, as a project for «a client» of a plausible type; never a named client.

**Filters.** Industry, Product and Services tags come from `references/taxonomy.md` (fixed names, so the site can filter). The first Industry tag is the filter industry and also the breadcrumb and URL segment. AI features → `AI Development` in Services; no AI → never mention it. Team & Timeline: the development phase, not the Notion date range (it includes support): see taxonomy.

**SEO and AI search.**
- H1 names the product with its main keyword phrase, short (like «Local Food Business Marketplace Directory», «Employee Mental Health & Therapy Platform»). No client name, no result in H1.
- The result and the headline numbers go in the hero subtitle.
- Mine keywords from the current long site title, the industry and the product type (e.g. «employee mental health platform», «fleet management software», «MVP development»). Spread them: H1, subtitle, tags, Client and What we delivered paragraphs, Solution step names, meta title and description. Never stuff; every sentence must read naturally.
- For AI search, the Client and What we delivered paragraphs are self-contained statements of fact: who the client is (type, country, stage), what SDA did, with which stack, with which result in numbers and units («15 s to 1 s», «12 weeks»).
- Meta title ≤ 60 with « | SDA» at the end; meta description ≤ 155 with the main keyword and a number; URL slug from the H1 keyword under the industry: `/cases/<industry>/<keyword-slug>/`.

**Selling.** Lead with the client's pain and the measurable outcome. Concrete verbs and numbers over adjectives. Each block says something new: Overview «The problem» is the business problem in plain words (no tech details, no list), Challenges are the specific obstacles, Solution steps answer named challenges, Impact proves results. No repeated sentences across blocks; numbers may repeat between hero and Impact (the template does this).

**Rescue and support cases.** When SDA took over an existing product, do not claim SDA built it: say «we took over», «we rebuilt», «we stabilized»; Services tags `Product Rescue`, `Support & Maintenance`.

**AWS in hero.** AWS project (Notion `AWS` = `+`, or AWS in the stack, site or images) → two metrics plus the AWS Partner badge, a graphic with no text: Dev line «AWS project: two metrics plus the AWS Partner badge (graphic, no text), as in the template.» No AWS → the three-metric hero variant and no AWS anywhere on the page: Dev line «Not an AWS project: use the three-metric hero variant, no AWS badge anywhere on the page.»

**Standard blocks.** Testimonials, Why us, CTA and Footer are the same for every case: no copy. Never write a case-specific client quote.

**Related Case Studies.** Eyebrow «Other projects with a similar challenge». Three cases from the cases table: same industry first, then the same pain (e.g. rescue after a previous vendor). Use each case's exact H1 as the card title, so the developer can link it.

**Service matching (internal).** At the end of every doc add `## Internal: service matching` with a Dev line («Internal note for placing this case on service pages. Do not show it on the page.»), `**Best match:**` one site service and `**Also fits:**` 1–3 more. Site services (Services page in Figma): AI Product Development, Custom Software Development, AI Consulting, AIoT, Product Diagnostics & Discovery, Legacy & Product Modernization, Cloud & DevOps, Business Automation, AI Agents & Workflows, Integrations, FD Engineers, Dedicated Teams, Growth & Support, UX/UI Design, Custom Dashboards & BI. Pick by what SDA actually did: rescue/takeover → Legacy & Product Modernization; dashboards → Custom Dashboards & BI; audit/discovery → Product Diagnostics & Discovery; built from scratch → Custom Software Development (AI Product Development when the product's core is AI); team extension → Dedicated Teams; long support → Growth & Support; AWS setup/migration → Cloud & DevOps; hardware/sensors/cameras → AIoT.

**Prototype cases.** MeatMap and Qoka have clickable prototypes on a separate domain instead of a standard case page. Their doc has no page blocks: `## Case page` (Dev line: keep the current case link and add the prototype link; MeatMap prototype https://madeby.sda.company/project-mmc), `## Card in case lists` (title = H1, Industry/Product/Services tags, card image = hero image) and the service matching block.

**Fit.** Keep every text within the limits in `references/template.md`. Write the doc text to a local `.md` file first and run `python3 scripts/check_case.py <file>` (limits, 5 challenges, 3 goals, 6 impact cards, taxonomy tags, breadcrumb = industry); fix everything it reports, then create the doc from the same text. The limits never appear in the doc.

## The doc (for the developer)

One Claude Doc per case, title `<Product> — тексти кейсу` (create via the docs connector; load its guide first if its instructions are not in context). Format exactly like `references/example-samata.md`:

- A heading per block in page order: SEO, Hero, Overview, Goals, Challenges, Solution, The Impact, Testimonials / Why us, Related Case Studies, CTA / Footer, Internal: service matching.
- Inside: `**Eyebrow:**`, `**Heading:**`, paragraphs with bold labels, cards as tables (Title | Text; Metric | Text), Solution steps as `### N. Step name` followed by a three-row table matching the Figma card (template updated 11.2026): **Solves** (2–5 words, the title of one of this case's Challenges or Goals, different for each step), **What we did** (1–2 sentences, ≤ 170 chars, concrete actions in the product's own nouns), **Why this decision mattered** (1 sentence, ≤ 130 chars, what changed for whom, with a sourced number when there is one). Vary sentence openings across steps; no generic «improved efficiency / ensured scalability» endings.
- Developer notes only where the developer needs them, as short lines: `**Dev:**` (AWS badge card, highlighted Impact card, anything that differs from the template sample) and `**Image:**` (links to the case's ready images, desktop · mobile, with `?node-id=` links into `BPgoVTWRXLaYqIGFeeMwES`).
- Nothing else: no limits, no character counts, no keywords list, no sources, no assumptions, no explanations.

## Workflow

1. Input: case name (product) or site URL. Find its row in the cases table and Notion; read the site page, the presentation slides and the images section.
2. Check the template against `references/template.md` (see The template).
3. Decide and tell the user in 2–4 lines: NDA (name or not), AWS card or third result, rescue vs built-from-scratch, main keyword phrase.
4. Write all blocks, count characters, fix overflows.
5. Create the doc. Then write the link into the cases table: column «Тексти (Claude Doc)», create it if missing, keep the file's encoding (UTF-8 with BOM).
6. Report in Ukrainian: doc link, the decisions from step 3, one line on what was added from your side.

## Cases with partial sources

- No site page: the presentation and Notion are enough; the old site title does not exist, so take keywords from the product type and industry.
- No presentation and no Notion row (only the site page): write from the site page, and fill the rest from the product type.
- No ready images section: no `**Image:**` lines; add one line under the H1 block: `**Dev:** Images for this case are not made yet.`
- Audit-only or design-only projects (one slide): the Solution steps are the audit or design stages; Impact numbers describe what the audit found or the design delivered.

## Batch mode

The full list of cases is `Контекст SDA/Кейси — статус.xlsx` (sheet «Кейси»: №, name, status, site page, presentation link, images link). For the whole list, work in batches of ~5 cases: gather sources for the batch (site pages with curl, Notion rows with python, presentation texts with one `use_figma` call that keeps only text nodes of 3+ words, image frame names with one `use_figma` call), write each case to a local markdown file in the doc format, validate lengths with a script, create the docs, then record the links. Keep a progress file (case → doc link) in the scratchpad so the run can continue after a break; write the links into `Кейси — статус.xlsx` (column «Тексти (Claude Doc)», create if missing) and the cases CSV. Related Case Studies pick from the same list. After the last batch, one combined report: case → doc link → industry → AWS → what was added. If the user's review changes a rule, update this skill (and `references/`) before the next batch.
