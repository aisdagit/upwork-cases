#!/usr/bin/env python3
"""Write drafted messages into a COPY of the lead table (purple messaging columns).

Usage: python3 write_messages.py <table.csv|xlsx> <messages.json | messages_dir/> <output.csv|xlsx> [--force] [--sheet "Усі ліди"]

messages.json: {"<row>": {"Нотатка для конекту (текст)": ..., "Перший меседж": ..., "Фолов-апи": ..., "Сценарій": "B", "Кут": "H1",
                          "Campaign": optional, "Коментар": optional}}
- "Сценарій", "Кут" (and "Не писати": reason) are written into «Коментар» as «Сценарій: B; Кут: H1 — …» (kept with any existing comment) so results can be counted per hypothesis.
- Existing non-empty cells are NOT overwritten unless --force (lead gens may already have edited them).
- Only messaging columns are written. Master tables built after 26.10.2026: scenario A → «Конф: перше повідомлення», «Конф: фолов-ап 1/2»,
  «Конф: формат першого контакту» (optional key "Формат першого контакту"), tag → «Конф: переписка»; scenarios B–E → «Постконф: …»
  (нотатка для конекту, перший меседж, фолов-апи, Campaign, коментар). Older tables: «Нотатка для конекту (текст)», «Перший меседж», «Фолов-апи», «Campaign», «Коментар».
  Any other key (Tier, Статус, Бал, …) is ignored with a warning — this skill never changes qualification.
- A folder of *.json batches is merged in file order. Keys starting with "_" are ignored. The input file is never modified.
"""
import csv, json, os, glob, sys

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

args = [x for x in sys.argv[1:] if not x.startswith("--")]
force = "--force" in sys.argv
sheet = sys.argv[sys.argv.index("--sheet") + 1] if "--sheet" in sys.argv else ""
if sheet: args.remove(sheet)
src, mpath, dst = args[:3]
if os.path.abspath(src) == os.path.abspath(dst): sys.exit("Output must be a new file.")
files = sorted(glob.glob(os.path.join(mpath, "*.json"))) if os.path.isdir(mpath) else [mpath]
M = {}
for fp in files:
    for k, val in json.load(open(fp, encoding="utf-8")).items(): M.setdefault(int(k), {}).update(val)

xlsx = src.lower().endswith((".xlsx", ".xlsm"))
if xlsx:
    import openpyxl
    wb = openpyxl.load_workbook(src)
    ws = wb[sheet] if sheet else (wb["Усі ліди"] if "Усі ліди" in wb.sheetnames else wb.worksheets[0])
    H = [str(c.value or "") for c in ws[1]]
else:
    data = list(csv.reader(open(src, encoding="utf-8-sig", newline=""))); H = data[0]
_rows = [[str(c.value or "") for c in r] for r in ws.iter_rows(min_row=2)] if xlsx else data[1:]
company_guard(H, _rows, M, "етап 5")
col = {h.strip(): i for i, h in enumerate(H)}
def ensure(name):
    if name not in col:
        H.append(name); col[name] = len(H) - 1
        if xlsx: ws.cell(1, len(H), name)
    return col[name]

ALLOWED = {"Нотатка для конекту (текст)", "Перший меседж", "Фолов-апи", "Campaign", "Формат першого контакту"}
# Майстер-таблиця з 26.10.2026 має блоки «Конф: …» (апка конференції, сценарій A) і «Постконф: …» (LinkedIn, сценарії B–E).
# Ключі JSON лишаються старими, колонку обираємо за сценарієм; у старих таблицях (без префіксів) — старі назви.
POST = {"Нотатка для конекту (текст)": "Постконф: нотатка для конекту", "Перший меседж": "Постконф: перший меседж",
        "Фолов-апи": "Постконф: фолов-апи", "Campaign": "Постконф: Campaign", "Коментар": "Постконф: коментар"}
CONF = {"Перший меседж": "Конф: перше повідомлення", "Формат першого контакту": "Конф: формат першого контакту",
        "Коментар": "Конф: переписка"}  # сценарій і кут для A — у переписку з позначкою [меседжинг]
APPENDABLE = {"Коментар", "Постконф: коментар", "Конф: переписка"}
def target(name, scen):
    if scen == "A" and "Конф: перше повідомлення" in col: return CONF.get(name)
    if "Постконф: перший меседж" in col: return POST.get(name)
    return name
done = skipped = 0
for row, m in M.items():
    # Пишемо ЛИШЕ колонки меседжингу. Tier, «Статус» та інші колонки кваліфікації скіл не змінює ніколи.
    scen = (m.get("Сценарій") or "").strip().upper()[:1]
    vals = {k: v for k, v in m.items() if k in ALLOWED and v}
    ignored = [k for k in m if not k.startswith("_") and k not in ALLOWED and k not in ("Кут", "Сценарій", "Не писати", "Коментар")]
    if ignored: print(f"  ⚠ row {row}: проігноровано колонки поза меседжингом: {', '.join(ignored)}")
    tag = "; ".join(x for x in [f"Сценарій: {m['Сценарій']}" if m.get("Сценарій") else "", f"Кут: {m['Кут']}" if m.get("Кут") else "",
                                 f"Не писати: {m['Не писати']}" if m.get("Не писати") else "", m.get("Коментар") or ""] if x)
    if tag: vals["Коментар"] = tag
    conf = scen == "A" and "Конф: перше повідомлення" in col
    fu = vals.pop("Фолов-апи", "") if conf else ""
    vals = {target(k, scen): v for k, v in vals.items()}
    vals = {k: (f"[меседжинг] {v}" if k == "Конф: переписка" else v) for k, v in vals.items() if k}
    if fu:  # сценарій A: «FU1 …» і «Скасування слота …» розділені порожнім рядком → фолов-ап 1 / фолов-ап 2
        parts = [p.strip() for p in fu.split("\n\n") if p.strip()]
        vals["Конф: фолов-ап 1"] = parts[0]
        if len(parts) > 1: vals["Конф: фолов-ап 2"] = "\n\n".join(parts[1:])
    for name, val in vals.items():
        j = ensure(name)
        if xlsx:
            cell = ws.cell(row + 2, j + 1); cur = str(cell.value or "").strip()
            if cur and cur != "FALSE" and not force:
                if name in APPENDABLE and val not in cur: cell.value = f"{cur}; {val}"
                else: skipped += 1
                continue
            cell.value = val
        else:
            r = data[row + 1]; r += [""] * (len(H) - len(r)); cur = r[j].strip()
            if cur and cur != "FALSE" and not force:
                if name in APPENDABLE and val not in cur: r[j] = f"{cur}; {val}"
                else: skipped += 1
                continue
            r[j] = val
        done += 1
if xlsx: wb.save(dst)
else:
    data[0] = H; csv.writer(open(dst, "w", encoding="utf-8-sig", newline="")).writerows(data)
print(f"{len(M)} лідів, записано клітинок: {done}, пропущено (вже заповнені, без --force): {skipped} -> {dst}")
