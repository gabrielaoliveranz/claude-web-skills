// Inspect pages at several widths, languages and colour schemes: overflow, clipped elements, wrapped header,
// console errors, failed requests (including CSP blocks). Saves screenshots.
// Usage: node check-pages.mjs --base http://localhost:8000 --pages index.html,about.html --langs en,es --out shots
//        [--schemes light,dark] [--reduced-motion] [--header .nav] [--param lang] [--widths 320,390,820,1440]
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

// Find Playwright in the folder you run this from (your project) first, then next to this script.
// A plain `import 'playwright'` only looks next to the script, which fails when the script lives in ~/.claude/skills.
function loadPlaywright() {
  for (const from of [join(process.cwd(), 'noop.js'), import.meta.url]) {
    try { return createRequire(from)('playwright'); } catch {}
  }
  console.error('Playwright not found. In the folder you run this from:\n  npm install -D playwright\n  npx playwright install chromium');
  process.exit(2);
}
const { chromium } = loadPlaywright();

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
// A mistyped option (--scheme for --schemes) would otherwise be ignored and the check would quietly test less.
const OPTIONS = ["base","pages","langs","schemes","reduced-motion","out","header","param","widths"];
for (const a of process.argv.slice(2)) if (a.startsWith("--") && !OPTIONS.includes(a.slice(2))) { console.error(`Unknown option ${a}. Options: ${OPTIONS.map(o => "--" + o).join(", ")}`); process.exit(2); }
const list = (k, d) => (arg(k, d) || '').split(',').map(s => s.trim()).filter(Boolean);
const base = arg('base', 'http://localhost:8000').replace(/\/$/, '');
const pages = list('pages', 'index.html');
const langs = list('langs', '');
const schemes = list('schemes', 'light');
const reducedMotion = process.argv.includes('--reduced-motion') ? 'reduce' : 'no-preference';
const out = arg('out', 'shots'), header = arg('header', 'header, .nav'), param = arg('param', 'lang');
const widths = list('widths', '320,390,820,1440').map(Number);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const reported = new Set(); // console and network messages repeat at every width: report each once
let problems = 0;
for (const page of pages) for (const lang of (langs.length ? langs : [''])) for (const scheme of schemes) for (const w of widths) {
  const p = await browser.newPage({ viewport: { width: w, height: w < 900 ? 844 : 900 }, colorScheme: scheme, reducedMotion });
  const url = base + '/' + page + (lang ? (page.includes('?') ? '&' : '?') + param + '=' + lang : '');
  const issues = [], once = msg => { if (!reported.has(msg)) { reported.add(msg); issues.push(msg); } };
  p.on('pageerror', e => once(`script error: ${e.message.split('\n')[0]}`));
  p.on('console', m => { if (m.type() === 'error') once(`console error: ${m.text().slice(0, 200)}`); });
  p.on('requestfailed', r => { if (!/ERR_ABORTED/.test(r.failure()?.errorText || '')) once(`request failed: ${r.url().slice(0, 120)} (${r.failure()?.errorText})`); });
  p.on('response', r => { if (r.status() >= 400) once(`HTTP ${r.status()}: ${r.url().slice(0, 120)}`); });

  try { await p.goto(url, { waitUntil: 'networkidle', timeout: 30000 }); }
  catch (e) { issues.push(`page did not finish loading: ${e.message.split('\n')[0]}`); }
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); }).catch(() => {});
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
  }, { header }).catch(e => [`could not inspect the page: ${e.message.split('\n')[0]}`]);
  issues.push(...r);
  const name = `${page.replace(/[^a-z0-9]+/gi, '-')}${lang ? '-' + lang : ''}${scheme !== 'light' ? '-' + scheme : ''}-${w}`;
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: true }).catch(() => {});
  if (issues.length) { problems += issues.length; console.log(`\n${name}`); issues.forEach(x => console.log('  - ' + x)); }
  await p.close();
}
await browser.close();
console.log(problems ? `\n${problems} problem(s). Screenshots in ${out}/` : `\nNo problems found. Look at the screenshots in ${out}/ anyway.`);
process.exitCode = problems ? 1 : 0;
