# Field notes: design fixes from two websites and two apps

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

## Personal or consultancy website (from its spec and change log)
- **Two audiences, two doors.** A page that serves employers and clients sends each to its own action within two clicks. Put two cards under the hero ("Hiring?" / "Running a business?"). Each page has one main audience.
- **At most two dark sections per page.** Four dark bands made the home page heavy and 8,400px tall. The redesign cut it to about 5,000px.
- **Project bands become cards** (screenshot, question, three figures, "Read the case study"), side by side on desktop and stacked on phones.
- **A scroll story spanning three screens became four cards on one screen.**
- **Unify screenshots from different apps** with the same thin border and a subtle shadow, and keep them still (no hover zoom).
- **Crop screenshots that show off-palette elements** (a stray orange button in a blue site).
- **Third-party embeds must take your fonts and colours.** A newsletter form in the provider's own font looked pasted in. Style it, or use your own form connected by API.
- **Check overlaps at real widths.** At 1272px a large hero name covered the text of a floating card.
- **A huge moving outline-text ribbon of tools** was replaced by one still line listing them, separated by middle dots.
- **Cut empty space between sections by about a third** when the page feels long.
- **Watch light-to-dark transitions under a sticky header.** The logo passed through a dark box at the seam.
- **Hero particles or motion must not compete with the headline** while the page loads.
- **Try big visual changes on a branch** and compare before merging.
- **Keep what works.** List what not to touch (the copy that lands, the palette, the signature section) before a redesign starts.
- **A redesign reaches every page, not only the home page.** The newsletter pages, legal pages, 404 page and emails were still on the old fonts and cuts and looked dated next to the new home page. List them before starting, and save the new tokens in the brand notes.
- **A testimonial with an avatar breaks on phones before anything else.** A single row with the circle, name, company, link and stars wrapped badly at 390px. Use the grid recipe in `recipes.md` (circle beside the name and company, link and stars on their own line below).
- **Pricing shown as "From $X"** until prices are final, with the same call to action repeated at the end. Use a labelled example dashboard until the first approved case study exists.
- **Measure the calls to action** (clicks on "Get in touch" vs "Download CV") to know which audience arrives.
- **SEO per page:** one title and description, with the words a local customer would search for.
- **Images as WebP at the right size,** with lazy loading for dashboard screenshots.
- **Buttons are pills, and calls to action end with an arrow** ("Get in touch →"). Cards with a small radius, no shadow at rest and no gradients suit an editorial look.

## Collecting design references
- **Keep a table: idea, where it came from, where it goes in your product.** For example: "number cards with a small label and coloured figure / a finance app / Home and Insights". It turns a moodboard into decisions.
- **Patterns that came out of that table and worked:**
  - light grey page with white rounded cards and grouped lists;
  - big bold titles with one accent colour;
  - pill buttons and centred dialogs;
  - a dark toast with an action ("Done · Download", "Undo");
  - a coloured bar on cards by type;
  - a week grid with coloured blocks and hatched blocked time;
  - a mini month calendar on desktop;
  - a day progress bar;
  - the month-end close as a guided ritual.

## Guides, notices and legal pages (2026-11-27)
- **A notice box in a colour outside the palette looks like an error from another site.** The amber notice came from a default. Use the brand's soft tint (indigo on its pale indigo background) for every notice on every page, and keep the contrast above 4.5:1.
- **A guide with only text feels unfinished.** Add a screenshot beside the steps that have a screen, and a sticky contents list (recipe in `recipes.md`).
- **The contents list lit the wrong entry** when a short section never crossed the observer's threshold. Scroll position with a click lock fixed it.
- **A 404 page needs the full header and footer and a way home,** not a bare message.
- **Contact forms for sensitive fields:** one line above the fields saying what not to write (for example patient data), in the brand's notice style.

