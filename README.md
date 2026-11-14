# Web skills for Claude

Two Claude skills for building small web products without repeating the usual mistakes. They come from shipping three real products (a consultancy website, an installable budgeting app, and a paid app with its sales site) over about 250 commits. Every rule is a bug that actually happened.

[![Screenshots from check-pages.mjs at 390, 820 and 1440 px](docs/check-pages.png)](docs/check-pages.png)

*Screenshots taken by `check-pages.mjs` at phone, tablet and desktop widths. The script also flags anything that overflows, gets cut off at an edge, or makes the header wrap.*

## Who these are for

You're building a digital product on your own or with a small team: a landing page, a sales site, a small app people install on their phone, maybe with paid subscriptions. You use Claude to help you build it. These skills give Claude the experience you'd otherwise only get by shipping, breaking things and fixing them.

## What each skill does for you

### `web-launch-checklist`: so your product works for real people, on real phones

Most problems in a small web product don't show up on your laptop. They show up on a customer's phone, after a payment, or the day you move to your own domain. This skill makes Claude check for them before you publish.

It helps you:
- **Plan the app before coding it.** A table of the variables that caused most real bugs (plan vs reality, estimated vs actual amounts, which period a payment belongs to, things that move on their own, undo, old data), plus a method with three test users and acceptance criteria.
- **Connect the services step by step.** Domain and DNS, Cloudflare Workers and secrets, inbox routing, a sending subdomain for email, Paddle from onboarding to website approval, GitHub Pages, forms and analytics.
- **Ship updates people actually get.** Installed apps (PWAs) keep old versions unless the version changes in every place it lives. The skill makes Claude update all of them, and includes a script that does it in one go.
- **Avoid phone-only bugs.** iPhone zooming into forms, the Android keyboard hiding your buttons, pages that won't scroll, layouts that drift sideways.
- **Get paid without surprises.** Setting up Paddle or a similar merchant of record: the legal pages they require before approving your site, webhooks that "succeed" but don't unlock anything, a customer paying with a different email than the one they signed up with, prices in the wrong currency for a country.
- **Move to your own domain safely.** Redirecting only when the new address is ready, and never asking users to reinstall the app before they have a backup (on iPhone, a reinstalled app starts with empty data).
- **Launch in several languages.** Testing the longest language, keeping the visitor's language from page to page, and matching demos to the visitor's country.
- **Catch problems automatically.** Broken links, low contrast, pages wider than the phone screen, missing SEO files and social preview images.

It comes with `check-pages.mjs`, which opens every page at phone, tablet and desktop sizes (and in each language), takes screenshots, and tells you what overflows, what's cut off at the edge, and where the header breaks onto two lines.

### `web-design-playbook`: so your product looks considered, not templated

A sales page has a few seconds to make someone stay. This skill gives Claude a set of design decisions that tested well with real visitors, mostly on phones, so you get a polished result in fewer rounds of "move this, make that smaller".

It helps you:
- **Give your product its own identity.** Colours, fonts and spacing defined once as tokens (with dark mode), and a `DESIGN.md` template to agree on the look before building.
- **Keep the first phone screen clear.** Headline, one sentence, at most two buttons. Everything else appears as people scroll.
- **Use patterns that sell the product.** A hero with a live-looking app screen, a "problem then solution" section, a three-step "how it works", real screenshots, prices shown in the visitor's currency.
- **Make carousels and cards behave.** Equal-height cards, carousel arrows that never cover the content, gentle autoplay that stops when touched.
- **Avoid the small things that look broken.** A blurred date under the iPhone status bar, a button that vanishes on a dark modal, a cut-off carousel, a lonely button on its own row, double wedges between angled sections.
- **Keep motion quick and optional.** Animations with a purpose, fast on phones, and switched off for people who prefer reduced motion.
- **Hand over with confidence.** A review at four screen sizes, light and dark, and in the longest language, so nothing is cut off and nothing breaks.

The two work on their own or together. When both are installed, the design skill uses the checklist's page checker for its final review.

## Installation

### Claude Code

macOS or Linux:
```
git clone https://github.com/gabrielaoliveranz/claude-web-skills.git
cp -r claude-web-skills/web-launch-checklist claude-web-skills/web-design-playbook ~/.claude/skills/
```

Windows (PowerShell):
```
git clone https://github.com/gabrielaoliveranz/claude-web-skills.git
Copy-Item -Recurse claude-web-skills\web-launch-checklist, claude-web-skills\web-design-playbook $HOME\.claude\skills\
```

To use them in one project only, copy them into that project's `.claude/skills/` folder instead.

### claude.ai and the desktop app

1. Click **Code › Download ZIP** on this page and unzip it.
2. Zip each skill folder on its own (`web-launch-checklist.zip`, `web-design-playbook.zip`).
3. In **Settings › Capabilities**, turn on code execution, then upload each ZIP under **Skills**.

### For the scripts (optional)

You need Node 18 or later and Playwright:
```
npm install playwright
npx playwright install chromium
```

The skills still work without the scripts. Claude then checks with its own screenshots, or asks you to look on your phone.

## How to use them

There's no need to call them by name. Claude loads a skill when the task matches. For example:

- *"Build a landing page for my booking app in English and Spanish, with prices by country."*
- *"Release a new version of the app and make sure installed phones update."*
- *"Connect Paddle in sandbox mode and check that a payment unlocks the app."*
- *"Check the site on phone, tablet and desktop before we publish."*
- *"Redesign the home page: there's too much on the first phone screen."*

You can also run the page checker yourself:
```
node web-launch-checklist/scripts/check-pages.mjs --base http://localhost:8000 --pages index.html,pricing.html --langs en,pt-PT --out shots
```

| Option | What it does | Default |
|---|---|---|
| `--base` | Site address (a local server) | `http://localhost:8000` |
| `--pages` | Pages to check, comma-separated | `index.html` |
| `--langs` | Languages to test (added as `?lang=`) | none |
| `--widths` | Widths in pixels | `320,390,820,1440` |
| `--header` | Header selector | `header, .nav` |
| `--out` | Screenshot folder | `shots` |

## What's inside

```
web-launch-checklist/
├── SKILL.md                  what to read for each kind of task
├── references/
│   ├── field-notes.md        every technical bug we hit, read once per project
│   ├── building-an-app.md    variables to decide before coding, data rules, access codes
│   ├── connecting-services.md domain, Cloudflare, email, Paddle, GitHub Pages
│   ├── i18n-architecture.md  translations, currencies, dates, holidays
│   ├── recipes.md            ready-made code (language links, app moves, checkout, webhooks, emails)
│   └── ...                   PWA, phones, CSP, payments, static-site checks, CSS traps, content
└── scripts/
    ├── check-pages.mjs       screenshots + overflow + clipped elements + wrapped header
    └── bump-version.mjs      raises a PWA's version everywhere at once
web-design-playbook/
├── SKILL.md                  what to read for each kind of task
├── references/
│   ├── field-notes.md        every design fix made on real devices, read once per project
│   ├── recipes.md            ready-made code and the exact values that worked
│   └── ...                   identity, phone screens, header, patterns, carousels, motion, review
└── assets/DESIGN-template.md template to define a new product's identity
docs/                         image for this README
```

## How it works

- **Loaded in parts:** each `SKILL.md` is short and has a table that maps the task to the reference files to read. Claude loads only what it needs.
- **Built from real bugs:** every rule fixed a real problem in production. For example: the Android keyboard covered dialog buttons; a security policy silently blocked the payment check; on iPhone each home-screen icon keeps its own storage.
- **Checked with screenshots:** `check-pages.mjs` scrolls through each page (so scroll animations run), deliberately ignores carousels and marquees that overflow by design, and reports what's left cut off at an edge.

## Contributing

Found a bug that a checklist item would have caught? Open an issue or a pull request with the item and a one-line reason.

## Licence

MIT. See [LICENSE](LICENSE).

Made by [Gabriela Olivera](https://gabrielaolivera.nz).
