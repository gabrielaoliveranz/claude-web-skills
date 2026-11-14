---
name: web-design-playbook
description: "Use when designing or restyling a landing page, sales site or app screen for a small product: identity tokens, what to show per phone screen, header, hero and section patterns, carousels, motion and the review to run before handing a design over."
---

# Web design playbook

These patterns were refined across a consultancy site, a budgeting app and a SaaS sales site, mostly from feedback on real phone screenshots. Each product keeps its own identity: start from its tokens, and never borrow another product's look.

## How to use it

1. **New product:** fill in `assets/DESIGN-template.md` with the owner first (colours, type, tone, references they like), and save it as the product's `DESIGN.md`.
2. **Existing product:** read its `DESIGN.md` or its CSS tokens before touching anything.
3. Read the references that match the task:

| Working on... | Read |
|---|---|
| Colours, fonts, tokens, dark mode | `references/identity.md` |
| What goes on the first screen, especially on phones | `references/less-per-screen.md` |
| Header, language picker, footer | `references/header-and-nav.md` |
| Hero and section ideas | `references/patterns.md` |
| Rows of cards, carousels, button groups | `references/cards-and-carousels.md` |
| Animations and scroll effects | `references/motion.md` |
| Contrast, line length, copy tone | `references/readability.md` |
| Handing over | `references/review.md` |

4. Before handing over, run the review in `references/review.md`. If the `web-launch-checklist` skill is installed, also run its `check-pages.mjs`.

## The three rules people notice most

- On phones, the first screen shows the headline, one sentence and at most two buttons. Everything else waits until the visitor scrolls.
- Nothing gets cut off at the screen edge, and the header never wraps, in any language.
- Animations are quick on phones and still on request (`prefers-reduced-motion`).
