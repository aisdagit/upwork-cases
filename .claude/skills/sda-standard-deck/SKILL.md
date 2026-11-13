---
name: "sda-standard-deck"
description: "Build an SDA business proposal PDF in the standard SDA deck style (dark green/indigo, mint/lavender light slides, Rubik + Inter) from an estimate .xlsx, using the SDA Brand Kit zip for logo and photos."
---

# SDA standard proposal deck (PDF)

Use when the user asks for a proposal / пропоузал / презентацію для клієнта "в нашому стилі" from an SDA estimate. Output: one PDF, 960×540 pt pages (16:9), every slide rasterized at 2560×1440 with clickable link annotations. Reply in the user's language (usually Ukrainian); slide text in English unless asked.

## Inputs

1. **Brand assets** — bundled in `assets/` next to this SKILL.md (same files as SDA_Brand_Kit.zip; if `assets/` is missing, ask for the kit zip). Contents:
   - `sda_logo_yellow.png` — SDA wordmark, yellow, transparent
   - `contact_avatar_oleksandr.jpg` — founder avatar (show as a circle)
   - `contact_team_photo.jpg` — team photo with "Your next big move starts here" baked in (2475×2160, right part of the contact slide)
   - `and_many_more.jpg` — full-bleed "And many more" slide
   - `fonts/` — rubik-latin-800/900, inter-latin-400/500/600/700 (woff2)
   Ready-made scripts: `scripts/shoot.js` (screenshots + link boxes) and `scripts/build_pdf.py` (assembles the PDF). Fallback for fonts only: `npm i @fontsource/rubik @fontsource/inter`.
2. **Estimate .xlsx** (SDA template). Read with `openpyxl.load_workbook(path, data_only=True)` (Google Sheets formulas → cached values only).
   - `Summary`: row 4 role names, 5 hours, 6 hours/day, 7 weeks, 8 rate, 9 cost (show only roles with hours > 0); rows 11–12 Optimistic / Realistic / Pessimistic hours and budget; D16 start date; R16 duration; B18 tech stack; B20 risks; footnotes B13, B21.
   - `Scope`: A = TRUE/FALSE included, B = item, S = description; rows with text only in A are section headers.
   - `Findings` (audit projects): ID, severity, area, finding, evidence, fix, hours.
   - `Config` (~rows 27–37): Start/End per role and the `Release` date → roadmap.
   - Don't show the "Monthly budget" cell for projects shorter than a month (it's extrapolated). Show realistic total + range.
3. **Cases PDF** ("All Cases 1 page", one case per 16:9 page). View thumbnails (`pdftoppm -r 18`, contact sheet), pick the 3–4 most relevant to this client, render chosen pages with `pdftoppm -r 96 -jpeg -jpegopt quality=88 -f N -l N`, insert as full-bleed slides.
4. Optional brief, audit or previous proposal for content.
5. Links: estimate Google Sheet → "VIEW ESTIMATION ↗" button on the estimate slide; booking → "BOOK AN APPOINTMENT" on the contact slide, default `https://tidycal.com/sda/meet-sda`. If the sheet link is missing, ask once. Remind the user to set the sheet to "Anyone with the link".

## Slide structure (adapt to the project)

1. Cover (dark): "BUSINESS<br>PROPOSAL" Rubik 900 ~92px top-left; 3 small rotated glass icon cards with yellow outline icons; project name 24px + subtitle 16px bottom-left; logo bottom-right (28px high)
2. Overview (dark): logo top-left, vertical "OVERVIEW" ~76px on the right; vertically centered goal line (Rubik 800 30px, uppercase, yellow left border) + two 17px paragraphs
3. Business needs / what was found (light)
4–9. Scope: priority table, "SCOPE OF WORK" vertical title + 3×3 card grid, detail tables, feature/architecture cards (alternate dark/light)
10. Estimate summary (dark): white table with yellow header (roles × Hours*, Hours per day, Duration (weeks), Rate per hour, Cost); totals table Optimistic / **Realistic** / Pessimistic; right card "REALISTIC BUDGET $X" (Rubik 60px yellow) + hours, weeks, start and release dates; yellow pill link "VIEW ESTIMATION ↗" under it; footnotes 12px at the bottom
11. Roadmap (dark): subtitle with start · release · duration; 4 week cards (yellow date label, title, 17px text); milestone diamonds row; lead line
12. Risks & assumptions (dark): numbered rows (yellow circle, Rubik 19px label, 17px description)
13. Built when it's needed: optional / later items with hours and trigger
14. Engagement model (dark): vertical title, checklist cards: Delivery approach, Communication, After release, Commercial models, Team setup (role tags)
15. Next steps (light): vertical "NEXT STEPS" 76px, 5 white pill rows (number, label 18px, description 17px), vertically centered
16. Relevant cases divider (dark, HTML): centered "RELEVANT <span class=y>CASES</span>" 96px, 19px subtitle, logo 30px, two rotated glass icon cards
17–20. Case pages (images)
21. `and_many_more.jpg` full-bleed
22. Contact (see below)

Only use facts from the estimate, audit, brief or the user. If you split work into weeks/milestones yourself, say so in the reply. Guarantee/support terms only as stated in the estimate.

## Design system (standard SDA colours)

- Slide = `<section class="s">` 1280×720 CSS px. Dark: base `#131313`, green glow top-left, indigo glow bottom-right. Light: `#eef1f6`, mint top-left, lavender bottom-right. Accents: yellow `#FFE51F` (dark), blue `#2C24D8` (light), red `#FF4D4D` (critical).
- Headings uppercase Rubik 900, h2 60px, highlight 1–2 words with `.y` (dark) / `.b` (light).
- Text large: tables 16px (14px only for 9+ row tables), card text 15.5–17px, card titles 19px, lead 16px. No tiny text, no big empty areas.
- Content between title and lead line goes in `.mid` (absolute flex column, centered vertically). Slides with a vertical title center content in their own absolute flex box.
- In row/pill layouts: label column `flex:none`, description `flex:1` so wrapped rows stay aligned.

```css
/* @font-face for Rubik 800/900 and Inter 400-700 from the kit (base64 woff2) goes first */
@page{size:1280px 720px;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.s{width:1280px;height:720px;position:relative;overflow:hidden;color:#fff;padding:44px 52px;
  background:radial-gradient(900px 520px at 100% 105%,rgba(52,36,170,.75),transparent 70%),
             radial-gradient(700px 420px at 0% 0%,rgba(30,70,52,.55),transparent 70%),
             radial-gradient(600px 400px at 30% 110%,rgba(30,80,58,.45),transparent 70%),#131313}
.s.light{color:#141414;background:radial-gradient(800px 500px at 100% 100%,rgba(196,180,250,.65),transparent 70%),
             radial-gradient(800px 500px at 0% 0%,rgba(200,245,225,.9),transparent 70%),#eef1f6}
.img{padding:0;background:#131313}.img img{width:100%;height:100%;display:block}
h1,h2,.h{font-family:Rubik;font-weight:900;text-transform:uppercase;letter-spacing:.2px;line-height:1.02}
h2{font-size:60px}
.mid{position:absolute;left:52px;right:52px;top:124px;bottom:86px;display:flex;flex-direction:column;justify-content:center}
.mid.nolead{bottom:36px}
.y{color:#FFE51F}.b{color:#2C24D8}
.logo{height:22px;position:absolute}
.lead{border-left:3px solid #FFE51F;padding-left:14px;font-size:16px;line-height:1.45;position:absolute;left:52px;right:52px;bottom:38px}
.light .lead{border-color:#2C24D8}
.card{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:20px 22px}
.light .card{background:rgba(255,255,255,.75);border:1px solid rgba(255,255,255,.9);box-shadow:0 6px 24px rgba(60,60,120,.08)}
.ct{font-family:Rubik;font-weight:800;text-transform:uppercase;font-size:19px;margin-bottom:10px}
.cx{font-size:15.5px;line-height:1.5;color:rgba(255,255,255,.78)}
.light .cx{color:#3b3b48}
.lbl{font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#FFE51F;margin-bottom:6px}
.light .lbl{color:#2C24D8}
.grid{display:grid;gap:12px}
table{width:100%;border-collapse:collapse;font-size:16px}
th{font-size:12px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.55);font-weight:600;text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12)}
td{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.07);vertical-align:top;line-height:1.4;color:rgba(255,255,255,.88)}
.light th{color:#6b6b80;border-color:#dcdcea}.light td{color:#25252f;border-color:#e6e6f0}
.chip{display:inline-block;font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;text-transform:uppercase;white-space:nowrap}
.cC{background:#FF4D4D;color:#fff}.cH{background:#FFE51F;color:#141414}.cM{background:#2C24D8;color:#fff}.cL{background:rgba(255,255,255,.18);color:#fff}
.num{width:32px;height:32px;border-radius:50%;background:#FFE51F;color:#141414;font-weight:700;font-size:15px;display:inline-flex;align-items:center;justify-content:center;flex:none}
.light .num{background:#2C24D8;color:#fff}
.vert{position:absolute;writing-mode:vertical-rl;transform:rotate(180deg);font-family:Rubik;font-weight:900;font-size:60px;text-transform:uppercase;line-height:1}
ul.ck{list-style:none}ul.ck li{font-size:17px;line-height:1.45;padding-left:24px;position:relative;margin-bottom:10px;color:rgba(255,255,255,.85)}
ul.ck li:before{content:'';position:absolute;left:0;top:4px;width:13px;height:13px;border:1.5px solid #FFE51F;border-radius:50%}
ul.ck li:after{content:'';position:absolute;left:5px;top:7px;width:3px;height:5px;border:solid #FFE51F;border-width:0 1.5px 1.5px 0;transform:rotate(45deg)}
.tag{display:inline-block;border:1px solid rgba(255,255,255,.35);border-radius:20px;padding:7px 14px;font-size:12px;font-weight:700;text-transform:uppercase;margin:0 5px 6px 0}
.tag.f{background:#FFE51F;color:#141414;border-color:#FFE51F}
.tight{font-size:14px}.tight td{padding:8px 12px}
.roomy td{padding:17px 16px;font-size:17px}
.stat{font-family:Rubik;font-weight:900;font-size:56px;line-height:1}
.btn{display:block;background:#FFE51F;color:#141414;text-decoration:none;text-align:center;font-weight:700;font-size:15px;letter-spacing:.6px;text-transform:uppercase;padding:15px 20px;border-radius:30px}
```

Generator pattern (Python writing one HTML file, images embedded as base64 data URIs): `S(body, cls='')` appends a section; when body contains `</h2>`, wrap everything after it up to `<div class="lead">` in `<div class="mid">` (or `.mid.nolead`). Image slides: `<section class="s img"><img src="data:image/jpeg;base64,..."></section>`.

Contact slide:

```html
<section class="s" style="padding:0;background:#131313">
 <img src="{TEAM}" style="position:absolute;right:0;top:0;height:720px;width:825px;object-fit:cover">
 <div style="position:absolute;left:52px;top:0;bottom:0;width:360px;display:flex;flex-direction:column;justify-content:center">
  <img src="{AVATAR}" style="width:150px;height:150px;border-radius:50%;object-fit:cover;margin-bottom:24px">
  <!-- for each: label 17px rgba(255,255,255,.65); value Rubik 800 30px; 1px divider rgba(255,255,255,.18) between -->
  Founder@SDA / Oleksandr Shubin · Email / alex@sda.company · Phone / +421918131914
  <a href="https://tidycal.com/sda/meet-sda" style="align-self:flex-start;margin-top:8px;text-decoration:none;background:#FFE51F;color:#141414;font-weight:700;font-size:17px;text-transform:uppercase;padding:16px 30px;border-radius:40px">Book an appointment</a>
 </div>
</section>
```

## Rendering — rasterize slides

Vector PDF from Chrome keeps semi-transparent cards, gradients and shadows as transparency groups, which Preview/Acrobat show with grey bands and shifted colours. Always screenshot each slide at 2× and assemble with reportlab, re-adding link rectangles.

```js
// shoot.js — Playwright is preinstalled; don't reinstall
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1280,height:720},deviceScaleFactor:2});
await p.goto('file:///ABS/PATH/proposal.html');await p.evaluate(()=>document.fonts.ready);
const secs=await p.$$('section');const links=[];
for(let i=0;i<secs.length;i++){await secs[i].screenshot({path:`shots/s${String(i+1).padStart(2,'0')}.png`});
 const ls=await secs[i].$$eval('a',as=>as.map(a=>{const r=a.getBoundingClientRect(),s=a.closest('section').getBoundingClientRect();
   return {href:a.href,x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height}}));
 for(const l of ls) links.push({page:i,...l});}
require('fs').writeFileSync('shots/links.json',JSON.stringify(links));await b.close();})();
```

```python
import glob, json
from PIL import Image
from reportlab.pdfgen import canvas
W,H=960,540; k=W/1280
links=json.load(open('shots/links.json'))
c=canvas.Canvas(OUT_PDF,pagesize=(W,H)); c.setTitle(TITLE)
for i,f in enumerate(sorted(glob.glob('shots/s*.png'))):
    j=f.replace('.png','.jpg'); Image.open(f).convert('RGB').save(j,quality=90)
    c.drawImage(j,0,0,W,H)
    for l in links:
        if l['page']==i:
            c.linkURL(l['href'],(l['x']*k,H-(l['y']+l['h'])*k,(l['x']+l['w'])*k,H-l['y']*k),relative=0)
    c.showPage()
c.save()
```

Verify links with pypdf (`page['/Annots']` → `/A` → `/URI`).

## QA before sending

- Contact sheet of all slides (`pdftoppm -r 40`, grid) and look: no overflow, no empty halves, content centered, text readable; dense slides at higher resolution.
- Every number matches the estimate (hours, rates, costs, totals, dates).
- Both link buttons clickable.
- File name `<Client>_<Project>_Proposal_SDA.pdf`, send with SendUserFile. In the reply mention only what the user must check: your own assumptions (e.g. week split), missing links, sheet sharing.