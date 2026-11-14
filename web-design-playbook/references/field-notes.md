# Field notes: design fixes from three products

Real adjustments made after looking at each page on phones, tablets and laptops. Each line says what was wrong and what fixed it. Skim the whole list before designing; most of these come back on every project.

## Header and navigation
- **Header colour follows the section underneath.** It turns navy over dark sections and uses a lighter pill for its buttons. Sample only full-width sections: sampling cards on a listing page tinted the header blue.
- **Logo on dark sections.** Use a dark-mode logo with a transparent background, so it never shows a box.
- **One nav on every page.** Same labels and order, with "FAQs" and "Plans" spelled the same everywhere. Shared header, footer and contact form; a script checks that every page's footer is identical.
- **Header background on scroll.** Transparent over the hero, solid once you scroll.
- **Phone menu button.** A real menu button on phones; desktop links don't wrap into two lines.

## Hero and first screen
- **Two floating cards in the hero, not three.** Three made the phone screen busy.
- **Compact hero on phones,** with the photo beside the bio rather than stacked above it.
- **No headline highlight effect on phones.** It distracted on small screens; keep it for desktop.
- **Keep names together.** Use a non-breaking space so "New Zealand" never splits across lines.
- **Forward-looking copy.** Say what the visitor gets next, not the author's history.

## Cards
- **Equal, screen-sized cards on phones** for plans and privacy points, shown as carousels.
- **Compact plan cards on desktop.**
- **Tap state on touch screens.** Hover doesn't exist on phones, so give cards a visible pressed state.
- **Cards must not jump on touch.** Remove hover transforms on touch devices.
- **Project images stay still,** framed with rounded corners; moving screenshots felt unstable.
- **Window frames for screenshots.** Put screenshots in a "file window" frame with a soft gradient panel behind; they read as product, not decoration.
- **Privacy as tiles** with tags and small UI pieces, instead of a wall of text.
- **Arc carousel on portrait tablets,** steady arc on phones for question cards.

## Sections and data visuals
- **Diagram connectors from real positions.** Draw pipeline wires from the measured positions of the nodes; hand-placed lines broke at other widths.
- **Stagger labels on phones** in diagrams so they don't overlap.
- **Count-up numbers** for headline results; the final value must be readable with reduced motion.
- **Words that light up on scroll must all end up lit.** Fast scrolling left the last words grey and failed the contrast check.
- **Numbers as solid text** with at least 5.5:1 contrast, not low-contrast outlines.
- **One style for each repeated element.** The tools marquee had two styles on different pages; unify them.

## Footer
- **Phones: link lists side by side,** not one long column.
- **Align legal links** under the text, not under the icon.
- **Extra bottom space on phones,** so floating buttons don't cover the last links.
- **Back-to-top on every page,** with its ring centred.

## Layout at different widths
- **320px is the real minimum.** A logo card in a grid forced a column wider than the screen; let the column shrink (`min-width: 0`) and the logo scale down.
- **Two columns from 1180px, not 1280px.** Common laptops (1920px at 150% scaling) are about 1280px wide and missed the two-column layout.
- **Tablet: side menu as an icon rail; desktop: full side menu.** Phone layout unchanged.
- **Sheets open as a centred window on large screens,** full width on phones.
- **A lonely button on a second row looks broken.** Make it full width under the grid instead (for example "Add account").
- **Grids that fit evenly:** four accounts per row, the next four bills, envelopes in an even grid.

## Themes and colour
- **Several themes plus dark mode:** test every screen in each one. An unlock screen kept dark text in the dark theme.
- **Neutral rings when there's no budget yet,** coloured when there is one; over-budget in red, with words that say what's held ("$40 left of $120").
- **Coloured icon chips** for categories give a friendly look without extra illustrations.

## Motion and delight
- **Celebrations for real milestones** (a goal reached, a debt paid off), never for routine taps.
- **An animated welcome and unlock screen** set the tone; keep the rest of the app calm.
- **Smooth screen and panel transitions,** all switched off with reduced motion.
- **A design preview page before building.** Showing the new look on a single page for review saved rework.

## Copy inside the interface
- **Translate composed strings,** not just labels. "$6 over" was left in English inside the Spanish app.
- **Say in words what a visual shows.** "Holds $40 for groceries" next to the ring.
- **Clear page eyebrows** (small labels above titles) help people know where they are.
- **Demo data that shows every feature.** Include repeated purchases, past periods and paid items so every screen has something to show.

## App screens
- **The date above the greeting looked blurred on iPhone.** It sat under the status bar. Moving the header down fixed it (see the recipe). Light grey, thin, small text near the top also reads as blurred: use the main ink colour, weight 600, 15px.
- **Welcome and unlock screens fill the screen and stay still.** An animated cover looked broken on slow phones.
- **Every colour has one job.** A brand colour for the main action and celebrations (never as text on white), ink for text and hero cards, soft tints for highlights, and status colours (good, heads-up, over) used only to say how you're doing, never as decoration. Each tool or section can have its own soft tint.
- **Sticker-style illustrations** (thick dark outline, solid offset shadow) and line icons on a coloured chip give personality without stock imagery. No emojis.
- **Rounded cards (18 to 28px)** and plenty of air.
- **Session or item rows align in columns** (date with day, time with status chip). Ragged rows look careless.
- **Version number at the bottom of settings,** so support questions start with "which version?".
- **Bottom tab bar with five tabs at most** on phones; forms open as sheets.
- **Settings as a grouped list** (profile card, then rows that open sheets) rather than one long form.
- **Exports carry the brand:** spreadsheet sheets with a branded header, KPI cards and coloured status; PDFs with the logo. Store spreadsheet text as inline strings so nothing turns into a formula.

## Sales site and marketing pages
- **The contact button inside a dark modal disappeared.** A dark "ink" button on a dark surface; use the accent button there.
- **A privacy carousel was cut off on phones** because the track was wider than its wrapper. Use `grid-template-columns: minmax(0, 1fr)` on the wrapper and `width: 100%` on the track.
- **Floating chips overlapped.** Place each one on a loose grid, and on phones spread them across the full width.
- **Features as buttons:** centred, and split evenly on tablet (4 + 3), never a lonely last button.
- **Show the price for the visitor's country** automatically. A visible region picker looked unfinished.
- **Footer pages open at the top,** not at the scroll position of the previous page.
- **The demo needs a way back** to the website, and a "try it free" button.
- **Lists on the page must match the product:** countries, languages, features.

## Section shapes
- **One section transition style per site** (for example a single diagonal cut), not a mix.
- **Never cut both edges where two cut sections meet;** it leaves a double wedge.
- **A heading after a cut gets at least 64px of top padding** (80px if the section itself is cut on top).
- **The area revealed by a cut shows the page background,** so the section between two cut bands must use that same background.
