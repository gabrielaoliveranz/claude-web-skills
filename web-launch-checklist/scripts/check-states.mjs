// Contrast of every link and button in each state people actually see: at rest, hover, keyboard focus and pressed.
// Accessibility scanners (axe, Lighthouse) only measure the resting state, so a global a:hover rule that turns a
// button's label the same colour as its background passes them. Also flags elements with no visible focus change.
// Usage: node check-states.mjs --base http://localhost:8000 --pages index.html,pricing.html [--schemes light,dark]
//        [--width 1280] [--max 60] [--wait 80] [--param lang --langs en,es]
import { createRequire } from 'node:module';
import { join } from 'node:path';

function loadPlaywright() {
  for (const from of [join(process.cwd(), 'noop.js'), import.meta.url]) { try { return createRequire(from)('playwright'); } catch {} }
  console.error('Playwright not found. In the folder you run this from:\n  npm install -D playwright\n  npx playwright install chromium');
  process.exit(2);
}
const { chromium } = loadPlaywright();

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
// A mistyped option (--scheme for --schemes) would otherwise be ignored and the check would quietly test less.
const OPTIONS = ["base","pages","schemes","width","max","wait","param","langs"];
for (const a of process.argv.slice(2)) if (a.startsWith("--") && !OPTIONS.includes(a.slice(2))) { console.error(`Unknown option ${a}. Options: ${OPTIONS.map(o => "--" + o).join(", ")}`); process.exit(2); }
const list = (k, d) => (arg(k, d) || '').split(',').map(s => s.trim()).filter(Boolean);
const base = arg('base', 'http://localhost:8000').replace(/\/$/, '');
const pages = list('pages', 'index.html'), schemes = list('schemes', 'light'), langs = list('langs', '');
const width = +arg('width', 1280), max = +arg('max', 60), param = arg('param', 'lang');
// A short wait on purpose: a slow colour transition is caught half-way, and that frame is real for the visitor too.
const wait = +arg('wait', 80);

// Runs in the page: contrast of the element's text against what is really behind it.
const measure = el => {
  const cv = (window.__csCanvas ||= Object.assign(document.createElement('canvas'), { width: 1, height: 1 }));
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = str => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = str; ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (top, under) => [0, 1, 2].map(i => top[i] * top[3] + under[i] * (1 - top[3])).concat(1);
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  // Measure the element that actually holds the text (a span inside a button may have its own colour).
  let holder = el;
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => n.nodeValue.trim() ? 1 : 3 });
  const tn = tw.nextNode(); if (tn && tn.parentElement) holder = tn.parentElement;
  const cs = getComputedStyle(holder);
  // What is really painted behind the text at its centre: ancestors, but also siblings such as a sliding
  // "active" pill drawn under a tab. Falls back to the ancestor chain if the point isn't hit-testable.
  let stack = [];
  if (tn) {
    const r = document.createRange(); r.selectNodeContents(tn); const b = r.getBoundingClientRect();
    const all = document.elementsFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    const at = all.findIndex(n => n === holder || n.contains(holder));
    if (at >= 0) stack = all.slice(at);
  }
  if (!stack.length) for (let n = holder; n; n = n.parentElement) stack.push(n);
  const layers = [];
  for (const n of stack) {
    const s = getComputedStyle(n), c = rgba(s.backgroundColor);
    if (s.backgroundImage !== 'none' && c[3] < 1) return { unknown: 'text over an image or gradient' };
    if (c[3] > 0) layers.push(c);
    if (c[3] >= 1) break;
  }
  let bg = rgba(getComputedStyle(document.documentElement).colorScheme.includes('dark') && !layers.some(l => l[3] >= 1) ? '#121212' : '#fff');
  for (const l of layers.reverse()) bg = over(l, bg);
  const fg = over(rgba(cs.color), bg);
  const a = lum(fg), b = lum(bg), ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const size = parseFloat(cs.fontSize), large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
  const es = getComputedStyle(el);
  return { ratio, min: large ? 3 : 4.5, look: [es.outlineStyle, es.outlineWidth, es.outlineColor, es.boxShadow, es.textDecorationLine, es.backgroundColor, es.color, es.borderColor, es.transform].join('|') };
};

const browser = await chromium.launch();
let fails = 0, warns = 0, skipped = 0, measured = 0;
for (const page of pages) for (const lang of (langs.length ? langs : [''])) for (const scheme of schemes) {
  const p = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: 'reduce' });
  const url = base + '/' + page + (lang ? (page.includes('?') ? '&' : '?') + param + '=' + lang : '');
  const label = `${page}${lang ? ' ' + lang : ''}${scheme !== 'light' ? ' ' + scheme : ''}`;
  try { await p.goto(url, { waitUntil: 'networkidle', timeout: 30000 }); } catch (e) { console.log(`FAIL  ${label}: did not load (${e.message.split('\n')[0]})`); fails++; await p.close(); continue; }
  // Pressing a real link navigates away; swallow clicks during the check (hover, focus and :active still happen).
  await p.evaluate(() => addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); }, true));
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } scrollTo(0, 0); });
  // One element per distinct look: twenty identical nav links need one measurement, not twenty.
  const ids = await p.evaluate(max => {
    const seen = new Set(), ids = [];
    for (const el of document.querySelectorAll('a[href], button, [role="button"], input[type="submit"], input[type="button"], summary')) {
      const r = el.getBoundingClientRect(), s = getComputedStyle(el);
      if (!r.width || !r.height || s.visibility === 'hidden' || el.closest('[aria-hidden="true"], [inert]') || !el.innerText.trim()) continue;
      const key = [el.tagName, el.className, s.color, s.backgroundColor, s.fontSize, el.parentElement?.className].join('|');
      if (seen.has(key)) continue; seen.add(key);
      el.setAttribute('data-cs', ids.length); ids.push(el.innerText.trim().replace(/\s+/g, ' ').slice(0, 40));
      if (ids.length >= max) break;
    }
    return ids;
  }, max);
  await p.keyboard.press('Tab'); // the browser shows :focus-visible after keyboard use

  for (let i = 0; i < ids.length; i++) {
    const sel = `[data-cs="${i}"]`, el = await p.$(sel);
    if (!el) continue;
    const states = {};
    // Let the previous state's transition finish, so one state's leftovers never count against the next.
    const settle = () => el.evaluate(e => Promise.race([Promise.all(e.getAnimations({ subtree: true }).map(a => a.finished.catch(() => {}))), new Promise(r => setTimeout(r, 2000))]));
    try {
      await el.evaluate(e => { document.activeElement?.blur(); e.scrollIntoView({ block: 'center' }); });
      await p.mouse.move(1, 1); await settle();
      states.rest = await el.evaluate(measure);
      const box = await el.boundingBox();
      if (box) {
        await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.waitForTimeout(wait);
        states.hover = await el.evaluate(measure);
        await p.mouse.down(); await p.waitForTimeout(wait);
        states.pressed = await el.evaluate(measure);
        await p.mouse.up(); await p.mouse.move(1, 1);
        await p.keyboard.press('Escape');
      }
      await el.evaluate(e => e.blur()); await settle();
      await p.keyboard.press('Tab'); await el.evaluate(e => e.focus()); await p.waitForTimeout(wait);
      states.focus = await el.evaluate(measure);
      await el.evaluate(e => e.blur());
    } catch (e) { console.log(`WARN  ${label} "${ids[i]}": could not test (${e.message.split('\n')[0]})`); warns++; continue; }
    for (const [state, m] of Object.entries(states)) {
      if (m.unknown) { skipped++; continue; }
      measured++;
      if (m.ratio < m.min) { fails++; console.log(`FAIL  ${label} "${ids[i]}" ${state}: ${m.ratio.toFixed(2)}:1 (needs ${m.min}:1)`); }
    }
    if (states.focus && states.rest && !states.focus.unknown && states.focus.look === states.rest.look) {
      warns++; console.log(`WARN  ${label} "${ids[i]}": no visible change on keyboard focus (add a :focus-visible outline)`);
    }
  }
  await p.close();
}
await browser.close();
console.log(`\n${fails} fail, ${warns} warn. ${measured} state(s) measured${skipped ? `, ${skipped} skipped (text over an image or gradient: check those by eye)` : ''}.`);
process.exitCode = fails ? 1 : 0;
