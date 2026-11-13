#!/usr/bin/env python3
"""Check a case copy markdown file (doc format) against template limits and taxonomy.

Usage: python3 check_case.py case.md [case2.md ...]
Prints OVER / BAD lines; exit code 1 if any problem.
"""
import re, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
TAX = open(os.path.join(HERE, '..', 'references', 'taxonomy.md'), encoding='utf-8').read()

def tax_list(section):
    m = re.search(r'## ' + section + r'.*?\n\n(.+?)\n', TAX, re.S)
    return [t.strip() for t in m.group(1).split('·')]

INDUSTRIES = re.findall(r'^\| ([^|]+?) \| [a-z-]+ \|', TAX, re.M)
PRODUCTS = tax_list('Product')
SERVICES = tax_list('Services')

def sections(md):
    parts = re.split(r'^## ', md, flags=re.M)
    return {p.split('\n', 1)[0].strip(): p for p in parts[1:]}

def field(text, label):
    m = re.search(r'\*\*' + re.escape(label) + r':\*\*\s*(.+)', text)
    return m.group(1).strip() if m else None

def para_after(text, label):
    m = re.search(r'\*\*' + re.escape(label) + r'\*\*\s*\n\s*\n(.+)', text)
    return m.group(1).strip() if m else None

def rows(text):
    out = []
    for line in text.split('\n'):
        if line.startswith('|') and not re.match(r'^\|\s*-', line):
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            out.append(cells)
    return out[1:]  # skip header

def check(path):
    md = open(path, encoding='utf-8').read()
    S = sections(md)
    probs = []
    if 'Case page' in S:  # prototype case: card + links only
        return [] if 'Internal: service matching' in S else ['MISSING Internal: service matching']
    def lim(name, s, n):
        if s is None:
            probs.append(f'MISSING {name}')
        elif len(s) > n:
            probs.append(f'OVER {len(s)}/{n} {name}: {s}')
    seo = S.get('SEO', '')
    lim('meta title', field(seo, 'Meta title'), 60)
    lim('meta description', field(seo, 'Meta description'), 155)
    hero = S.get('Hero', '')
    lim('H1', field(hero, 'H1'), 45)
    lim('subtitle', field(hero, 'Subtitle'), 135)
    hr = rows(hero)
    aws = 'AWS Partner badge' in hero
    if len(hr) != (2 if aws else 3): probs.append(f'BAD hero metrics: {len(hr)} rows (AWS={aws}: need {2 if aws else 3})')
    for m, t in [(r[0], r[1]) for r in hr if len(r) > 1]:
        if m == 'AWS badge': probs.append('BAD AWS badge row: the badge is a graphic now, no row')
        lim('hero metric', m, 4)
        lim('hero metric label', t, 45)
    ov = S.get('Overview', '')
    for r in rows(ov):
        if len(r) < 2: continue
        tags = [t.strip() for t in r[1].split('·')]
        for t in tags: lim(f'tag {r[0]}', t, 22)
        if r[0] == 'Industry' and tags[0] not in INDUSTRIES: probs.append(f'BAD industry not in taxonomy: {tags[0]}')
        if r[0] == 'Product':
            for t in tags:
                if t not in PRODUCTS: probs.append(f'BAD product tag: {t}')
        if r[0] == 'Services':
            for t in tags:
                if t not in SERVICES: probs.append(f'BAD service tag: {t}')
    bc = field(hero, 'Breadcrumb')
    ind = next((r[1].split('·')[0].strip() for r in rows(ov) if r and r[0] == 'Industry'), None)
    if bc and ind and not bc.endswith(ind): probs.append(f'BAD breadcrumb {bc} vs industry {ind}')
    lim('Client', para_after(ov, 'Client'), 125)
    lim('The problem', para_after(ov, 'The problem'), 185)
    lim('What we delivered', para_after(ov, 'What we delivered'), 215)
    g = rows(S.get('Goals', ''))
    if len(g) != 3: probs.append(f'BAD goals: {len(g)}')
    for r in g: lim('goal title', r[0], 30); lim('goal text', r[1], 105)
    ch = rows(S.get('Challenges', ''))
    if len(ch) != 5: probs.append(f'BAD challenges: {len(ch)}')
    for i, r in enumerate(ch):
        lim('challenge title', r[0], 26); lim('challenge text', r[1], 75 if i == 4 else 120)
    sol = S.get('Solution', '')
    if not sol: probs.append('MISSING Solution section')
    steps = re.split(r'^### ', sol, flags=re.M)[1:]
    if not 2 <= len(steps) <= 6: probs.append(f'BAD solution steps: {len(steps)}')
    for st in steps:
        name = re.sub(r'^\d+\.\s*', '', st.split('\n', 1)[0].strip())
        lim('step name', name, 35)
        body = next((l.strip() for l in st.split('\n')[1:] if l.strip() and not l.startswith('**')), None)
        lim(f'step text ({name})', body, 240)
    for old in ('Inside the platform', 'The Solution'):
        if old in S: probs.append(f'BAD old block still present: {old}')
    if 'Internal: service matching' not in S: probs.append('MISSING Internal: service matching')
    im = rows(S.get('The Impact', ''))
    if len(im) != 6: probs.append(f'BAD impact cards: {len(im)}')
    for r in im:
        if r[0] == 'Number': lim('impact number', r[1], 4); lim('impact number label', r[2], 45)
        else: lim('impact title', r[1], 24); lim('impact text', r[2], 48)
    rel = re.findall(r'^- (.+)$', S.get('Related Case Studies', ''), re.M)
    if len(rel) != 3: probs.append(f'BAD related: {len(rel)}')
    for r in rel: lim('related title', r, 55)
    return probs

bad = False
for p in sys.argv[1:]:
    pr = check(p)
    print(f'{os.path.basename(p)}: ' + ('OK' if not pr else f'{len(pr)} problems'))
    for x in pr: print('   ', x)
    bad = bad or bool(pr)
sys.exit(1 if bad else 0)
