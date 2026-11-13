#!/usr/bin/env python3
"""Збирає пости з папки періоду в CSV для вставки в Google-таблицю контент-плану.

Використання: python3 tools/collect.py output/2026-10-13_2026-10-24
Колонки як у таблиці (Date, Day, Chanel, Topic, Description, Text, Creative) + Verdict, File.
Text = «Фінальний текст», якщо є, інакше «Текст».
"""
import csv, datetime as dt, os, re, sys

folder = sys.argv[1]
CH = {"CEO": "CEO", "SDA": "SDA", "Kateryna": "Kateryna Shubina", "Kateryna Shubina": "Kateryna Shubina"}


def section(md, name):
    m = re.search(r"^## " + re.escape(name) + r"\s*\n(.*?)(?=^## |\Z)", md, re.S | re.M)
    return m.group(1).strip() if m else ""


def field(block, key):
    m = re.search(r"-\s*" + re.escape(key) + r":\s*(.+)", block)
    return m.group(1).strip() if m else ""


rows = []
for fn in sorted(os.listdir(folder)):
    if not re.match(r"\d\d_.*\.md$", fn):
        continue
    md = open(os.path.join(folder, fn), encoding="utf-8").read()
    title = md.splitlines()[0].lstrip("# ").split(" · ")
    date_s = title[0].strip() if title else ""
    try:
        date = dt.date.fromisoformat(date_s)
        date_out, day = f"{date.day}-{date.strftime('%b-%Y')}", date.strftime("%A")
    except ValueError:
        date_out, day = date_s, ""
    channel = CH.get(title[1].strip(), title[1].strip()) if len(title) > 1 else ""
    topic = title[2].strip() if len(title) > 2 else ""
    plan = section(md, "План")
    text = section(md, "Фінальний текст") or section(md, "Текст")
    vis = section(md, "Візуал")
    visual = " | ".join(x for x in (field(vis, "Тип"), field(vis, "Що на ньому"), field(vis, "Хто робить / в кого попросити")) if x)
    verdict = field(section(md, "Критик"), "Вердикт")
    rows.append([date_out, day, channel, topic, field(plan, "Бриф"), text, visual, verdict, fn])

out = os.path.join(folder, "для_таблиці.csv")
with open(out, "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["Date", "Day", "Chanel", "Topic", "Description", "Text", "Creative", "Verdict", "File"])
    w.writerows(rows)
print(f"{len(rows)} постів → {out}")
