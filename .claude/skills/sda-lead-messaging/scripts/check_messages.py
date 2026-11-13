#!/usr/bin/env python3
"""Check a batch of drafted messages against SDA messaging rules and for template-likeness.

Usage: python3 check_messages.py <messages.json> [--channel linkedin|app]

messages.json: {"<row>": {"Нотатка для конекту (текст)": "...", "Перший меседж": "...", "Фолов-апи": "FU1: ...\\n\\nFU2: ...",
                          "Кут": "H1", "_name": "Malthe", "_company": "CareLog"}}
Prints per-message problems and batch-level template warnings. Exit code 1 if there are hard errors.
Nothing here replaces judgement: it catches what is easy to miss when writing many messages in a row.
"""
import json, re, sys, itertools, collections

path = sys.argv[1]
DEFAULT_SC = sys.argv[sys.argv.index("--scenario") + 1].upper() if "--scenario" in sys.argv else "B"
M = json.load(open(path, encoding="utf-8"))
BANNED = ["instantly caught", "caught my attention", "really impressed", "i came across your profile", "exactly the kind of",
          "real value in", "hope this finds you", "quick question", "pick your brain", "synerg", "game-changer", "game changer",
          "revolutioniz", "leading provider", "top-notch", "world-class", "!!", ":))", "touch base", "circle back", "i noticed that you"]
GUARANTEE = re.compile(r"\b70\s?%|pay only|fixed[- ]price|money[- ]back|guarantee", re.I)
ATTEND = re.compile(r"great to meet|nice to meet you at|missed you|see you at|meet at (the )?(event|bits|conference)|we were (both )?at|at our booth|at the conference", re.I)
CAL = re.compile(r"calendly|cal\.com|book a (call|slot)|\b\d{2}\s?min(ute)?s?\b|schedule a call", re.I)
PLACE = re.compile(r"\{[^}]*\}|\[[^\]]*\]|<[^>]+>|XXX|TBD", re.I)
DATETIME = re.compile(r"\b(mon|tue|wed|thu|fri|sat|sun)(day)?\b|\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}\s?(am|pm)\b|\b(sep|oct|nov|dec|jan|feb|mar|apr|may|jun|jul|aug)[a-z]*\.? \d{1,2}\b", re.I)
PRIOR = re.compile(r"\bapp\b|brella|b2match|grip|swapcard|tried to (meet|set up|find|reach)|messaged you|reached out (before|in)|we'd tried|earlier in", re.I)
MISSED = re.compile(r"missed you|sorry we didn'?t (get to )?meet|great to meet|nice meeting", re.I)
def limits(sc): return {"Нотатка для конекту (текст)": 200, "Перший меседж": 450 if sc in ("A", "C") else 500}

def _unused(): pass
def grams(t, n=3):
    w = re.findall(r"[a-zà-ÿäöüß']+", t.lower()); return {tuple(w[i:i+n]) for i in range(len(w) - n + 1)}
def opening(t, k=5): return " ".join(re.findall(r"[a-zà-ÿäöüß']+", t.lower())[:k])

hard = 0; issues = collections.defaultdict(list)
for row, m in M.items():
    if m.get("Не писати"): continue
    sc = (m.get("Сценарій") or DEFAULT_SC).strip().upper()[:1]; LIM = limits(sc); channel = "app" if sc == "A" else "linkedin"
    note, first, fu = m.get("Нотатка для конекту (текст)", ""), m.get("Перший меседж", ""), m.get("Фолов-апи", "")
    for col, txt in (("Нотатка для конекту (текст)", note), ("Перший меседж", first), ("Фолов-апи", fu)):
        if re.search(r"[—–]", txt): issues[row].append(f"{col}: довге/середнє тире (— –) — замінити крапкою, комою або двокрапкою"); hard += 1
    if sc == "A":
        if re.search(r"ukrain|eastern europ|offshore|nearshore|outsourc", first, re.I): issues[row].append("A: походження / «outsourcing» у першому повідомленні — «хто ми» будувати від ситуації ліда")
        last = re.split(r"(?<=[.!?])\s+", first.strip())[-1] if first.strip() else ""
        if re.search(r"worth (a |\d+ ?min)|can we meet|could we meet|open to (a )?(meet|chat|call)|would you be (open|up)|let'?s meet|meet at the (conference|event)\?", last, re.I): issues[row].append(f"A: кінцівка просить зустріч («{last[:60]}») — запит уже прикріплений, краще сказати, що людина отримає")
        if DATETIME.search(first): issues[row].append(f"A: у тексті дата/час «{DATETIME.search(first).group(0)}» — слот уже в запиті, не повторювати"); hard += 1
        if note: issues[row].append("A: нотатка до конекту не потрібна (це застосунок)")
    if sc == "C":
        if not PRIOR.search(note + " " + first): issues[row].append("C: немає посилання на попередній контакт у застосунку")
        if MISSED.search(note + " " + first): issues[row].append(f"C: «{MISSED.search(note + ' ' + first).group(0)}» — лише якщо зустріч справді була домовлена")
        if m.get("_prev") and first:
            j = len(grams(first) & grams(m["_prev"])) / max(len(grams(first) | grams(m["_prev"])), 1)
            if j > 0.25: issues[row].append(f"C: перший меседж повторює попереднє повідомлення в застосунку ({j:.0%})")
    if sc in ("D", "E"): issues[row].append(f"{sc}: сценарій-заготовка — правила ще не узгоджені")
    name = (m.get("_name") or "").split()[0] if m.get("_name") else ""
    for col, txt in (("Нотатка для конекту (текст)", note), ("Перший меседж", first), ("Фолов-апи", fu)):
        if not txt: continue
        tl = txt.lower()
        if col in LIM and len(txt) > LIM[col]: issues[row].append(f"{col}: {len(txt)} символів > {LIM[col]}"); hard += 1
        for b in BANNED:
            if b in tl: issues[row].append(f"{col}: штамп «{b}»"); hard += 1
        if PLACE.search(txt): issues[row].append(f"{col}: незаповнений плейсхолдер «{PLACE.search(txt).group(0)}»"); hard += 1
        if ATTEND.search(txt): issues[row].append(f"{col}: згадка присутності на події «{ATTEND.search(txt).group(0)}» — перевірити, що це правда")
    if note and note.rstrip().endswith("?"): issues[row].append("Нотатка до конекту закінчується питанням (краще легка фраза без питання)")
    if GUARANTEE.search(note + " " + first): issues[row].append("Гарантія / fixed price у першому дотику — прибрати"); hard += 1
    if channel == "linkedin" and CAL.search(first): issues[row].append("Календар / «N min» у першому меседжі LinkedIn — пропонувати лише після відповіді"); hard += 1
    if first.count("?") > 1: issues[row].append(f"Перший меседж: {first.count('?')} питання (має бути одне)")
    if first and first.count("?") == 0 and channel == "linkedin" and not re.search(r"glad to|happy to|could be useful|compare notes|would be good to", first, re.I):
        issues[row].append("Перший меседж без питання і без пропозиції (що людина отримає) — немає на що відповісти")
    if name and first and name.lower() not in first.lower(): issues[row].append(f"Перший меседж не звертається на ім'я ({name})")
    if fu and not re.search(r"FU1|FU2|\+\d|Скасування", fu): issues[row].append("Фолов-апи: позначте FU1 / FU2 (або «Скасування слота» для застосунку) з інтервалом")
    if sc == "A" and re.search(r"FU2", fu): issues[row].append("A: у застосунку лише один фолов-ап; замість FU2 — скасування і заміна слота")

# batch-level: same openings, near-duplicates
for col in ("Нотатка для конекту (текст)", "Перший меседж"):
    ops = collections.defaultdict(list)
    for row, m in M.items():
        t = re.sub(r"^(hi|hey|hello|thanks for connecting|thank you for connecting)[, ]+\w+[,.!—-]*\s*", "", (m.get(col) or "").strip(), flags=re.I)
        if t: ops[opening(t)].append(row)
    for op, rs in ops.items():
        if len(rs) > 1: print(f"⚠ {col}: однакове відкриття «{op}…» у рядках {', '.join(rs)} — переписати по-різному")
    for (r1, m1), (r2, m2) in itertools.combinations(M.items(), 2):
        g1, g2 = grams(m1.get(col, "")), grams(m2.get(col, ""))
        if g1 and g2:
            j = len(g1 & g2) / len(g1 | g2)
            if j > 0.35: print(f"⚠ {col}: рядки {r1} і {r2} схожі на шаблон (збіг {j:.0%})")
ends = collections.defaultdict(list)
for row, m in M.items():
    f = (m.get("Перший меседж") or "").strip()
    if f and (m.get("Сценарій") or DEFAULT_SC).upper().startswith("A"):
        ends[" ".join(re.findall(r"[a-z']+", re.split(r"(?<=[.!?])\s+", f)[-1].lower())[:6])].append(row)
for e, rs in ends.items():
    if len(rs) > 1: print(f"⚠ A: однакова кінцівка «{e}…» у рядках {', '.join(rs)} — чергувати варіанти з банку кінцівок")
angles = collections.Counter((m.get("Кут") or ("не писати" if m.get("Не писати") else "?")).split()[0] for m in M.values())
print(f"Кути в партії: {dict(angles)}")
for row in M:
    if issues[row]: print(f"\nrow {row} ({M[row].get('_company','')}):\n  - " + "\n  - ".join(issues[row]))
print(f"\nПовідомлень: {len(M)}; жорстких помилок: {hard}")
sys.exit(1 if hard else 0)
