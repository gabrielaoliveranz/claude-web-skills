---
name: web-launch-checklist
description: Use when building, changing or launching a small web product (a static marketing site, a single-file PWA, or a paid microapp with a merchant of record such as Paddle): technical checks that catch the bugs that usually slip through, plus a script that screenshots and inspects every page at phone, tablet and desktop widths.
---

# Web launch checklist

Every item in this skill is a bug that really happened while shipping three products (a consultancy website, a budgeting PWA, and a paid app with its sales site). Use it to plan a change and to check it before saying it's done.

## How to use it

1. Find the parts of the task in the table below and read only those reference files.
2. While building, follow the rules in those files.
3. Before saying "done", run `scripts/check-pages.mjs` against the site, look at the screenshots, and go through `references/before-done.md`.

| If the task touches... | Read |
|---|---|
| An installable app, service worker or app version | `references/pwa-releases.md` |
| Forms, sheets, scrolling or anything on phones | `references/phones.md` |
| A new domain, an API call, moving the app, DNS or email | `references/csp-and-domains.md` |
| Checkout, subscriptions, webhooks or pricing | `references/payments.md` |
| Buttons built in JavaScript, or account states | `references/app-code.md` |
| A static site going live, SEO files, CI checks | `references/static-site-checks.md` |
| Several languages | `references/multilingual.md` |
| Hiding elements, gradient text, layout shifts | `references/css-traps.md` |
| Copy, figures, legal pages | `references/content.md` |
| Finishing any change | `references/before-done.md` |

## Scripts

- `scripts/check-pages.mjs`: opens each page at 320, 390, 820 and 1440 px (and in each language you pass), then reports horizontal overflow, elements cut off at the screen edges, and headers that wrap to a second line. It also saves screenshots to look at. Needs Node and Playwright.
  ```
  node scripts/check-pages.mjs --base http://localhost:8000 --pages index.html,pricing.html --langs en,pt-PT --out shots
  ```
- `scripts/bump-version.mjs`: raises the version in every place a PWA keeps it (a `version.json`, a version constant in the page, the cache name in `sw.js`) so installed apps update.
  ```
  node scripts/bump-version.mjs --dir public 1.4.0
  ```

## Non-negotiables

- Test languages through a local HTTP server, never `file://`.
- Never tell users to delete or reinstall a home-screen app before they have a backup.
- A webhook marked "succeeded" only means your endpoint answered. Open the payload.
- Say plainly what you could not test.
