// Inspect pages at several widths and languages: overflow, clipped elements, wrapped header. Saves screenshots.
// Usage: node check-pages.mjs --base http://localhost:8000 --pages index.html,about.html --langs en,es --out shots [--header .nav] [--param lang]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const base = arg('base', 'http://localhost:8000').replace(/\/$/, '');
const pages = arg('pages', 'index.html').split(',');
const langs = (arg('langs', '') || '').split(',').filter(Boolean);
const out = arg('out', 'shots'), header = arg('header', 'header, .nav'), param = arg('param', 'lang');
const widths = (arg('widths', '320,390,820,1440')).split(',').map(Number);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
let problems = 0;
for (const page of pages) for (const lang of (langs.length ? langs : [''])) for (const w of widths) {
  const p = await browser.newPage({ viewport: { width: w, height: w < 900 ? 844 : 900 } });
  const url = base + '/' + page + (lang ? (page.includes('?') ? '&' : '?') + param + '=' + lang : '');
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
  await p.waitForTimeout(400);
  const r = await p.evaluate(({ header }) => {
    const vw = document.documentElement.clientWidth, issues = [];
    if (document.documentElement.scrollWidth > vw + 1) issues.push(`horizontal overflow: page is ${document.documentElement.scrollWidth}px wide`);
    const seen = new Set();
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      if (!el.textContent.trim() || el.children.length > 3) continue;
      const b = el.getBoundingClientRect(); if (!b.width || !b.height) continue;
      const crosses = (l, r) => (b.left < l - 1 && b.right > l + 1) || (b.right > r + 1 && b.left < r - 1);
      if (b.right <= 0 || b.left >= vw) continue; // fully off screen on purpose (e.g. carousel slides)
      // Skip content inside tracks built to overflow (carousels, marquees, sliders): their peeking items are on purpose.
      let track = false;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const s = getComputedStyle(a);
        if ((s.overflowX !== 'visible' || s.scrollSnapType !== 'none') && a.scrollWidth > a.clientWidth + 20) { track = true; break; }
      }
      if (track) continue;
      let clipped = crosses(0, vw);
      for (let a = el.parentElement; a && !clipped && a !== document.body; a = a.parentElement) {
        const s = getComputedStyle(a); if (s.overflowX === 'visible') continue;
        const ab = a.getBoundingClientRect(); if (crosses(ab.left, ab.right)) clipped = true;
      }
      const t = el.textContent.trim().slice(0, 40);
      if (clipped && !seen.has(t)) { seen.add(t); issues.push(`cut off at the edge: "${t}"`); }
    }
    const h = document.querySelector(header);
    if (h) { const kids = [...h.querySelectorAll('a, button, img, svg')].filter(k => k.getBoundingClientRect().height); const tops = new Set(kids.map(k => Math.round(k.getBoundingClientRect().top / 8))); if (tops.size > 2) issues.push('header wraps to more than one line'); }
    return issues.slice(0, 12);
  }, { header });
  const name = `${page.replace(/[^a-z0-9]+/gi, '-')}${lang ? '-' + lang : ''}-${w}`;
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  if (r.length) { problems += r.length; console.log(`\n${name}`); r.forEach(x => console.log('  - ' + x)); }
  await p.close();
}
await browser.close();
console.log(problems ? `\n${problems} problem(s). Screenshots in ${out}/` : `\nNo problems found. Look at the screenshots in ${out}/ anyway.`);
process.exitCode = problems ? 1 : 0;
