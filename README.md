# Web skills for Claude

Two Claude skills for building small web products without repeating the usual mistakes. They come from shipping three real products (a consultancy website, an installable budgeting app, and a paid app with its sales site) over about 250 commits. Every rule is a bug that actually happened.

[![Screenshots from check-pages.mjs at 390, 820 and 1440 px](docs/check-pages.png)](docs/check-pages.png)

*Screenshots taken by `check-pages.mjs` at phone, tablet and desktop widths. The script also flags anything that overflows, gets cut off at an edge, or makes the header wrap.*

## What's included

| Skill | What it covers |
|---|---|
| [`web-launch-checklist`](web-launch-checklist/SKILL.md) | The technical side: installable app (PWA) releases, iPhone and Android quirks, Content Security Policy, domain moves, payments with Paddle and similar providers, automated checks, multilingual sites and CSS traps. Ships with two scripts. |
| [`web-design-playbook`](web-design-playbook/SKILL.md) | The design side: identity tokens, what to show per phone screen, header and navigation, hero and section patterns, cards and carousels, motion, accessibility, and a review before handing over. Ships with a `DESIGN.md` template. |

They work on their own or together. When both are installed, the design skill uses the checklist's page checker.

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
├── references/               one file per topic (PWA, phones, domains, payments, languages, CSS...)
└── scripts/
    ├── check-pages.mjs       screenshots + overflow + clipped elements + wrapped header
    └── bump-version.mjs      raises a PWA's version everywhere at once
web-design-playbook/
├── SKILL.md                  what to read for each kind of task
├── references/               identity, phone screens, header, patterns, carousels, motion, review
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
