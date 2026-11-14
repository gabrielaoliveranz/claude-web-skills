# Readability and accessibility

## Contrast
- **4.5:1 for text, 3:1 for large text** (24px and up, or 18.66px bold and up), in every state: at rest, hover, keyboard focus and pressed. Resting-state scanners miss the other three; run `check-states.mjs` from the `web-launch-checklist` skill.
- **Style `:active` too.** The browser's default colour for a link being pressed is red (`#EE0000`), which measures 4.0:1 on white and fails; any link you didn't style for that state shows it.
- **Figures people must read are solid text,** at 5.5:1 or more. Outlined or low-opacity numbers failed.
- **Labels on dark sections** need their own colour token; muted text tuned for a light page drops below 3:1 on navy.
- **A muted accent is rarely readable as text.** A "muted accent" pull-quote measured about 3:1 on the page background; a muted ink colour gave 5.9:1.
- **Translucent backgrounds:** compute contrast against the colour underneath, not the tint alone (see `dashboards-and-data.md`).

## Touch and keyboard
- **Tap targets at least 44 by 44px** (Apple's guideline and WCAG's enhanced level; the AA minimum is 24px). Icon links kept 52px on desktop and held 44px on narrow screens, with a tighter gap so all four still fit on one row at 320px.
- **Every interactive element shows keyboard focus:** `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`. Never remove the outline without replacing it. `check-states.mjs` warns about elements whose focus shows no change.
- **Every panel, sheet and dialog closes with its X button, Escape and the phone's back gesture.**
- **Move focus to what just appeared** when it replaces what the person was using (a "Message sent" panel replacing a form).

## Icon-only controls
- **The icon is the whole control, so the control needs the name:** `aria-label="LinkedIn"` (and a matching `title` for a desktop tooltip) on the link, `aria-hidden="true"` on the icon inside, so the name isn't read twice.
- **Draw icons with `currentColor`** (an inline SVG, or a `mask-image` on a span) so they follow the link's colour in every state and theme.
- **Credit icon sets** (Lucide, Flaticon) in the licence file, and list only icons you actually use.
- **Use generic icons for other companies' services** where their brand rules restrict logos.

## Email links
- **A `mailto:` link alone looks broken on desktops with no mail app.** Keep the real `href="mailto:..."` (it works without JavaScript) and also copy the address to the clipboard on click, showing "Copied". Read the address from the `href`, so the two can't drift apart. Code in `recipes.md`.

## Structure
- **One `<h1>`, and heading levels never skip** (h2 to h4). A form injected by a third-party script added an `h4` under an `h2`; give it `role="heading" aria-level="3"` or restyle a proper level.
- **`lang` on `<html>`,** with the right regional variant (`en-NZ`, `es-AR`), and one spelling convention throughout.
- **`alt` on every image:** a description of what matters in it, or `alt=""` for decoration.

## Reading comfort
- **Body text around 65 characters wide;** `text-wrap: balance` on headings.
- **Keep names together** with a non-breaking space (`New&nbsp;Zealand`).
- **Small text near the top of an iPhone screen looks blurred** if it's light grey and thin; use the main ink colour, weight 600, at least 15px (see `recipes.md`).
- **Inputs at 16px or more,** or iPhone Safari zooms into the page.

## Copy
- **Plain, confident words, no jargon.** Describe what the product does, looking forward: what the visitor gets next, not the author's history.
- **Say in words what a visual shows:** "Holds $40 for groceries" beside the ring, "$40 left of $120" when over budget.
- **Describe what it really does,** not what people might assume ("tells you what to invoice", not "invoices for you").
