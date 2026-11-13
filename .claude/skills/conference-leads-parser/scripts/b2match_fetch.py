#!/usr/bin/env python3
"""Збір учасників b2match (GraphQL persisted query, курсорна пагінація) з відновленням.

config.json робиться з curl (curl_to_config.py): у ньому тіло запиту з variables.page.after.
Починаємо з after=null (перша сторінка), далі беремо pageInfo.endCursor. Ті самі правила
ввічливості, що й у brella_fetch.py. Курсор у curl користувача зазвичай з середини списку —
тому свідомо скидаємо його на null і йдемо від початку.

  python3 b2match_fetch.py --config work/config.json --out work/pages
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from common import load_config, curl_request, pause, Guard, log_line, saved_pages  # noqa: E402


def find_connection(o):
    """Шукає в JSON з'єднання учасників: dict із pageInfo і nodes, де вузли схожі на учасників."""
    if isinstance(o, dict):
        if "pageInfo" in o and isinstance(o.get("nodes"), list):
            nodes = o["nodes"]
            if not nodes or (isinstance(nodes[0], dict) and ("user" in nodes[0] or "participation" in nodes[0])):
                return o
        for v in o.values():
            r = find_connection(v)
            if r:
                return r
    elif isinstance(o, list):
        for v in o:
            r = find_connection(v)
            if r:
                return r
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--out", required=True)
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
        conn = find_connection(last)
        if conn and not conn["pageInfo"]["hasNextPage"]:
            print(f"Вже повністю зібрано ({have[-1]} сторінок).")
            return
        cursor, page = conn["pageInfo"]["endCursor"], have[-1] + 1

    t0, guard, done = time.time(), Guard(), 0
    while True:
        if time.time() - t0 > a.max_seconds:
            print(f"ЧАС: досягнуто --max-seconds. Продовжити тим самим запуском; наступна сторінка {page}.")
            return
        body["variables"]["page"]["after"] = cursor
        status, text = curl_request(cfg, body=body, timeout=40)
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
            conn = find_connection(d)
            n = len(conn["nodes"])
        except Exception:
            log_line(log_path, page, status, 0, "BAD_JSON_OR_ERRORS")
            print(f"СТОП на сторінці {page}: відповідь без списку учасників (persisted query застарів? перевір curl).")
            return
        with open(os.path.join(a.out, f"page_{page}.json"), "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False)
        log_line(log_path, page, status, n, "ok")
        print(f"сторінка {page}: {n} учасників")
        done += 1
        if n == 0 or not conn["pageInfo"]["hasNextPage"]:
            print("ГОТОВО: остання сторінка.")
            return
        if a.max_pages and done >= a.max_pages:
            print("Зупинено за --max-pages.")
            return
        cursor, page = conn["pageInfo"]["endCursor"], page + 1
        pause()


if __name__ == "__main__":
    main()
