# Dashboards and data screens

Lessons from four design passes on a data dashboard (six pages, maps, tables and charts), each verified on the running app, plus the insight screens of two finance-style apps.

## Tables
- **Right-align every numeric column;** keep text columns left-aligned. Left-aligned numbers were the default and looked unfinished.
- **One decimal precision per column** (0.20, never 0.2 next to 0.18). Whole numbers where decimals add nothing.
- **Units in the cell** ("12.4 km"), not only in the header.
- **Totals and summary rows** stand apart (weight or a rule), and a "Summary" card (total, highest, average) helps more than a long table.

## Cards and surfaces
- **Faint tints don't read as cards.** Two rounds of "a bit more visible" border and tint still looked like an outline. What worked: a solid white card on a tinted page, a two-layer shadow (a tight dark layer plus a soft diffuse one) and generous padding (about 1.5rem).
- **One card per KPI,** not one container holding several numbers.
- **KPI cards:** a small uppercase label with letter-spacing on top, the number large in the accent colour, and always the count that explains it ("$84,000 · 4 sessions").
- **A short accent mark beside section headers** gives hierarchy without heavy styling.

## Charts
- **One colour language across the whole product.** Charts recoloured to the same colour-blind-safe palette as the map (blue, amber, orange).
- **Hover must be obvious:** a lighter shade of the same colour at about a 60% blend with white. A 40% blend was too subtle.
- **Tooltips use human labels** ("Suitability level: Excellent, Parcels: 16,414"), never raw field names.
- **Axis labels need contrast too.** They failed at 3.0:1 until coloured explicitly.
- **"This month vs last month"** as two lines or paired bars, with a dark detail on hover.
- **Say what the number means.** A one-sentence written insight ("Your busiest day was Friday") next to the chart, and "how this is calculated" on tap.
- **When money is shown over time, show volume beside it.** With inflation, "+15% income" can mean prices, not more work.

## Contrast audits
- **Audit every rendered text and background pair,** including the framework's own defaults (captions, table headers, chart axes). Build a table: page, element, colour, background, size, ratio, required minimum, result.
- **Canvas-rendered tables can't be fixed with CSS.** Change the theme's text colour token instead.
- **Composite translucent backgrounds before computing contrast.** An automated scan reported two callouts as failing (1.9:1) that were really 13:1. Its maths ignored the colour underneath.
- **Large text (24px+, or 18.66px bold) needs 3:1;** everything else needs 4.5:1.

## Structure and tokens
- **One theme file holds every colour, shadow and spacing value.** Components import it; nothing defines its own colour. The only literals are the brand colours.
- **Derive tints with explicit blend helpers,** not by picking hex values by eye.
- **Callouts (warning, info) are your own component** with a tint and an accent, not the framework's default boxes.

## Footers in app frameworks
- **A full-bleed coloured footer inside a framework's layout fought four flexbox rules at once:** `flex-shrink`, `flex-basis`, `align-items: stretch` on a column parent, and the framework's own `max-width: 100%`. Overriding all four (`flex: none; align-self: flex-start; max-width: none`) worked, but the result looked disconnected from the sidebar.
- **What stayed:** a plain divider, three columns (pages, data sources with real URLs, project links), and typography instead of a background band.

## Copy on data screens
- **Write captions and disclaimers in plain, confident business language.** Use no jargon ("n=5", "provenance") and no file paths or script names in visitor-facing text.
- **Change the wording, never the facts.** Counts, thresholds and correlations stay exactly as they are.
- **Cite real sources with real links,** taken from the project's own documentation, never invented.
- **Credit icons and data sources** where they are used.
