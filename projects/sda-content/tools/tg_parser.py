#!/usr/bin/env python3
"""Вивантажує пости публічного Telegram-каналу з t.me/s/<channel> (без логіну).

Використання:
  python3 tg_parser.py                      # увесь архів system_chaos_art
  python3 tg_parser.py --since 380          # лише пости з id > 380 (для щоденного запуску)
  python3 tg_parser.py --channel other_chan

Результат: tg_<channel>.json (повний архів, доповнюється) і tg_<channel>.md (для читання).
Поле `forwarded` = True для репостів з інших каналів — їх не можна використовувати як думки CEO.
"""
import argparse, html, json, os, re, time, urllib.request

HERE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def clean(fragment):
    s = re.sub(r"<br\s*/?>", "\n", fragment)
    s = re.sub(r"<[^>]+>", "", s)
    return html.unescape(s).strip()


def parse(page, channel):
    posts = []
    blocks = re.split(r'(?=<div class="tgme_widget_message_wrap)', page)
    for b in blocks:
        m = re.search(r'data-post="%s/(\d+)"' % re.escape(channel), b)
        if not m:
            continue
        pid = int(m.group(1))
        text_m = re.search(r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', b, re.S)
        date_m = re.search(r'<time datetime="([^"]+)"', b)
        views_m = re.search(r'<span class="tgme_widget_message_views">([^<]+)</span>', b)
        fwd_m = re.search(r'tgme_widget_message_forwarded_from_name[^>]*>(?:<[^>]+>)*([^<]+)', b)
        posts.append({
            "id": pid,
            "date": date_m.group(1)[:10] if date_m else None,
            "views": views_m.group(1) if views_m else None,
            "forwarded": bool(fwd_m),
            "forwarded_from": clean(fwd_m.group(1)) if fwd_m else None,
            "has_media": "tgme_widget_message_photo" in b or "tgme_widget_message_video" in b,
            "text": clean(text_m.group(1)) if text_m else "",
            "url": f"https://t.me/{channel}/{pid}",
        })
    return posts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--channel", default="system_chaos_art")
    ap.add_argument("--since", type=int, default=0)
    a = ap.parse_args()

    out_json = os.path.join(HERE, f"tg_{a.channel}.json")
    store = {}
    if os.path.exists(out_json):
        store = {p["id"]: p for p in json.load(open(out_json, encoding="utf-8"))}

    url = f"https://t.me/s/{a.channel}"
    while True:
        batch = parse(fetch(url), a.channel)
        if not batch:
            break
        for p in batch:
            store[p["id"]] = p
        oldest = min(p["id"] for p in batch)
        if oldest <= max(a.since, 1):
            break
        url = f"https://t.me/s/{a.channel}?before={oldest}"
        time.sleep(1)

    posts = sorted((p for p in store.values() if p["id"] > a.since or a.since == 0), key=lambda p: p["id"])
    all_posts = sorted(store.values(), key=lambda p: p["id"])
    json.dump(all_posts, open(out_json, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    with open(os.path.join(HERE, f"tg_{a.channel}.md"), "w", encoding="utf-8") as f:
        for p in all_posts:
            if not p["text"]:
                continue
            tag = f" [РЕПОСТ: {p['forwarded_from']}]" if p["forwarded"] else ""
            f.write(f"## {p['id']} · {p['date']} · 👁 {p['views']}{tag}\n{p['url']}\n\n{p['text']}\n\n---\n\n")
    print(f"всього в архіві: {len(all_posts)}, нових у цьому запуску: {len(posts)}")


if __name__ == "__main__":
    main()
