#!/usr/bin/env python3
"""CSV з сторінок b2match + опційне виключення відомих за participant_id.

  python3 b2match_build_csv.py --pages-dir work/pages --out leads.csv [--exclude old.csv]
"""
import argparse
import csv
import glob
import json
import os
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from b2match_fetch import find_connection  # noqa: E402


def read_ids(path):
    with open(path, encoding="utf-8-sig") as f:
        r = csv.DictReader(f)
        if "participant_id" not in (r.fieldnames or []):
            sys.exit(f"У {path} немає колонки participant_id: {r.fieldnames}")
        return {str(x["participant_id"]).strip().split(".")[0] for x in r if str(x["participant_id"]).strip()}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages-dir", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--exclude", action="append", default=[])
    a = ap.parse_args()

    nodes, seen = [], set()
    files = sorted(glob.glob(os.path.join(a.pages_dir, "page_*.json")),
                   key=lambda p: int(re.search(r"page_(\d+)", p).group(1)))
    for f in files:
        conn = find_connection(json.load(open(f, encoding="utf-8")))
        for n in (conn or {}).get("nodes", []):
            if n["id"] not in seen:
                seen.add(n["id"])
                nodes.append(n)
    print(f"Зібрано: {len(nodes)} учасників")

    if a.exclude:
        known = set()
        for p in a.exclude:
            known |= read_ids(p)
        have = {str(n["id"]) for n in nodes}
        nodes = [n for n in nodes if str(n["id"]) not in known]
        print(f"Виключено відомих: {len(have & known)} з {len(known)}; відомих, яких нема у свіжій видачі: {len(known - have)}")
        print(f"Нових унікальних: {len(nodes)}")

    tags = lambda t: "; ".join(x.get("name", "") for x in (t or {}).get("nodes", []))
    rows = []
    for n in nodes:
        u = n.get("user") or {}
        loc = n.get("location") or {}
        c = loc.get("country") or {}
        part = n.get("participation") or {}
        rows.append({
            "participant_id": n["id"], "first_name": u.get("firstName", ""), "last_name": u.get("lastName", ""),
            "job_position": u.get("jobPosition") or "", "company": n.get("organisationName") or "",
            "country": c.get("name", ""), "country_iso": c.get("iso", ""), "city": loc.get("city", ""),
            "pitch": n.get("pitch") or "", "about": n.get("about") or "",
            "interests": tags(n.get("interests")), "skills": tags(n.get("skills")),
            "onsite": n.get("onsite"), "attendance_type": n.get("attendanceType") or "",
            "is_speaker": n.get("isSpeaker"),
            "profile_url": ("https://www.b2match.com" + n["profileUrl"]) if n.get("profileUrl") else "",
            "company_page": ("https://www.b2match.com" + part["profileUrl"]) if part.get("profileUrl") else "",
        })
    if not rows:
        print("Нових немає — файл не створюю.")
        return
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    for c in ("job_position", "country", "pitch", "about", "interests", "skills"):
        print(f"  {c}: {sum(1 for r in rows if r[c])}")
    print(f"Записано {a.out}")


if __name__ == "__main__":
    main()
