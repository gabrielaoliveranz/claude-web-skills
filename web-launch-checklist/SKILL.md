---
name: web-launch-checklist
description: "Use when building, changing, testing or launching a small web product (a static marketing site, a single-file PWA, or a paid microapp with a merchant of record such as Paddle): checks for the bugs that usually slip through (wrong-case paths, stale caches, drifted canonical URLs, hover states nobody tested, apps that never update), CI setup, and scripts that inspect the files and screenshot every page at phone, tablet and desktop widths."
---

# Web launch checklist

Every item in this skill is a bug that really happened while building two websites and two apps (a consultancy website with 155 commits of CI history, a budgeting PWA, and a paid app with its own sales website). Use it to plan a change and to check it before saying it's done.

## How to use it

1. Read `references/field-notes.md` once per project, and `references/building-an-app.md` before starting a new app. Then find the parts of the task in the table below and read those reference files.
2. While building, follow the rules in those files.
3. Before saying "done", run the scripts below, look at the screenshots, and go through `references/before-done.md`.

| If the task touches... | Read |
|---|---|
| Starting a new app, its data or its logic | `references/building-an-app.md` |
| Updates, reminders, PDF and Excel exports, imports, backups, insights in an app with no server | `references/app-features.md` |
| Domain, DNS, Cloudflare, email, Paddle, GitHub Pages, forms, a private app behind a sign-in, Google Calendar | `references/connecting-services.md` |
| Sending mail as your own domain (Gmail "Send mail as", SPF, DKIM, DMARC, Resend), signatures per language | `references/email-deliverability.md` |
| Syncing data between a person's devices: merging, outdated devices, undo after a bad sync | `references/sync.md` |
| Translations, currencies, dates, holidays | `references/i18n-architecture.md` |
| An installable app, service worker or app version | `references/pwa-releases.md` |
| Forms, sheets, scrolling or anything on phones | `references/phones.md` |
| A new domain, an API call, moving the app | `references/csp-and-domains.md` |
| Checkout, subscriptions, webhooks or pricing | `references/payments.md` |
| Buttons built in JavaScript, or account states | `references/app-code.md` |
| A static site going live: sitemap, canonical URLs, share images, 404 page, Cloudflare quirks, caching, forms, honest content | `references/static-site-checks.md` |
| A newsletter issue, an archive page of issues, or a campaign email that has to match the site | `references/newsletter-and-email.md` |
| Setting up CI, a check that fails (or passes) for the wrong reason, or testing an app update with old data | `references/testing-and-ci.md` |
| Several languages, including `hreflang` and canonical URLs for sites that switch with `?lang=` | `references/multilingual.md` |
| Hiding elements, gradient text, layout shifts | `references/css-traps.md` |
| Copy, figures, legal pages | `references/content.md` |
| Privacy page promises, data retention and expiry, erasure requests, fonts, untranslated legal pages | `references/privacy-and-data.md` |
| Finishing any change | `references/before-done.md` |
| Ready-made code: language links, demo links, app moves, checkout, webhooks, reminder emails, an upgrade test | `references/recipes.md` |
| Every technical bug we hit (PWA, phones, data, SEO, CI, languages) | `references/field-notes.md` |

## Scripts

Run them from the project folder, giving the script's full path. `check-static.mjs` and `bump-version.mjs` need only Node. The others use the project's Playwright (`npm install -D playwright`, then `npx playwright install chromium`).

| Script | What it catches | Example |
|---|---|---|
| `check-static.mjs` | Straight from the files, no browser: paths with the wrong letter case (fine on Windows and Mac, 404 on the server), broken internal links, canonical / `og:url` / `og:image` / sitemap / `robots.txt` that disagree, share images whose real size differs from the declared one, a hand-copied footer that drifted on one page, `mailto:` forms, relative paths on the 404 page, relative `fetch()` calls in scripts, `hreflang` codes Google rejects (such as `es-419`) or a canonical that drops the other languages or exists only by script, links to a `.html` address the host redirects to a clean one, `width: 100vw`, `<style>` in the body, skipped heading levels, published documents no page links to, untracked files | `node <skill>/scripts/check-static.mjs --same footer` |
| `check-pages.mjs` | In a real browser at 320, 390, 820 and 1440 px, per language and colour scheme: sideways scroll, text cut off at an edge, a header that wraps, script and console errors, failed requests (including ones the CSP blocks), HTTP errors. Saves full-page screenshots | `node <skill>/scripts/check-pages.mjs --base http://localhost:8000 --pages index.html,pricing.html --langs en,pt-PT --schemes light,dark` |
| `check-states.mjs` | Contrast of every link and button at rest, on hover, on keyboard focus and while pressed, against what is really painted behind the text; elements with no visible focus | `node <skill>/scripts/check-states.mjs --base http://localhost:8000 --pages index.html` |
| `make-share-card.mjs` | Renders the link-preview image from `assets/share-card.html` (or your own template) at 1200x630 with the site's real fonts | `node <skill>/scripts/make-share-card.mjs --template card.html --out assets/og.png` |
| `make-favicon.mjs` | Builds the root `favicon.ico` (16, 32 and 48 px) from your SVG icon | `node <skill>/scripts/make-favicon.mjs --svg assets/icon.svg --out favicon.ico` |
| `bump-version.mjs` | PWA: raises the version in `version.json`, the page and the `sw.js` cache name. Static site: sets a new `?v=` on every local CSS and JS link | `node <skill>/scripts/bump-version.mjs --dir public 1.4.0` or `--dir . --assets 20261114a` |

`check-pages.mjs` also takes `--reduced-motion` (check nothing stays hidden with animations off), `--widths` and `--header`. `check-static.mjs` takes `--ignore` (path prefixes) and `--strict` (warnings fail too). Every script exits with 1 when it finds a problem, so they work in CI as they are.

## Non-negotiables

- Test languages through a local HTTP server, never `file://`.
- Never tell users to delete or reinstall a home-screen app before they have a backup.
- A webhook marked "succeeded" only means your endpoint answered. Open the payload.
- Break a check on purpose once before trusting it.
- Link to the address the host really serves (`/guide`, not `guide.html`), and keep a canonical in the HTML itself; a script may only update that tag. Both caused Search Console reports on a live site.
- Before finishing a site change, open the Search Console emails and Pages report of the live site, if there are any, and compare.
- Say plainly what you could not test.
