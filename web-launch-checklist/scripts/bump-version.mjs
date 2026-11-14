// Raise a version everywhere it lives, so phones and installed apps stop using stale files.
// PWA:          node bump-version.mjs --dir public 1.4.0   (or 4.13)
//               updates version.json, APP_VERSION in index.html and the cache number in sw.js
// Static site:  node bump-version.mjs --dir . --assets 20261114a
//               updates every "?v=" on .css and .js links in every .html file under --dir
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const arg = k => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : undefined; };
// A mistyped option (--scheme for --schemes) would otherwise be ignored and the check would quietly test less.
const OPTIONS = ["dir","assets"];
for (const a of process.argv.slice(2)) if (a.startsWith("--") && !OPTIONS.includes(a.slice(2))) { console.error(`Unknown option ${a}. Options: ${OPTIONS.map(o => "--" + o).join(", ")}`); process.exit(2); }
const dir = arg('dir') || 'public';
const touched = [];
const edit = (file, fn) => { const p = join(dir, file); if (!existsSync(p)) return; const s = readFileSync(p, 'utf8'), n = fn(s); if (n !== s) { writeFileSync(p, n); touched.push(file); } };

const assets = arg('assets');
if (assets) {
  if (!/^[\w.-]+$/.test(assets)) { console.error('Give a plain version like 20261114a or 12'); process.exit(1); }
  const html = [];
  (function walk(d) { for (const n of readdirSync(join(dir, d))) { if (n.startsWith('.') || n === 'node_modules') continue; const rel = d ? d + '/' + n : n; statSync(join(dir, rel)).isDirectory() ? walk(rel) : /\.html?$/i.test(n) && html.push(rel); } })('');
  let links = 0;
  // Only the site's own files: a CDN's "?v=" is part of someone else's URL.
  for (const f of html) edit(f, s => s.replace(/\b(href|src)=(["'])([^"']+)\2/g, (m, k, q, url) => {
    if (/^[a-z][a-z0-9+.-]*:|^\/\//i.test(url)) return m;
    const n = url.replace(/(\.(?:css|js|mjs)\?(?:[^"'#&]*&)*v=)[^&#]*/, (x, a) => a + assets);
    if (n !== url) links++;
    return `${k}=${q}${n}${q}`;
  }));
  console.log(touched.length ? `Set ?v=${assets} on ${links} link(s) in: ${touched.join(', ')}` : 'No "?v=" links found. Add ?v=1 to your <link rel="stylesheet"> and <script src> tags first.');
  // Local stylesheets or scripts linked with no query at all never get a fresh copy.
  const bare = /<(?:link[^>]*\bhref|script[^>]*\bsrc)=["'](?![a-z][a-z0-9+.-]*:|\/\/)[^"'?#]+\.(?:css|m?js)["']/i;
  const without = html.filter(f => bare.test(readFileSync(join(dir, f), 'utf8')));
  if (without.length) console.log(`Warning: these pages load CSS or JS without ?v= and will keep stale copies: ${without.join(', ')}`);
  process.exit(0);
}

const version = process.argv.slice(2).find(a => /^\d+(\.\d+){1,2}$/.test(a)); // 4.13 or 1.4.0
if (!version) { console.error('Give a version like 4.13 or 1.4.0 (PWA), or --assets 20261114a (static site)'); process.exit(1); }
edit('version.json', s => s.replace(/"version"\s*:\s*"[^"]*"/, `"version": "${version}"`));
edit('index.html', s => s.replace(/(const\s+APP_VERSION\s*=\s*["'])[^"']*(["'])/, `$1${version}$2`));
edit('sw.js', s => s.replace(/(const\s+CACHE\s*=\s*["'][^"']*?-v)(\d+)(["'])/, (m, a, n, b) => a + (+n + 1) + b));

console.log(touched.length ? `Updated: ${touched.join(', ')}` : 'Nothing updated. Check the file names and patterns in this script.');
if (touched.length < 3) console.log('Warning: fewer than 3 files changed. Make sure every place that holds the version was updated.');
