#!/usr/bin/env python3
"""Print a compact, one-line-per-contact view of an attendee list (CSV or XLSX).

Usage: python3 dump_rows.py <input.csv|xlsx> [output.txt] [--sheet NAME] [--from N] [--to M]

--from / --to: print only data rows N..M-1 (for splitting a big list between agents; indices stay global).

Each line: index|name|title|company|persona|function|countries|website|size|interests|pitch
The index is the 0-based data-row number; apply_decisions.py uses the same index.
Columns are matched by common export names (Brella, b2match, Grip, Swapcard);
unknown layouts fall back to every short non-empty column.
"""
import csv, sys, os

ALIASES = {
    "first": ["first_name", "first name", "firstname", "ім'я"],
    "last": ["last_name", "last name", "lastname", "прізвище"],
    "full": ["full name", "full_name", "name", "contact_name"],
    "title": ["company_title", "job position", "title", "job_title", "position", "contact_position", "посада"],
    "company": ["company_name", "organisation", "organization", "company", "назва компанії"],
    "persona": ["persona", "role tags", "persona/роль"],
    "function": ["function"],
    "countries": ["company_countries", "country", "countries", "location", "країна"],
    "website": ["website", "company_website", "сайт компанії"],
    "size": ["company_size"],
    "interests": ["interests", "industry tags", "industry"],
    "pitch": ["pitch", "about / bio", "about", "bio", "description"],
}


def read_rows(path, sheet=None):
    if path.lower().endswith((".xlsx", ".xlsm")):
        import openpyxl
        wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
        ws = wb[sheet] if sheet else wb.worksheets[0]
        rows = [["" if c is None else str(c) for c in r] for r in ws.iter_rows(values_only=True)]
    else:
        with open(path, encoding="utf-8-sig", newline="") as f:
            rows = list(csv.reader(f))
    return rows[0], rows[1:]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    sheet = None
    if "--sheet" in sys.argv:
        sheet = sys.argv[sys.argv.index("--sheet") + 1]
        args = [a for a in args if a != sheet]
    rng = {}
    for opt in ("--from", "--to"):
        if opt in sys.argv:
            val = sys.argv[sys.argv.index(opt) + 1]; rng[opt] = int(val); args = [a for a in args if a != val]
    src = args[0]
    out = args[1] if len(args) > 1 else None
    header, rows = read_rows(src, sheet)
    low = [h.strip().lower() for h in header]

    def col(key):
        for a in ALIASES[key]:
            if a in low:
                return low.index(a)
        return None

    idx = {k: col(k) for k in ALIASES}
    known = any(idx[k] is not None for k in ("title", "company"))
    lines = []
    lo, hi = rng.get("--from", 0), rng.get("--to", len(rows))
    for i, r in enumerate(rows):
        if i < lo or i >= hi: continue
        r = r + [""] * (len(header) - len(r))
        g = lambda k, n=260: " ".join(r[idx[k]].split())[:n] if idx[k] is not None else ""
        if known:
            name = g("full") or f"{g('first')} {g('last')}".strip()
            parts = [name, g("title"), g("company"), g("persona"), g("function"),
                     g("countries"), g("website"), g("size"), g("interests", 90), g("pitch")]
        else:
            parts = [" ".join(c.split())[:120] for c in r if c and len(c) < 400]
        lines.append(f"{i}|" + "|".join(parts))
    text = "\n".join(lines)
    if out:
        with open(out, "w", encoding="utf-8") as f:
            f.write(text + "\n")
        print(f"{len(rows)} rows -> {out}")
        missing = [k for k, v in idx.items() if v is None]
        if missing:
            print("columns not found:", ", ".join(missing))
    else:
        print(text)


if __name__ == "__main__":
    main()
