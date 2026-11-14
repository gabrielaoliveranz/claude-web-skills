# Set the identity first

## Tokens
- Put every colour, font, radius and shadow in tokens on `:root`, with a dark-mode set. Components only use tokens; the only literal values are the brand colours, defined once.
- **Neutrals carry a slight hue from the accent.** One accent colour for actions, used sparingly.
- **Every colour has one job:** a brand colour for the main action and celebrations (never as text on white), ink for text, soft tints for highlights, status colours only for status.
- **Derive tints with `color-mix()`** or a helper, not hex values picked by eye.
- **Several themes or dark mode means testing every screen in each.** An unlock screen kept dark text in the dark theme.
- **Write it down:** a short `DESIGN.md` per product (start from `assets/DESIGN-template.md`) so future changes stay consistent, including a list of what not to touch.

## Type
- **Pick a deliberate pairing:**
  - a serif for headlines, a sans for text and a mono for data labels (an editorial or consultancy feel);
  - one geometric sans throughout (a friendly app feel);
  - a characterful display face for the logo and big numbers only.
- **Self-host fonts** as `woff2`, and list them in the licence file. A single font still loaded from Google Fonts was render-blocking the most prominent headline and contradicted the privacy policy.
- **Keep variable fonts variable.** Download the same `woff2` files the font service serves (latin and latin-ext) and declare the real range (`font-weight: 600 800`); the optical-size axis then works on its own.
- **Declare only weights the font has.** A headline declared `font-weight: 900` in a family whose maximum is 800 was silently drawn at 800 for months. State what renders.
- **Embed the fonts in single-file apps** (base64 `woff2`, licence permitting) so they work offline.

## Logo and icons
- **A logo with a transparent background, in a light and a dark version,** so it never shows a box on a coloured section.
- **App icons:** a solid ink square with one white letter in the logo font reads at every size.
- **Sticker-style illustrations** (thick dark outline, solid offset shadow) and line icons on a coloured chip give personality without stock imagery. No emojis in the interface.

## Collecting references
- **Keep a table: the idea, where it came from, where it goes in your product.** "Number cards with a small label and coloured figure / a finance app / Home and Insights". It turns a moodboard into decisions.
- **Study other products' design files** (fintech and health apps are good references), then build a one-page preview of the new look for review before touching the product.
- **When porting from a reference, the reference wins** for colour, type and motion; "close enough" existing tokens had to be redone.
