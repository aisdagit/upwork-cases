#!/usr/bin/env python3
"""Перетворює вставлений curl (з DevTools / Proxyman) на config.json для скриптів.

Токени лишаються тільки в config.json (права 600) — у вивід не друкуються.

Використання:
  python3 curl_to_config.py --curl-file curl.txt --out work/config.json
  (або передати curl через stdin)
"""
import argparse
import json
import os
import re
import shlex
import sys
from urllib.parse import urlparse

# Заголовки, які не потрібні для запиту (трекінг, кеш-валідатори, браузерні службові).
DROP_EXACT = {"host", "content-length", "accept-encoding", "connection", "priority",
              "if-none-match", "if-modified-since", "baggage", "sentry-trace", "cookie"}
DROP_PREFIX = ("sec-",)
SECRET_HINTS = ("token", "authorization", "client", "cookie", "key", "secret")


def parse_curl(text):
    text = text.replace("\\\r\n", " ").replace("\\\n", " ")
    toks = shlex.split(text, posix=True)
    if toks and toks[0] == "curl":
        toks = toks[1:]
    url, method, body, headers = None, None, None, {}
    i = 0
    while i < len(toks):
        t = toks[i]
        nxt = toks[i + 1] if i + 1 < len(toks) else None
        if t in ("-H", "--header") and nxt is not None:
            k, _, v = nxt.partition(":")
            headers[k.strip()] = v.strip()
            i += 2
        elif t in ("--url",) and nxt is not None:
            url = nxt
            i += 2
        elif t in ("--data-raw", "--data", "--data-binary", "-d", "--data-urlencode") and nxt is not None:
            body = nxt
            i += 2
        elif t in ("-X", "--request") and nxt is not None:
            method = nxt
            i += 2
        elif t in ("-b", "--cookie", "--proxy", "-x", "-A", "--user-agent", "-e", "--referer", "-o", "--output") and nxt is not None:
            # cookie/проксі не беремо; UA і referer — беремо як заголовки
            if t in ("-A", "--user-agent"):
                headers["user-agent"] = nxt
            if t in ("-e", "--referer"):
                headers["referer"] = nxt
            i += 2
        elif t.startswith("-"):
            i += 1  # прапорці без значення (--compressed, -s, -L ...)
        else:
            url = url or t
            i += 1
    if not url:
        sys.exit("Не знайшла URL у curl.")
    clean = {}
    for k, v in headers.items():
        kl = k.lower()
        if kl in DROP_EXACT or kl.startswith(DROP_PREFIX):
            continue
        clean[k] = v
    return {"url": url, "method": method or ("POST" if body else "GET"), "headers": clean, "body": body}


def redact(k, v):
    if any(h in k.lower() for h in SECRET_HINTS):
        return v[:4] + "…" + f"({len(v)} симв.)"
    return v


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--curl-file")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    text = open(a.curl_file, encoding="utf-8").read() if a.curl_file else sys.stdin.read()
    cfg = parse_curl(text)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
    os.chmod(a.out, 0o600)
    u = urlparse(cfg["url"])
    print(f"Записано {a.out} (права 600)")
    print(f"host: {u.netloc}\npath: {u.path}\nметод: {cfg['method']}  тіло: {'є' if cfg['body'] else 'нема'}")
    m = re.search(r"/events/([^/?]+)", u.path)
    if m:
        print(f"event slug: {m.group(1)}")
    print("заголовки (секрети приховані):")
    for k, v in cfg["headers"].items():
        print(f"  {k}: {redact(k, v)}")


if __name__ == "__main__":
    main()
