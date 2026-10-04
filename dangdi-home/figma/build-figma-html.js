// DOM -> flat, absolutely-positioned HTML for Figma importers (html.to.design etc.).
// No clip-path, mask, CSS variables, pseudo-elements, writing-mode or grid: only divs, text lines and inline SVG paths.
const { chromium } = require('playwright');
const fs = require('fs');
const SCR = '/tmp/claude-0/-home-user-upwork-cases/dcc36b45-5518-5742-a880-bca3dce25b68/scratchpad';
const SRC = '/home/user/upwork-cases/dangdi-home/index.html';

function walker() {
  const W = 390;
  const cv = document.createElement('canvas').getContext('2d');
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const n2 = v => Math.round(v * 100) / 100;
  let uid = 0; const used = {};
  const nm = (base) => { base = (base || 'layer').replace(/[^A-Za-z0-9_\- ]/g, '').trim().replace(/\s+/g, '-').slice(0, 40) || 'layer'; used[base] = (used[base] || 0) + 1; return used[base] > 1 ? base + '-' + used[base] : base; };
  function col(str) {
    cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = str; cv.fillRect(0, 0, 1, 1);
    const d = cv.getImageData(0, 0, 1, 1).data; const h = x => x.toString(16).padStart(2, '0');
    return { hex: '#' + h(d[0]) + h(d[1]) + h(d[2]), a: d[3] / 255, css: d[3] === 255 ? '#' + h(d[0]) + h(d[1]) + h(d[2]) : `rgba(${d[0]},${d[1]},${d[2]},${n2(d[3] / 255)})` };
  }
  const fillAttr = c => c.a === 0 ? 'fill="none"' : `fill="${c.hex}"` + (c.a < 1 ? ` fill-opacity="${n2(c.a)}"` : '');
  function boxRadius(cs, r) {
    const get = p => { const v = cs[p].split(' '); const f = (s, b) => s.endsWith('%') ? parseFloat(s) / 100 * b : parseFloat(s); return [f(v[0], r.w), f(v[1] || v[0], r.h)]; };
    const tl = get('borderTopLeftRadius'), tr = get('borderTopRightRadius'), br = get('borderBottomRightRadius'), bl = get('borderBottomLeftRadius');
    return { tl, tr, br, bl, any: [tl, tr, br, bl].some(q => q[0] > 0 || q[1] > 0) };
  }
  const radiusCss = rad => `${n2(rad.tl[0])}px ${n2(rad.tr[0])}px ${n2(rad.br[0])}px ${n2(rad.bl[0])}px / ${n2(rad.tl[1])}px ${n2(rad.tr[1])}px ${n2(rad.br[1])}px ${n2(rad.bl[1])}px`;
  function roundedPath(r, rad) {
    let { tl, tr, br, bl } = rad; const x = r.x, y = r.y, w = r.w, h = r.h;
    const f = Math.min(1, w / (tl[0] + tr[0] || 1), w / (bl[0] + br[0] || 1), h / (tl[1] + bl[1] || 1), h / (tr[1] + br[1] || 1));
    const s = q => [q[0] * f, q[1] * f]; tl = s(tl); tr = s(tr); br = s(br); bl = s(bl);
    return `M${n2(x + tl[0])} ${n2(y)}H${n2(x + w - tr[0])}A${n2(tr[0])} ${n2(tr[1])} 0 0 1 ${n2(x + w)} ${n2(y + tr[1])}V${n2(y + h - br[1])}A${n2(br[0])} ${n2(br[1])} 0 0 1 ${n2(x + w - br[0])} ${n2(y + h)}H${n2(x + bl[0])}A${n2(bl[0])} ${n2(bl[1])} 0 0 1 ${n2(x)} ${n2(y + h - bl[1])}V${n2(y + tl[1])}A${n2(tl[0])} ${n2(tl[1])} 0 0 1 ${n2(x + tl[0])} ${n2(y)}Z`;
  }
  function polyWithCircles(pts, circles) {
    const N = pts.length, eps = 0.6; const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const norm = (a, b) => { const d = dist(a, b) || 1; return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; };
    let d = ''; const emit = (cmd, p) => { d += cmd + n2(p[0]) + ' ' + n2(p[1]); };
    const edgeC = pts.map(() => []); const vertC = pts.map(() => null);
    circles.forEach(c => {
      for (let i = 0; i < N; i++) if (dist(pts[i], [c.x, c.y]) < eps) { vertC[i] = c; return; }
      for (let i = 0; i < N; i++) {
        const a = pts[i], b = pts[(i + 1) % N]; const l = dist(a, b); if (!l) continue;
        const t = ((c.x - a[0]) * (b[0] - a[0]) + (c.y - a[1]) * (b[1] - a[1])) / (l * l);
        const px = a[0] + t * (b[0] - a[0]), py = a[1] + t * (b[1] - a[1]);
        if (t > 0 && t < 1 && Math.hypot(px - c.x, py - c.y) < eps) { edgeC[i].push({ c, t: t * l }); return; }
      }
    });
    let first = true;
    for (let i = 0; i < N; i++) {
      const a = pts[i], b = pts[(i + 1) % N], dir = norm(a, b); const prev = pts[(i + N - 1) % N], pdir = norm(prev, a);
      if (vertC[i]) {
        const R = vertC[i].r; const p1 = [a[0] - pdir[0] * R, a[1] - pdir[1] * R], p2 = [a[0] + dir[0] * R, a[1] + dir[1] * R];
        if (first) { emit('M', p1); first = false; } else emit('L', p1);
        d += `A${n2(R)} ${n2(R)} 0 0 0 ${n2(p2[0])} ${n2(p2[1])}`;
      } else { if (first) { emit('M', a); first = false; } else emit('L', a); }
      edgeC[i].sort((p, q) => p.t - q.t).forEach(({ c, t }) => {
        const R = c.r; emit('L', [a[0] + dir[0] * (t - R), a[1] + dir[1] * (t - R)]);
        const e = [a[0] + dir[0] * (t + R), a[1] + dir[1] * (t + R)]; d += `A${n2(R)} ${n2(R)} 0 0 0 ${n2(e[0])} ${n2(e[1])}`;
      });
    }
    return d + 'Z';
  }
  function parsePoly(str, w, h) {
    const m = str.match(/polygon\((.*)\)/); if (!m) return null;
    const val = (t, base) => { t = t.trim(); const c = t.match(/^calc\(\s*([\d.]+)%\s*([+-])\s*([\d.]+)px\s*\)$/); if (c) return parseFloat(c[1]) / 100 * base + (c[2] === '-' ? -1 : 1) * parseFloat(c[3]); if (t.endsWith('%')) return parseFloat(t) / 100 * base; return parseFloat(t); };
    return m[1].split(/,\s*(?![^()]*\))/).map(p => { const q = p.trim().match(/(calc\([^)]*\)|\S+)\s+(calc\([^)]*\)|\S+)/); return [val(q[1], w), val(q[2], h)]; });
  }
  function parseMaskCircles(mask, w, h) {
    const out = []; const re = /(\d+(?:\.\d+)?)px at ([^\s,]+) ([^\s,]+),/g; let m;
    const px = (s, b) => s.endsWith('%') ? parseFloat(s) / 100 * b : parseFloat(s);
    while ((m = re.exec(mask))) out.push({ r: parseFloat(m[1]), x: px(m[2], w), y: px(m[3], h) });
    return out;
  }
  function absRect(el) { const b = el.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height }; }
  const px = v => n2(v) + 'px';
  const abs = (l, t, w, h) => `position:absolute;left:${px(l)};top:${px(t)};` + (w != null ? `width:${px(w)};height:${px(h)};` : '');

  // ----- inline <svg> -----
  function svgStyleAttrs(o, c) {
    const cs = getComputedStyle(o); const set = (a, v) => { if (v && v !== 'normal') c.setAttribute(a, v); };
    ['fill', 'stroke'].forEach(p => { const v = cs[p]; if (v && v !== 'none') { const k = col(v); c.setAttribute(p, k.hex); if (k.a < 1) c.setAttribute(p + '-opacity', n2(k.a)); } else if (v === 'none') c.setAttribute(p, 'none'); });
    set('stroke-width', cs.strokeWidth); set('stroke-linecap', cs.strokeLinecap); set('stroke-linejoin', cs.strokeLinejoin);
    if (cs.strokeDasharray && cs.strokeDasharray !== 'none') c.setAttribute('stroke-dasharray', cs.strokeDasharray);
    if (cs.opacity !== '1') c.setAttribute('opacity', cs.opacity);
    c.removeAttribute('style'); c.removeAttribute('class');
  }
  function serializeSvg(svg, w, h, style) {
    const clone = svg.cloneNode(true);
    const origs = [svg, ...svg.querySelectorAll('*')], clones = [clone, ...clone.querySelectorAll('*')];
    origs.forEach((o, i) => { const c = clones[i]; if (!['use', 'symbol', 'defs'].includes(c.tagName)) svgStyleAttrs(o, c); });
    clone.querySelectorAll('use').forEach(u => {
      const id = (u.getAttribute('href') || '').slice(1); const sym = document.getElementById(id);
      if (sym) { const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); sym.childNodes.forEach(ch => g.appendChild(ch.cloneNode(true))); u.replaceWith(g); }
    });
    clone.setAttribute('width', n2(w)); clone.setAttribute('height', n2(h)); clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('style', style); clone.removeAttribute('aria-hidden'); clone.removeAttribute('focusable');
    clone.querySelectorAll('text').forEach((t, i) => { const o = svg.querySelectorAll('text')[i]; const cs = getComputedStyle(o); t.setAttribute('font-family', cs.fontFamily.split(',')[0].replace(/["']/g, '')); t.setAttribute('font-size', cs.fontSize); t.setAttribute('font-weight', cs.fontWeight); });
    return new XMLSerializer().serializeToString(clone);
  }

  // ----- text -----
  function textLines(node) {
    const txt = node.nodeValue; const out = []; const range = document.createRange(); let cur = null;
    for (let i = 0; i < txt.length; i++) {
      const ch = txt[i]; range.setStart(node, i); range.setEnd(node, i + 1); const rects = range.getClientRects();
      if (/\s/.test(ch)) { if (cur && rects.length) cur.pendingSpace = true; continue; }
      if (!rects.length) continue;
      const rc = rects[0]; const t = rc.top + scrollY, l = rc.left + scrollX, r = rc.right + scrollX;
      if (cur && Math.abs(cur.t - t) < 3 && l >= cur.l - 1) { cur.s += (cur.pendingSpace ? ' ' : '') + ch; cur.r = r; } else { cur = { s: ch, l, t, r, h: rc.height }; out.push(cur); }
      cur.pendingSpace = false;
    }
    return out;
  }
  function textStyle(cs) {
    const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(); const size = parseFloat(cs.fontSize);
    const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing); const c = col(cs.color);
    const sw = parseFloat(cs.webkitTextStrokeWidth) || 0; const sc = col(cs.webkitTextStrokeColor);
    const stretch = parseFloat(cs.fontStretch);
    let s = `font-family:'${fam}',sans-serif;font-size:${size}px;font-weight:${cs.fontWeight};white-space:pre;margin:0;padding:0;`;
    if (ls) s += `letter-spacing:${n2(ls)}px;`;
    if (stretch && stretch < 100) s += `font-stretch:${stretch}%;`;
    if (c.a === 0 && sw > 0) s += `color:transparent;-webkit-text-stroke:${sw}px ${sc.css};`; else s += `color:${c.css};`;
    return s;
  }
  function emitText(node, cs, org) {
    const parts = []; const up = cs.textTransform === 'uppercase'; const vertical = cs.writingMode.startsWith('vertical');
    const base = textStyle(cs);
    if (vertical) {
      const range = document.createRange(); const chars = [...node.nodeValue]; let idx = 0; let run = null;
      const flush = () => { if (!run) return; parts.push(`<div data-name="${esc(nm('t ' + run.s))}" style="${abs(run.l + run.w - org.x, run.t - org.y)}${base}line-height:${px(run.w)};transform:rotate(90deg);transform-origin:0 0;">${esc(run.s)}</div>`); run = null; };
      chars.forEach(ch => {
        range.setStart(node, idx); range.setEnd(node, idx + ch.length); const rc = range.getClientRects()[0]; idx += ch.length;
        if (!rc || /\s/.test(ch)) { if (/\s/.test(ch) && run) run.s += ' '; return; }
        const R = { l: rc.left + scrollX, t: rc.top + scrollY, w: rc.width, h: rc.height };
        if (/[　-鿿]/.test(ch)) { flush(); parts.push(`<div data-name="${esc(nm('t ' + ch))}" style="${abs(R.l - org.x, R.t - org.y)}${base}line-height:${px(R.h)};">${esc(ch)}</div>`); }
        else { if (!run) run = { s: '', l: R.l, t: R.t, w: R.w }; run.s += ch; }
      });
      flush(); return parts.join('');
    }
    textLines(node).forEach(L => { const s = up ? L.s.toUpperCase() : L.s; parts.push(`<div data-name="${esc(nm('t ' + s))}" style="${abs(L.l - org.x, L.t - org.y)}${base}line-height:${px(L.h)};">${esc(s)}</div>`); });
    return parts.join('');
  }

  // ----- lines / pseudo boxes (all relative to org) -----
  function lineEl(name, x1, y1, x2, y2, bw, bc, bs) {
    const w = Math.max(Math.abs(x2 - x1), bw), h = Math.max(Math.abs(y2 - y1), bw);
    if (bs === 'solid') return `<div data-name="${esc(nm(name))}" style="${abs(Math.min(x1, x2) - (x1 === x2 ? bw / 2 : 0), Math.min(y1, y2) - (y1 === y2 ? bw / 2 : 0), w, h)}background:${bc.css};"></div>`;
    const dash = bs === 'dotted' ? `stroke-dasharray="0 ${bw * 2}" stroke-linecap="round"` : `stroke-dasharray="${bw * 3} ${bw * 2}"`;
    const L = Math.min(x1, x2) - bw, T = Math.min(y1, y2) - bw;
    return `<svg data-name="${esc(nm(name))}" xmlns="http://www.w3.org/2000/svg" style="${abs(L, T, w + bw * 2, h + bw * 2)}overflow:visible" width="${n2(w + bw * 2)}" height="${n2(h + bw * 2)}"><line x1="${n2(x1 - L)}" y1="${n2(y1 - T)}" x2="${n2(x2 - L)}" y2="${n2(y2 - T)}" stroke="${bc.hex}" stroke-width="${bw}"${bc.a < 1 ? ` stroke-opacity="${n2(bc.a)}"` : ''} ${dash} fill="none"/></svg>`;
  }
  function sideLines(cs, x, y, w, h, prefix) {
    let out = '';
    ['Top', 'Right', 'Bottom', 'Left'].forEach(sd => {
      const bw = parseFloat(cs['border' + sd + 'Width']); const bs = cs['border' + sd + 'Style']; if (!bw || bs === 'none') return;
      const bc = col(cs['border' + sd + 'Color']); let x1, y1, x2, y2;
      if (sd === 'Top') { y1 = y2 = y + bw / 2; x1 = x; x2 = x + w; } else if (sd === 'Bottom') { y1 = y2 = y + h - bw / 2; x1 = x; x2 = x + w; } else if (sd === 'Left') { x1 = x2 = x + bw / 2; y1 = y; y2 = y + h; } else { x1 = x2 = x + w - bw / 2; y1 = y; y2 = y + h; }
      out += lineEl(prefix + '-' + sd.toLowerCase(), x1, y1, x2, y2, bw, bc, bs === 'solid' ? 'solid' : bs);
    });
    return out;
  }
  function pseudoBox(el, which, rw, rh) {
    const ps = getComputedStyle(el, which); if (ps.content === 'none' || ps.content === 'normal' || ps.position !== 'absolute') return '';
    const L = parseFloat(ps.left), T = parseFloat(ps.top), Wd = parseFloat(ps.width), Ht = parseFloat(ps.height), Rt = parseFloat(ps.right), Bt = parseFloat(ps.bottom);
    let x, y, w, h;
    if (!isNaN(Wd) && !isNaN(L)) { x = L; w = Wd; } else if (!isNaN(L) && !isNaN(Rt)) { x = L; w = rw - L - Rt; } else return '';
    if (!isNaN(Ht) && !isNaN(T) && ps.height !== 'auto') { y = T; h = Ht; } else if (!isNaN(T) && !isNaN(Bt)) { y = T; h = rh - T - Bt; } else return '';
    let out = ''; const bg = col(ps.backgroundColor);
    if (bg.a > 0) out += `<div data-name="${esc(nm(which.replace('::', '')))}" style="${abs(x, y, w, h)}background:${bg.css};"></div>`;
    return out + sideLines(ps, x, y, w, h, which.replace('::', ''));
  }
  function pseudoText(el, org) {
    const ps = getComputedStyle(el, '::after'); const ct = ps.content; if (!ct || ct === 'none' || ct === 'normal' || ps.position === 'absolute') return '';
    const s0 = ct.replace(/^["']|["']$/g, ''); if (!s0.trim()) return '';
    let last = null; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let t; while ((t = tw.nextNode())) if (t.nodeValue.trim()) last = t;
    if (!last) return '';
    const range = document.createRange(); range.setStart(last, last.nodeValue.length - 1); range.setEnd(last, last.nodeValue.length);
    const rc = range.getClientRects()[0]; if (!rc) return '';
    const c = col(ps.color); const op = parseFloat(ps.opacity);
    const fam = ps.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    return `<div data-name="separator" style="${abs(rc.right + scrollX - org.x, rc.top + scrollY - org.y)}font-family:'${fam}',sans-serif;font-size:${ps.fontSize};font-weight:${ps.fontWeight};letter-spacing:${ps.letterSpacing === 'normal' ? 0 : ps.letterSpacing};white-space:pre;line-height:${px(rc.height)};color:${c.css};${op < 1 ? `opacity:${op};` : ''}">${esc(s0)}</div>`;
  }

  // ----- main -----
  function walk(el, org, parentShape) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return '';
    const tag = el.tagName.toLowerCase();
    if (['script', 'style', 'link', 'title', 'noscript'].includes(tag)) return '';
    if (el.id === 'scrim' || el.id === 'sheet') return '';
    const r = absRect(el); const rad = boxRadius(cs, r);
    if (tag === 'svg') {
      if (el.closest('svg') !== el || r.w === 0 || r.h === 0) return '';
      const l = r.x - org.x, t = r.y - org.y; let out = '';
      const b = cs.boxShadow;
      if (b && b !== 'none') b.split(/,\s*(?![^()]*\))/).forEach(sh => {
        const m = sh.match(/(rgba?\([^)]*\)|color\([^)]*\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px(?:\s+(-?[\d.]+)px)?/); if (!m || /inset/.test(sh)) return;
        const c = col(m[1]); const sp = +(m[5] || 0); if (c.a === 0 || +m[4] > 0) return;
        const rr = { x: 0, y: 0, w: r.w + 2 * sp, h: r.h + 2 * sp }; const big = { tl: rad.tl.map(v => v + sp), tr: rad.tr.map(v => v + sp), br: rad.br.map(v => v + sp), bl: rad.bl.map(v => v + sp) };
        out += `<svg data-name="${esc(nm('ring'))}" xmlns="http://www.w3.org/2000/svg" style="${abs(l - sp + +m[2], t - sp + +m[3], rr.w, rr.h)}" width="${n2(rr.w)}" height="${n2(rr.h)}"><path d="${roundedPath(rr, big)}" ${fillAttr(c)}/></svg>`;
      });
      if (parentShape) { // clip scene to the parent's cut/notch outline
        const id = 'c' + (++uid);
        const inner = serializeSvg(el, r.w, r.h, '').replace('<svg ', `<svg x="${n2(l)}" y="${n2(t)}" `);
        return out + `<svg data-name="${esc(nm('scene'))}" xmlns="http://www.w3.org/2000/svg" style="${abs(0, 0, parentShape.w, parentShape.h)}" width="${n2(parentShape.w)}" height="${n2(parentShape.h)}"><defs><clipPath id="${id}"><path d="${parentShape.d}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g></svg>`.replace(abs(0, 0, parentShape.w, parentShape.h), abs(parentShape.ox, parentShape.oy, parentShape.w, parentShape.h));
      }
      const base = `${abs(l, t)}display:block;`;
      if (rad.any) return out + `<div data-name="${esc(nm('svg-mask'))}" style="${abs(l, t, r.w, r.h)}border-radius:${radiusCss(rad)};overflow:hidden;">${serializeSvg(el, r.w, r.h, 'display:block')}</div>`;
      return out + serializeSvg(el, r.w, r.h, base).replace(/<svg /, `<svg data-name="${esc(nm('illustration'))}" `);
    }
    const rr = { x: 0, y: 0, w: r.w, h: r.h };
    const cp = cs.clipPath; const mk = cs.maskImage && cs.maskImage !== 'none' ? cs.maskImage : (cs.webkitMaskImage && cs.webkitMaskImage !== 'none' ? cs.webkitMaskImage : 'none');
    let shapeD = null;
    if (cp && cp.startsWith('polygon')) shapeD = polyWithCircles(parsePoly(cp, r.w, r.h), mk !== 'none' ? parseMaskCircles(mk, r.w, r.h) : []);
    else if (mk !== 'none') { const circ = parseMaskCircles(mk, r.w, r.h); if (circ.length) shapeD = polyWithCircles([[0, 0], [r.w, 0], [r.w, r.h], [0, r.h]], circ); }
    const isRoot = el.classList.contains('screen');
    const ovf = (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') && !isRoot;
    const bg = col(cs.backgroundColor);
    const me = { x: r.x, y: r.y };
    const myShape = shapeD ? { d: shapeD, w: r.w, h: r.h, ox: 0, oy: 0 } : null;
    let inner = '';
    if (bg.a > 0 && r.w > 0 && r.h > 0 && shapeD) inner += `<svg data-name="shape" xmlns="http://www.w3.org/2000/svg" style="${abs(0, 0, r.w, r.h)}" width="${n2(r.w)}" height="${n2(r.h)}"><path d="${shapeD}" ${fillAttr(bg)}/></svg>`;
    // box-shadow (non-svg): inset left bars only
    const bsh = cs.boxShadow; if (bsh && bsh !== 'none') bsh.split(/,\s*(?![^()]*\))/).forEach(sh => {
      const m = sh.match(/(rgba?\([^)]*\)|color\([^)]*\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px/); if (!m || !/inset/.test(sh)) return;
      const c = col(m[1]); if (c.a > 0 && +m[2] > 0 && +m[3] === 0) inner += `<div data-name="divider" style="${abs(0, 0, +m[2], r.h)}background:${c.css};"></div>`;
    });
    inner += sideLines(cs, 0, 0, r.w, r.h, 'border');
    inner += pseudoBox(el, '::before', r.w, r.h);
    el.childNodes.forEach(ch => {
      if (ch.nodeType === 3) { if (ch.nodeValue.trim()) inner += emitText(ch, cs, me); }
      else if (ch.nodeType === 1) inner += walk(ch, me, shapeD ? myShape : null);
    });
    inner += pseudoBox(el, '::after', r.w, r.h) + pseudoText(el, me);
    if (tag === 'input' && el.placeholder) { const size = parseFloat(cs.fontSize); inner += `<div data-name="placeholder" style="${abs(parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), 0, r.w, r.h)}font-family:'${cs.fontFamily.split(',')[0].replace(/["']/g, '')}',sans-serif;font-size:${size}px;line-height:${px(r.h)};color:${col(cs.color).css};opacity:.55;">${esc(el.placeholder)}</div>`; }
    const cls = typeof el.className === 'string' ? el.className.trim() : '';
    const needG = el.id || cls || bg.a > 0 || shapeD || ovf;
    if (!needG) { // flatten: children were positioned relative to `me`, re-position into parent origin
      return inner ? `<div data-name="${esc(nm(tag))}" style="${abs(r.x - org.x, r.y - org.y, r.w, r.h)}">${inner}</div>` : '';
    }
    if (!inner && !(bg.a > 0)) return '';
    const label = el.id || (cls ? cls.split(/\s+/).filter(c => !['cut', 'nt', 'lg', 'mono', 'disp', 'ed', 'han'].includes(c)).join(' ') || cls.split(/\s+/)[0] : tag);
    let st = abs(r.x - org.x, r.y - org.y, r.w, r.h);
    if (bg.a > 0 && !shapeD) st += `background:${bg.css};`;
    if (rad.any && !shapeD) st += `border-radius:${radiusCss(rad)};`;
    if (ovf && !shapeD) st += 'overflow:hidden;';
    const op = parseFloat(cs.opacity); if (op < 1) st += `opacity:${op};`;
    return `<div data-name="${esc(nm(label))}" style="${st}">${inner}</div>`;
  }

  const root = document.querySelector('.screen'); const dock = document.querySelector('.dockwrap');
  const H = Math.ceil(document.documentElement.scrollHeight); const pageBg = col(getComputedStyle(document.body).backgroundColor);
  const org = { x: 0, y: 0 };
  const body = walk(root, org, null) + walk(dock, org, null);
  return { H, bg: pageBg.css, body };
}

(async () => {
  let html = fs.readFileSync(SRC, 'utf8');
  const css = fs.readFileSync(SCR + '/fonts/all.css', 'utf8');
  const local = html.replace(/<link[^>]*fonts\.googleapis[^>]*>/, '<style>' + css + '</style>').replace('</style>\n\n<svg width="0"', '.dockwrap{position:absolute!important;bottom:0!important}body{position:relative}</style>\n\n<svg width="0"');
  fs.writeFileSync(SCR + '/local.html', local);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('file://' + SCR + '/local.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  const res = await p.evaluate(`(${walker.toString()})()`);
  const head = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=390">
<title>Dangdi Home — Figma import</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600;700&family=Noto+Serif+SC:wght@500;700;900&display=swap" rel="stylesheet">
<style>html,body{margin:0;padding:0;background:#17130F}*{box-sizing:border-box}svg{overflow:visible}</style></head>
<body><div data-name="Dangdi Home" id="Dangdi-Home" style="position:relative;width:390px;height:${res.H}px;background:${res.bg};overflow:hidden;">
<div data-name="Page background" style="position:absolute;left:0;top:0;width:390px;height:${res.H}px;background:${res.bg};"></div>
${res.body}
</div></body></html>
`;
  fs.writeFileSync(SCR + '/out-figma.html', head);
  console.log('bytes', head.length);
  await b.close();
})();
