#!/usr/bin/env python3
"""Дешевий доступ до даних для скілів SDA content (без читання великих файлів цілком).

Команди (запускати з кореня папки sda-content):
  python3 tools/context.py history --days 45 [--channel CEO]      опубліковане за N днів + індекс до медіани каналу
  python3 tools/context.py drafts [--full]                         неопубліковані чернетки, які можна використати
  python3 tools/context.py planned --from 2026-10-13 --to 2026-10-24   що вже стоїть у плані маркетологині на період
  python3 tools/context.py conferences --from 2026-10-13 --to 2026-10-24   конференції, що впливають на період (події + анонси наперед)
  python3 tools/context.py examples --channel CEO [--type Conference] [--n 5]   найкращі пости каналу з повним текстом
  python3 tools/context.py tg --days 30 [--id 393]                 нові пости Telegram CEO (без репостів), повний текст
  python3 tools/context.py tg-used                                 які пости ТГ уже використані в LinkedIn

Дані: data/content_plan.csv (експорт Google-таблиці), data/conferences.csv (експорт аркуша «Реєстр конференцій»),
data/tg_system_chaos_art.json (оновлюється tools/tg_parser.py).
"""
import argparse, csv, datetime as dt, json, os, re, statistics as st, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
CHANNELS = {"ceo": "CEO", "sda": "SDA", "kateryna": "Kateryna Shubina", "kateryna shubina": "Kateryna Shubina", "sales": "Sales"}
MONTHS = {"jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6, "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
          "січ": 1, "лют": 2, "бер": 3, "квіт": 4, "трав": 5, "черв": 6, "лип": 7, "серп": 8, "верес": 9, "жовт": 10, "листоп": 11, "груд": 12}


def d(s):
    s = (s or "").strip()
    for f in ("%d-%b-%Y", "%Y-%m-%d", "%d.%m.%Y", "%m/%d/%Y", "%d/%m/%Y"):
        try:
            return dt.datetime.strptime(s, f).date()
        except ValueError:
            pass
    return None


def num(v):
    try:
        return float(str(v).replace(",", "").replace(" ", ""))
    except ValueError:
        return None


def ch(name):
    return CHANNELS.get((name or "").strip().lower(), (name or "").strip())


def load_plan():
    rows = list(csv.reader(open(os.path.join(DATA, "content_plan.csv"), encoding="utf-8")))
    head = rows[0]
    idx = {h.strip(): i for i, h in enumerate(head)}
    col = lambda r, k: r[idx[k]].strip() if k in idx and idx[k] < len(r) else ""
    out = []
    for r in rows[1:]:
        date = d(col(r, "Date"))
        channel = col(r, "Chanel") or col(r, "Channel")
        if not date or not channel:
            continue
        out.append(dict(date=date, day=col(r, "Day"), ch=ch(channel), topic=col(r, "Topic"), desc=col(r, "Description"),
                        text=col(r, "Text"), creative=col(r, "Creative"), imp=num(col(r, "Impressions")),
                        react=num(col(r, "Reactions")), comm=num(col(r, "Comments")),
                        published=col(r, "Status").upper() == "TRUE"))
    return out


def add_index(posts):
    by = {}
    for p in posts:
        if p["imp"]:
            by.setdefault(p["ch"], []).append(p)
    for c, lst in by.items():
        mi = st.median(p["imp"] for p in lst)
        mr = st.median((p["react"] or 0) for p in lst) or 1
        for p in lst:
            p["idx"] = round(p["imp"] / mi, 2)
            p["ridx"] = round((p["react"] or 0) / mr, 2)
    return by


def short(t, n=220):
    return re.sub(r"\s+", " ", t or "")[:n]


def cmd_history(a):
    today = d(a.today) if a.today else dt.date.today()
    posts = load_plan()
    add_index(posts)
    start = today - dt.timedelta(days=a.days)
    for p in sorted(posts, key=lambda p: p["date"]):
        if not (start <= p["date"] < today):
            continue
        if a.channel and p["ch"] != ch(a.channel):
            continue
        if not p["published"]:
            continue
        m = f"imp={p['imp']:.0f} idx={p.get('idx')} react_idx={p.get('ridx')}" if p["imp"] else "метрик ще нема"
        print(f"{p['date']} {p['day'][:3]} | {p['ch']} | {p['topic'] or '-'} | {m}\n  бриф: {short(p['desc'], 140)}\n  текст: {short(p['text'])}")


def cmd_planned(a):
    f, t = d(a.date_from), d(a.date_to)
    for p in sorted(load_plan(), key=lambda p: p["date"]):
        if f <= p["date"] <= t:
            print(f"{p['date']} {p['day'][:3]} | {p['ch']} | {p['topic'] or '-'}\n  бриф: {short(p['desc'], 300)}\n  текст: {short(p['text'], 300)}")


def cmd_drafts(a):
    """Неопубліковані рядки, де вже є бриф або текст: їх можна використати в плані."""
    today = d(a.today) if a.today else dt.date.today()
    start = today - dt.timedelta(days=a.days)
    for p in sorted(load_plan(), key=lambda p: p["date"]):
        if not p["published"] and p["date"] >= start and (p["desc"] or p["text"]):
            print(f"{p['date']} | {p['ch']} | {p['topic'] or '-'} | {'є текст' if p['text'] else 'лише бриф'}\n  бриф: {short(p['desc'], 200)}\n  текст: {p['text'] if a.full else short(p['text'], 300)}")


def conf_start(text, year):
    t = (text or "").lower()
    m = re.search(r"(\d{1,2})\s*(?:[–\-—]\s*\d{1,2})?\s*([a-zа-яії]+)", t)
    if not m:
        return None
    day, word = int(m.group(1)), m.group(2)
    for k, v in MONTHS.items():
        if word.startswith(k):
            try:
                return dt.date(year, v, day)
            except ValueError:
                return None
    return None


def cmd_conferences(a):
    f, t = d(a.date_from), d(a.date_to)
    path = os.path.join(DATA, "conferences.csv")
    rows = list(csv.DictReader(open(path, encoding="utf-8")))
    print("Логіка вікна: події в періоді + події до 6 тижнів після нього (під анонси T-21/T-14) + до 2 тижнів до періоду (під підсумки).")
    for r in rows:
        name = (r.get("Conferences ID") or "").strip()
        start = conf_start(r.get("Dates"), f.year)
        if not name or not start:
            continue
        if f - dt.timedelta(days=14) <= start <= t + dt.timedelta(days=42):
            print(f"{start} | {name} | дати: {r.get('Dates','').strip()} | хто їде: {r.get('Sales','').strip() or '-'} | "
                  f"{r.get('Location','').strip()} | {short(r.get('Industry'), 60)} | approved={r.get('Approved','').strip()}\n"
                  f"  опис: {short(r.get('Description'), 200)}")
    print("\n«Alex» = CEO (Oleksandr Shubin). «Лише списки» = ніхто не їде, лише лідген — пост не потрібен.")


def cmd_examples(a):
    posts = load_plan()
    add_index(posts)
    lst = [p for p in posts if p["ch"] == ch(a.channel) and p.get("idx") and p["text"]]
    if a.type:
        lst = [p for p in lst if p["topic"].lower() == a.type.lower()] or lst
    lst.sort(key=lambda p: -(p["idx"] + p["ridx"]))
    sel = lst[: a.n] if not a.worst else lst[-a.n:]
    for p in sel:
        print(f"=== {p['date']} | {p['ch']} | {p['topic']} | imp idx {p['idx']} | react idx {p['ridx']} | візуал: {short(p['creative'], 60)}\n{p['text']}\n")


def load_tg():
    return json.load(open(os.path.join(DATA, "tg_system_chaos_art.json"), encoding="utf-8"))


def cmd_tg(a):
    posts = [p for p in load_tg() if p["text"] and not p["forwarded"]]
    if a.id:
        posts = [p for p in posts if p["id"] in a.id]
    else:
        start = (dt.date.today() - dt.timedelta(days=a.days)).isoformat()
        posts = [p for p in posts if (p["date"] or "") >= start]
    for p in posts:
        print(f"=== #{p['id']} {p['date']} 👁{p['views']} {p['url']}\n{p['text']}\n")


def cmd_tg_used(a):
    ids = set()
    for p in load_plan():
        ids |= set(int(x) for x in re.findall(r"system_chaos_art/(\d+)", p["desc"] + " " + p["text"]))
    print("Пости ТГ, вже згадані в контент-плані:", sorted(ids))
    print("Плюс теми з банку позицій, позначені ✅.")


def main():
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    h = sp.add_parser("history"); h.add_argument("--days", type=int, default=45); h.add_argument("--channel"); h.add_argument("--today")
    p = sp.add_parser("planned"); p.add_argument("--from", dest="date_from", required=True); p.add_argument("--to", dest="date_to", required=True)
    c = sp.add_parser("conferences"); c.add_argument("--from", dest="date_from", required=True); c.add_argument("--to", dest="date_to", required=True)
    e = sp.add_parser("examples"); e.add_argument("--channel", required=True); e.add_argument("--type"); e.add_argument("--n", type=int, default=5); e.add_argument("--worst", action="store_true")
    t = sp.add_parser("tg"); t.add_argument("--days", type=int, default=30); t.add_argument("--id", type=int, nargs="*")
    sp.add_parser("tg-used")
    dr = sp.add_parser("drafts"); dr.add_argument("--days", type=int, default=30); dr.add_argument("--today"); dr.add_argument("--full", action="store_true")
    a = ap.parse_args()
    {"history": cmd_history, "planned": cmd_planned, "conferences": cmd_conferences, "examples": cmd_examples,
     "tg": cmd_tg, "tg-used": cmd_tg_used, "drafts": cmd_drafts}[a.cmd](a)


if __name__ == "__main__":
    main()
