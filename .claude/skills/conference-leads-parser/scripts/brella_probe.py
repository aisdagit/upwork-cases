#!/usr/bin/env python3
"""Розвідка Brella: скільки людей віддає кожна комбінація фільтрів (по 1 запиту з page[size]=1).

Допомагає обрати ендпоінт для повного списку (див. SKILL.md → «Який ендпоінт брати»).
Запити послідовні, пауза 3–5 с, зупинка на 429/401/403.

  python3 brella_probe.py --config work/config.json
"""
import argparse
import json
import re
import sys
from urllib.parse import urlparse

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from common import load_config, curl_request, pause, Guard  # noqa: E402

COMBOS = [
    ("attendees", ""),
    ("attendees", "ignore_networking=true"),
    ("attendees", "ignore_networking=false&show_only_best_matches=true"),
    ("registrants", ""),
    ("registrants", "ignore_networking=true"),
]


def event_base(cfg):
    u = urlparse(cfg["url"])
    m = re.search(r"^(.*?/events/[^/?]+)", u.path)
    if not m:
        sys.exit("У URL немає /events/<slug>. Це не Brella?")
    return f"{u.scheme}://{u.netloc}{m.group(1)}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    a = ap.parse_args()
    cfg = load_config(a.config)
    base = event_base(cfg)
    guard = Guard()
    for ep, q in COMBOS:
        url = f"{base}/{ep}?{q + '&' if q else ''}page%5Bnumber%5D=1&page%5Bsize%5D=1"
        status, text = curl_request(cfg, url)
        action, reason = guard.check(status)
        if action == "stop":
            print(f"СТОП: {reason}")
            break
        if action == "retry":
            print(f"/{ep}?{q}: {reason}, пропускаю")
            pause()
            continue
        try:
            tc = json.loads(text)["meta"]["total_count"]
        except Exception:
            tc = "?"
        print(f"{status}  total={tc:<6} /{ep}" + (f"?{q}" if q else ""))
        pause()


if __name__ == "__main__":
    main()
