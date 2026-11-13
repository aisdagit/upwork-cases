#!/usr/bin/env python3
"""Build the single master lead table (XLSX) for one conference.

Usage:
  python3 build_master.py --original <export.csv|xlsx> --stage1 <… - етап 3.csv> --out <… — МАЙСТЕР-ТАБЛИЦЯ ЛІДІВ.xlsx> [--title "Назва конференції"] [--mode both|conf|postconf]

--mode     : purple messaging block. conf = messages in the conference app (with / without a slot) and meetings at the event;
             postconf = LinkedIn after the event; both (default) = conf block, then postconf block (leads without a meeting move on to LinkedIn).

--original : the untouched export from the conference app (green columns).
--stage1   : the stage 3 table (stage 1 copy + write_signals.py results). Same row order as the export.
Rows are matched by position (apply_decisions.py and write_signals.py keep the row order).

What the script does (rules — see references/icp-modules.md and «SDA — ICP & Tier Rules»):
- Статус: Tier 1 / Tier 2 / Tier 3 / Investor / Partner / Partner? / Дубль / Потрібна перевірка
- Наступна дія for every row; «Потрібно від лідгена» gets «додати сайт компанії» for Tier 1/2 without a site
- «Базово підходить» = «TRUE (етап 3)» when stage 1 was blank but stage 3 gave Tier 1/2
- Група A/B/C for undetermined rows (A — DM with description, B — DM without, C — not DM)
- Бал recomputed the same way for all rows (sorting only)
- Напрям послуг SDA from Основний ICP + Тип потреби
- Duplicates among Tier 1/2 (same company): best DM stays, others → Дубль
- Header colours: green = export, blue = AI qualification, purple = messaging (filled by lead gen): «Конф: …» and/or «Постконф: …» columns
"""
import argparse, csv, re, datetime, collections

ap = argparse.ArgumentParser()
ap.add_argument("--original", required=True)
ap.add_argument("--signals", "--stage1", dest="stage1", required=True, help="таблиця після етапу 3 (сигнали)")
ap.add_argument("--out", required=True)
ap.add_argument("--title", default="")
ap.add_argument("--mode", choices=["both", "conf", "postconf"], default="both", help="фіолетовий блок: конф / постконф / обидва")
a = ap.parse_args()


def read(path):
    if path.lower().endswith((".xlsx", ".xlsm")):
        import openpyxl
        ws = openpyxl.load_workbook(path, read_only=True, data_only=True).worksheets[0]
        rows = [["" if c is None else str(c) for c in r] for r in ws.iter_rows(values_only=True)]
    else:
        rows = list(csv.reader(open(path, encoding="utf-8-sig", newline="")))
    h = rows[0]
    return h, [dict(zip(h, r + [""] * (len(h) - len(r)))) for r in rows[1:]]


GREEN, orig = read(a.original)
_, rows = read(a.stage1)
# сумісність зі старими файлами (до 06.10.2026 етапи нумерувались 0 / 1): «Коментар етап 1» = коментар сигналів
for x in rows:
    if not x.get("Коментар етап 3 (сигнали)") and x.get("Коментар етап 1"): x["Коментар етап 3 (сигнали)"] = x["Коментар етап 1"]
_fit = next((k for k in rows[0] if k.strip().lower().startswith("базово підходить")), None) if rows else None
if _fit and _fit != "Базово підходить":  # у деяких експортах колонка має довшу назву
    for x in rows: x["Базово підходить"] = x.pop(_fit)
    GREEN = [c for c in GREEN if c != _fit]
if len(orig) != len(rows):
    raise SystemExit(f"Різна кількість рядків: export {len(orig)} vs stage1 {len(rows)} — перевірте файли")

ALIAS = {"first": ["first_name", "first name", "firstname", "ім'я"], "last": ["last_name", "last name", "lastname", "прізвище"],
         "title": ["company_title", "job position", "title", "job_title", "position", "посада"],
         "company": ["company_name", "organisation", "organization", "company", "назва компанії"],
         "pitch": ["pitch", "about / bio", "about", "bio", "description"], "website": ["website", "company_website", "сайт компанії"]}
low = {h.strip().lower(): h for h in rows[0].keys()}
def col(k): return next((low[x] for x in ALIAS[k] if x in low), None)
C = {k: col(k) for k in ALIAS}
def f(x, k): return (x.get(C[k]) or "") if C[k] else ""

TODAY = datetime.date.today()
MONTHS = {"січ": 1, "лют": 2, "берез": 3, "квіт": 4, "трав": 5, "черв": 6, "лип": 7, "серп": 8, "верес": 9, "жовт": 10, "листоп": 11, "груд": 12,
          "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6, "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12}
def months_ago(text):
    """Most recent (year, month) mentioned in text → months ago; None if no year."""
    t = text.lower(); best = None
    for m in re.finditer(r"(20\d\d)", t):
        y = int(m.group(1)); mo = None
        before = t[max(0, m.start() - 15):m.start()]
        for k, v in MONTHS.items():
            if k in before: mo = v
        dm = re.search(r"\b(\d{1,2})[./](20\d\d)", t[max(0, m.start() - 4):m.end()])
        if dm: mo = int(dm.group(1))
        mo = mo or 6
        ago = (TODAY.year - y) * 12 + (TODAY.month - mo)
        best = ago if best is None else min(best, ago)
    return best
def yes(v): return (v or "").strip().lower().startswith("так")
def score(x, st):
    """Раунд ≤12 міс = 3, 13–24 міс = 2; вакансії з датою = 3, без дати = 2; немає CTO (DEV/IOT) = 3;
    кожен сигнал модуля «так» = 2 (макс. 2); Tier 3 = −3."""
    if st == "Tier 3": return -3
    s = 0; r = x.get("раунд") or ""
    ago = months_ago(r) if yes(r) and "застар" not in r.lower() else None
    if ago is None and not r.strip():
        m = re.search(r"(seed|series|раунд)[^.]{0,80}", (x.get("Коментар етап 3 (сигнали)") or "").lower())
        ago = months_ago(m.group(0)) if m else None
    if ago is not None: s += 3 if ago <= 12 else 2 if ago <= 24 else 0
    v = x.get("вакансії") or ""
    if yes(v): s += 2 if any(k in v.lower() for k in ("дату не вказано", "без дати", "не видно", "не відображ", "перевірити актуальність")) else 3
    if (x.get("чи є CTO") or "").strip().lower().startswith("ні") and (x.get("Основний ICP") or "").startswith(("DEV", "IOT")): s += 3
    segs = [p for p in (x.get("Сигнали модуля") or "").split(";") if re.search(r"(^|:)\s*так\b", p.strip().lower())]
    return s + 2 * min(len(segs), 2)
def direction(icp, need):
    n = (need or "").lower()
    if icp.startswith("AUT-4"): return "Automation"
    if icp.startswith("MOD-5"): return "Team Extension (FD Engineers) / Modernization & Strategy"
    if icp.startswith("DEV-3"): return "Automation (Integrations) / Modernization & Strategy (Cloud & DevOps)"
    if icp.startswith(("IOT-6", "DEV-1")): return "AI & Software Development"
    if icp.startswith("DEV-2"):
        if "техборг" in n: return "Modernization & Strategy"
        if "private" in n: return "AI & Software Development"
        if "ai до продакшну" in n: return "Team Extension (FD Engineers)"
        return "Team Extension"
    return ""
DM = re.compile(r"ceo|founder|cto|coo|cio|cdo|managing|geschäftsf|owner|president|\bmd\b|head of (it|digital|ai)", re.I)
MOD = re.compile(r"\b(DEV-[123]|AUT-4|MOD-5|IOT-6)\b")

for i, x in enumerate(rows):
    if not x.get("LinkedIn компанії") and x.get("company_linkedin"): x["LinkedIn компанії"] = x["company_linkedin"]
    li = (x.get("LinkedIn компанії") or "").strip()
    if li and not re.search(r"linkedin\.com/(company|showcase|school)/[^/?#\s]+", li):  # не сторінка компанії (особистий профіль, стрічка, пост)
        x["LinkedIn компанії"] = ""
        x["Потрібно від лідгена"] = ((x.get("Потрібно від лідгена") or "").strip() + "; " if (x.get("Потрібно від лідгена") or "").strip() else "") + f"знайти сторінку компанії в LinkedIn (було не те посилання: {li[:80]})"
    tier = (x.get("Tier") or "").strip(); c0 = x.get("Коментар з причиною") or ""; c1 = x.get("Коментар етап 3 (сигнали)") or ""
    if tier in ("Tier 1", "Tier 2") and not (x.get("Основний ICP") or "").strip():
        m = MOD.search(" ".join([c1, x.get("ICP-збіги") or "", c0]))
        if m: x["Основний ICP"] = m.group(1)
    if x.get("Основний ICP") == "DEV-2" and not (x.get("Тип потреби") or "").strip() and tier in ("Tier 1", "Tier 2"):
        blob = " ".join(str(v) for v in x.values()).lower()
        if "fd engineer" in blob or "ai до продакшну" in blob: x["Тип потреби"] = "AI до продакшну (авто)"
        elif "техборг" in blob or "lovable" in blob: x["Тип потреби"] = "техборг (авто)"
        elif yes(x.get("раунд")) or yes(x.get("вакансії")): x["Тип потреби"] = "команда (авто)"
    if tier in ("Tier 1", "Tier 2") and c1.startswith("Дубль"): st = "Дубль"
    elif tier in ("Tier 1", "Tier 2", "Tier 3", "Investor", "Partner", "Partner?"): st = tier
    elif "дубль" in c0.lower(): st = "Дубль"
    else: st = "Потрібна перевірка"
    x["Статус"] = st
    g = ""
    if st == "Потрібна перевірка":
        g = (x.get("Група (для невизначених)") or "").strip() or (("A" if len(f(x, "pitch")) > 40 else "B") if DM.search(f(x, "title")) else "C")
    x["Група (для невизначених)"] = g
    site = f(x, "website")
    todo = (x.get("Потрібно від лідгена") or "").strip()
    if st in ("Tier 1", "Tier 2") and not site and "сайт" not in todo.lower():
        todo = (todo + "; " if todo else "") + "додати сайт компанії"; x["Потрібно від лідгена"] = todo
    act = {"Tier 1": "Перевірити (етап 4) → персональний меседж з гачком", "Tier 2": "Перевірити → меседж з кваліфікаційним питанням",
           "Tier 3": "Не писати", "Investor": "Трек інвесторів — лише за взаємної користі, без слотів CEO",
           "Partner": "Передати партнершіпу", "Partner?": "Передати партнершіпу (можливо конкурент)",
           "Дубль": "Не писати окремо — див. DM у коментарі"}.get(st)
    if st == "Потрібна перевірка":
        act = "Низький пріоритет: шукати DM, якщо компанія цікава" if g == "C" else \
              "Є сайт → перевірити й кваліфікувати (етап 3)" if site else "Знайти сайт/LinkedIn або надіслати кваліфікаційне питання"
    if todo and st in ("Tier 1", "Tier 2"): act += " · є задачі в «Потрібно від лідгена»"
    x["Наступна дія"] = act
    if st in ("Tier 1", "Tier 2") and not (x.get("Базово підходить") or "").strip(): x["Базово підходить"] = "TRUE (етап 3)"
    x["Бал"] = score(x, st) if st in ("Tier 1", "Tier 2") or (st == "Tier 3" and c1) else ""
    if st in ("Tier 1", "Tier 2") and not (x.get("Напрям") or "").strip():
        x["Напрям"] = direction(x.get("Основний ICP") or "", x.get("Тип потреби") or "")
    if st not in ("Tier 1",): x["Гачок для меседжу"] = x.get("Гачок для меседжу", "") if st == "Tier 1" else ""
    x["Сайт (фінальний)"] = site
    for c in GREEN: x["__g_" + c] = orig[i].get(c, "")

def rank(t):
    t = t.lower()
    for k, v in (("ceo", 0), ("founder", 0), ("geschäftsf", 0), ("managing director", 0), ("cio", 1), ("cto", 1), ("cdo", 1), ("coo", 2)):
        if k in t: return v
    return 3
by = collections.defaultdict(list)
for x in rows:
    if x["Статус"] in ("Tier 1", "Tier 2"): by[re.sub(r"\s+", " ", f(x, "company").lower()).strip()].append(x)
for grp in by.values():
    if len(grp) < 2: continue
    grp.sort(key=lambda x: (x["Статус"], rank(f(x, "title")), -(x["Бал"] if isinstance(x["Бал"], int) else 0)))
    b = grp[0]
    for x in grp[1:]:
        x["Коментар з причиною"] = f"Дубль компанії, DM — {f(b,'first')} {f(b,'last')} ({f(b,'title')}). " + (x.get("Коментар з причиною") or "")
        x["Статус"] = "Дубль"; x["Наступна дія"] = "Не писати окремо — див. DM у коментарі"; x["Гачок для меседжу"] = ""

# Пріоритет усередині Tier (рішення 26.10.2026): Tier 1 — «сильний сигнал» / «середній сигнал» (вакансії без дати, раунд старший
# за 12 міс чи без суми, немає CTO, сигнал модуля — підвищено з Tier 2); Tier 2 — «основний» (CEO/фаундер/CTO, software-first,
# пріоритетне гео) / «другий пріоритет» (агент позначив слабким або схожим на сервіс, не DM, гео лише прийнятне: US/UK/CA та інші поза пріоритетом).
PRIO_GEO = set("""Austria Belgium Bulgaria Croatia Cyprus Czechia Denmark Estonia Finland France Germany Greece Hungary Ireland Italy Latvia
Lithuania Luxembourg Malta Netherlands Poland Portugal Romania Slovakia Slovenia Spain Sweden Switzerland Norway Iceland Liechtenstein
Ukraine Moldova Serbia Montenegro Albania Kosovo Israel Singapore""".split()) | {"Czech Republic", "Bosnia and Herzegovina", "North Macedonia", "Kosovo, Republic of"}
WEAK = re.compile(r"слабк|низьк|нижньої межі|сумнів|сервіс|консалт|агенц|дев-шоп|студі|partner\?|можливий конкурент|не software-first", re.I)
DM_PRIO = re.compile(r"ceo|founder|fundador|co-?owner|owner|managing director|cto|chief technology|geschäftsf|president", re.I)
for x in rows:
    p = ""
    if x["Статус"] == "Tier 1":
        p = "середній сигнал" if "середній сигнал" in (x.get("Коментар етап 3 (сигнали)") or "").lower() else "сильний сигнал"
    elif x["Статус"] == "Tier 2":
        ctry = (x.get("country") or "").strip()
        weak = WEAK.search((x.get("Коментар етап 3 (сигнали)") or "") + " " + (x.get("Джерело сайту") or ""))
        p = "другий пріоритет" if weak or not DM_PRIO.search(f(x, "title")) or (ctry and ctry not in PRIO_GEO) else "основний"
        if p == "другий пріоритет": x["Наступна дія"] = "Другий пріоритет: без слотів; кваліфікаційне питання, якщо лишається час (або постконф)"
        else: x["Наступна дія"] = "Повідомлення в апці без слоту з кваліфікаційним питанням; слот — після відповіді"
    x["Пріоритет"] = p
    # «Що робимо» — одразу після Статусу й Пріоритету, щоб лідген бачив, чому рядки посортовані саме так
    x["Що робимо"] = {"сильний сигнал": "Слот + персональний меседж з гачком",
                      "середній сигнал": "Слот + персональний меседж з гачком; перед відправкою перевірити факт у «Потрібно від лідгена»",
                      "основний": "Повідомлення в апці без слоту з кваліфікаційним питанням; слот — після відповіді",
                      "другий пріоритет": "Без слотів; кваліфікаційне питання, якщо лишається час, або постконф"}.get(p) or x.get("Наступна дія", "")
PORDER = {"сильний сигнал": 0, "середній сигнал": 1, "основний": 0, "другий пріоритет": 1}

# 🟪 трекінг меседжингу (заповнює лідген). Конф — апка конференції (повідомлення зі слотом чи без) і зустрічі на події;
# Постконф — LinkedIn після події. Префікси «Конф:» / «Постконф:» розводять однакові за змістом колонки (відповідь, переписка).
CONF = ["Конф: формат першого контакту", "Конф: перше повідомлення", "Конф: дата відправки", "Конф: фолов-ап 1", "Конф: дата фолов-апу 1",
        "Конф: фолов-ап 2", "Конф: дата фолов-апу 2", "Конф: статус запиту", "Конф: відповідь", "Конф: причина відмови", "Конф: переписка",
        "Конф: дата зустрічі", "Конф: час зустрічі", "Конф: місце зустрічі", "Конф: результат зустрічі",
        "Конф: нотатки зустрічі (текст або посилання на запис)", "Конф: оцінка після розмови", "Конф: наступний крок",
        "Конф: дата наступного кроку", "Конф: далі в LinkedIn (постконф)"]
POST = ["Постконф: Campaign", "Постконф: нотатка для конекту", "Постконф: профіль-відправник", "Постконф: відправлено",
        "Постконф: дата прийняття конекту", "Постконф: перший меседж", "Постконф: фолов-апи", "Постконф: відповідь",
        "Постконф: позитивна відповідь", "Постконф: переписка", "Постконф: зустріч заброньована", "Постконф: дата", "Постконф: час",
        "Постконф: зустріч відбулася", "Постконф: коментар"]
TRACK = (CONF if a.mode != "postconf" else []) + (POST if a.mode != "conf" else [])
PROFILES = ["Саша", "Лєра", "Катя", "Каміла", "Соломія"]
LISTS = {  # випадаючі списки
    "Конф: формат першого контакту": ["повідомлення + слот", "повідомлення без слоту", "лише запит слоту"],
    "Конф: статус запиту": ["надіслано", "прийнято", "відхилено", "запропонував інший час", "без відповіді", "скасовано"],
    "Конф: відповідь": ["немає", "позитивна", "нейтральна", "відмова"],
    "Конф: причина відмови": ["in-house", "вже є підрядник", "не зараз", "не DM", "інше"],
    "Конф: місце зустрічі": ["стіл в апці", "стенд", "офлайн без бронювання", "онлайн після події"],
    "Конф: результат зустрічі": ["відбулася", "no-show", "перенесена на після події", "скасована"],
    "Конф: оцінка після розмови": ["hot", "warm", "cold", "не наш"],
    "Конф: наступний крок": ["дзвінок заброньовано", "надіслати матеріали", "повернутись пізніше", "немає"],
    "Конф: далі в LinkedIn (постконф)": ["так: сценарій C — зустрічі не було", "так: сценарій D — фолов-ап після зустрічі", "ні"],
    "Постконф: профіль-відправник": PROFILES,
}
CHECK = [c for c in ("Постконф: відправлено", "Постконф: відповідь", "Постконф: позитивна відповідь", "Постконф: зустріч заброньована",
                     "Постконф: зустріч відбулася") if c in TRACK]
DATES = [c for c in ("Конф: дата відправки", "Конф: дата фолов-апу 1", "Конф: дата фолов-апу 2", "Конф: дата зустрічі",
                     "Конф: дата наступного кроку", "Постконф: дата прийняття конекту", "Постконф: дата") if c in TRACK]
TIMES = [c for c in ("Конф: час зустрічі", "Постконф: час") if c in TRACK]
# старі назви колонок (до 26.10.2026) → нові, щоб перезбирання не губило вже записані меседжі
OLD = {"Campaign": "Постконф: Campaign", "Нотатка для конекту (текст)": "Постконф: нотатка для конекту", "Профіль-відправник": "Постконф: профіль-відправник",
       "відправлено": "Постконф: відправлено", "Дата прийняття конекту": "Постконф: дата прийняття конекту", "Перший меседж": "Постконф: перший меседж",
       "Фолов-апи": "Постконф: фолов-апи", "Відповідь": "Постконф: відповідь", "Позитивна відповідь": "Постконф: позитивна відповідь",
       "Переписка (текст)": "Постконф: переписка", "Зустріч заброньована": "Постконф: зустріч заброньована", "Дата": "Постконф: дата",
       "Час": "Постконф: час", "Зустріч відбулася": "Постконф: зустріч відбулася", "Коментар": "Постконф: коментар"}
for x in rows:
    for o, n_ in OLD.items():
        if (x.get(o) or "").strip() and not (x.get(n_) or "").strip(): x[n_] = x[o]
    for c in CHECK:
        if not (x.get(c) or "").strip(): x[c] = "FALSE"
# 🟩 перші колонки — ім'я, прізвище, компанія; решта в порядку вивантаження
_first = [c for c in (C["first"], C["last"], C["company"]) if c and c in GREEN]
GREEN = _first + [c for c in GREEN if c not in _first]
BLUE = ["Сайт (фінальний)", "Джерело сайту", "LinkedIn компанії", "Базово підходить", "Група (для невизначених)", "Коментар з причиною",
        "раунд", "вакансії", "стадія", "чи є CTO", "Розмір команди", "Сигнали модуля", "Додатковий контекст", "Бал",
        "Коментар етап 3 (сигнали)", "Статус", "Пріоритет", "Що робимо", "ICP-збіги", "Основний ICP", "Тип потреби", "Напрям",
        "Потрібно від лідгена", "Наступна дія", "Гачок для меседжу"]
cols = ["__g_" + c for c in GREEN] + BLUE + TRACK
ORDER = {"Tier 1": 0, "Tier 2": 1, "Потрібна перевірка": 2, "Partner": 3, "Partner?": 4, "Investor": 5, "Дубль": 6, "Tier 3": 7}
rows.sort(key=lambda x: (ORDER.get(x["Статус"], 9), PORDER.get(x.get("Пріоритет", ""), 2), -(x["Бал"] if isinstance(x["Бал"], int) else 0)))

from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font
from openpyxl.utils import get_column_letter
FILL = {"Tier 1": "C6EFCE", "Tier 2": "FFF2CC", "Потрібна перевірка": "DDEBF7", "Tier 3": "EDEDED", "Investor": "E4DFEC",
        "Partner": "FCE4D6", "Partner?": "FCE4D6", "Дубль": "EDEDED"}
HEAD = {**{"__g_" + c: "B7E1A1" for c in GREEN}, **{c: "BDD7EE" for c in BLUE}, **{c: "D9C3E9" for c in TRACK}}
REN = {"Коментар з причиною": "Коментар етап 1 (фільтр)", "Напрям": "Напрям послуг SDA"}
WIDE = {"Що робимо", "Конф: перше повідомлення", "Конф: фолов-ап 1", "Конф: фолов-ап 2", "Конф: переписка", "Конф: нотатки зустрічі (текст або посилання на запис)",
        "Постконф: перший меседж", "Постконф: нотатка для конекту", "Постконф: фолов-апи", "Постконф: переписка", "Наступна дія", "Гачок для меседжу", "Сигнали модуля", "Коментар етап 3 (сигнали)", "Коментар з причиною", "Потрібно від лідгена", "__g_" + (C["pitch"] or "")}
wb = Workbook(); leg = wb.active; leg.title = "Як читати"
for line in [
    [f"{a.title} — майстер-таблиця лідів (єдиний актуальний файл)".strip(" —")],
    [f"Зібрано: {TODAY:%d.%m.%Y}. Правила — «SDA — ICP & Tier Rules»."], [""],
    ["Аркуш «Усі ліди»", f"Усі {len(rows)} рядків. Потрібний сегмент — фільтром за колонкою «Статус»"],
    ["Колір шапки", "Зелений — дані з вивантаження; синій — колонки, створені ШІ для кваліфікації; фіолетовий — статистика меседжингу (заповнює лідген)"],
    [""], ["Статус", "Що означає / що робимо"],
    ["Tier 1", "Є підтверджена причина писати зараз. Перевірити (сайт, дата сигналу, людина, історія) → персональний меседж з гачком. Пріоритет: «сильний сигнал» (свіжий раунд, вакансії з датою) або «середній сигнал» (вакансії без дати, раунд старший за 12 міс чи без суми, немає CTO, сигнал модуля — перевірити факт у «Потрібно від лідгена»). Слоти — насамперед Tier 1"],
    ["Tier 2", "Підходить, сильного сигналу немає. Пріоритет «основний» (CEO/фаундер/CTO, пріоритетне гео) — повідомлення в апці без слоту з кваліфікаційним питанням, слот після відповіді; «другий пріоритет» (агент позначив слабким / схоже на сервіс, не DM, гео лише прийнятне: US, UK, CA та ін.) — без слотів, якщо лишається час або постконф"],
    ["Потрібна перевірка", "Даних замало. Група A/B/C; якщо є сайт — можна кваліфікувати (етап 3)"],
    ["Tier 3", "Не пишемо (причина в коментарі)"], ["Investor", "Лише за взаємної користі, без слотів CEO"],
    ["Partner / Partner?", "Передати партнершіпу, лідген не пише"], ["Дубль", "Пишемо лише DM, вказаному в коментарі"],
    [""], ["Колонки", ""],
    ["Базово підходить", "TRUE — за даними вивантаження; «TRUE (етап 3)» — рішення після перевірки сайту; FALSE — Tier 3 / Investor / Partner; порожньо — не визначено"],
    ["Група", "Лише для невизначених: A — CEO/фаундер з описом; B — без опису; C — не DM (найнижчий пріоритет)"],
    ["Джерело сайту", "«підбір домену — перевірити» — сайт знайдено автоматично, у 15–25% це чужа компанія"],
    ["Сигнали", "Формат: так — факт (дата) URL / ні / невідомо"],
    ["Бал", "Лише для сортування (Tier ставиться за правилом ICP). Раунд ≤12 міс = 3, 13–24 міс = 2; вакансії з датою = 3, без дати = 2; немає CTO (DEV/IOT) = 3; кожен сигнал модуля «так» = 2 (макс. 2); Tier 3 = −3"],
    ["Тип потреби", "Лише для DEV-2 (команда / AI до продакшну / техборг / Private AI). «(авто)» — проставлено за сигналами, перевірити"],
    ["Напрям послуг SDA", "Наш напрям послуг, під який підходить лід (не галузь ліда)"],
    ["Гачок для меседжу", "Лише для Tier 1. Для Tier 2 гачка немає навмисно — їм пишемо кваліфікаційне питання"],
    ["Потрібно від лідгена", "Що перевірити/доповнити вручну перед відправкою"],
    *([["Фіолетові «Конф: …»", "Заповнює лідген під час конференції (апка Brella / b2match / Grip / Web Summit тощо): формат першого контакту (список: повідомлення + слот / без слоту / лише запит слоту), перше повідомлення, дата відправки, фолов-ап 1 і 2 з датами, статус запиту, відповідь, причина відмови, переписка, дата / час / місце зустрічі, результат зустрічі, нотатки зустрічі (текст або посилання на запис), оцінка після розмови, наступний крок і його дата, «далі в LinkedIn» — якщо так, лід продовжує в блоці «Постконф». Статуси — випадаючі списки"]] if a.mode != "postconf" else []),
    *([["Фіолетові «Постконф: …»", "Заповнює лідген у LinkedIn після події: Campaign (формат «CONF / <конференція> / <ICP> / <гіпотеза>»), нотатка до конекту, профіль-відправник (список), відправлено ☑, дата прийняття конекту, перший меседж, фолов-апи, відповідь ☑, позитивна відповідь ☑, переписка, зустріч заброньована ☑, дата, час, зустріч відбулася ☑, коментар"]] if a.mode != "conf" else []),
    ["Статистика", "Конф: відсоток відповідей і прийнятих слотів (загалом і «зі слотом» проти «без слоту»), no-show, зустріч → дзвінок («наступний крок»), причини відмов — у розрізі Статусу, Основного ICP, Групи. Зведена таблиця в Google Sheets: рядки — колонка статистики, значення — COUNTA"],
    ["Google Sheets", "Після імпорту: колонки з ☑ (TRUE/FALSE) → Insert → Checkbox; випадаючі списки з XLSX переносяться (якщо ні — Data validation → dropdown з варіантами з цього аркуша); для Campaign — dropdown зі своїми кампаніями. Працювати в копії: при перезбиранні таблиці ручні позначки в оригіналі не зберігаються"],
]: leg.append(line)
leg.column_dimensions["A"].width = 24; leg.column_dimensions["B"].width = 110; leg["A1"].font = Font(bold=True, size=14)
ws = wb.create_sheet("Усі ліди")
ws.append([c[4:] if c.startswith("__g_") else REN.get(c, c) for c in cols])
for x in rows: ws.append([x[c] if isinstance(x.get(c), int) else str(x.get(c, "") or "") for c in cols])
for j, c in enumerate(cols, 1):
    ws.cell(1, j).font = Font(bold=True); ws.cell(1, j).fill = PatternFill("solid", fgColor=HEAD[c])
    ws.column_dimensions[get_column_letter(j)].width = 40 if c in WIDE else 14
sc = cols.index("Статус") + 1
for r_ in range(2, ws.max_row + 1):
    v = ws.cell(r_, sc).value
    if v in FILL: ws.cell(r_, sc).fill = PatternFill("solid", fgColor=FILL[v])
ws.freeze_panes = "D2"; ws.auto_filter.ref = ws.dimensions
from openpyxl.worksheet.datavalidation import DataValidation
n = ws.max_row
def colL(c): return get_column_letter(cols.index(c) + 1)
for c, opts in LISTS.items():
    if c not in cols: continue
    dv = DataValidation(type="list", formula1='"' + ",".join(opts) + '"', allow_blank=True); ws.add_data_validation(dv); dv.add(f"{colL(c)}2:{colL(c)}{n}")
if CHECK:
    dvb = DataValidation(type="list", formula1='"TRUE,FALSE"', allow_blank=True); ws.add_data_validation(dvb)
    for c in CHECK: dvb.add(f"{colL(c)}2:{colL(c)}{n}")
for c in DATES:
    for r_ in range(2, n + 1): ws.cell(r_, cols.index(c) + 1).number_format = "DD/MM/YYYY"
for c in TIMES:
    for r_ in range(2, n + 1): ws.cell(r_, cols.index(c) + 1).number_format = "HH:MM"
wb.save(a.out)
cnt = collections.Counter(x["Статус"] for x in rows)
print(f"{len(rows)} rows -> {a.out}")
for k, v in sorted(cnt.items(), key=lambda kv: ORDER.get(kv[0], 9)): print(f"  {v:5d}  {k}")
t12 = [x for x in rows if x["Статус"] in ("Tier 1", "Tier 2")]
for c in ["Основний ICP", "Коментар етап 3 (сигнали)"]:
    n = sum(1 for x in t12 if not (x.get(c) or "").strip())
    if n: print(f"  ⚠ Tier 1/2 без «{c}»: {n}")
n = sum(1 for x in rows if x["Статус"] == "Tier 1" and not (x.get("Гачок для меседжу") or "").strip())
if n: print(f"  ⚠ Tier 1 без гачка: {n}")
