#!/usr/bin/env python3
"""Збирає CSV з сторінок Brella (registrants і/або attendees), опційно виключає відомих лідів.

Колонки: id, is_attendee (зайшов в апку), networking (yes/no/порожньо), ім'я, посада, компанія,
тип квитка, status, joined_at, pitch, persona/function/industry (якщо подія їх віддає),
контакти (email/linkedin/twitter/website), розмір компанії, країни, часовий пояс, interests, in_registrants_list.

  # повний список реєстрантів + attendees (union)
  python3 brella_build_csv.py --registrants-dir work/reg --attendees-dir work/att --out leads.csv
  # лише attendees
  python3 brella_build_csv.py --attendees-dir work/att --out leads.csv
  # виключити вже відомих (за id із CSV користувача)
  python3 brella_build_csv.py ... --exclude old.csv --out new_only.csv
"""
import argparse
import csv
import glob
import json
import os
import re
import sys


def load_dir(d):
    items, inc = [], {}
    files = sorted(glob.glob(os.path.join(d, "page_*.json")),
                   key=lambda p: int(re.search(r"page_(\d+)", p).group(1)))
    seen = set()
    for f in files:
        data = json.load(open(f, encoding="utf-8"))
        for r in data.get("data", []):
            if r["id"] not in seen:
                seen.add(r["id"])
                items.append(r)
        for x in data.get("included", []):
            inc[(x["type"], x["id"])] = x
    return items, inc


def build(reg, att, inc):
    G = lambda t, i: inc.get((t, i), {}).get("attributes", {}) if i else {}
    rid = lambda rel, n: ((rel.get(n, {}) or {}).get("data") or {}).get("id")

    def interests(rel):
        out = []
        for si in (rel.get("selected-interests", {}) or {}).get("data", []) or []:
            so = inc.get(("selected-interest", si["id"]))
            if not so:
                continue
            sr = so["relationships"]
            name = G("interest", sr["interest"]["data"]["id"]).get("name", "")
            itd = (sr.get("intent", {}) or {}).get("data")
            lab = G("intent", itd["id"]).get("selection-label", "") if itd else ""
            out.append(f"{name} ({lab})" if lab else name)
        return "; ".join(out)

    def row(i, base, a, in_reg, rel_src):
        at = a["attributes"] if a else {}
        arel = a["relationships"] if a else rel_src
        u = G("user", rid(arel, "user")) if a else {}
        tl = G("registrant-list", rid(rel_src, "ticket-type-list") or rid(arel, "ticket-type-list"))
        skip = at.get("skip-networking") if a else None
        return {
            "id": i, "is_attendee": "yes" if a else "no",
            "networking": "" if skip is None else ("no" if skip else "yes"),
            "first_name": base.get("first-name", ""), "last_name": base.get("last-name", ""),
            "company_title": base.get("company-title", ""), "company_name": base.get("company-name", ""),
            "ticket_type": tl.get("name", ""), "attendance_type": tl.get("attendance-type", ""),
            "status": at.get("status", "") if a else "registered",
            "joined_at": at.get("joined-at", "") if a else "",
            "pitch": (at.get("pitch") or "") if a else "",
            "persona": G("persona", rid(arel, "persona")).get("name", ""),
            "function": G("function", rid(arel, "function")).get("name", ""),
            "industry": G("industry", rid(arel, "industry")).get("name", ""),
            "email": u.get("email") or "", "linkedin": u.get("linkedin") or "",
            "twitter": u.get("twitter") or "", "website": u.get("website") or "",
            "company_size": u.get("company-size", ""), "company_revenue": u.get("company-revenue", ""),
            "company_countries": ";".join(u.get("company-countries") or []),
            "time_zone": u.get("time-zone", ""),
            "interests": interests(arel) if a else "",
            "in_registrants_list": "yes" if in_reg else "no",
        }

    att_by = {a["id"]: a for a in att}
    rows, reg_ids = [], set()
    for r in reg:
        reg_ids.add(r["id"])
        aid = rid(r["relationships"], "attendee")
        # id реєстранта = id attendee; посилання relationships.attendee інколи порожнє через затримку
        # оновлення, хоча людина вже є в /attendees — тоді беремо профіль за збігом id.
        a = inc.get(("attendee", aid)) or att_by.get(aid) or att_by.get(r["id"])
        rows.append(row(r["id"], r["attributes"], a, True, r["relationships"]))
    extra = 0
    for aid, a in att_by.items():  # attendees, яких немає серед registrants — не губимо
        if aid not in reg_ids:
            extra += 1
            rows.append(row(aid, a["attributes"], a, False, a["relationships"]))
    return rows, extra


def read_ids(path):
    with open(path, encoding="utf-8-sig") as f:
        r = csv.DictReader(f)
        col = next((c for c in ("registrant_id", "attendee_id", "participant_id", "id") if c in (r.fieldnames or [])), None)
        if not col:
            sys.exit(f"У {path} не знайшла колонку id (registrant_id/attendee_id/participant_id/id): {r.fieldnames}")
        return {str(row[col]).strip().split(".")[0] for row in r if str(row[col]).strip()}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--registrants-dir")
    ap.add_argument("--attendees-dir")
    ap.add_argument("--out", required=True)
    ap.add_argument("--exclude", action="append", default=[], help="CSV з уже відомими лідами (можна кілька)")
    a = ap.parse_args()
    if not (a.registrants_dir or a.attendees_dir):
        sys.exit("Потрібен --registrants-dir і/або --attendees-dir")

    reg, inc = ([], {})
    att = []
    if a.registrants_dir:
        reg, inc = load_dir(a.registrants_dir)
    if a.attendees_dir:
        att, inc2 = load_dir(a.attendees_dir)
        inc = {**inc, **inc2}
    if not reg:  # лише attendees: вважаємо їх основним списком
        rows, extra = build([], att, inc)
        for r in rows:
            r["in_registrants_list"] = ""
    else:
        rows, extra = build(reg, att, inc)
    print(f"Зібрано: {len(rows)} (registrants {len(reg)}, attendees {len(att)}, лише в attendees: {extra})")

    if a.exclude:
        known = set()
        for p in a.exclude:
            known |= read_ids(p)
        have = {r["id"] for r in rows}
        rows = [r for r in rows if r["id"] not in known]
        print(f"Виключено відомих: {len(have & known)} з {len(known)} в файлах(і); "
              f"відомих, яких немає у свіжій видачі: {len(known - have)} (імовірно скасували реєстрацію)")
        print(f"Нових унікальних: {len(rows)}")

    if not rows:
        print("Нових немає — файл не створюю.")
        return
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    for c in ("email", "linkedin", "website", "interests", "pitch"):
        print(f"  {c}: {sum(1 for r in rows if r[c])}")
    print(f"Записано {a.out}")


if __name__ == "__main__":
    main()
