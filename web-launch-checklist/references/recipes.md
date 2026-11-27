# Recipes: tested code

## Keep the language between pages

Call this every time the language changes, so internal links carry it even when storage is blocked:
```js
document.querySelectorAll('a[href]').forEach(function (a) {
  var h = a.getAttribute('href'); if (!/^[a-z0-9-]+\.html(\?|#|$)/i.test(h)) return;
  var u = new URL(h, location.href); u.searchParams.set('lang', lang);
  a.setAttribute('href', u.pathname.split('/').pop() + u.search + u.hash);
});
```
Language order on load: `?lang=` first, then the stored choice, then the browser language, then the default.

## Demo link that matches the visitor

```js
var cc = { 'es-AR': 'AR', 'es-419': 'MX', 'es-ES': 'ES', 'en-GB': 'GB', 'en-US': 'US', 'pt-BR': 'BR', 'pt-PT': 'PT' }[lang] || 'US';
demoLink.href = demoUrl.replace(/lang=[^&]*/, 'lang=' + lang).replace(/cc=[^&]*/, 'cc=' + cc) + '&web';
```
Open it in the same tab. With `&web`, the app's demo banner shows "Back to the website" and "Try it free" instead of "Exit".

## Move an app to a new address only when it's ready

```js
var ready = Promise.race([
  fetch(NEW_HOME + '/version.json?t=' + Date.now(), { mode: 'no-cors', cache: 'no-store' }).then(function () { return true; }),
  new Promise(function (r) { setTimeout(function () { r(false); }, 4000); })
]).catch(function () { return false; });
ready.then(function (ok) { if (ok) location.replace(NEW_HOME + '/#mv=' + compressedLocalData); });
```
On the new address, import the data only if local storage is empty. Then show a sheet: "Your data is here. Don't delete this icon without making a backup first", with a "Make a backup now" button. Add the new host to `connect-src`.

## Checkout with the email the app will look for

```js
Paddle.Checkout.open({ items: [{ priceId: price, quantity: 1 }],
  customer: { email: email }, customData: { email: email, plan: plan, lang: lang },
  settings: { displayMode: 'overlay', successUrl: APP + '/?paid&email=' + encodeURIComponent(email) } });
```
Ask for the email in your own small dialog first ("Use the same email you'll sign in with"). On `?paid`, the app saves that email and checks the subscription a few times, about 4 s apart.

## Webhook: verify, deduplicate, store by email hash

- Check the signature: HMAC-SHA256 of `ts + ":" + rawBody` with the webhook secret, compared to `h1`, and a timestamp no older than 5 minutes.
- Store each `event_id` for 7 days and ignore repeats.
- Key the subscription on `sha256("app:" + email.toLowerCase())`. Store the status, plan, next payment date and the cancel and update URLs.
- If an event has no email, look it up from the subscription ID (keep a `subId → hash` map).
- Treat `past_due` as active for 7 days, and `canceled` as active until the paid period ends.

## Reminder emails

- A scheduled worker (cron once a day) sends:
  - **trial:** on the day the trial starts, then 4 days and 1 day before it ends;
  - **annual plans:** 7 days and 1 day before renewal;
  - **monthly plans:** 2 days and 1 day before renewal.
- Mark each email as sent in storage so it never goes twice.
- Send from a subdomain (`mail.example.com`), in the customer's language.

## Upgrade test: old data, moved clock

Checks what people see when they open a new version days after the old one saved their data. Run it against a local server; `DB`, `saveLocal()` and the button text are this app's names, adapt them.
```js
import { chromium } from "playwright";
const b = await chromium.launch(), errs = [];
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, timezoneId: "Pacific/Auckland", serviceWorkers: "block" })).newPage();
p.on("pageerror", e => errs.push(e.message));
await p.clock.install({ time: new Date("2026-11-24T10:00:00+13:00") });   // when the old data was made
await p.goto("http://localhost:8000/");
await p.click("text=Start with the sample plan");
await p.evaluate(() => { DB.v = 4; saveLocal(); });                          // the version people still have
await p.clock.setFixedTime(new Date("2026-11-26T06:30:00+13:00"));           // the day they open the update
await p.reload();
console.log(await p.evaluate(() => ({ v: DB.v, items: DB.tasks.map(t => [t.id, t.due]) })));  // live state, not storage
await p.screenshot({ path: "upgrade-390.png", fullPage: true });
console.log(errs.length ? errs : "no page errors"); await b.close();
```

## Find strings left untranslated
Flatten each language file and list the long strings that are identical to the English (or source) file. Short identical strings (brand names, ids) are fine.
```js
const flat = (o, p = "", r = {}) => { for (const [k, v] of Object.entries(o)) typeof v === "object" ? flat(v, p + k + ".", r) : r[p + k] = v; return r; };
const en = flat(JSON.parse(fs.readFileSync("i18n/en-GB.json", "utf8")));
for (const code of ["pt-BR", "pt-PT"]) {
  const t = flat(JSON.parse(fs.readFileSync(`i18n/${code}.json`, "utf8")));
  console.log(code, Object.keys(t).filter(k => typeof t[k] === "string" && t[k].length > 25 && t[k] === en[k]));
}
```
Missing keys are a different problem: compare key lists too. Then check the same text in the plain-HTML fallback of each page.

## Test expiry logic with a fake key-value store
No Cloudflare account needed: import the worker as a module, give it an `env` whose `HN` records every `put` with its `expirationTtl`, post a signed webhook, then print each key's TTL in days. Expect no key printed as having no expiry. Seed old records without TTL, run the scheduled handler (keep the promise passed to `waitUntil` and await it), and print again.
```js
const store = new Map();
const HN = { async get(k, t) { const v = store.get(k); return v ? (t === "json" ? JSON.parse(v.v) : v.v) : null; },
  async put(k, v, o) { store.set(k, { v: String(v), ttl: o && o.expirationTtl }); }, async delete(k) { store.delete(k); },
  async list({ prefix }) { return { keys: [...store].filter(([k]) => k.startsWith(prefix)).map(([k, x]) => ({ name: k, expiration: x.ttl ? 1 : undefined })), list_complete: true }; } };
let P; worker.scheduled({}, env, { waitUntil(p) { P = p; } }); await P;
```
