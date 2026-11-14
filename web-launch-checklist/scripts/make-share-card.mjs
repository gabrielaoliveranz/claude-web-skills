// Render the link-preview image (og:image) from an HTML template, so it's rebuilt from the site's real fonts,
// colours and figures instead of hand-edited. A hand-edited card kept an old accent colour for months.
// Usage: node make-share-card.mjs --template share-card.html --out assets/images/og-card.png [--width 1200 --height 630]
// Start from ../assets/share-card.html: link your own stylesheet so the card uses the site's tokens.
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

function loadPlaywright() {
  for (const from of [join(process.cwd(), 'noop.js'), import.meta.url]) { try { return createRequire(from)('playwright'); } catch {} }
  console.error('Playwright not found. In the folder you run this from:\n  npm install -D playwright\n  npx playwright install chromium');
  process.exit(2);
}
const { chromium } = loadPlaywright();
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
// A mistyped option (--scheme for --schemes) would otherwise be ignored and the check would quietly test less.
const OPTIONS = ["template","out","width","height"];
for (const a of process.argv.slice(2)) if (a.startsWith("--") && !OPTIONS.includes(a.slice(2))) { console.error(`Unknown option ${a}. Options: ${OPTIONS.map(o => "--" + o).join(", ")}`); process.exit(2); }
const template = resolve(arg('template', 'share-card.html')), out = resolve(arg('out', 'og-card.png'));
const width = +arg('width', 1200), height = +arg('height', 630);
if (!existsSync(template)) { console.error(`No template at ${template}`); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
const failed = [];
page.on('requestfailed', r => failed.push(r.url()));
page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
await page.goto(pathToFileURL(template).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready); // never capture with a fallback font
const overflow = await page.evaluate(([w, h]) => document.documentElement.scrollWidth > w || document.documentElement.scrollHeight > h, [width, height]);
await page.screenshot({ path: out, clip: { x: 0, y: 0, width, height } });
await browser.close();

console.log(`Saved ${out} (${width}x${height}).`);
if (failed.length) console.log(`Warning: these didn't load, so the card may use fallback fonts or miss images:\n  ${failed.join('\n  ')}`);
if (overflow) console.log('Warning: the template is bigger than the card; something is cut off at the edge.');
console.log(`Declare it in each page's <head>:\n  <meta property="og:image" content="https://YOUR-DOMAIN/...">\n  <meta property="og:image:width" content="${width}">\n  <meta property="og:image:height" content="${height}">`);
process.exitCode = failed.length || overflow ? 1 : 0;
