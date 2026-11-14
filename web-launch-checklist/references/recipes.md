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
