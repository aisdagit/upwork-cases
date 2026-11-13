#!/usr/bin/env python3
"""Pick the rows that need enrichment (stage 2) and print compact cards in batches.

Usage:
  python3 select_rows.py "<… - етап 1.csv|xlsx>" [--offset 0] [--limit 12] [--groups S,A,B] [--rows 3,17] [--skip-done batches/]

Who is selected (rows of the stage 1 table, 0-based like dump_rows.py):
  S — «Базово підходить» = TRUE and no website
  A — undetermined, DM with description (group A), no website
  B — undetermined, DM without description (group B), with or without website (they need a product description)
Tier 3 / Investor / Partner / duplicates / group C are skipped.
--count: print only the number of rows and their indices (for splitting work between agents).
--skip-done: skip rows already present in batch JSON files of that folder (to resume after a break).
Card fields: name, title, company, countries, pitch, interests, corporate email domain, personal LinkedIn (hint only),
existing website, stage 1 comment.
"""
import argparse, csv, glob, json, os, re

ap = argparse.ArgumentParser()
ap.add_argument("table"); ap.add_argument("--offset", type=int, default=0); ap.add_argument("--limit", type=int, default=12)
ap.add_argument("--groups", default="S,A,B"); ap.add_argument("--rows", default=""); ap.add_argument("--skip-done", default=""); ap.add_argument("--count", action="store_true")
a = ap.parse_args()
if a.table.lower().endswith((".xlsx", ".xlsm")):
    import openpyxl
    ws = openpyxl.load_workbook(a.table, read_only=True, data_only=True).worksheets[0]
    data = [["" if c is None else str(c) for c in r] for r in ws.iter_rows(values_only=True)]
else:
    data = list(csv.reader(open(a.table, encoding="utf-8-sig", newline="")))
H, rows = data[0], data[1:]
low = [h.strip().lower() for h in H]
def ci(*names, prefix=False):
    for n in names:
        for i, h in enumerate(low):
            if (h.startswith(n) if prefix else h == n): return i
    return None
C = {"first": ci("first_name", "first name", "ім'я"), "last": ci("last_name", "last name", "прізвище"),
     "title": ci("company_title", "job position", "title", "position", "посада"), "company": ci("company_name", "organisation", "organization", "company", "компанія"),
     "countries": ci("company_countries", "country", "countries", "країни"), "pitch": ci("pitch", "about / bio", "about", "bio", "опис (pitch)"),
     "interests": ci("interests", "industry tags", "інтереси"), "email": ci("email"), "linkedin": ci("linkedin", "linkedin особистий"),
     "website": ci("website", "сайт (фінальний)", "company_website"), "fit": ci("базово підходить", prefix=True),
     "comment": ci("коментар з причиною", "коментар етап 1 (фільтр)", "коментар етап 0"), "group": ci("група (для невизначених)"), "tier": ci("tier", "статус")}
g = lambda r, k: (r[C[k]].strip() if C[k] is not None and C[k] < len(r) else "")
DM = re.compile(r"ceo|founder|cto|coo|cio|cdo|managing|geschäftsf|owner|president|\bmd\b", re.I)
FREE = re.compile(r"@(gmail|googlemail|yahoo|hotmail|outlook|gmx|web\.de|icloud|me\.com|live|aol|proton|t-online)\.", re.I)
done = set()
if a.skip_done and os.path.isdir(a.skip_done):
    for fp in glob.glob(os.path.join(a.skip_done, "*.json")): done |= set(json.load(open(fp, encoding="utf-8")).keys())
want = {x.strip().upper() for x in a.groups.split(",")}
pick = []
for i, r in enumerate(rows):
    if str(i) in done: continue
    fit, com = g(r, "fit"), g(r, "comment").lower()
    if fit.upper().startswith("FALSE") or "дубль" in com: continue
    grp = g(r, "group") or (("A" if len(g(r, "pitch")) > 40 else "B") if DM.search(g(r, "title")) else "C")
    if fit.upper().startswith("TRUE"): grp = "S"
    has_site = bool(g(r, "website"))
    if grp == "C" or grp not in want: continue
    if grp in ("S", "A") and has_site: continue
    pick.append((i, grp))
if a.rows: pick = [(int(x), "?") for x in a.rows.split(",") if x.strip()]
order = {"S": 0, "A": 1, "B": 2, "?": 3}
pick.sort(key=lambda t: order[t[1]])
if a.count:
    print(len(pick)); print(",".join(str(i) for i, _ in pick)); raise SystemExit
print(f"# До збагачення: {len(pick)} рядків ({', '.join(f'{k}={sum(1 for _, x in pick if x == k)}' for k in ('S','A','B') if any(x == k for _, x in pick))}); показано {min(a.limit, max(0, len(pick)-a.offset))} з offset {a.offset}\n")
for i, grp in pick[a.offset:a.offset + a.limit]:
    r = rows[i]; em = g(r, "email"); dom = em.split("@")[-1] if em and not FREE.search(em) else ""
    print(f"=== row {i} [{grp}] {g(r,'first')} {g(r,'last')} · {g(r,'title')} @ {g(r,'company')}")
    for lab, val in (("країни", g(r, "countries")), ("pitch", g(r, "pitch")[:500]), ("інтереси", g(r, "interests")[:200]),
                     ("домен email", dom), ("особистий LinkedIn (підказка)", g(r, "linkedin")), ("сайт уже є", g(r, "website")),
                     ("етап 1", g(r, "comment")[:200])):
        if val: print(f"  {lab}: {val}")
    print()
