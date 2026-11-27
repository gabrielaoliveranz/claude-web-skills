# Patterns that work
- Hero:
  - a headline with a slow colour sweep across its words;
  - a phone or data visual with a few floating labels showing real data, kept inside the screen;
  - on phones the visual turns gently sideways on scroll, never stays tilted back.
- Problem to solution: cards whose problem headline gets struck through with an accent line, revealing the solution card underneath. On desktop the cards go one after another; on phones each one goes as soon as it's visible.
- "How it works" in three steps: number, short title, one sentence and a small illustration of that step.
- A colourful marquee of audiences or tools, with the loop duplicated by script, never by hand.
- A background or wall made of real product screenshots.
- One big number (countries, clients, hours saved) in gradient text with floating chips around it. On phones, move the glow to the bottom and spread the chips across the full width.
- Bento grids for privacy or features; an arc carousel on portrait tablets; data pipelines whose connectors are drawn from the real positions of the nodes.

## User guide with step-by-step screenshots
Companies show the real screen beside each step, not only text. Layout that worked:
- A sticky contents list on the left (a row of chips on tablets, hidden or compact on phones), the steps on the right.
- Each step is a section with a number, a short heading, one or two sentences, and a phone-shaped frame with the real screenshot. Screens come from the product's demo mode, one set per language and per light and dark theme, loaded by script from a predictable path (`/shots/<lang>/<name>-light.webp`).
- Steps without a screenshot yet render as text only. Never leave an empty frame.
- Every page of the guide needs a way home and a way to the next step.

