#!/usr/bin/env python3
"""Pick the rows for stage 3 (signals) and print cards with everything known so far.

Usage:
  python3 select_rows.py "<… - етап 2.csv|xlsx>" [--offset 0] [--limit 26] [--skip-done batches/] [--rows 3,17] [--count]

Selected: «Базово підходить» = TRUE; undetermined group A; undetermined group B **with** a website (after stage 2).
Skipped: Tier 3 / Investor / Partner (FALSE), duplicates, group C, rows already present in batch files (--skip-done).
--count: print only the number of rows and the list of indices (for the orchestrator to split work between agents).
Indices are 0-based data rows of the given file (the same index write_signals.py uses).
"""
import argparse, csv, glob, json, os, re

ap = argparse.ArgumentParser()
ap.add_argument("table"); ap.add_argument("--offset", type=int, default=0); ap.add_argument("--limit", type=int, default=26)
ap.add_argument("--skip-done", default=""); ap.add_argument("--rows", default=""); ap.add_argument("--count", action="store_true")
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
C = {"fit": ci("базово підходить", prefix=True), "comment": ci("коментар з причиною"), "group": ci("група (для невизначених)"),
     "website": ci("website"), "title": ci("company_title", "job position", "title", "position"), "pitch": ci("pitch", "about / bio", "about", "bio")}
g = lambda r, k: (r[C[k]].strip() if C[k] is not None and C[k] < len(r) else "")
DM = re.compile(r"ceo|founder|cto|coo|cio|cdo|managing|geschäftsf|owner|president|\bmd\b|head of (it|digital|ai)", re.I)
done = set()
if a.skip_done and os.path.isdir(a.skip_done):
    for fp in glob.glob(os.path.join(a.skip_done, "*.json")):
        done |= {k for k, v in json.load(open(fp, encoding="utf-8")).items() if v.get("Tier") is not None}
pick = []
for i, r in enumerate(rows):
    if str(i) in done: continue
    fit, com = g(r, "fit").upper(), g(r, "comment").lower()
    if fit.startswith("FALSE") or "дубль" in com: continue
    grp = "S" if fit.startswith("TRUE") else (g(r, "group") or (("A" if len(g(r, "pitch")) > 40 else "B") if DM.search(g(r, "title")) else "C"))
    if grp == "C" or (grp == "B" and not g(r, "website")): continue
    pick.append((i, grp))
if a.rows: pick = [(int(x), "?") for x in a.rows.split(",") if x.strip()]
pick.sort(key=lambda t: {"S": 0, "A": 1, "B": 2, "?": 3}[t[1]])
if a.count:
    print(len(pick)); print(",".join(str(i) for i, _ in pick)); raise SystemExit
SKIP = {"registrant_id", "status", "joined_at", "time_zone", "is_attendee", "networking", "ticket_type", "attendance_type", "in_registrants_list"}
print(f"# Для етапу 3: {len(pick)} рядків; показано {min(a.limit, max(0, len(pick) - a.offset))} з offset {a.offset}\n")
for i, grp in pick[a.offset:a.offset + a.limit]:
    r = rows[i]
    print(f"=== row {i} [{grp}]")
    for j, h in enumerate(H):
        v = r[j].strip() if j < len(r) else ""
        if v and h.strip().lower() not in SKIP and v.upper() != "FALSE": print(f"  {h}: {v[:500]}")
    print()
