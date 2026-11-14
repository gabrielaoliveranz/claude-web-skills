# Cards, carousels and media

Code for each of these is in `recipes.md`.

## Cards
- **Cards in a row share the same height and align their inner parts** (title, text, price, button) with CSS subgrid. Subgrid aligns within one row only; when two rows must match too, measure the tallest card with script and set a shared minimum height.
- **Nothing jumps on tap.** Remove hover transforms on touch devices (`@media (hover: hover)` around them), and give cards a visible pressed state instead (`:active`), because hover doesn't exist on phones.
- **Faint tints don't read as cards.** What worked: a solid card on a tinted page, a two-layer shadow (a tight dark one plus a soft wide one) and about 1.5rem of padding.
- **A lonely button on its own row looks broken.** Make it full width under the grid ("Add account").
- **Grids that fit evenly:** four per row, never three and a leftover.

## Carousels on phones and tablets
- Turn rows of cards into carousels below about 900px; equal, screen-sized cards on phones.
- **Arrows sit beside the dots, never on top of the cards;** the arrow you can't use fades out and stops taking clicks.
- **Gentle autoplay (5 to 6 s) that stops for good once the visitor touches it,** and no autoplay at all with reduced motion.
- **Make it readable without sight:** the wrapper has `aria-roledescription="carousel"` and a label; each card has `aria-roledescription="slide"` and `aria-label="2 of 4: Card title"`; the arrows are real buttons labelled "Previous" and "Next"; a counter ("02 / 04") sits in an `aria-live="polite"` element.
- **Track cut off at the edge:** the wrapper needs `grid-template-columns: minmax(0, 1fr)` and the track `width: 100%`.
- **Arc carousels** (cards on a curve) suit portrait tablets; keep the arc steady on phones.

## Tabs with a sliding highlight
- A pill that slides under the active tab is a sibling element painted behind the text. Check the active label's contrast against the pill, not the tab bar: an ancestor-only checker reads light text on the light bar and reports a false 1.2:1. `check-states.mjs` reads what is really painted behind the text.
- Every tab keeps a `:focus-visible` outline (`outline: 2px solid var(--accent); outline-offset: 2px`).

## Screenshots and media beside text
- **Match the media box to the image's shape.** In a two-column card, the image box stretched to the text column's height and `object-fit: cover` cropped away two thirds of a wide screenshot. `align-self: start` plus `aspect-ratio` on the box fixed it.
- **When the text is much taller than the image,** make the media `position: sticky` inside its own grid cell (top offset clear of the sticky header), so it travels with the text. Turn it off below the breakpoint where columns stack, or it covers the text.
- **Frame screenshots as product:** a thin border, a subtle shadow, rounded corners, a "window" frame with a soft gradient panel behind. Use the same treatment for screenshots from different apps.
- **Screenshots stay still.** Hover zoom and moving screenshots felt unstable.
- **Crop out off-palette elements** (a stray orange button in a blue site).
- **WebP at the displayed size, lazy-loaded below the fold,** with `width` and `height` set so nothing shifts.

## Button groups
- Centred; on tablet split them evenly (4 + 3), never a lonely last button.
- Calls to action read as actions and end with an arrow ("Get in touch →").
