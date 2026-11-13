#!/usr/bin/env python3
"""Turn the Codex website/LinkedIn search result into a stage 3 batch file.

Usage: python3 sites_to_batch.py <codex_result.csv> <batches_dir>/a00_sites.json

Reads «Знайдений сайт», «LinkedIn компанії», «Впевненість», «Метод», «Доказ збігу» (prompt v2; v1 columns
«Впевненість (висока/середня/низька)» and «Джерело / примітка» also work) and writes
{"<row_index>": {"website": …, "LinkedIn компанії": …, "Джерело сайту": …}}.
Named a00_… so that later batches (agents' verified sites) override it in write_signals.py.
Sites found by domain guessing are marked «перевірити»: in ~15–25 % of cases they belong to another company.
"""
import csv, json, sys

src, dst = sys.argv[1:3]
out = {}
for r in csv.DictReader(open(src, encoding="utf-8-sig")):
    site = (r.get("Знайдений сайт") or "").strip(); li = (r.get("LinkedIn компанії") or "").strip()
    if not (site or li): continue
    conf = (r.get("Впевненість") or r.get("Впевненість (висока/середня/низька)") or "н/д").strip() or "н/д"
    method = (r.get("Метод") or "").strip()
    note = (r.get("Доказ збігу") or r.get("Джерело / примітка") or "").strip()
    guess = "підбір домену" in method or "глибокою перевіркою доменів" in note
    d = {}
    if site: d["website"] = site
    if li: d["LinkedIn компанії"] = li
    src_txt = f"Codex{', ' + method if method else ''}, впевненість {conf}"
    if guess or conf != "висока": src_txt += " (перевірити, чи це та сама компанія)"
    if note: src_txt += f" — {note[:120]}"
    d["Джерело сайту"] = src_txt
    out[str(int(r["row_index"]))] = d
json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(f"{len(out)} rows -> {dst}; сайтів: {sum('website' in v for v in out.values())}, LinkedIn: {sum('LinkedIn компанії' in v for v in out.values())}")
