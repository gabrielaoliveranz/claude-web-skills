---
name: web-design-playbook
description: "Use when designing, restyling or reviewing a landing page, sales site or app screen for a small product. Unlike general taste guides, every rule and value here was tuned on real phone screenshots: what fits on the first phone screen, headers that never wrap, carousels, cards and screenshots, forms and empty states, motion that passes accessibility checks, tap targets and focus, dashboards and data, plus tested CSS and JS recipes with the exact timings and breakpoints that worked."
---

# Web design playbook

These patterns were refined across a consultancy site, a budgeting app and a SaaS sales site, mostly from feedback on real phone screenshots. Each product keeps its own identity: start from its tokens, and never borrow another product's look.

## How to use it

1. **New product:** fill in `assets/DESIGN-template.md` with the owner first (colours, type, tone, references they like), and save it as the product's `DESIGN.md`.
2. **Existing product:** read its `DESIGN.md` or its CSS tokens before touching anything, and list what not to touch.
3. Read `references/field-notes.md` once per project, then the references that match the task:

| Working on... | Read |
|---|---|
| Colours, fonts, tokens, dark mode, logo, design references | `references/identity.md` |
| What goes on the first screen, especially on phones | `references/less-per-screen.md` |
| Header, anchors, navigation, language picker, footer | `references/header-and-nav.md` |
| Hero and section ideas | `references/patterns.md` |
| Cards, carousels, tabs, screenshots beside text, button groups | `references/cards-and-carousels.md` |
| Contact forms, inputs, sheets, empty states, toasts, settings | `references/forms-and-states.md` |
| Animations, scroll effects, marquees, physics, celebrations | `references/motion.md` |
| Contrast, tap targets, keyboard focus, icon-only links, headings, copy | `references/readability.md` |
| Dashboards, tables, charts, KPI cards, contrast audits | `references/dashboards-and-data.md` |
| A newsletter page or email that should look like the site | `../web-launch-checklist/references/newsletter-and-email.md` |
| Handing over | `references/review.md` |
| Ready-made code and the exact values that worked (timings, breakpoints, positions) | `references/recipes.md` |
| Every design fix we made on real devices (header, cards, footer, widths, themes, copy) | `references/field-notes.md` |

4. Before handing over, run the review in `references/review.md`. If the `web-launch-checklist` skill is installed (it sits next to this one, for example in `~/.claude/skills/web-launch-checklist/`), also run its `scripts/check-pages.mjs` (with `--schemes light,dark` when the product has a dark theme) and `scripts/check-states.mjs`.

## The rules people notice most

- On phones, the first screen shows the headline, one sentence and at most two buttons. Everything else waits until the visitor scrolls.
- Nothing gets cut off at the screen edge, and the header never wraps, in any language.
- Every link and button stays readable on hover, focus and press, shows keyboard focus, and is at least 44px to tap.
- Animations are quick on phones, move rather than fade text, and show the final state with `prefers-reduced-motion`.
