#!/usr/bin/env python3
"""Print one context card per lead — everything known about the lead at this moment.

Usage:
  python3 lead_cards.py <table.csv|xlsx> [--status "Tier 1,Tier 2"] [--rows 3,17,40] [--offset 0] [--limit 12]
                        [--only-empty "Перший меседж"] [--sheet "Усі ліди"]

- Works with the master table (sheet «Усі ліди») or a lead gen's own CSV/XLSX export with the same column names.
- Card = all non-empty columns of the row, grouped: person & company → what they wrote → stage 1/3 qualification →
  signals → messaging history (purple columns). Empty fields are skipped, so the card shows only what is actually known.
- `row` = 0-based data row of the given sheet; write_messages.py uses the same index.
- --only-empty: skip leads where this column is already filled (e.g. message already written).
"""
import argparse, csv

ap = argparse.ArgumentParser()
ap.add_argument("table"); ap.add_argument("--status", default="Tier 1,Tier 2"); ap.add_argument("--rows", default="")
ap.add_argument("--offset", type=int, default=0); ap.add_argument("--limit", type=int, default=12)
ap.add_argument("--only-empty", default=""); ap.add_argument("--sheet", default="")
a = ap.parse_args()

if a.table.lower().endswith((".xlsx", ".xlsm")):
    import openpyxl
    wb = openpyxl.load_workbook(a.table, read_only=True, data_only=True)
    ws = wb[a.sheet] if a.sheet else (wb["Усі ліди"] if "Усі ліди" in wb.sheetnames else wb.worksheets[0])
    data = [["" if c is None else str(c) for c in r] for r in ws.iter_rows(values_only=True)]
else:
    data = list(csv.reader(open(a.table, encoding="utf-8-sig", newline="")))
H, rows = data[0], data[1:]
low = {h.strip().lower(): i for i, h in enumerate(H)}
# Майстер-таблиці з 26.10.2026: блоки «Конф: …» і «Постконф: …». Старі назви (напр. --only-empty "Перший меседж") шукаються в обох.
ALIAS = {"перший меседж": ["постконф: перший меседж", "конф: перше повідомлення"], "фолов-апи": ["постконф: фолов-апи", "конф: фолов-ап 1"],
         "нотатка для конекту (текст)": ["постконф: нотатка для конекту"], "переписка (текст)": ["постконф: переписка", "конф: переписка"],
         "відправлено": ["постконф: відправлено", "конф: дата відправки"], "зустріч відбулася": ["постконф: зустріч відбулася"],
         "коментар": ["постконф: коментар"], "campaign": ["постконф: campaign"]}
def v(r, *names):
    names = [x for n in names for x in [n, *ALIAS.get(n.lower(), [])]]
    for n in names:
        i = low.get(n.lower())
        if i is not None and i < len(r) and str(r[i]).strip() not in ("", "None", "FALSE"): return str(r[i]).strip()
    return ""

GROUPS = [
    ("ЛЮДИНА І КОМПАНІЯ", ["first_name", "Ім'я", "last_name", "Прізвище", "company_title", "Посада", "company_name", "Компанія", "persona",
                           "company_countries", "Країни", "Сайт (фінальний)", "website", "LinkedIn компанії", "linkedin", "LinkedIn особистий"]),
    ("ЩО ЛЮДИНА НАПИСАЛА САМА", ["pitch", "Опис (pitch)", "interests", "Інтереси", "function", "industry"]),
    ("КВАЛІФІКАЦІЯ", ["Статус", "Tier", "Основний ICP", "Тип потреби", "Напрям послуг SDA", "Напрям", "ICP-збіги", "Група (для невизначених)",
                      "Коментар етап 1 (фільтр)", "Коментар з причиною", "Коментар етап 0", "Коментар етап 3 (сигнали)", "Коментар етап 1", "Бал"]),
    ("СИГНАЛИ (з посиланнями)", ["раунд", "вакансії", "стадія", "чи є CTO", "Розмір команди", "Сигнали модуля", "Додатковий контекст",
                                 "Гачок для меседжу", "Потрібно від лідгена"]),
    ("ІСТОРІЯ МЕСЕДЖИНГУ: КОНФ (апка)", ["Конф: формат першого контакту", "Конф: перше повідомлення", "Конф: дата відправки",
                            "Конф: фолов-ап 1", "Конф: фолов-ап 2", "Конф: статус запиту", "Конф: відповідь", "Конф: причина відмови",
                            "Конф: переписка", "Конф: дата зустрічі", "Конф: місце зустрічі", "Конф: результат зустрічі",
                            "Конф: нотатки зустрічі (текст або посилання на запис)", "Конф: оцінка після розмови", "Конф: наступний крок",
                            "Конф: далі в LinkedIn (постконф)"]),
    ("ІСТОРІЯ МЕСЕДЖИНГУ: ПОСТКОНФ (LinkedIn)", ["Постконф: Campaign", "Постконф: профіль-відправник", "Постконф: відправлено",
                            "Постконф: нотатка для конекту", "Постконф: дата прийняття конекту", "Постконф: перший меседж", "Постконф: фолов-апи",
                            "Постконф: відповідь", "Постконф: позитивна відповідь", "Постконф: переписка", "Постконф: зустріч заброньована",
                            "Постконф: дата", "Постконф: зустріч відбулася", "Постконф: коментар",
                            # старі таблиці (до 26.10.2026)
                            "Campaign", "Профіль-відправник", "відправлено", "Нотатка для конекту (текст)", "Дата прийняття конекту",
                            "Перший меседж", "Фолов-апи", "Відповідь", "Позитивна відповідь", "Переписка (текст)", "Зустріч заброньована",
                            "Дата", "Час", "Зустріч відбулася", "Коментар", "Коментар лідгена"]),
]
want = {s.strip() for s in a.status.split(",") if s.strip()}
pick = [int(x) for x in a.rows.split(",") if x.strip()]
idx = pick if pick else [i for i, r in enumerate(rows) if not want or v(r, "Статус", "Tier") in want]
if a.only_empty: idx = [i for i in idx if not v(rows[i], a.only_empty)]
total = len(idx); idx = idx[a.offset:a.offset + a.limit]
print(f"# Лідів за фільтром: {total}; показано {len(idx)} (offset {a.offset})\n")
for i in idx:
    r = rows[i]
    fn = v(r, "first_name", "Ім'я"); ln = v(r, "last_name", "Прізвище"); tt = v(r, "company_title", "Посада"); co = v(r, "company_name", "Компанія")
    print(f"=== row {i} — {fn} {ln} · {tt} @ {co}")
    seen = set()
    for title, cols in GROUPS:
        lines = []
        for c in cols:
            x = v(r, c)
            if x and c.lower() not in seen and x not in seen:
                seen.add(c.lower()); seen.add(x); lines.append(f"  {c}: {x}")
        if lines: print(f"[{title}]"); print("\n".join(lines))
    print()
