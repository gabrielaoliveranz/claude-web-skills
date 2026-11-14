# Before handing a design over

## Look at it
- **Screenshots at 320, 390, 820 and 1440 px,** plus every width where the layout switches, in light and dark, and in the longest language. With the `web-launch-checklist` skill installed, `check-pages.mjs --schemes light,dark --langs ...` takes them all and flags overflow.
- **Nothing clipped at the edges** (floating labels, big numbers, chips), no sideways scroll, and the header on one line.
- **Check overlaps at real in-between widths.** At 1272px a large hero name covered the text of a floating card.
- **Look at it on a real phone.** Most of these rules came from real phone screenshots.

## Try it
- **Hover, tab through and press every link and button.** Each keeps its contrast and shows focus (`check-states.mjs`).
- **Tap every card and carousel on a touch screen:** nothing jumps, and pressed states show.
- **Turn on reduced motion:** every piece of content is visible, every counter shows its final value.
- **Fill in and send each form,** including the error case.

## Read it
- **Every copy of a number matches its source** (page, share card, PDFs).
- **One style per repeated element** across pages (the same marquee, the same section cut, the same pull-quote).
- **What not to touch is still untouched:** the copy that lands, the palette, the signature section.

## Hand over
- Before and after screenshots of the changed parts.
- The tokens or components added, and where they're documented (`DESIGN.md`).
- What you couldn't check (a real iPhone, a slow connection, a language you can't read).
