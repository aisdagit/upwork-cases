#!/usr/bin/env python3
"""Послідовний збір сторінок Brella (attendees або registrants) з відновленням.

Правила: строго послідовно; пауза 3–5 с з джитером; без агресивних ретраїв;
429 / 401 / 403 — стоп одразу; 2×5xx або 2×збій мережі підряд — стоп; кожна сторінка
зберігається окремим JSON і ніколи не запитується двічі (--start auto продовжує з місця зупинки).
Фонова задача в Claude Code живе максимум 10 хв, тому є --max-seconds (за замовчуванням 540):
скрипт сам коректно зупиняється й пише, як продовжити.

  python3 brella_fetch.py --config work/config.json --endpoint registrants --out work/pages
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from common import load_config, curl_request, pause, Guard, log_line, saved_pages  # noqa: E402
from brella_probe import event_base  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--endpoint", choices=["attendees", "registrants"], required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--start", default="auto", help="номер сторінки або 'auto' (з місця зупинки)")
    ap.add_argument("--size", type=int, default=20)
    ap.add_argument("--max-seconds", type=int, default=540)
    ap.add_argument("--max-pages", type=int, default=0, help="для тесту: зупинитись після N сторінок")
    ap.add_argument("--no-ignore-networking", action="store_true",
                    help="не додавати ignore_networking=true (за замовчуванням додаємо — інакше сховані учасники з вимкненим нетворкінгом)")
    a = ap.parse_args()

    cfg = load_config(a.config)
    base = event_base(cfg)
    os.makedirs(a.out, exist_ok=True)
    log_path = os.path.join(a.out, "fetch_log.csv")

    if a.start == "auto":
        have = saved_pages(a.out)
        page = (have[-1] + 1) if have else 1
        if have:
            last = json.load(open(os.path.join(a.out, f"page_{have[-1]}.json")))
            tp = last.get("meta", {}).get("total_pages")
            if tp and have[-1] >= tp:
                print(f"Вже повністю зібрано ({have[-1]}/{tp} сторінок).")
                return
    else:
        page = int(a.start)

    q = "" if a.no_ignore_networking else "ignore_networking=true&"
    t0, guard, done = time.time(), Guard(), 0
    while True:
        if time.time() - t0 > a.max_seconds:
            print(f"ЧАС: досягнуто --max-seconds. Продовжити: той самий запуск (--start auto), наступна сторінка {page}.")
            return
        url = f"{base}/{a.endpoint}?{q}order=newest&page%5Bnumber%5D={page}&page%5Bsize%5D={a.size}"
        status, text = curl_request(cfg, url)
        action, reason = guard.check(status)
        if action != "ok":
            log_line(log_path, page, status or "NETFAIL", 0, reason)
            if action == "stop":
                print(f"СТОП на сторінці {page}: {reason}")
                return
            pause()
            continue
        try:
            d = json.loads(text)
            n = len(d["data"])
        except Exception:
            log_line(log_path, page, status, 0, "BAD_JSON")
            print(f"СТОП на сторінці {page}: відповідь не JSON")
            return
        with open(os.path.join(a.out, f"page_{page}.json"), "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False)
        log_line(log_path, page, status, n, "ok")
        tp = d.get("meta", {}).get("total_pages")
        print(f"сторінка {page}/{tp}: {n} записів (всього {d.get('meta', {}).get('total_count')})")
        done += 1
        if n == 0 or (tp and page >= tp):
            print("ГОТОВО: остання сторінка.")
            return
        if a.max_pages and done >= a.max_pages:
            print("Зупинено за --max-pages.")
            return
        page += 1
        pause()


if __name__ == "__main__":
    main()
