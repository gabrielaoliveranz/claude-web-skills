// Raise a PWA's version everywhere it lives so installed apps update.
// Usage: node bump-version.mjs --dir public 1.4.0
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const i = process.argv.indexOf('--dir'), dir = i > 0 ? process.argv[i + 1] : 'public';
const version = process.argv.slice(2).find(a => /^\d+\.\d+\.\d+$/.test(a));
if (!version) { console.error('Give a version like 1.4.0'); process.exit(1); }
const touched = [];
const edit = (file, fn) => { const p = join(dir, file); if (!existsSync(p)) return; const s = readFileSync(p, 'utf8'), n = fn(s); if (n !== s) { writeFileSync(p, n); touched.push(file); } };

edit('version.json', s => s.replace(/"version"\s*:\s*"[^"]*"/, `"version": "${version}"`));
edit('index.html', s => s.replace(/(const\s+APP_VERSION\s*=\s*")[^"]*(")/, `$1${version}$2`));
edit('sw.js', s => s.replace(/(const\s+CACHE\s*=\s*"[^"]*?-v)(\d+)(")/, (m, a, n, b) => a + (+n + 1) + b));

console.log(touched.length ? `Updated: ${touched.join(', ')}` : 'Nothing updated. Check the file names and patterns in this script.');
if (touched.length < 3) console.log('Warning: fewer than 3 files changed. Make sure every place that holds the version was updated.');
