#!/usr/bin/env python3
"""Профіль аудиторії кампанії за кваліфікованими списками лідів.

Використання:
  python3 tools/audience.py data/lists/web_summit_2026.csv data/lists/slush_2026.csv
  python3 tools/audience.py <файли> --hooks 15      показати приклади гачків і сигналів Tier 1

Рахує Tier 1 і Tier 2: сегменти (ICP), напрям послуг, тип потреби, індустрії, країни, ролі, перетин компаній між списками.
"""
import argparse, collections, csv, os, re

csv.field_size_limit(10**9)
TITLE_COLS = ("job_title", "title")
ROLE = [("CEO/Founder", r"\b(ceo|founder|co-?founder|owner|managing director|president)\b"),
        ("CTO/Tech", r"\b(cto|vp.{0,12}eng|head of (eng|tech|dev)|tech(nical)? (lead|director)|chief tech)"),
        ("COO/Ops", r"\b(coo|operations|chief operating)\b"),
        ("Product", r"\b(cpo|product)\b"),
        ("Sales/Marketing/BD", r"\b(cmo|cro|sales|marketing|growth|business development|\bbd\b)")]


def role(t):
    t = (t or "").lower()
    for name, rx in ROLE:
        if re.search(rx, t):
            return name
    return "Інше"


def top(rows, col, n=10):
    c = collections.Counter()
    for r in rows:
        v = (r.get(col) or "").strip()
        if v:
            c[v] += 1
    return c.most_common(n)


def norm(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+")
    ap.add_argument("--hooks", type=int, default=0)
    a = ap.parse_args()
    companies = {}
    for f in a.files:
        rows = list(csv.DictReader(open(f, encoding="utf-8-sig")))
        name = os.path.basename(f)
        print(f"\n=== {name}: усього {len(rows)}; статуси: {top(rows, 'Статус', 8)}")
        qual = [r for r in rows if r.get("Статус") in ("Tier 1", "Tier 2")]
        companies[name] = {norm(r.get("company_name")) for r in qual if norm(r.get("company_name"))}
        for tier in ("Tier 1", "Tier 2"):
            t = [r for r in rows if r.get("Статус") == tier]
            print(f"\n-- {tier}: {len(t)}")
            for col in ("Основний ICP", "Напрям послуг SDA", "Тип потреби", "industry", "primary_industry", "company_stage", "country"):
                if any(col in r for r in t[:1]):
                    print(f"  {col}: {top(t, col)}")
            print("  ролі:", collections.Counter(role(next((r.get(c) for c in TITLE_COLS if r.get(c)), "")) for r in t).most_common())
        if a.hooks:
            print("\n-- Tier 1, приклади:")
            for r in [r for r in rows if r.get("Статус") == "Tier 1"][:a.hooks]:
                print(f"  {r.get('company_name')} | {next((r.get(c) for c in TITLE_COLS if r.get(c)), '')} | {(r.get('Гачок для меседжу') or '')[:170]}")
    names = list(companies)
    if len(names) == 2:
        print(f"\nКомпанії Tier 1–2 в обох списках: {len(companies[names[0]] & companies[names[1]])}")


if __name__ == "__main__":
    main()
