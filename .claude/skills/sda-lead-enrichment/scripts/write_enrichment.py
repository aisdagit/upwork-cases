#!/usr/bin/env python3
"""Write enrichment results (stage 2) into a COPY of the stage 1 table.

Usage: python3 write_enrichment.py "<… - етап 1.csv|xlsx>" batches/ "<… - етап 2.csv|xlsx>"

batches/*.json: {"<row>": {"website": ..., "LinkedIn компанії": ..., "Джерело сайту": ..., "Розмір команди": ...,
                           "чи є CTO": ..., "Додатковий контекст": ..., "Потрібно від лідгена": ...}}
- Files are merged per column in alphabetical order (a00_codex.json first, then b01…, zz_review.json last).
- Only existing column names are used; a missing column is appended at the end (no new column order is invented).
- «Додатковий контекст» and «Потрібно від лідгена» are appended to existing text, other columns are overwritten.
- Checks: LinkedIn must be a company page; a website needs «Джерело сайту». Problems are printed as warnings.
The input file is never modified.
"""
import csv, glob, json, os, re, sys

def company_guard(header, rows, res, label):
    """Захист від зсуву індексів: "_company" у результаті має збігатися з компанією в рядку таблиці."""
    import unicodedata, re as _re
    n = lambda t: unicodedata.normalize("NFKD", str(t).lower()).encode("ascii", "ignore").decode()
    low = [h.strip().lower() for h in header]
    ci = next((low.index(c) for c in ("company_name", "компанія", "organisation", "organization", "company") if c in low), None)
    if ci is None: return
    checked = bad = 0; ex = []; missing = 0
    for i, v in res.items():
        want = v.get("_company")
        if not want: missing += 1; continue
        if i >= len(rows): continue
        checked += 1; have = rows[i][ci] if ci < len(rows[i]) else ""
        toks = _re.findall(r"[a-z0-9]{3,}", n(want))
        if toks and not any(t in n(have) for t in toks): bad += 1; ex.append(f"row {i}: результат для «{want}», а в рядку «{have}»")
    if missing: print(f"  ⚠ {label}: у {missing} записах немає \"_company\" — перевірку зсуву для них не зроблено")
    if checked and bad / checked > 0.05:
        print("\n".join(ex[:10])); raise SystemExit(f"СТОП: {bad} з {checked} записів не збігаються з компанією в рядку (зсув індексів). Нічого не записано.")
    for e in ex: print("  ⚠", e)

src, bdir, dst = sys.argv[1:4]
if os.path.abspath(src) == os.path.abspath(dst): sys.exit("Output must be a new file.")
files = sorted(glob.glob(os.path.join(bdir, "*.json"))) if os.path.isdir(bdir) else [bdir]
R = {}
for fp in files:
    for k, v in json.load(open(fp, encoding="utf-8")).items(): R.setdefault(int(k), {}).update(v)
if src.lower().endswith((".xlsx", ".xlsm")):
    import openpyxl
    ws = openpyxl.load_workbook(src, data_only=True).worksheets[0]
    data = [["" if c is None else str(c) for c in r] for r in ws.iter_rows(values_only=True)]
else:
    data = list(csv.reader(open(src, encoding="utf-8-sig", newline="")))
H, rows = data[0], data[1:]
company_guard(H, rows, R, "етап 2")
low = {h.strip().lower(): i for i, h in enumerate(H)}
APPEND = {"додатковий контекст", "потрібно від лідгена"}
PROTECTED = {"tier", "статус", "базово підходить", "основний icp", "icp-збіги", "бал", "група (для невизначених)", "коментар з причиною"}
LI = re.compile(r"linkedin\.com/(company|showcase|school)/[^/?#\s]+", re.I)
warn = []
for i, vals in R.items():
    if i >= len(rows): sys.exit(f"row {i} out of range")
    r = rows[i]
    if vals.get("LinkedIn компанії") and not LI.search(vals["LinkedIn компанії"]):
        warn.append(f"row {i}: LinkedIn не сторінка компанії — не записано ({vals['LinkedIn компанії'][:60]})"); vals.pop("LinkedIn компанії")
    if vals.get("website") and not vals.get("Джерело сайту"): warn.append(f"row {i}: є сайт без «Джерело сайту»")
    for col, v in vals.items():
        if col.startswith("_") or v in (None, ""): continue
        if col.strip().lower() in PROTECTED: warn.append(f"row {i}: колонку «{col}» етап 2 не змінює — проігноровано"); continue
        key = col.strip().lower()
        if key not in low: H.append(col); low[key] = len(H) - 1
        j = low[key]; r += [""] * (len(H) - len(r))
        r[j] = (r[j].rstrip("; ") + "; " + str(v)) if key in APPEND and r[j].strip() and str(v) not in r[j] else str(v)
for r in rows: r += [""] * (len(H) - len(r))
if dst.lower().endswith(".xlsx"):
    import openpyxl
    wb = openpyxl.Workbook(); ws = wb.active; ws.append(H)
    for r in rows: ws.append(r)
    wb.save(dst)
else:
    csv.writer(open(dst, "w", encoding="utf-8-sig", newline="")).writerows([H] + rows)
src_counts = {}
for v in R.values():
    k = "перевірено Claude" if "перевірено" in v.get("Джерело сайту", "") and "НЕ перевірено" not in v.get("Джерело сайту", "") else ("Codex, не перевірено" if "Codex" in v.get("Джерело сайту", "") else "інше")
    src_counts[k] = src_counts.get(k, 0) + 1
print(f"{len(R)} рядків -> {dst}; сайтів: {sum(1 for v in R.values() if v.get('website'))}; за джерелом: {src_counts}")
for w in warn: print("  ⚠", w)
