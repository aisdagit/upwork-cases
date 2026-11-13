#!/usr/bin/env python3
"""CSV зі сторінок searchafter_fetch.py для Slush (search.slush.org/…/meeting-tool/<event>/all).

Запис = user + company (+ meeting_fit). Списки склеюються через '; '. Опційне --exclude за user_id.
  python3 slush_build_csv.py --pages-dir work/pages --out slush.csv [--exclude known.csv]
"""
import argparse
import csv
import glob
import json
import os
import re
import sys


def j(v):
    if v is None:
        return ""
    if isinstance(v, list):
        return "; ".join(str(x) for x in v)
    return str(v)


def read_ids(path):
    with open(path, encoding="utf-8-sig") as f:
        r = csv.DictReader(f)
        col = next((c for c in ("user_id", "id", "objectID") if c in (r.fieldnames or [])), None)
        if not col:
            sys.exit(f"У {path} немає колонки user_id/id: {r.fieldnames}")
        return {str(x[col]).strip() for x in r if str(x[col]).strip()}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages-dir", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--exclude", action="append", default=[])
    a = ap.parse_args()

    files = sorted(glob.glob(os.path.join(a.pages_dir, "page_*.json")),
                   key=lambda p: int(re.search(r"page_(\d+)", p).group(1)))
    rows, seen = [], set()
    for f in files:
        for rec in json.load(open(f, encoding="utf-8")).get("results", []):
            u, c = rec.get("user") or {}, rec.get("company") or {}
            if u.get("user_id") in seen:
                continue
            seen.add(u.get("user_id"))
            el = u.get("external_links") or {}
            rows.append({
                "user_id": u.get("user_id"), "first_name": u.get("first_name", ""), "last_name": u.get("last_name", ""),
                "title": u.get("title", ""), "company_name": c.get("company_name", ""),
                "company_type": c.get("company_type") or "", "organization_category": c.get("organization_category") or "",
                "country": u.get("country", ""), "city": u.get("city", ""),
                "linkedin": el.get("linked_in") or "", "website": el.get("website") or "", "twitter": el.get("twitter") or "",
                "bio": u.get("bio", ""), "industry": j(u.get("industry")), "occupation": j(u.get("occupation")),
                "company_description": c.get("description") or "", "company_country": c.get("country") or "",
                "company_city": c.get("city") or "", "company_stage": j(c.get("company_stage")),
                "primary_industry": j(c.get("primary_industry")), "secondary_industry": j(c.get("secondary_industry")),
                "business_types": j(c.get("business_types")), "software_hardware": j(c.get("software_hardware")),
                "raising_next": j(c.get("raising_next")), "next_equity_round": j(c.get("next_equity_round")),
                "focus_stage": j(c.get("focus_stage")), "focus_startup_stage": j(c.get("focus_startup_stage")),
                "focus_industries": j(c.get("focus_industries")), "geo_focus": j(c.get("geo_focus")),
                "typical_ticket_size": j(c.get("typical_ticket_size")),
                "partner_type": j(u.get("partner_type") or c.get("partner_type")),
                "media_accreditation": j(u.get("media_accreditation")),
                "active_at": u.get("active_at") or "", "recently_active": u.get("recently_active"),
                "company_id": u.get("company_id") or "", "meeting_fit": (rec.get("meeting_fit") or {}).get("level", ""),
            })
    print(f"Зібрано: {len(rows)} унікальних")
    if a.exclude:
        known = set()
        for p in a.exclude:
            known |= read_ids(p)
        have = {r["user_id"] for r in rows}
        rows = [r for r in rows if r["user_id"] not in known]
        print(f"Виключено відомих: {len(have & known)} з {len(known)}; нових унікальних: {len(rows)}")
    if not rows:
        print("Нових немає — файл не створюю.")
        return
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    for c in ("linkedin", "website", "bio", "title", "company_description"):
        print(f"  {c}: {sum(1 for r in rows if r[c])}")
    print(f"Записано {a.out}")


if __name__ == "__main__":
    main()
