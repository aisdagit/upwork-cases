#!/usr/bin/env python3
"""Write stage 3 signal results into a copy of a stage 1 table.

Usage: python3 write_signals.py <… - етап 1 або етап 2.csv|xlsx> <results.json | batches_dir/> <output.csv|xlsx>

results.json: {"<row index>": {"<column name>": "<value>", ...}}
Row index = 0-based data-row number (same as dump_rows.py in sda-lead-qualification).
Only listed rows and columns are changed; missing columns are appended at the end.
The input file is never modified. Prints a Tier summary for processed rows.
"""
import csv, json, sys, collections

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


def read_rows(path):
    if path.lower().endswith((".xlsx", ".xlsm")):
        import openpyxl
        ws = openpyxl.load_workbook(path, data_only=True).worksheets[0]
        return [["" if c is None else str(c) for c in r] for r in ws.iter_rows(values_only=True)]
    with open(path, encoding="utf-8-sig", newline="") as f:
        return list(csv.reader(f))


def main():
    src, res_path, dst = sys.argv[1:4]
    if src == dst:
        sys.exit("Output must be a new file.")
    rows = read_rows(src)
    header, data = rows[0], rows[1:]
    # results.json або папка з партіями (batches/*.json): зливаються по колонках в алфавітному порядку файлів,
    # тож пізніші файли (напр. zz_review.json з ручними правками) перекривають ранні.
    import os, glob
    files = sorted(glob.glob(os.path.join(res_path, "*.json"))) if os.path.isdir(res_path) else [res_path]
    res = {}
    for fp in files:
        for k, v in json.load(open(fp, encoding="utf-8")).items():
            res.setdefault(int(k), {}).update(v)
    for v in res.values():  # Tier завжди рядком "Tier 1/2/3"
        if isinstance(v.get("Tier"), int) or str(v.get("Tier", "")).strip() in ("1", "2", "3"):
            v["Tier"] = f"Tier {str(v['Tier']).strip()}"
    company_guard(header, data, res, "етап 3")
    # етап 3 не змінює рішень етапу 1 і не затирає знахідок етапу 2
    PROTECTED = {"базово підходить", "коментар з причиною", "icp-збіги", "група (для невизначених)"}
    APPEND = {"додатковий контекст", "потрібно від лідгена"}
    KEEP_IF_UNKNOWN = {"website", "linkedin компанії", "чи є cto", "розмір команди", "раунд", "вакансії", "стадія", "джерело сайту"}
    for v in res.values():
        for k in [k for k in v if k.startswith("_")]: v.pop(k)
        for k in [k for k in v if k.strip().lower() in PROTECTED or k.strip().lower().startswith("базово підходить")]:
            print(f"  ⚠ колонку «{k}» етап 3 не змінює — проігноровано"); v.pop(k)
    low = [h.strip().lower() for h in header]
    for vals in res.values():
        for col in vals:
            if col.strip().lower() not in low:
                header.append(col)
                low.append(col.strip().lower())
    for r in data:
        r += [""] * (len(header) - len(r))
    for i, vals in res.items():
        if i >= len(data):
            sys.exit(f"Row {i} out of range")
        for col, v in vals.items():
            j = low.index(col.strip().lower()); cur = (data[i][j] or "").strip(); new = str(v).strip(); key = col.strip().lower()
            if key in APPEND and cur and new and new not in cur: data[i][j] = cur.rstrip("; ") + "; " + new; continue
            if key in KEEP_IF_UNKNOWN and cur and not cur.lower().startswith("невідомо") and (not new or new.lower().startswith("невідомо")):
                continue  # не затирати відоме (напр. CTO з етапу 2) на «невідомо»
            data[i][j] = new
    if dst.lower().endswith(".xlsx"):
        import openpyxl
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.append(header)
        for r in data:
            ws.append(r)
        wb.save(dst)
    else:
        with open(dst, "w", encoding="utf-8-sig", newline="") as f:
            csv.writer(f).writerows([header] + data)
    tiers = collections.Counter(v.get("Tier", "—") for v in res.values())
    print(f"{len(res)} rows updated -> {dst}")
    for k, v in tiers.most_common():
        print(f"  {v:3d}  {k}")


if __name__ == "__main__":
    main()
