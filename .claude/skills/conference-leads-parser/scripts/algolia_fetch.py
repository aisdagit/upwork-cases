#!/usr/bin/env python3
"""Збір учасників із Algolia (напр. Web Summit: індекс se_attendances_*) з обходом ліміту в 1000 результатів.

Algolia віддає максимум 1000 хітів на один пошук (paginationLimitedTo), тому список ділимо на частини
≤ --cap за фасетами (--split), а невеликі значення групуємо через OR в один запит. Записи беруться
пачками по --hits (до 1000), тож запитів потрібно в рази менше, ніж при сторінках по 20.
Ті самі правила ввічливості: послідовно, пауза 3–5 с, стоп на 429/401/403, 2×5xx/збій. Відновлюється:
кожен результат кешується у --out (повторний запуск пропускає вже зроблене).

Приклад:
  python3 algolia_fetch.py --config work/config.json --out work/pages \
     --select "accreditation.name=ALPHA,BETA,GROWTH,PARTNER,SPEAKER,EXECUTIVE" \
     --split industry.name,country.name
config.json — з curl (curl_to_config.py); у тілі беруться indexName і базовий facetFilters.
"""
import argparse
import hashlib
import json
import math
import os
import sys
import time

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from common import load_config, curl_request, pause, Guard, log_line  # noqa: E402


class Stop(Exception):
    pass


class Runner:
    def __init__(self, cfg, out, split, cap, hits, max_seconds):
        self.cfg, self.out, self.split, self.cap, self.hits = cfg, out, split, cap, hits
        self.base = json.loads(cfg["body"])["requests"][0]
        self.guard = Guard()
        self.t0, self.max_seconds = time.time(), max_seconds
        self.log = os.path.join(out, "fetch_log.csv")
        self.requests_made = 0
        os.makedirs(out, exist_ok=True)

    # --- один запит до Algolia з кешем на диску ---
    def call(self, filters, page=0, hits=0, facets=None, tag=""):
        req = dict(self.base)
        req["facetFilters"] = filters
        req["page"], req["hitsPerPage"] = page, hits
        req.pop("facets", None)
        if facets:
            req["facets"], req["maxValuesPerFacet"] = facets, 1000
        key = hashlib.md5(json.dumps(req, sort_keys=True).encode()).hexdigest()[:16]
        path = os.path.join(self.out, f"{tag or 'q'}_{key}.json")
        if os.path.exists(path):
            return json.load(open(path, encoding="utf-8"))["results"][0]
        while True:
            if time.time() - self.t0 > self.max_seconds:
                raise Stop("ЧАС: досягнуто --max-seconds. Запусти ту саму команду ще раз — продовжить.")
            status, text = curl_request(self.cfg, body={"requests": [req]}, timeout=60)
            if status == 400 and self.hits > 100:
                print(f"400 при hitsPerPage={self.hits} — зменшую до 100 і повторюю один раз")
                self.hits = 100
                req["hitsPerPage"] = min(req["hitsPerPage"], 100) if req["hitsPerPage"] else 0
                continue
            action, reason = self.guard.check(status)
            self.requests_made += 1
            if action == "stop":
                log_line(self.log, page, status or "NETFAIL", 0, reason)
                raise Stop(f"СТОП: {reason}")
            if action == "retry":
                pause()
                continue
            d = json.loads(text)
            with open(path, "w", encoding="utf-8") as f:
                json.dump(d, f, ensure_ascii=False)
            n = len(d["results"][0].get("hits", []))
            log_line(self.log, page, status, n, f"{tag} {json.dumps(filters, ensure_ascii=False)[:120]}")
            pause()
            return d["results"][0]

    def leaf(self, filters, label):
        """Забрати всі записи вузла (має бути ≤ 1000)."""
        r = self.call(filters, page=0, hits=self.hits, tag="hits")
        nb = r["nbHits"]
        got = len(r["hits"])
        pages = math.ceil(nb / self.hits) if self.hits else 1
        for p in range(1, min(pages, math.ceil(1000 / self.hits))):
            self.call(filters, page=p, hits=self.hits, tag="hits")
        print(f"  [{label}] nbHits={nb}, отримано на стор.0: {got}")
        if nb > 1000:
            return "overflow"
        return "ok"

    def node(self, filters, depth, label):
        attr = self.split[depth] if depth < len(self.split) else None
        c = self.call(filters, facets=[attr] if attr else None, tag="count")
        nb = c["nbHits"]
        print(f"{label}: {nb}")
        if nb <= self.cap or attr is None:
            if nb > 1000:
                print(f"  УВАГА: {label} має {nb} > 1000 і далі ділити нічим — частина записів буде втрачена")
            self.leaf(filters, label)
            return
        dist = c["facets"].get(attr, {})
        big = [v for v, n in dist.items() if n > self.cap]
        small = sorted(((v, n) for v, n in dist.items() if n <= self.cap), key=lambda x: -x[1])
        for v in big:  # великі значення ділимо далі наступним фасетом
            self.node(filters + [f"{attr}:{v}"], depth + 1, f"{label} / {v}")
        # дрібні пакуємо в групи ≤ cap через OR
        bins, cur, cur_n = [], [], 0
        for v, n in small:
            if cur and cur_n + n > self.cap:
                bins.append(cur)
                cur, cur_n = [], 0
            cur.append(v)
            cur_n += n
        if cur:
            bins.append(cur)
        for i, b in enumerate(bins, 1):
            f = filters + [[f"{attr}:{v}" for v in b]]
            self.leaf(f, f"{label} / група {i} ({len(b)} знач.)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--select", required=True, help="attr=val1,val2,… — які значення брати (кожне окремим деревом)")
    ap.add_argument("--split", required=True, help="фасети для ділення через кому, напр. industry.name,country.name")
    ap.add_argument("--cap", type=int, default=900)
    ap.add_argument("--hits", type=int, default=1000)
    ap.add_argument("--max-seconds", type=int, default=540)
    a = ap.parse_args()
    cfg = load_config(a.config)
    base_filters = json.loads(cfg["body"])["requests"][0].get("facetFilters", [])
    attr, _, vals = a.select.partition("=")
    r = Runner(cfg, a.out, a.split.split(","), a.cap, a.hits, a.max_seconds)
    try:
        for v in vals.split(","):
            r.node(list(base_filters) + [f"{attr}:{v}"], 0, v)
    except Stop as e:
        print(str(e))
        print(f"Запитів у цьому прогоні: {r.requests_made}")
        return
    print(f"ГОТОВО. Запитів у цьому прогоні: {r.requests_made}")


if __name__ == "__main__":
    main()
