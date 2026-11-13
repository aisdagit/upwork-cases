#!/usr/bin/env python3
"""Write stage 1 qualification decisions into a copy of the attendee list.

Usage: python3 apply_decisions.py <input.csv|xlsx> <decisions.json> <output.csv|xlsx> [--sheet NAME]

decisions.json (or a folder of *.json parts):
  {"<row index>": {"fit": "TRUE"|"FALSE"|"", "tier": "", "icp": "DEV-2, DEV-3", "primary": "DEV-2",
                   "direction": "", "need": "", "comment": "", "group": "A"|"B"|"C"|""}}
Row index = 0-based data-row number, same as dump_rows.py. Every row must have a decision.
The original file is never modified. Output columns that do not exist yet are appended
right after the fit column (or at the end if there is none). Prints a summary.
"""
import csv, json, sys, collections

FIT_PREFIX = "базово підходить"
COLS = [("fit", "Базово підходить"), ("icp", "ICP-збіги"), ("primary", "Основний ICP"),
        ("direction", "Напрям"), ("need", "Тип потреби"), ("tier", "Tier"),
        ("comment", "Коментар з причиною"), ("group", "Група (для невизначених)")]


def read_rows(path, sheet=None):
    if path.lower().endswith((".xlsx", ".xlsm")):
        import openpyxl
        wb = openpyxl.load_workbook(path, data_only=True)
        ws = wb[sheet] if sheet else wb.worksheets[0]
        rows = [["" if c is None else str(c) for c in r] for r in ws.iter_rows(values_only=True)]
    else:
        with open(path, encoding="utf-8-sig", newline="") as f:
            rows = list(csv.reader(f))
    return rows


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    sheet = None
    if "--sheet" in sys.argv:
        sheet = sys.argv[sys.argv.index("--sheet") + 1]
        args = [a for a in args if a != sheet]
    src, dec_path, dst = args[:3]
    if dst == src:
        sys.exit("Output must be a new file; the original list stays untouched.")
    rows = read_rows(src, sheet)
    header, data = rows[0], rows[1:]
    # decisions.json або папка з частинами (decisions/*.json) — для великих списків, що обробляються частинами
    import os, glob
    files = sorted(glob.glob(os.path.join(dec_path, "*.json"))) if os.path.isdir(dec_path) else [dec_path]
    dec = {}
    for fp in files:
        dec.update({int(k): v for k, v in json.load(open(fp, encoding="utf-8")).items()})
    # захист від зсуву індексів: якщо в рішенні є "_company", звірити з назвою компанії в рядку
    import unicodedata, re as _re
    def _norm(t): return unicodedata.normalize("NFKD", t.lower()).encode("ascii", "ignore").decode()
    lowh = [h.strip().lower() for h in header]
    ci = next((lowh.index(n) for n in ("company_name", "organisation", "organization", "company", "компанія") if n in lowh), None)
    if ci is not None:
        checked = bad = 0; ex = []
        for i, d in dec.items():
            want = d.get("_company")
            if not want or i >= len(data): continue
            checked += 1
            have = data[i][ci] if ci < len(data[i]) else ""
            tw = [t for t in _re.findall(r"[a-z0-9]{3,}", _norm(want))]
            if tw and not any(t in _norm(have) for t in tw):
                bad += 1; ex.append(f"row {i}: рішення для «{want}», а в рядку «{have}»")
        if checked and bad / checked > 0.05:
            print("\n".join(ex[:10]))
            sys.exit(f"СТОП: {bad} з {checked} рішень не збігаються з компанією в рядку — ймовірно зсув індексів. Нічого не записано.")
        if bad: print("⚠ " + "\n⚠ ".join(ex))
    missing = [i for i in range(len(data)) if i not in dec]
    if missing:
        sys.exit(f"No decision for {len(missing)} rows, e.g. {missing[:10]}")

    low = [h.strip().lower() for h in header]
    pos = {}
    fit_i = next((i for i, h in enumerate(low) if h.startswith(FIT_PREFIX)), None)
    if fit_i is not None:
        pos["fit"] = fit_i
    insert_at = (fit_i + 1) if fit_i is not None else len(header)
    for key, name in COLS:
        if key in pos:
            continue
        if name.lower() in low:
            pos[key] = low.index(name.lower())
            continue
        header.insert(insert_at, name)
        for r in data:
            r.insert(insert_at, "") if len(r) >= insert_at else None
        low = [h.strip().lower() for h in header]
        pos = {k: (v + 1 if v >= insert_at else v) for k, v in pos.items()}
        pos[key] = insert_at
        insert_at += 1

    for i, r in enumerate(data):
        r += [""] * (len(header) - len(r))
        d = dec[i]
        for key, _ in COLS:
            r[pos[key]] = str(d.get(key, "") or "")

    if dst.lower().endswith(".xlsx"):
        import openpyxl
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "етап 1"
        ws.append(header)
        for r in data:
            ws.append(r)
        wb.save(dst)
    else:
        with open(dst, "w", encoding="utf-8-sig", newline="") as f:
            csv.writer(f).writerows([header] + data)

    def bucket(d):
        if d.get("fit") == "TRUE":
            return "Базово підходить"
        return d.get("tier") or "Не визначено (далі етапи 2–3)"
    cnt = collections.Counter(bucket(d) for d in dec.values())
    print(f"{len(data)} rows -> {dst}")
    for k, v in cnt.most_common():
        print(f"  {v:4d}  {k}")
    prim = collections.Counter(d.get("primary") for d in dec.values() if d.get("fit") == "TRUE")
    if prim:
        print("  основний ICP серед 'Базово підходить':", dict(prim))


if __name__ == "__main__":
    main()
