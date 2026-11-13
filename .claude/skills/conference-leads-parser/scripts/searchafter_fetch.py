#!/usr/bin/env python3
"""Збір списку з пошукового API з курсором searchAfter (Slush: search.slush.org/…/meeting-tool/<event>/all).

Тіло запиту береться з curl (config.json); options.page.searchAfter скидаємо й далі беремо meta.searchAfter
з кожної відповіді. Ті самі правила ввічливості. Відновлюється: кожна сторінка — окремий JSON у --out,
продовження з курсора останньої збереженої сторінки. 401 = токен (у Slush живе ~15 хв) протух —
скрипт зупиняється; користувач скидає свіжий curl, продовжуємо з того самого місця.

  python3 searchafter_fetch.py --config work/config.json --out work/pages --size 200
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from common import load_config, curl_request, pause, Guard, log_line, saved_pages  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--size", type=int, default=24, help="розмір сторінки (в застосунку 24; більший = менше запитів, якщо API дозволяє)")
    ap.add_argument("--max-seconds", type=int, default=540)
    ap.add_argument("--max-pages", type=int, default=0)
    a = ap.parse_args()

    cfg = load_config(a.config)
    body = json.loads(cfg["body"])
    os.makedirs(a.out, exist_ok=True)
    log_path = os.path.join(a.out, "fetch_log.csv")

    cursor, page = None, 1
    have = saved_pages(a.out)
    if have:
        last = json.load(open(os.path.join(a.out, f"page_{have[-1]}.json"), encoding="utf-8"))
        cursor, page = last["meta"].get("searchAfter"), have[-1] + 1
        if not last["results"] or cursor is None:
            print("Вже повністю зібрано.")
            return

    t0, guard, done = time.time(), Guard(), 0
    while True:
        if time.time() - t0 > a.max_seconds:
            print(f"ЧАС: продовжити тим самим запуском; наступна сторінка {page}.")
            return
        body["options"]["page"]["size"] = a.size
        if cursor:
            body["options"]["page"]["searchAfter"] = cursor
        else:
            body["options"]["page"].pop("searchAfter", None)
        status, text = curl_request(cfg, body=body, timeout=60)
        if status == 400 and a.size > 24:
            print(f"400 при size={a.size} — повертаюсь до 24 (як у застосунку)")
            a.size = 24
            continue
        action, reason = guard.check(status)
        if action != "ok":
            log_line(log_path, page, status or "NETFAIL", 0, reason)
            if action == "stop":
                print(f"СТОП на сторінці {page}: {reason}")
                return
            pause()
            continue
        d = json.loads(text)
        n = len(d.get("results", []))
        with open(os.path.join(a.out, f"page_{page}.json"), "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False)
        log_line(log_path, page, status, n, "ok")
        m = d.get("meta", {}).get("page", {})
        print(f"сторінка {page}: {n} (всього {m.get('total_results')})")
        done += 1
        cursor = d["meta"].get("searchAfter")
        if n == 0 or n < a.size or not cursor:
            print("ГОТОВО: остання сторінка.")
            return
        if a.max_pages and done >= a.max_pages:
            print("Зупинено за --max-pages.")
            return
        page += 1
        pause()


if __name__ == "__main__":
    main()
