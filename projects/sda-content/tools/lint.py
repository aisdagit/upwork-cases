#!/usr/bin/env python3
"""Механічна перевірка тексту поста на ознаки AI-стилю і типові помилки (без LLM).

Використання:
  python3 tools/lint.py output/<період>/01_....md      перевіряє «Фінальний текст», інакше «Текст»
  python3 tools/lint.py output/<період>                усі пости папки
  python3 tools/lint.py --text "..."                   довільний текст

ERROR — виправити обов'язково. WARN — перевірити очима. Код виходу 1, якщо є ERROR.
"""
import os, re, sys

ERRORS = [
    ("довге тире", r"\s—\s|—|\w\s–\s\w"),
    ("стрілка", r"→|->|=>"),
    ("маркований список", r"(?m)^\s*(?:[-•*▪]|\d+[.)])\s+\S|:\s+-\s"),
    ("«не X, а Y» окремими реченнями", r"(?i)\b(?:isn.t|aren.t|wasn.t|weren.t|doesn.t|don.t)\b[^.?!\n]{0,70}\.\s+(?:it|they|that|this)(?:.s| is| are| was| were)\b"),
    ("«not X, but/the Y»-штамп", r"(?i)\bisn.t the (?:badge|logo|job|point)\b|\bnot the logo\b"),
    ("штамп", r"(?i)\b(?:here.s the thing|let that sink in|turns out|game.?changer|in today.s|excited to|let.s dive|that.s not a bug|nobody tells you|worth sitting with|the real (?:question|perk|value)s?\b)"),
    ("HTML-сутність", r"&amp;|&nbsp;"),
    ("незаповнене місце", r"\[ПОТРІБНО"),
]
WARNS = [
    ("«Not because…» — припустимо зрідка, перевір, чи не шаблон", r"(?i)\bnot because\b"),
    ("слово часу з джерела — перевір, чи це правда на дату публікації", r"(?i)\b(?:today|yesterday|this morning|tonight|last week|last night|this week)\b"),
    ("«this year» — перевір рік події", r"(?i)\bthis year\b"),
    ("кирилиця в англійському тексті", r"[а-яіїєґА-ЯІЇЄҐ]"),
]


def sentences(t):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", t) if s.strip()]


def check(t):
    errs, warns = [], []
    for name, rx in ERRORS:
        hits = [m.group(0).strip()[:50] for m in re.finditer(rx, t)]
        if hits:
            errs.append(f"{name} ×{len(hits)}: {hits[0]!r}")
    for name, rx in WARNS:
        hits = [m.group(0) for m in re.finditer(rx, t)]
        if hits:
            warns.append(f"{name}: {hits[0]!r}")
    run = best = 0
    for s in sentences(t):
        run = run + 1 if len(s.split()) <= 5 else 0
        best = max(best, run)
    if best >= 3:
        errs.append(f"стаккато: {best} дуже короткі речення поспіль")
    paras = [p for p in t.split("\n") if p.strip()]
    tail = " ".join(paras[-2:]) if paras else ""
    if "?" not in tail and not re.search(r"(?i)comment|\bDM\b|send me|message me|reach out|write ", tail):
        warns.append("немає конкретного питання або заклику наприкінці")
    return errs, warns


def post_text(md):
    for name in ("Фінальний текст", "Текст"):
        m = re.search(r"^## " + name + r"\s*\n(.*?)(?=^## |\Z)", md, re.S | re.M)
        if m and m.group(1).strip():
            return m.group(1).strip()
    return md


def main():
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    if a[0] == "--text":
        items = [("текст", " ".join(a[1:]))]
    elif os.path.isdir(a[0]):
        items = [(f, post_text(open(os.path.join(a[0], f), encoding="utf-8").read()))
                 for f in sorted(os.listdir(a[0])) if re.match(r"\d\d_.*\.md$", f)]
    else:
        items = [(a[0], post_text(open(a[0], encoding="utf-8").read()))]
    bad = 0
    for name, t in items:
        errs, warns = check(t)
        bad += len(errs)
        print(f"{name}: {'OK' if not errs else 'ERROR ' + str(len(errs))}, {len(t)} знаків")
        for e in errs:
            print("  ERROR", e)
        for w in warns:
            print("  WARN ", w)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
