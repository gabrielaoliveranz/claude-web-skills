# Motion

Every animation needs a job: show a change, lead the eye, or reward a real milestone. Tested code and timings are in `recipes.md`.

## Rules that held on real phones
- **Quick on phones.** Scroll-driven effects should need little scrolling, and staggered delays are for desktop only: cards 2 and 3 waited 1 to 2 seconds inside a phone carousel.
- **Respect `prefers-reduced-motion` by showing the final state at once:** every word lit, every counter at its final value, every revealed card visible. Content that waits for an animation is content some visitors never see.
- **Gate motion behind a class set by script** (for example `html.motion-ready`, added only when JavaScript runs, `IntersectionObserver` exists and reduced motion is off). Without it, the page is complete and static.
- **Links change colour instantly** on hover; keep longer transitions for larger elements. A 0.25s colour fade was caught half-way at 1.3:1 contrast.
- **Move, don't fade, text that must stay readable.** Text at partial opacity fails contrast on the frames in between. Slide it in at full opacity; for an exit, let it drop away rather than fade out.
- **Words that light up on scroll must all end up lit.** Fast scrolling left the last two words grey. Light everything once the section has scrolled past.
- **Decorative animated text is `aria-hidden`,** with the real sentence in an always-rendered `.sr-only` element (not `display: none`), so screen readers and accessibility scanners read the steady version.

## Scroll reveals
- **Use a small threshold.** An `IntersectionObserver` with `threshold: 0.2` never fired for a tall section on a phone, because 20% of it can't be on screen at once. Use 0 to 0.1, or a negative `rootMargin`.
- **Sticky scrollytelling** (a pinned canvas that changes with scroll): keep the pin short on phones (`calc(360px + 45vh)` worked; the first version needed far too much scrolling), and keep a plain card version of the same content as the accessible source.

## Marquees and loops
- **Duplicate the items with script, never by hand.** A hand-typed second copy drifted (one separator short), the halves were different widths and the loop jumped every 20 seconds. Clone the real list and mark the clone `aria-hidden="true"`.
- **Subtract half a gap.** With `gap` on the track, two identical halves still don't loop at exactly -50%: the gap between the halves is counted once. Animate to `translateX(calc(-50% - var(--gap) / 2))`. Measured: 28px short before, 0px after.
- **Start the animation only after the clone exists,** or it scrolls into empty space for visitors without JavaScript.

## Physics and canvas
- **Physics engines (Matter.js):** give letters of one word the same negative `collisionFilter.group` so they don't shove each other, and lock rotation with `Body.setInertia(body, Infinity)` after creating the body (the constructor option didn't hold).
- **Engines can eat a bounce.** Matter's resting-contact solver removed all rebound at any restitution; the fix was to keep the engine for free fall and resolve the floor contact by hand.
- **A body that hasn't started moving looks "settled".** Guard settle detection with a "has started falling" flag.
- **Time cycles with `performance.now()`,** never chained `setTimeout`s, which drift.
- **Keep motion out of the headline's way while the page loads.** Hero particles that compete with the first line make the page feel slow.

## Delight, in the right places
- **Celebrations for real milestones** (a goal reached, a debt paid off, every dollar assigned), never for routine taps.
- **Count-up numbers** for headline results, readable at their final value with reduced motion.
- **An animated welcome sets the tone; the rest of the app stays calm.** But a welcome or unlock screen that animates in looked broken on slow phones: keep those screens still and full-screen.
- **Smooth screen and panel transitions,** all switched off with reduced motion.
