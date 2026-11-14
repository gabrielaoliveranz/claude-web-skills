// Tests for the scripts in web-launch-checklist/scripts.
// Each case runs a script against a fixture with planted bugs (it must report every one) or a clean fixture
// (it must report nothing). Run: npm test   (or npm run test:quick to skip the browser scripts)
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, cpSync, readFileSync, existsSync, createReadStream, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS = join(ROOT, 'web-launch-checklist', 'scripts');
const FIX = join(ROOT, 'tests', 'fixtures');
const QUICK = process.argv.includes('--quick');
const tmp = () => mkdtempSync(join(tmpdir(), 'wls-'));

// Asynchronous on purpose: the fixture server runs in this process, and a blocking spawnSync would stop it
// from answering the browser the script under test is driving.
const run = (script, args, cwd = ROOT) => new Promise(resolve => {
  const p = spawn(process.execPath, [join(SCRIPTS, script), ...args], { cwd });
  let out = '';
  p.stdout.on('data', d => out += d); p.stderr.on('data', d => out += d);
  const timer = setTimeout(() => { p.kill(); out += '\n[timed out after 5 minutes]'; }, 300000);
  p.on('close', code => { clearTimeout(timer); resolve({ code, out }); });
});

// A static server like the hosts these sites run on: unknown paths get 404.html with a 404 status.
function serve(dir) {
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
  const server = createServer((q, s) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = join(dir, p);
    if (existsSync(f) && statSync(f).isFile()) { s.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' }); return createReadStream(f).pipe(s); }
    s.writeHead(404, { 'content-type': 'text/html' }); s.end('<!doctype html><title>404</title>');
  });
  return new Promise(r => server.listen(0, () => r({ base: `http://localhost:${server.address().port}`, close: () => server.close() })));
}

const cases = [];
const test = (name, fn, { browser = false } = {}) => cases.push({ name, fn, browser });

function expect({ code, out }, { exit, has = [], not = [] }) {
  const problems = [];
  if (exit !== undefined && code !== exit) problems.push(`exit code ${code}, expected ${exit}`);
  for (const s of has) if (!out.includes(s)) problems.push(`missing: ${s}`);
  for (const s of not) if (out.includes(s)) problems.push(`should not contain: ${s}`);
  if (problems.length) throw new Error(problems.join('\n      ') + '\n    --- output ---\n' + out.trim().split('\n').map(l => '    ' + l).join('\n'));
}
const warnings = out => out.split('\n').filter(l => /^(FAIL|WARN) /.test(l) && !/untracked/.test(l));

// ---------- check-static.mjs ----------
test('check-static: catches every planted bug', async () => expect(await run('check-static.mjs', ['--root', join(FIX, 'static-bugs'), '--same', 'footer']), {
  exit: 1,
  has: [
    'og:image must be an absolute URL', 'og:image is 1200x600 but the page declares 1200x630',
    'on disk it\'s "assets/Logo.png" (wrong case', '"/missing/" not found', 'has no alt', 'form posts to mailto:',
    'url(img/bg.png) not found', 'https://example.com/old/ has no page in the site', 'expected https://example.com/sitemap.xml',
    '<footer> differs', 'the 404 page is served at any missing URL', 'copied from another page?', '<style> inside <body>',
    'heading jumps from h1 to h3', 'width: 100vw includes the scrollbar and causes sideways scroll', 'favicon.ico: missing',
    'old-cv.pdf: published but no page links to it', 'not found on 404.html',
  ],
  not: ['scripts/card.html'],
}));
test('check-static: a clean site reports nothing', async () => {
  const r = await run('check-static.mjs', ['--root', join(FIX, 'static-clean'), '--same', 'footer']);
  expect(r, { exit: 0 });
  if (warnings(r.out).length) throw new Error('unexpected:\n    ' + warnings(r.out).join('\n    '));
});
test('check-static: hreflang codes, duplicates, targets, x-default, relative fetch', async () => expect(await run('check-static.mjs', ['--root', join(FIX, 'hreflang-bugs')]), {
  exit: 1,
  has: ['hreflang="es-419" is not a code Google accepts', 'hreflang="en" is listed twice', 'https://ex.com/pt/, which has no page in the site', 'without an x-default', "fetch('i18n/es.json"],
  not: ["fetch('/ok.json"],
}));
test('check-static: a fixed canonical that drops ?lang= languages', async () => expect(await run('check-static.mjs', ['--root', join(FIX, 'hreflang-canonical')]), {
  exit: 0, has: ['treats every other language as a duplicate'],
}));
test('check-static: an installable app gets no SEO-only warnings', async () => expect(await run('check-static.mjs', ['--root', join(FIX, 'app')]), {
  exit: 0, not: ['no <link rel="canonical">', 'fetch('],
}));

test('check-static: --same compares pages in the same language only', async () => expect(await run('check-static.mjs', ['--root', join(FIX, 'translated'), '--same', 'footer']), {
  exit: 1, has: ['<footer> differs from the one on es/', '(both lang="es")'], not: ['FAIL  index.html:'],
}));

// ---------- every script ----------
test('every script refuses a mistyped option instead of quietly testing less', async () => {
  for (const [script, typo] of [['check-static.mjs', '--sme'], ['check-pages.mjs', '--scheme'], ['check-states.mjs', '--scheme'], ['make-share-card.mjs', '--templat'], ['make-favicon.mjs', '--size'], ['bump-version.mjs', '--asset']])
    expect(await run(script, [typo, 'x']), { exit: 2, has: [`Unknown option ${typo}`] });
});

// ---------- bump-version.mjs ----------
for (const v of ['4.13', '1.4.0']) test(`bump-version: PWA version ${v} in all three places`, async () => {
  const d = tmp(); cpSync(join(FIX, 'app'), d, { recursive: true });
  expect(await run('bump-version.mjs', ['--dir', d, v]), { exit: 0, has: ['Updated: version.json, index.html, sw.js'] });
  const problems = [];
  if (!readFileSync(join(d, 'version.json'), 'utf8').includes(`"${v}"`)) problems.push('version.json');
  if (!readFileSync(join(d, 'index.html'), 'utf8').includes(`APP_VERSION = "${v}"`)) problems.push('APP_VERSION');
  if (!readFileSync(join(d, 'sw.js'), 'utf8').includes('app-v36')) problems.push('sw.js cache');
  rmSync(d, { recursive: true, force: true });
  if (problems.length) throw new Error('not updated: ' + problems.join(', '));
});
test('bump-version: ?v= on local assets only, warns about bare links', async () => {
  const d = tmp(); cpSync(join(FIX, 'static-assets'), d, { recursive: true });
  expect(await run('bump-version.mjs', ['--dir', d, '--assets', 'T1']), { exit: 0, has: ['without ?v=', 'sub/index.html'] });
  const html = readFileSync(join(d, 'index.html'), 'utf8');
  rmSync(d, { recursive: true, force: true });
  for (const s of ['site.css?v=T1', 'app.js?x=2&v=T1', 'lib.js?v=9']) if (!html.includes(s)) throw new Error(`expected ${s} in:\n    ${html}`);
});

// ---------- browser scripts ----------
test('check-pages: CSP block, script error, 404, overflow, cut-off text', async () => {
  const s = await serve(join(FIX, 'pages')), out = tmp();
  try {
    expect(await run('check-pages.mjs', ['--base', s.base, '--pages', 'bad.html', '--widths', '390', '--schemes', 'light,dark', '--out', out]), {
      exit: 1, has: ['violates the following Content Security Policy', 'undefinedFunction is not defined', 'HTTP 404', 'horizontal overflow: page is 700px wide', 'cut off at the edge'],
    });
    if (!existsSync(join(out, 'bad-html-dark-390.png'))) throw new Error('no dark screenshot saved');
  } finally { s.close(); rmSync(out, { recursive: true, force: true }); }
}, { browser: true });
test('check-pages: a clean page reports nothing', async () => {
  const s = await serve(join(FIX, 'pages')), out = tmp();
  try { expect(await run('check-pages.mjs', ['--base', s.base, '--pages', 'good.html', '--widths', '320,1440', '--out', out]), { exit: 0, has: ['No problems found'] }); }
  finally { s.close(); rmSync(out, { recursive: true, force: true }); }
}, { browser: true });
test('check-pages: a closed mobile menu is not a wrapped header', async () => {
  const s = await serve(join(FIX, 'pages')), out = tmp();
  try {
    expect(await run('check-pages.mjs', ['--base', s.base, '--pages', 'menu-closed.html', '--out', out]), { exit: 0, has: ['No problems found'] });
    expect(await run('check-pages.mjs', ['--base', s.base, '--pages', 'header-wraps.html', '--widths', '390', '--out', out]), { exit: 1, has: ['header wraps to more than one line'] });
  } finally { s.close(); rmSync(out, { recursive: true, force: true }); }
}, { browser: true });
test('check-states: hover rule, slow transition, missing focus, gradient skipped', async () => {
  const s = await serve(join(FIX, 'pages'));
  try {
    expect(await run('check-states.mjs', ['--base', s.base, '--pages', 'states.html']), {
      exit: 1,
      has: ['"See plans" hover: 1.00:1', '"Good link" hover: 1.00:1', '"Slow nav link" pressed', '"Button without ring": no visible change on keyboard focus', 'skipped (text over an image or gradient'],
      not: ['"See plans": no visible change'],
    });
  } finally { s.close(); }
}, { browser: true });
test('check-states: a clean page reports nothing', async () => {
  const s = await serve(join(FIX, 'pages'));
  try { expect(await run('check-states.mjs', ['--base', s.base, '--pages', 'states-clean.html']), { exit: 0, has: ['0 fail, 0 warn'] }); }
  finally { s.close(); }
}, { browser: true });
test('make-share-card: 1200x630 PNG from the template', async () => {
  const d = tmp(), png = join(d, 'og.png');
  try {
    expect(await run('make-share-card.mjs', ['--template', join(ROOT, 'web-launch-checklist', 'assets', 'share-card.html'), '--out', png]), { exit: 0 });
    const b = readFileSync(png);
    if (b.readUInt32BE(16) !== 1200 || b.readUInt32BE(20) !== 630) throw new Error(`image is ${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`);
  } finally { rmSync(d, { recursive: true, force: true }); }
}, { browser: true });
test('make-favicon: .ico with 16, 32 and 48 px PNGs', async () => {
  const d = tmp(), ico = join(d, 'favicon.ico');
  try {
    expect(await run('make-favicon.mjs', ['--svg', join(FIX, 'icon.svg'), '--out', ico]), { exit: 0 });
    const b = readFileSync(ico), n = b.readUInt16LE(4), sizes = [...Array(n)].map((_, i) => b[6 + 16 * i]);
    if (sizes.join() !== '16,32,48') throw new Error(`sizes ${sizes}`);
    if (b.readUInt32BE(b.readUInt32LE(18)) !== 0x89504e47) throw new Error('first image is not a PNG');
  } finally { rmSync(d, { recursive: true, force: true }); }
}, { browser: true });

// ---------- run ----------
let failed = 0, skipped = 0;
for (const c of cases) {
  if (QUICK && c.browser) { skipped++; continue; }
  const t = Date.now();
  try { await c.fn(); console.log(`PASS  ${c.name} (${((Date.now() - t) / 1000).toFixed(1)}s)`); }
  catch (e) { failed++; console.log(`FAIL  ${c.name}\n      ${e.message}`); }
}
console.log(`\n${cases.length - failed - skipped} passed, ${failed} failed${skipped ? `, ${skipped} skipped (--quick)` : ''}.`);
process.exitCode = failed ? 1 : 0;
