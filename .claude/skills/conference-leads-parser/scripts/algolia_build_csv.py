#!/usr/bin/env python3
"""CSV з кешу algolia_fetch.py: дедублікація за objectID, звірка кількості, опційне виключення відомих.

  python3 algolia_build_csv.py --pages-dir work/pass1 --out leads.csv [--exclude known.csv --id-col objectID]
Колонка id у файлі відомих: objectID / id / attendee_id / participant_id (шукається автоматично).
"""
import argparse
import csv
import glob
import json
import os
import sys


def flat(h):
    g = lambda k: (h.get(k) or {}) if isinstance(h.get(k), dict) else {}
    return {
        "objectID": h.get("objectID", ""), "first_name": h.get("first_name", ""), "last_name": h.get("last_name", ""),
        "job_title": h.get("job_title", ""), "company_name": h.get("company_name", ""),
        "industry": g("industry").get("name", ""), "city": h.get("city", ""),
        "country": g("country").get("name", ""), "accreditation": g("accreditation").get("name", ""),
        "bio": h.get("bio") or "", "updated_at": h.get("updated_at", ""),
        "conference_slug": h.get("conference_slug", ""),
    }


def read_ids(path):
    with open(path, encoding="utf-8-sig") as f:
        r = csv.DictReader(f)
        col = next((c for c in ("objectID", "id", "attendee_id", "participant_id") if c in (r.fieldnames or [])), None)
        if not col:
            sys.exit(f"У {path} немає колонки id (objectID/id/attendee_id/participant_id): {r.fieldnames}")
        return {str(x[col]).strip() for x in r if str(x[col]).strip()}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages-dir", required=True, action="append", help="тека кешу algolia_fetch (можна кілька проходів)")
    ap.add_argument("--out", required=True)
    ap.add_argument("--exclude", action="append", default=[])
    a = ap.parse_args()

    rows, seen, expected = [], set(), 0
    files = [f for d in a.pages_dir for f in sorted(glob.glob(os.path.join(d, "hits_*.json")))]
    for p in files:
        r = json.load(open(p, encoding="utf-8"))["results"][0]
        expected += r.get("nbHits", 0)
        for h in r.get("hits", []):
            if h["objectID"] not in seen:
                seen.add(h["objectID"])
                rows.append(flat(h))
    print(f"Зібрано: {len(rows)} унікальних (сума nbHits по частинах: {expected}; різниця = дублікати між частинами або зсув списку)")

    if a.exclude:
        known = set()
        for p in a.exclude:
            known |= read_ids(p)
        have = {r["objectID"] for r in rows}
        rows = [r for r in rows if r["objectID"] not in known]
        print(f"Виключено відомих: {len(have & known)} з {len(known)}; нових унікальних: {len(rows)}")
    if not rows:
        print("Нових немає — файл не створюю.")
        return
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    from collections import Counter
    print("за акредитацією:", dict(Counter(r["accreditation"] for r in rows)))
    print(f"Записано {a.out}")


if __name__ == "__main__":
    main()
