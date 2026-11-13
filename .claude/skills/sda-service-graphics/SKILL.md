---
name: "sda-service-graphics"
description: "Use when building the dashboard images for an SDA service page (Hero, How we solve it, Take a look) in Figma from the existing dashboard library, picked by the service description."
---

# SDA service page graphics

Builds the 23 unique dashboard images (plus mobile versions) for one service page: 2 Hero, 5 modules, 15 Take a look. Native in Figma, from the existing dashboard library. Reports in Ukrainian; all layer names and notes in English. Keep reports short.

## Sources (Figma file `BPgoVTWRXLaYqIGFeeMwES`, SDA Website Redesign 2026)

The dashboard libraries live on page "☣️ Here Yulia makes graphics" (`238:2073`). The output goes to page "💻📱Service" (`481:6367`). `getNodeByIdAsync` reaches library nodes from the Service page; a clone made there can be moved into the output with `appendChild`.

- Library, 1440×900: section `3357:61361` "1440 901". Used for Hero and How we solve it. Includes at its end RouteMargin `3357:71812`, Property Detail `3357:72066`, CarrierPulse `3357:72271`, Financial Overview `3357:72555`. Main IDs: Pulse `3357:61362`, Facilities `3357:61717`, Clay `3357:62305`, PingPoint `3357:62490`, ForgeFlow `3357:62710`, PartLink `3357:64668`, Visionline `3357:65007`, Qoka `3357:65211`, Haute `3357:65226`, Samata `3357:65658`, Agroplace `3357:65966`, ETF Insider `3357:65985`, Mintarius `3357:65990`, Meatmap `3357:66110`, Rewarded `3357:67082`, Datascoop `3357:67229`, Five `3357:67239`, LivUnity `3357:67391`, FCT `3357:68032`, Dream English `3357:68373`, Hirer Pro `3357:68804`, Nexar `3357:68946`, OpenCare `3357:69360`, Homecare `3357:69716`, Smarketing `3357:69909`, GSlow `3357:70288`, Shareholder `3357:70644`, Area `3357:70864`, Medapp `3357:71066`, Airoject `3357:71358`.
- New case dashboards: section `3388:26808`, both sizes: Wildcast `3388:26950` / tall `3388:26809`, Yourflexexec `3391:89653` / tall `3391:89395`, Check Raise `3392:27283` / tall `3392:26808`, Atlas ERP `3393:26905` / tall `3393:26808`. Also tall versions: Area `3393:55296`, Property Detail `3393:55793`, Financial Overview `3393:55998`.
- Tall library, 1440×1154: section `3357:73007` "Homepage - Hero section". Used for Take a look (ratio 1.25:1 matches 700×554). Not every dashboard has a tall version. Tall versions built by this skill: Shareholder `3357:81555`, Airoject `3357:81775`, Medapp `3357:82229`, GSlow `3357:82570`, CarrierPulse `3357:82926`, RouteMargin `3357:83210`. Save new ones in this section (see Missing tall versions). Reuse them; do not rebuild.
- Hero reference with the finished depth effect: `2633:25159`; dashboards in it: `2633:25325` (Pulse, 789×493) and `2633:25175` (Risk Register).
- Service page frames: desktop `2633:25157`, mobile `2694:20871`, module states `2017:31391`, example page `2711:26125`.
- Service briefs: Google Doc `1VPu3bxCeXrAMEsKorCfrLPBySib-VmeWcmC107u6i2E` (one tab per service: header, problem, modules with "Visual:" descriptions, cases), or the per-service .md briefs ("<Service> — тексти для сайту.md") if the user attaches them; the module visual lines there are marked "Візуал:". Read the Visual lines to choose dashboards.
- Take a look source: group `3345:30231` inside section `3344:30231` "AI Product Development" (30 frames, 15 screens desktop + mobile). Until each service has its own cases and tabs, clone this group into every service section as is (renamed "Take a look").
- Output: one Figma section per service, named exactly like the service tab in the brief. Size 5000×6200, fills and strokes copied from an existing service section (e.g. `3351:262928`). Grid on the page: x = 34100 + (k%4)×5300, y = −677 + floor(k/4)×6500; the next free slot is k = 13. Never reuse another service's section. Do not rebuild a section that already exists with the same name; report it.

Built so far: Custom dashboards `3320:55636`, AI Product Development `3344:30231`, Custom Software Development `3351:32587`, AI Consulting `3351:59705`, AIoT `3351:82157`, Product Diagnostics & Discovery `3351:140012`, Legacy & Product Modernization `3351:160616`, Cloud & DevOps `3351:182366`, Business Automation `3351:215104`, AI Agents & Workflows `3351:240456`, Integrations `3351:262928`, FD Engineers `3351:291510`, Dedicated Teams `3351:312844`, Growth & Support `3351:338554`, UX/UI Design `3565:64267`.

Before Figma calls: `create_session`, then load `figma-use` and `figma-generate-design` (`get_figma_skill`) before `use_figma`. Read-only by default; write only inside the output sections and, for new tall versions, in `3357:73007`. Do not edit the library, the service frames or other sections. `get_metadata` on the library is huge: list section children with `use_figma` instead, or use screenshots at small size (`enableBase64Response: true`; URL download is blocked by the proxy).

## Hard rules

1. Never replace or edit anything inside a dashboard. Clone library frames as is.
2. No new dashboards and no extra layers on top (scope maps, code snippets, diagrams). If the doc's visual does not exist in the library, pick the closest existing dashboard. Exception: if a dashboard has no tall (1440×1154) version, build one (see Missing tall versions).
3. Dashboards stay live Figma layers, not raster.
4. Never stretch. Scale uniformly with `rescale`.
5. Rotation is not baked in. Frames are straight; put the rotation in the name.
6. No text on top, no background art. One dashboard per image.
7. No new variables, styles or components.
8. Do not call anything finished before every frame is checked for size and a screenshot.
9. ALL images go into the output section, every one of them, even if the same image already exists in the page design. Never skip a slot because it is already designed. Never move or edit the page frames. The output section is the full, self-contained set for handoff.

## The depth effect (copy exactly)

Every image frame gets it, scaled by `f = width / 789`:

- Frame fill `#0B0B0F` (r .0431, g .0431, b .0588), clip on, corner radius `21.9 × f`.
- 5 drop shadows, colour `#2F1EC1` (r .1843, g .1176, b .7569), no spread. (radius, offset x, offset y, alpha): (33.25, 12.67, 7.92, .10), (60.17, 50.67, 33.25, .09), (80.76, 112.42, 72.84, .05), (95.01, 199.51, 129.84, .01), (104.51, 313.52, 202.68, 0). Multiply radius and offsets by f.
- 1 inner shadow: white, alpha .25, radius 11.4f, spread −4.75f, offset (12.67f, 12.67f).

Build: new wrapper frame with the recipe, clone of the dashboard inside, `rescale(wrapperWidth / 1440)`, x = y = 0. Wrapper clips.

## Image specs

| Block | Count | Desktop | Mobile | Rotation (desktop) | Source |
|---|---|---|---|---|---|
| Hero D1 (back) | 1 | 789×493 | 281×176 | −4° | library 1440×900 |
| Hero D2 (front) | 1 | 789×493 | 288×180 | +6° | library 1440×900 |
| How we solve it (per module) | 5 | 789×493 | 500×312 | −5° | library 1440×900, scale width/1440 (same ratio, no crop) |
| Take a look | 15 (5 tabs × 3) | 700×554 | 300×223 | +5°, −1°, −5° (left / centre / right) | tall 1440×1154, scale width/1440, crop bottom |

Every service has 5 modules. Figma sizes win over the prototype. Take a look tabs default to AI, Healthcare, Fintech, Manufacturing, Logistics.

## Choosing dashboards

- Read the service tab in the brief: header, problem, every module's "Visual:" line, and the cases listed for the service (prefer dashboards from those cases).
- Hero = two dashboards that carry the core promise of the service. Modules = one dashboard per module, matched to the module's visual (calendar → Area, KPI/finance → Financial Overview, inbox → Smarketing, SLA/monitoring → CarrierPulse, fleet/IoT → Nexar, Visionline, ForgeFlow, admin/roles → Pulse, Haute, etc.). Judge by the screen, not by the frame name (e.g. Facilities is a dark "Market Intelligence" analytics screen). Skip landing pages (Rise, Krypt, Intelza).
- Avoid repeating the same dashboard inside one service; repeats across services are acceptable when the library is small, but flag them. To see what other sections already use, read the dashboard part of the frame names in their Hero and How we solve it groups.
- Post a table (slot → dashboard, reason) and wait for OK on the first service. For a batch of services, state the mapping and continue if the user has approved the logic.

## Batch build (several services per call)

Use one `use_figma` call per 3 services (or split one service into two calls: Hero + Take a look, then How we solve it). Per service:

1. Create the section with the service name, same fills/strokes as an existing service section, 5000×6200 at the grid position.
2. Group frame "Hero" at (100, 100), 1250×800: D1 desktop (0,0), D2 desktop (900,0), D1 mobile (0,600), D2 mobile (400,600).
3. Group frame "How we solve it" at (100, 1100), 4600×950: module i desktop at (i×900, 0), mobile at (i×600, 600).
4. Clone group `3345:30231` to (100, 2400), name "Take a look".
5. Verify: every frame whose name has `WxH` has exactly that size.
6. Group frames are `fills = []`, `clipsContent = false`.

For each image: clone the library frame, load its fonts, detach all instances (outermost first, repeat until none left), record every text node's height (by index), wrap in the effect frame, `rescale`, then set each text height = recorded height × scale (see Scaling gotchas), x = y = 0.

Frame naming: `Hero D1 · <Dashboard> · 789x493 · rot -4`, `Module N · <Title> · <Dashboard> · 789x493 · rot -5` (+ ` · mobile`), `Take a look · <Tab> N · <Dashboard> · 700x554 · rot +5/-1/-5`.

## Missing tall versions

If a chosen dashboard has no 1440×1154 version in `3357:73007` or `3388:26808`:

1. Build it directly in section `3357:73007`, in free space below the lowest existing frame (compute the max bottom of its children, leave ~200 px; grid step 1575 × 1354). Name `<Dashboard> · tall 1440x1154`.
2. Clone the 1440×900 frame, clip on, `resize(1440, 1154)`, resize its direct child frames (sidebar, main) to 1154.
3. If there is empty space at the bottom, add content by cloning existing blocks (table card, KPI row) and changing only demo text. Keep demo text plausible, no claims about real companies or results. Load the font before changing `characters`; set `textAutoResize = WIDTH_AND_HEIGHT` for short strings.
4. Screenshot to check.

## Scaling gotchas

- `rescale` of a clone with INSTANCEs can reflow text and misalign table columns. Detach every instance first. If a table header cell is HUG and taller than the others, set all headers in that table to the same FIXED height and `counterAxisAlignItems = MIN`.
- The file does not have the font "Avenir Next Cyr" (used by Shareholder and others). Figma cannot re-layout text in a missing font, so text heights stay stale after `rescale` (title still 46 px at fontSize 21, layout breaks, content pushed out of the frame). `loadFontAsync` and `textAutoResize` fail for these texts. Fix: before `rescale`, store `height` of every TEXT node (findAll order); after `rescale`, call `t.resize(t.width, storedHeight × scale)` for each. `resize` works without the font.
- After building, check every dashboard: screenshots, plus a node-count/name comparison against the source. Known case: the Datascoop library frame has a bottom `Frame 1000010680`; the approved images do NOT include it (keep as built, 4 rectangles).
- Call `setCurrentPageAsync` for the Service page before `figma.currentPage.findAll`.

## Workflow

1. Collect input: service name(s), brief, module titles, Take a look tabs. State assumptions in one line.
2. Match dashboards (see Choosing dashboards).
3. Build (single service or batch).
4. Verify: sizes, slot count (2 Hero + 2 mobile, 5 modules + 5 mobile, 15 + 15 Take a look = 44 frames), screenshot of each group.
5. Report briefly in Ukrainian: what was built and where, repeated dashboards, approximate matches to the brief visuals, open decisions.

## Export

Only if asked: PNG @2x, transparent background, names = frame names, straight (no rotation). Shadows extend outside the frame, so export with the effect bounds included.