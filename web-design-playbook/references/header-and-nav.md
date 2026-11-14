# Header, navigation and footer

## Header
- **A sticky pill header with a frosted background** (`backdrop-filter`), with a solid-colour fallback under `@supports not (backdrop-filter: blur(1px))`, offset by the safe-area inset on phones.
- **Transparent over the hero, solid once you scroll.**
- **Optional: the header takes the colour of the full-width section underneath.** Sample only full-width sections: sampling cards on a listing page tinted the header blue. Use a dark-mode logo with a transparent background so it never shows a box on dark sections.
- **Watch the seams.** Under a sticky header, the logo passed through a dark box where a light section met a dark one.
- **The header never wraps, in any language.** Test the longest one; under 420px shrink the call-to-action's padding and font rather than letting the language flag drop to a second line.
- **A real menu button on phones;** desktop links stay on one line.

## Jumping to sections
- **A sticky header hides the heading you jump to.** Add `scroll-margin-top` (header height plus a little air) to every anchor target.
- **Highlight only the current section** in the nav, and update it on scroll in both directions; two items lit at once looked like a bug.
- **Pages opened from the footer start at the top,** not at the previous page's scroll position.

## One navigation everywhere
- **Same labels, same order, same spelling on every page** ("FAQs" and "Plans", never "FAQ" on one page and "Questions" on another).
- **Every page has a way back** to the rest of the site, including landing pages and the demo ("Back to the website" and "Try it free").
- **No build step? Check the copies.** When the header and footer are pasted into each page, `check-static.mjs --same footer,header` fails as soon as one copy drifts.

## Language picker
- Flags plus language names. On phones the menu spans the bar's width (the header becomes its anchor); it opened off-screen to the left before.
- Keep `?lang=` on internal links so the choice survives pages and blocked storage.

## Footer
- **Phones: link lists side by side,** not one long column.
- **Align legal links under the text,** not under the icon beside it.
- **Extra bottom space on phones,** so floating buttons don't cover the last links.
- **Back-to-top on every page,** appearing after about 1.2 screen heights, with its ring centred.
- **Social links:** only the ones you keep up. Icon-only links need an `aria-label` (see `readability.md`).
