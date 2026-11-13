#!/usr/bin/env python3
"""Aggregate a week of Upwork job records and compare with the previous snapshot.

Usage:
  python3 analyze_jobs.py jobs.jsonl --history "<folder>/snapshots" --out <run folder> [--date YYYY-MM-DD]

Input: JSON Lines, one job per line (fields described in references/method.md).
Output: <out>/summary.json and <history>/<date>.json (the snapshot used next week).
Only the "fixed3k" sample feeds the market figures, so weeks stay comparable.
"""
import argparse
import collections
import datetime as dt
import json
import os
import re
import statistics
import sys

# Request types: a job can match several. Order matters only for display.
TYPES = {
    "custom_platform": ["web app", "web application", "saas", "mvp", "platform", "crm", "erp", "portal",
                        "marketplace", "dashboard", "back-office", "backoffice", "internal tool", "booking",
                        "management system", "pwa"],
    "ai_features": ["ai", "ai-", "llm", "openai", "gpt", "claude", "ai agent", "ai agents", "rag", "chatbot", "machine learning", "artificial intelligence"],
    "take_over": ["take over", "takeover", "finish", "complete", "rescue", "stabilize", "stabilization", "audit", "fix ",
                  "existing app", "existing codebase", "existing product", "previous developer",
                  "previous vendor", "lovable", "bolt", "cursor", "with claude", "ai-built",
                  "ai-generated", "prototype", "recreate", "rebuild", "take it live", "go live", "working mvp",
                  "first version"],
    "cms_sites": ["wordpress", "webflow", "elementor", "shopify", "wix", "squarespace", "framer", "landing page"],
    "payments_fintech": ["stripe", "payment", "payout", "billing", "subscription", "fintech", "authorize.net"],
    "healthcare": ["hipaa", "healthcare", "telehealth", "clinic", "hospital", "medical", "senior care", "patient"],
    "other_stack": [".net", "java ", "spring boot", "dynamics 365", "blockchain", "web3", "solidity", "smart contract"],
}

TECH = {
    "React": [r"\breact(?!\s*native)\b", r"\breact\.js\b"],
    "Next.js": [r"\bnext\.?js\b", r"\bnext\b(?=,|\s*\+)"],
    "Node.js / NestJS": [r"\bnode\.?js\b", r"\bnestjs\b", r"\bnest\.js\b"],
    "PostgreSQL": [r"\bpostgres(ql)?\b"],
    "AI / LLM / OpenAI": [r"\bllm\b", r"\bopenai\b", r"\bai agent", r"\bgpt\b", r"\bclaude\b", r"\brag\b", r"\bai\b"],
    "Stripe / payments": [r"\bstripe\b", r"\bpayment"],
    "Supabase": [r"\bsupabase\b"],
    "Python / FastAPI": [r"\bpython\b", r"\bfastapi\b", r"\bdjango\b"],
    "AWS": [r"\baws\b", r"amazon web services", r"\blambda\b"],
    "TypeScript": [r"\btypescript\b"],
    "WordPress": [r"\bwordpress\b"],
    "Laravel / PHP": [r"\blaravel\b", r"\bphp\b"],
    "React Native / Flutter": [r"react native", r"\bflutter\b", r"\bexpo\b"],
    "Vue.js": [r"\bvue(\.js)?\b", r"\bnuxt\b"],
}

STOP = set("""a an and the for to of in on with by from at or our your we you is are be as this that it
need needed needs looking seeking build building developer developers expert experienced senior
project app""".split())


def load_jobs(path):
    jobs, seen = [], set()
    with open(path, encoding="utf-8") as f:
        for n, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                j = json.loads(line)
            except json.JSONDecodeError as e:
                print(f"skip line {n}: {e}", file=sys.stderr)
                continue
            if j.get("id") in seen:
                continue
            seen.add(j.get("id"))
            jobs.append(j)
    return jobs


def text_of(j):
    return " ".join([j.get("title") or "", j.get("snippet") or "", " ".join(j.get("skills") or [])]).lower()


def budget_bucket(b):
    if b is None:
        return "unknown"
    if b < 3000:
        return "<$3k"
    if b < 5000:
        return "$3k-4.9k"
    if b < 8000:
        return "$5k-7.9k"
    if b < 20000:
        return "$8k-19.9k"
    return "$20k+"


def pct(part, total):
    return round(100 * part / total, 1) if total else 0.0


def analyze(jobs):
    base = [j for j in jobs if j.get("sample") == "fixed3k"]
    n = len(base)
    types = collections.Counter()
    tech = collections.Counter()
    words = collections.Counter()
    bigrams = collections.Counter()
    buckets = collections.Counter()
    proposals50 = no_history = 0
    budgets = []
    examples = collections.defaultdict(list)
    for j in base:
        t = text_of(j)
        for name, keys in TYPES.items():
            if any(re.search(r"(?<![a-z0-9])" + re.escape(k.strip()) + (r"" if k.endswith(("-", "z")) else r"(?![a-z0-9])"), t) for k in keys):
                types[name] += 1
                if len(examples[name]) < 3:
                    examples[name].append(j.get("title"))
        for name, pats in TECH.items():
            if any(re.search(p, t) for p in pats):
                tech[name] += 1
        toks = [w for w in re.findall(r"[a-z][a-z0-9.+#-]*", (j.get("title") or "").lower()) if w not in STOP]
        words.update(set(toks))
        bigrams.update(set(" ".join(p) for p in zip(toks, toks[1:])))
        b = j.get("budget")
        buckets[budget_bucket(b)] += 1
        if b:
            budgets.append(b)
        if (j.get("proposals") or "").startswith("50"):
            proposals50 += 1
        if not j.get("client_spent"):
            no_history += 1
    dates = sorted(j.get("created") for j in base if j.get("created"))
    return {
        "base_sample_size": n,
        "period": [dates[0], dates[-1]] if dates else None,
        "all_records": len(jobs),
        "samples": dict(collections.Counter(j.get("sample", "?").split(":")[0] for j in jobs)),
        "types": {k: {"count": v, "pct": pct(v, n), "examples": examples[k]} for k, v in types.most_common()},
        "tech": {k: {"count": v, "pct": pct(v, n)} for k, v in tech.most_common()},
        "budget_buckets": dict(buckets),
        "budget_median": statistics.median(budgets) if budgets else None,
        "share_50plus_proposals": pct(proposals50, n),
        "share_clients_no_history": pct(no_history, n),
        "top_title_words": words.most_common(25),
        "top_title_bigrams": bigrams.most_common(20),
    }


def diff(cur, prev):
    if not prev:
        return None
    out = {"previous_period": prev.get("period")}
    for key in ("types", "tech"):
        d = {}
        names = set(cur[key]) | set(prev.get(key, {}))
        for name in names:
            a = cur[key].get(name, {}).get("pct", 0.0)
            b = prev.get(key, {}).get(name, {}).get("pct", 0.0)
            if abs(a - b) >= 5:
                d[name] = {"now": a, "before": b, "change_pp": round(a - b, 1)}
        out[key] = d
    prev_words = {w for w, _ in prev.get("top_title_words", [])}
    out["new_title_words"] = [w for w, _ in cur["top_title_words"] if w not in prev_words]
    for key in ("budget_median", "share_50plus_proposals", "share_clients_no_history", "base_sample_size"):
        out[key] = {"now": cur.get(key), "before": prev.get(key)}
    return out


def latest_snapshot(folder, today):
    if not folder or not os.path.isdir(folder):
        return None, None
    files = sorted(f for f in os.listdir(folder) if re.fullmatch(r"\d{4}-\d{2}-\d{2}\.json", f) and f[:10] < today)
    if not files:
        return None, None
    with open(os.path.join(folder, files[-1]), encoding="utf-8") as f:
        return json.load(f), files[-1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("jobs")
    ap.add_argument("--history", help="folder with weekly snapshots")
    ap.add_argument("--out", required=True)
    ap.add_argument("--date", default=dt.date.today().isoformat())
    a = ap.parse_args()

    jobs = load_jobs(a.jobs)
    cur = analyze(jobs)
    prev, prev_name = latest_snapshot(a.history, a.date)
    summary = {"date": a.date, "market": cur, "compared_with": prev_name, "changes": diff(cur, prev)}

    os.makedirs(a.out, exist_ok=True)
    with open(os.path.join(a.out, "summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    if a.history:
        try:
            os.makedirs(a.history, exist_ok=True)
            with open(os.path.join(a.history, f"{a.date}.json"), "w", encoding="utf-8") as f:
                json.dump(cur, f, ensure_ascii=False, indent=2)
        except OSError as e:
            print(f"snapshot not saved: {e}", file=sys.stderr)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
