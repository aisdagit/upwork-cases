#!/usr/bin/env python3
"""Mode 2: import the Codex website/LinkedIn search result and list what Claude must verify.

Usage: python3 import_codex.py <codex_result.csv> batches/a00_codex.json [--spot 10]

- Reads prompt-v2 columns («Знайдений сайт», «LinkedIn компанії», «Впевненість», «Метод», «Доказ збігу», «Кандидат (не перевірено)»)
  and v1 columns («Впевненість (висока/середня/низька)», «Джерело / примітка»).
- Writes a batch {row_index: {website, LinkedIn компанії, Джерело сайту}} marked «Codex, НЕ перевірено». It is named a00_…
  so Claude's verified batches (b01_…) override it when written.
- Prints the rows Claude must verify: everything found by domain guessing, confidence not «висока», candidates,
  invalid LinkedIn links — plus a random spot-check of --spot % of the «висока» ones (default 10%).
"""
import csv, json, random, re, sys

src, dst = sys.argv[1:3]
spot = int(sys.argv[sys.argv.index("--spot") + 1]) if "--spot" in sys.argv else 10
out, verify, high = {}, [], []
LI = re.compile(r"linkedin\.com/(company|showcase|school)/[^/?#\s]+", re.I)
for r in csv.DictReader(open(src, encoding="utf-8-sig")):
    i = str(int(r["row_index"]))
    site = (r.get("Знайдений сайт") or "").strip(); li = (r.get("LinkedIn компанії") or "").strip()
    cand = (r.get("Кандидат (не перевірено)") or "").strip()
    conf = (r.get("Впевненість") or r.get("Впевненість (висока/середня/низька)") or "").strip().lower()
    method = (r.get("Метод") or "").strip(); note = (r.get("Доказ збігу") or r.get("Джерело / примітка") or "").strip()
    guess = "підбір домену" in method.lower() or "глибокою перевіркою доменів" in note.lower()
    if not (site or li or cand): continue
    d = {}
    if site: d["website"] = site
    if li and LI.search(li): d["LinkedIn компанії"] = li
    d["Джерело сайту"] = f"Codex ({method or 'метод н/д'}, впевненість {conf or 'н/д'}) — НЕ перевірено"
    out[i] = d
    reason = []
    if guess: reason.append("підбір домену")
    if conf != "висока": reason.append(f"впевненість {conf or 'н/д'}")
    if cand: reason.append(f"кандидат {cand}")
    if li and not LI.search(li): reason.append("LinkedIn не сторінка компанії")
    if reason: verify.append((i, r.get("Компанія", ""), site or cand, "; ".join(reason)))
    else: high.append((i, r.get("Компанія", ""), site))
random.seed(1)
sample = random.sample(high, max(1, len(high) * spot // 100)) if high else []
json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(f"Імпортовано {len(out)} рядків -> {dst}")
print(f"Перевірити обов'язково: {len(verify)}; вибірково з «високих»: {len(sample)} з {len(high)}\n")
for i, co, s, why in verify + [(i, co, s, 'вибіркова перевірка «високої»') for i, co, s in sample]:
    print(f"row {i} | {co[:40]} | {s} | {why}")
