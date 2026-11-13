#!/usr/bin/env python3
"""Prepare the CSV for the website / LinkedIn search (Codex) after stage 1.

Usage: python3 export_for_site_search.py <… - етап 1.csv|xlsx> <output.csv>

Takes only rows worth searching: «Базово підходить» = TRUE and undetermined rows (blank) of groups A and B,
without a website. Tier 3 / Investor / Partner / duplicates / group C are skipped.
Columns match references/codex_site_search_prompt.md (v2). row_index = 0-based data row (same as dump_rows.py),
used to merge results back.
"""
import csv, re, sys

src, dst = sys.argv[1:3]
if src.lower().endswith((".xlsx", ".xlsm")):
    import openpyxl
    ws = openpyxl.load_workbook(src, read_only=True, data_only=True).worksheets[0]
    rows = [["" if c is None else str(c) for c in r] for r in ws.iter_rows(values_only=True)]
else:
    rows = list(csv.reader(open(src, encoding="utf-8-sig", newline="")))
h, data = rows[0], rows[1:]
low = [x.strip().lower() for x in h]
def col(*names):
    for n in names:
        if n in low: return low.index(n)
    return None
C = {"first": col("first_name", "first name"), "last": col("last_name", "last name"),
     "title": col("company_title", "job position", "title", "position"), "company": col("company_name", "organisation", "organization", "company"),
     "countries": col("company_countries", "country", "countries"), "pitch": col("pitch", "about / bio", "about", "bio"),
     "interests": col("interests", "industry tags"), "linkedin": col("linkedin"), "website": col("website", "company_website"),
     "email": col("email"), "fit": next((i for i, x in enumerate(low) if x.startswith("базово підходить")), None), "comment": col("коментар з причиною"), "group": col("група (для невизначених)")}
g = lambda r, k: (r[C[k]] if C[k] is not None and C[k] < len(r) else "").strip()
DM = re.compile(r"ceo|founder|cto|coo|cio|cdo|managing|geschäftsf|owner|president|\bmd\b", re.I)
FREE = re.compile(r"@(gmail|googlemail|yahoo|hotmail|outlook|gmx|web\.de|icloud|me\.com|live|aol|proton|t-online)", re.I)
out = []
for i, r in enumerate(data):
    fit, com = g(r, "fit"), g(r, "comment")
    if fit == "FALSE" or "дубль" in com.lower() or g(r, "website"): continue
    grp = g(r, "group") or (("A" if len(g(r, "pitch")) > 40 else "B") if DM.search(g(r, "title")) else "C")
    if fit == "TRUE": grp = "S"
    elif grp == "C": continue
    em = g(r, "email")
    out.append({"row_index": i, "Група": grp, "Ім'я": f"{g(r,'first')} {g(r,'last')}".strip(), "Посада": g(r, "title"),
                "Компанія": g(r, "company"), "Країни": g(r, "countries"), "Опис (pitch)": g(r, "pitch").replace("\n", " ")[:500],
                "Інтереси": g(r, "interests")[:200], "Особистий LinkedIn (з експорту)": g(r, "linkedin"),
                "email": em if em and not FREE.search(em) else "", "Сайт (вже є)": "",
                "Знайдений сайт": "", "LinkedIn компанії": "", "Впевненість": "", "Метод": "", "Доказ збігу": "",
                "Кандидат (не перевірено)": "", "Примітка": ""})
out.sort(key=lambda x: {"S": 0, "A": 1, "B": 2}[x["Група"]])
if not out: sys.exit("Нічого шукати: у всіх потрібних рядків уже є сайт.")
with open(dst, "w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(out[0].keys())); w.writeheader(); w.writerows(out)
import collections
print(f"{len(out)} rows -> {dst}", dict(collections.Counter(x["Група"] for x in out)))
print("S — «базово підходить» без сайту; A/B — невизначені CEO/фаундери з описом / без опису")
