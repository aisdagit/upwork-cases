---
name: "sda-case-graphics"
description: "Use when building the images for an SDA case study page (Hero, Overview card, Challenges, Solution tabs, Related case card, plus mobile versions) in Figma from the case's presentation, the dashboard library and generated industry photos. Triggers: «зроби картинки для кейсу», «графіка для сторінки кейсу», «картинки для Single Case», a case name plus «картинки/зображення»."
---

# SDA case page graphics

Builds the full image set for one case study page on the redesigned site: the same blocks and the same meaning as the current case page, but new images. Native in Figma, one section per case. Reports in Ukrainian; layer names and notes in English. Keep reports short.

## Sources

**Website file `BPgoVTWRXLaYqIGFeeMwES`** (SDA Website Redesign 2026)
- Case page template: page "💻📱Single Case" (`398:28244`), section "Single case old text structure" (`2017:3545`). Desktop frame `2008:25259`, mobile frame `3052:21598`, solution tab states `2017:3546`, `2017:3554`, `2017:3562`. These define the blocks and slot sizes. Never edit them.
- Related Case Studies block `3044:16582` shows the 3 allowed card formats (see Related case card).
- Dashboard library (same as sda-service-graphics), page "☣️ Here Yulia makes graphics" (`238:2073`): desktop 1440×900 section `3357:61361`, tall 1440×1154 section `3357:73007`, new case dashboards `3388:26808`. CarrierPulse `3357:72271` / tall `3357:82926`, RouteMargin `3357:71812` / tall `3357:83210`, Meatmap `3357:66110`, Nexar `3357:68946`, Pulse `3357:61362` — the full ID list is in sda-service-graphics.
- Mobile screens 390×844, page "source images" (`3401:89481`), sections "Mobile 390x844 – A…E": `3429:70387` (Homecare, Smarketing, Facilities, Unomundi, Qoka, PingPoint, Clay, PartLink, ForgeFlow, Visionline), `3429:69293` (Haute, Samata Health, Rise, Agroplace, WildCast, ETF Insider, Five, Kyle App, Yourflexexec), `3429:40166` (Rewarded, Shmoodie, Spread, Live unity, Intelza, MeatMap, Datascoop, FCT, dreamenglish, HeyBodhi), `3429:68896` (Inplay, Hirer Pro, Bakesy, Nexar Fleet, OpenCare, Shareholder, Area, Krypt, Nubod, Medapp), `3429:68992` (Airoject, GS low, TransactIQ, RouteMargin, PortfolioPulse, CarrierPulse `3436:103082`, The Hourglass Society, Poker, Check Raise). Find a screen by name: list the section children with `use_figma`.
- Extra screens: "Pool – extra desktop – A/C/D" on the same page (Clay Lab Orders, PingPoint Statistics, FCT Order Detail, HirerPro Company Profile, Area Work Schedule, Krypt, Nubod).

**Case presentation file `pIWSeoboE8cJuUW6jr4TXt`** (case-presentation): one page per case (page name = product, e.g. "✅CarrierPulse" `1600:5167`). Each case has a section of ~5 slides 1920×1080: cover with a device mockup (laptop/phone, often a separate raster layer without text), Problem & Context with live UI cards (KPI, charts, tables), Solution modules, Results & Impact, summary slide with a person/scene photo cutout. The link to the case's slides is also in the Notion cases table, column «Cases NEW».

**Case text** (blocks, challenges, solutions): the case page on the site (stage.sda.company needs a login; sda.company has the same text), the Notion cases export `Контекст SDA/База знань про компанію/Projects SDA …_all.csv` (Description, Pains, Solutions, Industry, Type), and the presentation slides.

Before Figma calls: `create_session`, load `figma-use` and `figma-generate-design` (`get_figma_skill`). Write only inside the case's output section. Do not edit the template frames, the library or the presentation file.

## Slots (sizes from the template; Figma wins)

| Slot | Desktop | Mobile | Count |
|---|---|---|---|
| Hero | 1360×510 | 343×240 | 1 |
| Overview card (image under the first feature card) | 716×573 | — (mobile has no image) | 1 |
| Challenges | 334×334 | 343×343 (first two only) | 3 |
| Solution tab | 636×509 | 319×260 | one per «Provided Solutions» item (usually 4–6) |
| Related case card (used in Related Case Studies and listings) | 440×440 | 343×343 | 1 |

All slots: corner radius 8, background `#0B0B0F`, clip on.

## What goes in each slot

Keep the meaning of the current page, change the picture. Every case has a different amount of visuals, so pick per slot from what exists, in this order of preference, and say in the report what was used.

**Hero.** The product in use, big and readable. Centre the device (laptop + phone as one group) horizontally and vertically: the site puts the title on top, and an empty dark side looks like a gap. Where the cover image ends inside the slot, fill with `#0B0B0F` and a soft edge gradient (builder `centerHero`). The case has a mobile app → phone(s) with the case's mobile screen (alone or next to the laptop). Web only → laptop. Sources: the device mockup from the presentation cover, plus the case's mobile screen or dashboard from the library with the depth effect. Brand-colour glow behind the device. The device must be whole on mobile (343×240): re-crop, don't just scale.

**Overview card.** Top ~170 px stay empty and dark: the site puts the feature title and text there. Below: the case dashboard (tall version) with the depth effect, tilted −5…−8°, bleeding off the right/bottom edge, plus one **drawn** UI card about the page's first Overview feature (e.g. «Personalized Matching» → a «Your best match» card with a person, match %, tags and a button). Never use a cropped piece of a screen as the card. Mobile-only cases keep two phones + person, no card.

**Challenges.** One industry photo per challenge, matching that challenge's text (3 challenges; if the page lists more, take the 3 most concrete). Real-looking photos: the industry's place, objects or work situation, moody low-key light, dark tones. No UI, no text, no logos, no recognisable faces. Use photos from the presentation if they fit; otherwise generate with `generate_image` (see Generated photos).

**Solution tabs.** One image per solution item, drawn for that item's text in the product's style (its font, accent colours, light or dark cards, people photos and logo from the library screen). Never crop the same dashboard for several tabs. Every tab in a case uses a **different composition**; pick by meaning:
- `flow`: integrations, data sources, architecture, infrastructure (nodes + connectors + chips);
- `emblem`: security, roles and access, support, QA, monitoring (big icon + staggered status rows);
- `gauge`: speed, performance, savings, growth (big number ring + trend line);
- `phone`: mobile apps, notifications, alerts (lock screen with notifications + tilted card);
- `table`: lists, catalogues, orders, applications (table + highlighted row detail card);
- `kpis`: analytics, dashboards, reporting (bar chart + 3 KPI tiles);
- `steps`: discovery, MVP, prototypes, rollout (timeline with alternating step cards);
- `profiles`: marketplaces, people, offers, plans, products (three fanned cards; `icon` for non-people);
- `chat`: AI assistants, voice bots, messaging;
- `compare`: legacy → new, before/after, validation.
Numbers come from the case text when it has them (e.g. «15 s → 1 s», «x10», «$200k saved»); other values are plausible demo data. If the page has one untitled «Provided Solution» block, make one tab.

**Related case card.** One of the 3 formats in `3044:16582`:
1. angled close-up of the laptop with the product screen (`3044:16589`);
2. brand-colour background with a collage of mobile screens and a photo (`3044:16592`);
3. laptop front view on a dark gradient (`3044:16925`).
Mobile app → format 2; dashboard/web → 1 or 3. The site overlays the case title on the bottom ~180 px with a gradient, so keep the device in the top 60%.

If a case has almost nothing (no mockup, no library screens): compose from the presentation's UI cards and colours, and generate a scene photo for the Hero/Card in the product's colours and context. Say so in the report.

## Build rules

1. Library dashboards: clone as is, detach instances (repeat until none), keep text heights through `rescale` (see Scaling gotchas in sda-service-graphics), never edit content, never stretch (uniform `rescale` only).
2. Depth effect for floating screens and phones: the recipe from sda-service-graphics (frame fill `#0B0B0F`, 5 drop shadows `#2F1EC1`, 1 inner white shadow, scaled by `f = width / 789`). Phones: corner radius ~26 at 200–220 px width.
3. Brand glow: ellipse with the product's accent colour, opacity 0.18–0.22, layer blur ≈ 35% of its size. Take the accent from the product UI (e.g. CarrierPulse lime `#B0E340`, RouteMargin mint `#8CD9AD`); behind a person cutout a glow in the cover's background tone works better (RouteMargin navy `#4052A0`, opacity 0.35).
4. Inside a slot, rotation is allowed (the slot frame itself stays straight). Hero, Card and Challenges: no added text, captions or badges. Solution tabs and the Overview card are drawn UI in the product's style (see Drawn compositions).
5. Mobile versions: Solution — clone the desktop frame, `rescale(319/636)`, `resize(319, 260)`. Hero and Card — rebuild the crop so the main device is whole. Challenges — the same photo resized to 343×343.
6. No new variables, styles or components.

## Moving assets from the presentation

Nodes cannot be cloned between files. For each asset: `get_screenshot` on the presentation node (`contentsOnly: true`, `maxDimension` = node size; the PNG keeps transparency and shadow bounds) → download with `curl` → `upload_assets` into the website file (`currentPageId` = `398:28244`, multipart POST with an absolute file path) → move the created frames into the case section's "Sources" group and reuse their `imageHash`. Screenshots are 1× of the node size, so use them at that size or smaller; for crisp large screens prefer the library dashboards (live layers).

## Generated photos

`generate_image` with `nodeId` of a rectangle that already has any image fill (it replaces the fill, keeps the size). Square 1024×1024. Prompt pattern: «Realistic editorial photo: <industry place/objects that show this challenge>. Moody low-key lighting, dark tones with warm or cool highlights, shallow depth of field. No readable text, no logos, no faces.» Each call spends Figma AI credits; tell the user how many images were generated.

## Output in Figma

One section per case on "💻📱Single Case", named `Case images · <Product>`, 4400×4300, fill copied from a service section (`3351:262928`). Grid: x = 14500 + k×4600, y = −707. Next free slot k = 39. Never rebuild a section that exists; report it.

Inside (group frames, `fills = []`, `clipsContent = false`):
- "Sources (from case-presentation)" at (100, 100) — uploaded rasters, named `src · …`;
- "Hero" at (100, 1400): desktop (0, 0), mobile (1460, 0);
- "Overview card" at (100, 2050);
- "Challenges" at (900, 2050): desktop i×400, mobile below at y 420;
- "Related case card" at (2300, 2050): desktop (0, 0), mobile (500, 0);
- "Solution tabs" at (100, 2900): desktop i×700, mobile below at y 600.

Frame names: `Hero · <Product> · 1360x510`, `Overview · <Product> · 716x573`, `Challenge N · <short challenge> · <Product> · 334x334`, `Solution N · <solution title> · <Product> · 636x509`, `Card · <Product> · 440x440`; mobile adds ` · mobile` with its size.

Built so far (k = 0…38, all 39 cases that have both a site page and a presentation): CarrierPulse `3641:31998`, RouteMargin `3645:31998`, TransactIQ `3653:31998`, PortfolioPulse `3654:32011`, Unomundi `3657:32000`, Datascoop `3657:33010`, HeyBodhi `3657:33641`, Intelza `3659:32004`, Nexar (Dashcam) `3659:32398`, Shareholder `3659:38484`, ETF Insider `3662:31998`, Rewarded `3662:32801`, OpenCare `3662:38617`, HomeCare `3663:31998`, MedApp `3663:40349`, Facilities `3663:42483`, HirerPro `3666:31998`, FCT (Firstcomtrading) `3666:36037`, Mintarius `3666:39498`, Samata Health `3667:31998`, GCO / GS low `3667:35750`, YourFlexExec `3667:38054`, MeatMap `3672:31998`, Area `3672:53204`, Five `3672:62404`, WildCast `3674:31998`, Check Raise (Poker) `3674:32755`, Airoject `3674:34682`, Kyle App `3678:31998`, InPlay `3678:32776`, Spread `3678:33936`, The Hourglass Society `3679:31998`, LivUnity `3679:32878`, Nubod `3679:38049`, Shmoodie `3683:31998`, Bakesy `3683:32701`, Qoka `3683:35174`, Dream English `3684:31998`, Krypt `3684:33897`. The mapping site URL ↔ product ↔ presentation ↔ section is in `Контекст SDA/Кейси — сайт, Notion, Figma.xlsx`; add new sections there (column «Картинки для сторінки (Figma)»). Every section also has a text layer «Case page: <URL>» at the top for the developer.

## Drawn compositions (Solution tabs + Overview card)

`compositions.js` (next to this file) holds the 10 compositions and the Overview card. It is stored in the website file as shared plugin data, so a call only sends content:

```js
const L = eval(figma.root.getSharedPluginData('sda','caselib'));
const T = await L.theme({font:'Inter', dark:false, ink:'#111827', acc:'#4b5bdc', accL:'#eef0fd', av:[avatarHashes]});
await L.redoCase(sectionId, T, [['flow',{...}], ['kpis',{...}], ...], overviewData /* or null */);
```

`redoCase` clears each «Solution N · … · 636x509» frame, draws the composition, rebuilds the 319×260 mobile copy, and (with overview data) replaces the Overview card. Take the theme from the library screen: most common font family, background and accent colours, round image hashes for avatars (only if they are people, not logos). Figma reformats stored code, so to change the library re-store the whole file (wrap it in a function and store `'('+f.toString()+')()'`). Fonts that exist but do not render (SF Pro Rounded) leave empty text: check every case screenshot and fall back to Inter. Do 3–5 cases per call and screenshot the «Solution tabs» group of each case.

## Batch mode (several cases per run)

Use `builder.js` (next to this file): paste it into `use_figma`, then call `build(config)` for 3 cases per call (more risks a dropped connection; after a drop, list the sections before rebuilding, because the call may have finished). Config: `P`, `X`, `url`, `acc`, `tall`, `desk`, `mob` (library ids, any may be missing), `src` ([key, uploadedNodeId, name] with keys `cover`/`person`), `L` (device bbox in the 1920×1080 cover: x, y, w, h), `coverPhones` (cover already shows the phone → no extra phone in Hero), `heroX`, `sol` ([title, kind]), `ch` (3 short names). Solution kinds: `whole`, `zoom`, `desk`, `phones`, `phone1`, `phonezoom`, `person`, `scene`, `cover`.

Finding sources fast: one `use_figma` per batch on the presentation file lists, per case page, the cover (an image rectangle ≥1800 px wide, or a slide whose fill is the image with an empty «image N» placeholder) and person cutouts (image rectangles 600–1400 wide, ≥850 tall). When the device is in the slide fill, create a temporary rectangle with that fill far off-canvas (`_tmp cover export (delete)`), screenshot it, then delete every `_tmp` rectangle in the same session; that is the only change allowed in the presentation file. Tile all candidates into one preview image to choose and measure `L`.

No mockup on the cover (or the cover shows another product: Qoka's cover shows Five) → the builder makes Hero and Card from live library dashboards with the depth effect. Mobile-only apps → Overview with two phones. Old site pages with one untitled «Provided Solution» block → one tab named «Provided Solution»; a page with no solutions → take tab names from the presentation and say so.

`generate_image`: always pass `width`/`height` 1024. It sometimes creates a new «Generated Image» frame on another page instead of filling the slot (the result's `nodeId` differs from the slot). Then copy that frame's `imageHash` into the slot and delete the frame; finish each batch by checking the library page for stray «Generated Image» frames.

Person cutouts keep the real image aspect (read it with `figma.getImageByHash(hash).getSizeAsync()`, not the uploaded frame's size): a 4:3 rectangle with FILL crops the head. Check every person frame for a whole face.

Final check for the whole page: every frame named with `WxH` matches, every section has 5 Challenge images, no Challenge still shows a source/cover hash. Never run a «fix all sections» script without excluding approved sections (CarrierPulse, RouteMargin have hand-tuned crops).

## Workflow

1. Input: case name (product). Find the presentation page, the library screens (desktop, tall, mobile), and the case text: challenges list and Provided Solutions list. State in one line what exists (mockup, mobile app, cards, photos).
2. Plan: a table slot → source/composition → reason. For the first case or when unsure, wait for OK; otherwise continue.
3. Move the needed presentation assets into "Sources".
4. Build Hero, Overview, Card; then Solution tabs with mobile; then Challenges (create slots, generate photos, add mobile copies).
5. Verify: every frame whose name has `WxH` has that exact size; slot count = 2 + 1 + 3 + 2 + 2N + 2; one screenshot per group; devices whole on mobile crops; Overview top area empty.
6. Report in Ukrainian: section link/ID, what was used for each slot, generated photos count (credits), approximate matches, open questions.

## Export

Only if asked: PNG @2x, names = frame names. Rotated elements are inside the frames, so export the frames as they are.
