"""Спільні утиліти: конфіг із curl, ввічливий запит через curl, правила зупинки."""
import json
import os
import random
import re
import subprocess
import tempfile
import time
from datetime import datetime, timezone

MIN_DELAY, MAX_DELAY = 3.0, 5.0


def load_config(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def pause():
    """Пауза 3–5 с з джитером між запитами."""
    time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))


def _esc(s):
    # екранування для значень у файлі конфігу curl (-K)
    return (s.replace("\\", "\\\\").replace('"', '\\"')
            .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t"))


def curl_request(cfg, url=None, body=None, timeout=30):
    """Один запит через curl. Заголовки/токени йдуть через тимчасовий файл (не в `ps`).

    Повертає (status:int|None, text). status None = мережевий збій/таймаут.
    """
    url = url or cfg["url"]
    lines = [f'url = "{_esc(url)}"']
    for k, v in cfg.get("headers", {}).items():
        lines.append(f'header = "{_esc(k)}: {_esc(v)}"')
    if body is not None:
        data = body if isinstance(body, str) else json.dumps(body, ensure_ascii=False)
        lines.append(f'data-binary = "{_esc(data)}"')
    fd, path = tempfile.mkstemp(prefix="curlcfg_")
    try:
        os.write(fd, ("\n".join(lines) + "\n").encode("utf-8"))
        os.close(fd)
        os.chmod(path, 0o600)
        r = subprocess.run(
            ["curl", "-s", "-K", path, "--max-time", str(timeout), "-w", "\n%{http_code}"],
            capture_output=True, text=True, timeout=timeout + 20)
    except subprocess.TimeoutExpired:
        return None, ""
    finally:
        try:
            os.remove(path)
        except OSError:
            pass
    text, _, code = r.stdout.rpartition("\n")
    try:
        status = int(code)
    except ValueError:
        return None, ""
    return (None if status == 0 else status), text


class Guard:
    """Правила зупинки: 429/401/403 — одразу; 2×5xx або 2×збій мережі підряд — стоп.

    Жодних агресивних ретраїв: після першого збою одна пауза й одна спроба.
    """

    def __init__(self):
        self.c5xx = 0
        self.cfail = 0

    def check(self, status):
        """Повертає (action, reason): action = 'ok' | 'retry' | 'stop'."""
        if status is None:
            self.cfail += 1
            return ("stop", "два збої мережі/таймаути підряд") if self.cfail >= 2 else ("retry", "збій мережі")
        self.cfail = 0
        if status == 429:
            return "stop", "429 rate limit — зупинено, не обходимо"
        if status in (401, 403):
            return "stop", f"{status} авторизація — токен протух або немає доступу; не ротуємо токени/IP"
        if status >= 500:
            self.c5xx += 1
            return ("stop", "два 5xx підряд") if self.c5xx >= 2 else ("retry", f"{status}")
        self.c5xx = 0
        if status != 200:
            return "stop", f"неочікуваний статус {status}"
        return "ok", ""


def log_line(log_path, page, status, count, note=""):
    new = not os.path.exists(log_path)
    with open(log_path, "a", encoding="utf-8") as f:
        if new:
            f.write("timestamp,page,http_status,count,note\n")
        ts = datetime.now(timezone.utc).isoformat()
        f.write(f"{ts},{page},{status},{count},{note}\n")


def saved_pages(out_dir, prefix="page_"):
    pages = []
    for name in os.listdir(out_dir) if os.path.isdir(out_dir) else []:
        m = re.fullmatch(rf"{re.escape(prefix)}(\d+)\.json", name)
        if m:
            pages.append(int(m.group(1)))
    return sorted(pages)
