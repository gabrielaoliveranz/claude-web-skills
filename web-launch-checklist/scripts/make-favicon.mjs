// Build a root favicon.ico from the site's SVG icon. Search engines and some browsers ask for /favicon.ico
// directly, whatever <link rel="icon"> says; without it they get a 404 and show a blank icon.
// Usage: node make-favicon.mjs --svg assets/img/favicon.svg --out favicon.ico [--sizes 16,32,48]
// The .ico holds one PNG per size (supported by every current browser and by Google).
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';

function loadPlaywright() {
  for (const from of [join(process.cwd(), 'noop.js'), import.meta.url]) { try { return createRequire(from)('playwright'); } catch {} }
  console.error('Playwright not found. In the folder you run this from:\n  npm install -D playwright\n  npx playwright install chromium');
  process.exit(2);
}
const { chromium } = loadPlaywright();
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
// A mistyped option (--scheme for --schemes) would otherwise be ignored and the check would quietly test less.
const OPTIONS = ["svg","out","sizes"];
for (const a of process.argv.slice(2)) if (a.startsWith("--") && !OPTIONS.includes(a.slice(2))) { console.error(`Unknown option ${a}. Options: ${OPTIONS.map(o => "--" + o).join(", ")}`); process.exit(2); }
const svgPath = resolve(arg('svg', 'favicon.svg')), out = resolve(arg('out', 'favicon.ico'));
const sizes = arg('sizes', '16,32,48').split(',').map(Number).filter(n => n > 0 && n <= 256);
if (!existsSync(svgPath)) { console.error(`No SVG at ${svgPath}`); process.exit(1); }
const svg = readFileSync(svgPath, 'utf8');
if (!/viewBox=/i.test(svg)) console.log('Warning: the SVG has no viewBox, so it may not scale cleanly to small sizes.');

const browser = await chromium.launch(), pngs = [];
for (const s of sizes) {
  const page = await browser.newPage({ viewport: { width: s, height: s } });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace(/<svg\b/i, `<svg width="${s}" height="${s}"`)}</body></html>`);
  pngs.push(await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: s, height: s } }));
  await page.close();
}
await browser.close();

// ICO = 6-byte header, a 16-byte entry per image, then the images (PNG-compressed).
const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16); e[0] = s % 256; e[1] = s % 256; e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(offset, 12); offset += pngs[i].length; return e;
});
writeFileSync(out, Buffer.concat([head, ...entries, ...pngs]));
console.log(`Saved ${out} (${sizes.join(', ')} px, ${statSync(out).size} bytes). It must sit at the site root: /favicon.ico`);
