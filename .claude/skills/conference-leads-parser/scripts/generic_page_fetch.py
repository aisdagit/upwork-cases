#!/usr/bin/env python3
"""Збір будь-якого простого REST-списку з параметрами page/limit (напр. vendo-ai contacts) у CSV.

Ті самі правила ввічливості. Приклад (vendo-ai):
  python3 generic_page_fetch.py --config work/config.json --page-param page --size-param limit --size 50 \
      --list-key contacts --total-pages-key totalPages --tag "Logistics — Sweden" --out work/contacts.csv
Колонка --tag додається всім рядкам (зручно для міток категорій при об'єднанні кількох аудиторій:
повтори запуск з іншим config і --append).
"""
import argparse
import csv
import json
import os
import sys
import time
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from common import load_config, curl_request, pause, Guard  # noqa: E402


def with_params(url, **kv):
    u = urlparse(url)
    q = dict(parse_qsl(u.query))
    q.update({k: str(v) for k, v in kv.items()})
    return urlunparse(u._replace(query=urlencode(q)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--out", required=True, help="CSV")
    ap.add_argument("--page-param", default="page")
    ap.add_argument("--size-param", default="limit")
    ap.add_argument("--size", type=int, default=50)
    ap.add_argument("--list-key", required=True)
    ap.add_argument("--total-pages-key", default="totalPages")
    ap.add_argument("--tag", default="")
    ap.add_argument("--append", action="store_true")
    ap.add_argument("--max-seconds", type=int, default=540)
    a = ap.parse_args()

    cfg = load_config(a.config)
    guard, t0, page, rows = Guard(), time.time(), 1, []
    while True:
        if time.time() - t0 > a.max_seconds:
            print(f"ЧАС: зупинено на сторінці {page}; зібране збережу.")
            break
        url = with_params(cfg["url"], **{a.page_param: page, a.size_param: a.size})
        status, text = curl_request(cfg, url)
        action, reason = guard.check(status)
        if action == "stop":
            print(f"СТОП на сторінці {page}: {reason}")
            break
        if action == "retry":
            pause()
            continue
        d = json.loads(text)
        items = d.get(a.list_key, [])
        rows += items
        tp = d.get(a.total_pages_key) or 1
        print(f"сторінка {page}/{tp}: {len(items)}")
        if not items or page >= tp:
            break
        page += 1
        pause()

    if not rows:
        print("Нічого не зібрано.")
        return
    flat = []
    for r in rows:
        x = {k: v for k, v in r.items() if not isinstance(v, (dict, list))}
        if a.tag:
            x["tag"] = a.tag
        flat.append(x)
    mode = "a" if (a.append and os.path.exists(a.out)) else "w"
    cols = list(flat[0])
    with open(a.out, mode, newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        if mode == "w":
            w.writeheader()
        w.writerows(flat)
    print(f"Записано {len(flat)} рядків → {a.out}")


if __name__ == "__main__":
    main()
