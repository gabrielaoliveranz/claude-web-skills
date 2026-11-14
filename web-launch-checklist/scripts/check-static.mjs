// Static checks for a hand-written site, straight from the files: no browser, no dependencies.
// Every check here caught a real bug that looked fine locally and broke once published.
// Usage: node check-static.mjs [--root .] [--same footer,header.top] [--ignore drafts/,old/] [--strict]
//   --root    the folder the site is served from (default: current folder)
//   --same    blocks that must be identical on every page that has them (tag, optionally .class)
//   --ignore  path prefixes to skip, comma-separated (git-ignored files are skipped already)
//   --strict  warnings fail the run too
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, posix, extname, resolve } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const ROOT = resolve(arg('root', '.'));
// Tool folders are never served as pages (share-card templates, test fixtures).
const IGNORE = ['scripts/', 'tests/', 'test/', ...(arg('ignore', '') || '').split(',').map(s => s.trim()).filter(Boolean)];
const SAME = (arg('same', '') || '').split(',').map(s => s.trim()).filter(Boolean);
const STRICT = process.argv.includes('--strict');
const VERIFY = /^(google[0-9a-f]+|pinterest-[0-9a-f]+|yandex_[0-9a-f]+|BingSiteAuth)\.(html|xml)$/i;

const out = { FAIL: [], WARN: [] };
const fail = (where, msg) => out.FAIL.push(`${where}: ${msg}`);
const warn = (where, msg) => out.WARN.push(`${where}: ${msg}`);

// ---------- files ----------
function listFiles() {
  try { // inside a git repo: tracked files plus new ones that aren't ignored (skips tool scaffolding and drafts)
    const txt = execFileSync('git', ['-C', ROOT, 'ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return txt.split('\n').filter(Boolean).filter(f => existsSync(join(ROOT, f)));
  } catch {
    const res = [];
    (function walk(dir) {
      for (const n of readdirSync(join(ROOT, dir))) {
        if (n.startsWith('.') || n === 'node_modules') continue;
        const rel = dir ? dir + '/' + n : n;
        statSync(join(ROOT, rel)).isDirectory() ? walk(rel) : res.push(rel);
      }
    })('');
    return res;
  }
}
const ALL = listFiles().filter(f => !IGNORE.some(p => f.startsWith(p)) && !f.startsWith('node_modules/'));
const read = f => readFileSync(join(ROOT, f), 'utf8');

// Case-exact existence: Windows and macOS find "Logo.PNG" when you ask for "logo.png"; Linux hosts don't.
const dirCache = new Map();
const entries = d => { if (!dirCache.has(d)) { try { dirCache.set(d, readdirSync(join(ROOT, d))); } catch { dirCache.set(d, null); } } return dirCache.get(d); };
function exact(rel) { // 'file' | 'dir' | {wrongCase: 'real/Path'} | null
  const segs = rel.split('/').filter(Boolean); let dir = '', real = [];
  for (const s of segs) {
    const list = entries(dir); if (!list) return null;
    if (list.includes(s)) { real.push(s); dir = dir ? dir + '/' + s : s; continue; }
    const ci = list.find(e => e.toLowerCase() === s.toLowerCase());
    if (ci) { real.push(ci); dir = dir ? dir + '/' + ci : ci; const rest = segs.slice(real.length); return { wrongCase: [...real, ...rest].join('/') }; }
    return null;
  }
  return statSync(join(ROOT, dir || '.')).isDirectory() ? 'dir' : 'file';
}
// How a static host serves a path: exact file, folder/index.html, or a clean URL without .html
function served(rel) {
  rel = rel.replace(/^\/+/, '');
  const tries = rel === '' || rel.endsWith('/') ? [rel + 'index.html'] : [rel, rel + '/index.html', rel + '.html'];
  let wrong = null;
  for (const t of tries) { const r = exact(t); if (r === 'file') return { ok: true, file: t }; if (r && r.wrongCase) wrong = wrong || r.wrongCase; }
  return { ok: false, wrong };
}

// ---------- HTML helpers (regex-based: good enough for hand-written pages) ----------
const strip = h => h.replace(/<!--[\s\S]*?-->/g, '').replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>').replace(/(<style\b[^>]*>)[\s\S]*?<\/style>/gi, '$1</style>');
function attrs(tag) { const a = {}; for (const m of tag.matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) a[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4]; return a; }
const tags = (h, name) => [...h.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(m => ({ raw: m[0], index: m.index, a: attrs(m[0]) }));
const meta = (h, key) => { const t = tags(h, 'meta').find(t => (t.a.property || t.a.name || '').toLowerCase() === key); return t ? (t.a.content || '').trim() : null; };
const linkRel = (h, rel) => { const t = tags(h, 'link').find(t => (t.a.rel || '').toLowerCase().split(/\s+/).includes(rel)); return t ? t.a.href : null; };
const external = r => /^[a-z][a-z0-9+.-]*:/i.test(r) || r.startsWith('//');
const dec = s => { try { return decodeURIComponent(s); } catch { return s; } };
// Resolve a reference to a root-relative path, the way the browser would from this page or stylesheet.
function resolveRef(fromFile, ref) {
  const clean = dec(ref.split(/[?#]/)[0]);
  if (clean === '') return null;
  const base = posix.dirname(fromFile) === '.' ? '' : posix.dirname(fromFile);
  const p = clean.startsWith('/') ? clean : posix.join('/' + base, clean);
  const norm = posix.normalize(p);
  return norm.startsWith('/..') ? { outside: true } : { path: norm.replace(/^\//, ''), trailing: clean.endsWith('/') };
}
function blockOf(html, sel) { // first element matching "tag" or "tag.class", with nested same-name tags balanced
  const [tag, cls] = sel.split('.');
  const open = [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'gi'))].find(m => !cls || (attrs(m[0]).class || '').split(/\s+/).includes(cls));
  if (!open) return null;
  const re = new RegExp(`<${tag}\\b[^>]*>|</${tag}\\s*>`, 'gi'); re.lastIndex = open.index + open[0].length;
  let depth = 1, m;
  while ((m = re.exec(html))) { depth += m[0][1] === '/' ? -1 : 1; if (!depth) return html.slice(open.index, m.index + m[0].length); }
  return null;
}

function imageSize(file) {
  const b = readFileSync(join(ROOT, file));
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i < b.length - 9;) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1], len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + len;
    }
  }
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const k = b.toString('ascii', 12, 16);
    if (k === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (k === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (k === 'VP8L') { const n = b.readUInt32LE(21); return [(n & 0x3fff) + 1, ((n >> 14) & 0x3fff) + 1]; }
  }
  return null;
}

// ---------- pages ----------
const pages = ALL.filter(f => /\.html?$/i.test(f) && !VERIFY.test(posix.basename(f)))
  .filter(f => /<html[\s>]|<!doctype html/i.test(read(f).slice(0, 2000)));
const referenced = new Set();           // every local path any page or stylesheet points at
const canonicals = new Map();           // page -> canonical URL
const stylesheets = new Set();
const redirects = new Set();            // stub pages that only send visitors elsewhere
const blocks = Object.fromEntries(SAME.map(s => [s, new Map()]));

for (const page of pages) {
  const raw = read(page), html = strip(raw);
  const is404 = /(^|\/)404\.html$/.test(page);
  const robots = (meta(html, 'robots') || '').toLowerCase();
  const noindex = robots.includes('noindex') || is404;
  const redirect = /<meta[^>]+http-equiv=["']?refresh/i.test(html);
  if (redirect) redirects.add(page);

  // Head basics
  const htmlTag = tags(html, 'html')[0];
  if (!htmlTag || !htmlTag.a.lang) fail(page, '<html> has no lang attribute');
  const title = (raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  if (!title || !title.trim()) fail(page, 'missing <title>');
  if (!meta(html, 'viewport')) fail(page, 'missing <meta name="viewport"> (phones render it as a zoomed-out desktop page)');

  const canonical = linkRel(html, 'canonical');
  if (!noindex && !redirect) {
    if (!meta(html, 'description')) warn(page, 'no meta description (search results and link previews show random text)');
    if (!canonical) warn(page, 'no <link rel="canonical">');
    if (!meta(html, 'og:image')) warn(page, 'no og:image (shared links show no picture)');
  }
  if (canonical) {
    if (!/^https?:\/\//.test(canonical)) fail(page, `canonical must be an absolute URL, found "${canonical}"`);
    else {
      canonicals.set(page, canonical);
      const want = '/' + page.replace(/(^|\/)index\.html$/, '$1');
      const got = new URL(canonical).pathname;
      if (!noindex && !redirect && got !== want && got !== want.replace(/\.html$/, '')) warn(page, `canonical points at ${got}, but this page is served at ${want} (copied from another page?)`);
    }
    const ogUrl = meta(html, 'og:url');
    if (ogUrl && ogUrl !== canonical) fail(page, `og:url (${ogUrl}) differs from canonical (${canonical})`);
  }
  const ogImage = meta(html, 'og:image');
  if (ogImage) {
    if (!/^https?:\/\//.test(ogImage)) fail(page, `og:image must be an absolute URL (social sites ignore "${ogImage}")`);
    else if (canonical && /^https?:\/\//.test(canonical) && new URL(ogImage).origin === new URL(canonical).origin) {
      const local = served(dec(new URL(ogImage).pathname));
      if (!local.ok) fail(page, `og:image ${ogImage} has no file in the site${local.wrong ? ` (on disk: ${local.wrong}, wrong case)` : ''}`);
      else {
        referenced.add(local.file);
        const w = +meta(html, 'og:image:width'), h = +meta(html, 'og:image:height'), size = imageSize(local.file);
        if (size && w && h && (size[0] !== w || size[1] !== h)) fail(page, `og:image is ${size[0]}x${size[1]} but the page declares ${w}x${h}`);
        if (size && (size[0] < 600 || size[1] < 315)) warn(page, `og:image is only ${size[0]}x${size[1]}; previews look best at 1200x630`);
      }
    }
  }

  // Local references: pages, images, scripts, styles, downloads
  const refs = [];
  for (const t of tags(html, '[a-z]+')) {
    for (const k of ['src', 'href', 'poster', 'data-src']) if (t.a[k]) refs.push({ ref: t.a[k], tag: t.raw.slice(1, t.raw.search(/[\s>]/)).toLowerCase(), a: t.a });
    for (const k of ['srcset', 'imagesrcset']) if (t.a[k]) for (const part of t.a[k].split(',')) { const u = part.trim().split(/\s+/)[0]; if (u) refs.push({ ref: u, tag: 'srcset', a: t.a }); }
  }
  for (const { ref, tag, a } of refs) {
    if (!ref || ref.startsWith('#') || external(ref) || ref.startsWith('{') || ref.includes('${')) continue;
    if (tag === 'link' && /\b(canonical|alternate|preconnect|dns-prefetch)\b/i.test(a.rel || '')) continue;
    const r = resolveRef(page, ref);
    if (!r) continue;
    if (r.outside) { fail(page, `"${ref}" points above the site root`); continue; }
    const s = served(r.path + (r.trailing ? '/' : ''));
    if (!s.ok) fail(page, `"${ref}" not found${s.wrong ? ` - on disk it's "${s.wrong}" (wrong case: works on Windows and Mac, 404 on the server)` : ''}`);
    else { referenced.add(s.file); if (tag === 'link' && /stylesheet/i.test(a.rel || '')) stylesheets.add(s.file); }
    if (is404 && !ref.startsWith('/') && tag !== 'a') warn(page, `"${ref}" is relative: the 404 page is served at any missing URL, so use a root-absolute path ("/${r.path}")`);
  }

  // Content traps
  for (const t of tags(html, 'img')) if (!('alt' in t.a)) fail(page, `<img src="${t.a.src || '?'}"> has no alt (use alt="" for decoration)`);
  for (const t of tags(html, 'form')) if (/^mailto:/i.test(t.a.action || '')) fail(page, 'form posts to mailto: (browsers warn "not secure" and phones open a mail app with raw text); use a form service or your own endpoint');
  const body = html.split(/<body\b/i)[1] || '';
  if (/<style\b/i.test(body)) warn(page, '<style> inside <body> fails HTML validation; move it to the stylesheet');
  let prev = 0;
  for (const m of body.matchAll(/<h([1-6])\b/gi)) { const lvl = +m[1]; if (prev && lvl > prev + 1) warn(page, `heading jumps from h${prev} to h${lvl}`); prev = lvl; }

  // Shared blocks (header, footer...) copied by hand into each page
  for (const sel of SAME) {
    const b = blockOf(html, sel);
    if (!b) continue;
    const norm = b.replace(/\s(aria-current|data-active)="[^"]*"/g, '')
      .replace(/\b(href|src)="([^"]*)"/g, (m, k, v) => { if (!v || v.startsWith('#') || external(v)) return m; const r = resolveRef(page, v); return r && r.path !== undefined ? `${k}="/${r.path}${v.match(/[?#].*$/)?.[0] || ''}"` : m; })
      .replace(/\s+/g, ' ').trim();
    blocks[sel].set(page, norm);
  }
}

// Stylesheets: url() and @import references, plus the 100vw trap
for (const css of stylesheets) {
  const src = read(css).replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of src.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)|@import\s+["']([^"']+)["']/g)) {
    const ref = (m[1] || m[2]).trim();
    if (ref.startsWith('data:') || ref.startsWith('#') || external(ref)) continue;
    const r = resolveRef(css, ref); if (!r || r.outside) continue;
    const s = served(r.path);
    if (!s.ok) fail(css, `url(${ref}) not found${s.wrong ? ` - on disk it's "${s.wrong}" (wrong case)` : ''}`); else referenced.add(s.file);
  }
  if (/(?<![\w-])width\s*:\s*100vw/.test(src)) warn(css, 'width: 100vw includes the scrollbar and causes sideways scroll whenever the page is tall; use the natural block width');
}

// One domain everywhere
const origins = new Set([...canonicals.values()].filter(u => /^https?:/.test(u)).map(u => new URL(u).origin));
if (origins.size > 1) fail('canonical URLs', `pages disagree on the domain: ${[...origins].join(', ')}`);
const origin = [...origins][0];

// sitemap.xml and robots.txt
if (existsSync(join(ROOT, 'sitemap.xml'))) {
  referenced.add('sitemap.xml');
  const locs = [...read('sitemap.xml').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]);
  for (const loc of locs) {
    if (origin && !loc.startsWith(origin)) { fail('sitemap.xml', `${loc} is not on ${origin}`); continue; }
    const s = served(dec(new URL(loc).pathname));
    if (!s.ok) fail('sitemap.xml', `${loc} has no page in the site`);
    else { referenced.add(s.file); const h = strip(read(s.file)); if ((meta(h, 'robots') || '').includes('noindex')) warn('sitemap.xml', `${loc} is noindex; remove it from the sitemap`); }
  }
  for (const [page, url] of canonicals) {
    const h = strip(read(page));
    if (!(meta(h, 'robots') || '').includes('noindex') && !/http-equiv=["']?refresh/i.test(h) && !/(^|\/)404\.html$/.test(page) && !locs.includes(url)) warn('sitemap.xml', `missing ${url} (${page})`);
  }
  if (existsSync(join(ROOT, 'robots.txt'))) {
    const sm = (read('robots.txt').match(/^\s*Sitemap:\s*(\S+)/im) || [])[1];
    if (!sm) warn('robots.txt', 'no "Sitemap:" line');
    else if (origin && sm !== origin + '/sitemap.xml') fail('robots.txt', `Sitemap: ${sm}, expected ${origin}/sitemap.xml`);
  } else warn('robots.txt', 'missing');
} else if (pages.length > 1) warn('sitemap.xml', 'missing');
if (pages.length && !existsSync(join(ROOT, 'favicon.ico'))) warn('favicon.ico', 'missing at the root (search engines and some browsers ask for /favicon.ico directly)');

// Published but linked from nowhere: still downloadable, still indexed
for (const f of ALL) {
  if (referenced.has(f) || VERIFY.test(posix.basename(f))) continue;
  if (/\.(pdf|docx?|xlsx?|pptx?|zip|csv)$/i.test(f)) warn(f, 'published but no page links to it (still downloadable and indexable); delete it or link it');
  else if (pages.includes(f) && !/(^|\/)(404|index)\.html$/.test(f)) warn(f, 'page not linked from any other page or the sitemap');
}

// Shared blocks: compare each page with the most common version
for (const sel of SAME) {
  const m = blocks[sel];
  if (!m.size) { warn(`--same ${sel}`, 'no page has this block'); continue; }
  const counts = new Map(); for (const v of m.values()) counts.set(v, (counts.get(v) || 0) + 1);
  const common = [...counts].sort((a, b) => b[1] - a[1])[0][0];
  for (const [page, v] of m) if (v !== common) {
    let i = 0; while (i < v.length && v[i] === common[i]) i++;
    fail(page, `<${sel}> differs from the one on ${[...m].find(([, x]) => x === common)[0]}: ...${v.slice(Math.max(0, i - 30), i + 50)}...`);
  }
  const missing = pages.filter(p => !m.has(p) && !redirects.has(p));
  if (missing.length) warn(`--same ${sel}`, `not found on ${missing.join(', ')}`);
}

// Files git would sweep into the next commit without a decision
try {
  const u = execFileSync('git', ['-C', ROOT, 'ls-files', '--others', '--exclude-standard'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').filter(Boolean);
  if (u.length) warn('git', `${u.length} untracked file(s) not in .gitignore: ${u.slice(0, 6).join(', ')}${u.length > 6 ? ', ...' : ''}`);
} catch {}

for (const kind of ['FAIL', 'WARN']) for (const line of out[kind]) console.log(`${kind}  ${line}`);
console.log(`\n${out.FAIL.length} fail, ${out.WARN.length} warn across ${pages.length} page(s)${STRICT ? ' (strict)' : ''}.`);
process.exitCode = out.FAIL.length || (STRICT && out.WARN.length) ? 1 : 0;
