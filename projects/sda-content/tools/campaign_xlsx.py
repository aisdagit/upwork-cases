#!/usr/bin/env python3
"""Збирає робочий Excel кампанії з plan.json.

Використання: python3 tools/campaign_xlsx.py output/<папка кампанії>
Потрібен openpyxl (pip install openpyxl). Аркуші: Картка, Контент-план, Живі пости, Вхідні DM, Підсумок, Джерела.
"""
import json, os, sys
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.datavalidation import DataValidation

folder = sys.argv[1]
d = json.load(open(os.path.join(folder, "plan.json"), encoding="utf-8"))
HEAD = PatternFill("solid", fgColor="1F3864")
line = Side(style="thin", color="D0D0D0")
BOX = Border(left=line, right=line, top=line, bottom=line)
SHADES = {"Кампанія": "E2EFDA", "Постійний": "EDEDED"}


def table(ws, cols, rows, start=1, shade_col=None):
    for c, (name, width) in enumerate(cols, 1):
        cell = ws.cell(start, c, name)
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = HEAD
        cell.alignment = Alignment(wrap_text=True, vertical="center")
        cell.border = BOX
        ws.column_dimensions[cell.column_letter].width = width
    for i, row in enumerate(rows, start + 1):
        for c, v in enumerate(row, 1):
            cell = ws.cell(i, c, v)
            cell.alignment = Alignment(wrap_text=True, vertical="top")
            cell.border = BOX
        if shade_col is not None and row[shade_col] in SHADES:
            ws.cell(i, shade_col + 1).fill = PatternFill("solid", fgColor=SHADES[row[shade_col]])
    ws.freeze_panes = ws.cell(start + 1, 1)
    ws.auto_filter.ref = f"A{start}:{ws.cell(start + len(rows), len(cols)).coordinate}"


def choice(ws, formula, rng):
    v = DataValidation(type="list", formula1=f'"{formula}"', allow_blank=True)
    ws.add_data_validation(v)
    v.add(rng)


wb = Workbook()
ws = wb.active
ws.title = "Картка"
ws["A1"] = d["title"]
ws["A1"].font = Font(bold=True, size=14)
ws.column_dimensions["A"].width = 26
ws.column_dimensions["B"].width = 110
for i, (k, v) in enumerate(d["card"], 3):
    ws.cell(i, 1, k).font = Font(bold=True)
    ws.cell(i, 2, v)
    for c in (1, 2):
        ws.cell(i, c).alignment = Alignment(wrap_text=True, vertical="top")
        ws.cell(i, c).border = BOX

COLS = [("#", 4), ("Дата", 11), ("День", 6), ("Канал", 10), ("Шар", 11), ("Роль", 12), ("Формат", 15), ("Тема", 34),
        ("Кут / про що пост", 52), ("Текст EN", 70), ("Текст UA", 70), ("Що перевірити в тексті", 34), ("Дія читача", 24), ("Джерело і докази", 38), ("Власний елемент", 34), ("Опис картинки", 46),
        ("Хто робить візуал і дедлайн", 22), ("Використання в аутрічі", 32), ("Хто коментує першим", 14), ("Стан тексту", 22),
        ("Що перевірити або отримати", 36), ("Статус", 13), ("Посилання", 16), ("Перегляди", 10), ("Реакції", 9), ("Коментарі", 10), ("Вхідні DM", 9)]
ws = wb.create_sheet("Контент-план")
tx = d.get("texts", {})
def full(p):
    t = tx.get(str(p[0]), {})
    return p[:9] + [t.get("en", ""), t.get("ua", ""), t.get("check", "")] + p[9:] + ["Заплановано", "", "", "", "", ""]
rows = [full(p) for p in d["posts"]]
table(ws, COLS, rows, shade_col=4)
choice(ws, "Заплановано,Текст у роботі,На апруві,Готово,Опубліковано,Скасовано", f"V2:V{len(rows) + 50}")

if d["live"]:
    ws = wb.create_sheet("Живі пости")
    table(ws, [("Дата", 11), ("Канал", 10), ("Подія", 20), ("Роль", 18), ("Про що", 50), ("Що попросити в автора", 46), ("Опис картинки", 40), ("Хто коментує першим", 14), ("Статус", 13), ("Посилання", 16)],
          [p + ["Заплановано", ""] for p in d["live"]])
    choice(ws, "Заплановано,Чекаємо матеріал,Готово,Опубліковано,Скасовано", "I2:I40")

ws = wb.create_sheet("Вхідні DM")
table(ws, [("Дата", 11), ("Кому написали", 13), ("Хто написав", 24), ("Компанія", 22), ("Посада", 18), ("Цільовий?", 11), ("Tier зі списку", 10), ("Подія", 13), ("Після якого поста (#)", 12), ("Суть повідомлення", 40), ("Зустріч домовлена?", 11), ("Дата зустрічі", 11), ("Результат", 24)], [])
choice(ws, "Саша,Катя,Сторінка SDA", "B2:B500")
choice(ws, "Так,Ні", "F2:F500")
choice(ws, "Tier 1,Tier 2,Немає в списку", "G2:G500")
choice(ws, "Web Summit,Slush,Інше,Невідомо", "H2:H500")
choice(ws, "Так,Ні,Обговорюємо", "K2:K500")

ws = wb.create_sheet("Підсумок")
ws.column_dimensions["A"].width = 46
ws.column_dimensions["B"].width = 20
ws.column_dimensions["C"].width = 60
formulas = [("Вхідні DM усього", "=COUNTA('Вхідні DM'!C2:C500)", ""),
            ("З них від цільових людей (головна метрика)", "=COUNTIF('Вхідні DM'!F2:F500,\"Так\")", ""),
            ("Зустрічі з цих DM", "=COUNTIFS('Вхідні DM'!F2:F500,\"Так\",'Вхідні DM'!K2:K500,\"Так\")", ""),
            ("Опубліковано постів", "=COUNTIF('Контент-план'!V2:V60,\"Опубліковано\")" + ("+COUNTIF('Живі пости'!I2:I40,\"Опубліковано\")" if d["live"] else ""), ""),
            ("Сума реакцій", "=SUM('Контент-план'!Y2:Y60)", ""), ("Сума коментарів", "=SUM('Контент-план'!Z2:Z60)", "")]
for i, (k, f, n) in enumerate(formulas, 1):
    ws.cell(i, 1, k).font = Font(bold=True)
    ws.cell(i, 2, f)
    ws.cell(i, 3, n)
ws.cell(8, 1, "База: за півроку ведення LinkedIn вхідних не було, тому рахуємо з нуля.")
ws.cell(10, 1, "Висновки після кампанії: що спрацювало, що повторити").font = Font(bold=True)

ws = wb.create_sheet("Джерела")
table(ws, [("Дані", 56), ("Джерело", 62), ("Надійність", 44)], d["sources"])
out = os.path.join(folder, d["file"])
wb.save(out)
print(out)
