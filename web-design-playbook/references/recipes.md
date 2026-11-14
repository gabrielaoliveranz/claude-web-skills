# Recipes: tested code and tuned values

Copy these instead of designing the behaviour from scratch. Every value below was tuned on real phones after the first version felt wrong (too slow, cut off, too busy). Adjust the selectors to your markup.

## Tuned values at a glance

| What | Value that worked | What went wrong before |
|---|---|---|
| Phone breakpoint for "less per screen" | `max-width: 560px` | Header CTA, announcement and two hero buttons all on one screen |
| Carousel breakpoint | `max-width: 900px` | |
| Header CTA and floating buttons appear | after scrolling 55% of the hero | Floating "Contact" button covered the second hero button |
| Back-to-top appears | after 1.2 viewport heights | Visible on load, covering buttons |
| Strike-through line | `.55s`, `cubic-bezier(.7, 0, .2, 1)`, starts `.15s` after the card enters | |
| Solution card after the strike | fades in from `.65s`, `translate 22px → 0`, `scale .96 → 1` | |
| Stagger between cards | desktop only: `1.1s` per card; phones `0s` | Cards 2 and 3 waited 1 to 2 s inside a carousel |
| Scroll-pinned "mess to tidy" scene | pin height `calc(360px + 45vh)`, progress ramp over 50% of it | Needed far too much scrolling |
| Hero phone on scroll (phones) | `rotateY(-18deg)` plus `rotateZ(2deg)` at the end | Tilted backwards and stayed that way |
| Hero phone on desktop | follows the pointer: `rotateY(±16deg)`, `rotateX(±12deg)` | |
| Floating labels (phones) | `8px` from each edge, `4px` under 560px, no parallax drift | Labels cut off at both edges |
| Header CTA under 420px | `padding-inline: 12px; font-size: .84rem`, logo `1.2rem` | The longest language pushed the flag to a second line |
| Language menu (phones) | full width of the header bar | Opened off-screen to the left |
| Big gradient number | `padding: .06em .12em .04em .04em` plus the same negative margin | Last digit clipped |
| Glow behind chips (phones) | 150% wide, `bottom: -38%`, opacity `.85` | Glow sat top-right, chips crammed on the left |

## Strike-through reveal (problem → solution)

```css
.js .fix h3 { position: relative; justify-self: start; transition: color .4s ease calc(.5s + var(--dl, 0s)); }
.js .fix h3::after { content: ""; position: absolute; left: -3px; right: -3px; top: 55%; height: 3px; border-radius: 99px;
  background: var(--accent); transform: scaleX(0); transform-origin: left;
  transition: transform .55s cubic-bezier(.7, 0, .2, 1) calc(.15s + var(--dl, 0s)); }
.js .fix.in h3 { color: var(--muted); } .js .fix.in h3::after { transform: scaleX(1); }
.js .fix .fix-new { opacity: 0; translate: 0 22px; scale: .96;
  transition: opacity .45s ease calc(.65s + var(--dl, 0s)), translate .55s ease calc(.65s + var(--dl, 0s)), scale .55s ease calc(.65s + var(--dl, 0s)); }
.js .fix.in .fix-new { opacity: 1; translate: none; scale: 1; }
.fix:nth-child(2) { --dl: 1.1s; } .fix:nth-child(3) { --dl: 2.2s; }
@media (max-width: 900px) { .fix:nth-child(n) { --dl: 0s; } }      /* carousel: no waiting */
@media (prefers-reduced-motion: reduce) { .js .fix h3::after { transform: scaleX(1); transition: none; } .js .fix .fix-new { opacity: 1; translate: none; scale: 1; transition: none; } }
```
Add the class `in` with an IntersectionObserver when the card is visible.

## Show secondary buttons only after the hero (phones)

```js
(function () {
  var hero = document.querySelector('.hero'), root = document.documentElement;
  if (!hero) { root.classList.add('past-hero'); return; }
  var busy = false, update = function () { root.classList.toggle('past-hero', scrollY > hero.offsetTop + hero.offsetHeight * 0.55); busy = false; };
  addEventListener('scroll', function () { if (!busy) { busy = true; requestAnimationFrame(update); } }, { passive: true }); update();
})();
```
```css
@media (max-width: 560px) {
  html:not(.past-hero) .nav-tools .btn-primary { display: none; }          /* display, not opacity: no ghost space */
  html:not(.past-hero) .fab-dock { opacity: 0; pointer-events: none; }
  .nav-tools .btn-primary { white-space: nowrap; } .nav-tools { flex-wrap: nowrap; }
  .announce { font-size: .82rem; padding-block: 6px; }
}
@media (max-width: 420px) { .nav-tools .btn-primary { padding-inline: 12px; font-size: .84rem; } .logo-word { font-size: 1.2rem; } }
```

## Back-to-top

```js
(function () {
  var toTop = document.querySelector('.to-top'); if (!toTop) return;
  toTop.addEventListener('click', function () { scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
  addEventListener('scroll', function () { toTop.hidden = scrollY < innerHeight * 1.2; }, { passive: true });
})();
```
Start the button with the `hidden` attribute, and make sure the CSS has `[hidden] { display: none !important; }`.

Never name the variable `top` (or `name`, `status`, `parent`, `self`) in a plain script: those are read-only browser globals. `var top = …` silently keeps `window.top`, so the click listener lands on the whole window and every click on the page scrolls to the top.

## Hero phone: pointer on desktop, sideways on phones

```css
.phone { transform: perspective(1400px) rotateY(calc(var(--px, 0) * -16deg)) rotateX(calc(var(--py, 0) * 12deg + var(--s, 0) * 22deg)) translateY(calc(var(--s, 0) * -24px)); transition: transform .35s ease; }
@media (max-width: 900px) {
  .phone { transform: perspective(1400px) rotateY(calc(var(--s, 0) * -18deg)) rotateZ(calc(var(--s, 0) * 2deg)); }
  .float { translate: none; }                                   /* no drift: labels stay on screen */
  .f1, .f3 { left: 8px; } .f2, .f4 { right: 8px; }
}
@media (max-width: 560px) { .f1 { left: 4px; } .f4 { right: 4px; } .float-in { max-width: calc(100vw - 40px); } }
```
`--px`/`--py` come from `pointermove` on the hero (−0.5 to 0.5, only when `(pointer: fine)`); `--s` is scroll progress through the hero (0 to 1).

## Carousel on phones and tablets: arrows beside the dots

```css
@media (max-width: 900px) {
  .car-wrap { display: block; position: relative; }
  .car-dots { display: flex; justify-content: center; align-items: center; gap: 6px; min-height: 40px; margin-top: 10px; }
  .car-dots i { width: 7px; height: 7px; border-radius: 99px; background: color-mix(in srgb, var(--ink) 18%, transparent); transition: width .3s; }
  .car-dots i.on { width: 22px; background: var(--accent); }
  .car-btn { position: absolute; bottom: 0; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; }
  .car-btn.prev { left: calc(50% - 96px); } .car-btn.next { right: calc(50% - 96px); }
  .car-btn:disabled { opacity: .35; pointer-events: none; }
  .car-off { opacity: .55; scale: .95; }                      /* neighbouring cards peek, dimmed */
}
```
Autoplay every 5 to 6 s and stop for good once the visitor touches the carousel.

## Big number in gradient text, never clipped

```css
.big-num { font-size: clamp(8rem, 22vw, 17rem); line-height: .8; letter-spacing: -.06em;
  background: linear-gradient(100deg, #fff 20%, #A9A8FF 45%, #E7A6FF 60%, #fff 80%) 0 0 / 220% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  padding: .06em .12em .04em .04em; margin: -.06em -.12em -.04em -.04em; }
```

## Number card with floating chips: glow at the bottom on phones

```css
@media (max-width: 760px) {
  .world::before { width: 150%; left: -25%; right: auto; top: auto; bottom: -38%; opacity: .85; }   /* blurred accent circle */
  .world-chips { position: relative; height: 300px; margin-inline: -8px; }
  /* place 11 chips on a loose 3-column grid: left 0/24/48/76 %, top 0 to 252px in ~60px steps */
}
```

## Language menu on phones

```css
@media (max-width: 640px) { .lang { position: static; } .lang-menu { left: 0; right: 0; width: auto; top: calc(100% + 8px); } }
```
The header (`position: sticky`) becomes the menu's anchor, so the menu matches the bar's width.

## Colour sweep across the headline

```css
.hero h1 .w > span { background: linear-gradient(90deg, currentColor 40%, var(--accent) 50%, currentColor 60%) 0 0 / 300% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: sweep 7s ease-in-out infinite; animation-delay: calc(var(--i) * 75ms + 1.8s); }
@keyframes sweep { from { background-position: 100% 0; } to { background-position: 0 0; } }
```
Wrap each word in `<span class="w"><span style="--i:N">word</span></span>`.

## Seamless marquee

Duplicate the items with JavaScript (`track.append(...items.map(n => n.cloneNode(true)))`) and animate `translateX(-50%)`. Never copy the items by hand, because they fall out of sync.

## Equal cards in a row

```css
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
.card { display: grid; grid-row: span 4; grid-template-rows: subgrid; }   /* title, text, price, button line up across cards */
```

## Compact contact modal

One dialog with three fields (name, email, message), a send button in the accent colour (a dark "ink" button disappeared on the dark modal), and a "Message sent" state. No email addresses printed around the page. Open it from a floating button and from "Contact" links.

## App header that never looks blurred on iPhone

```css
.app-header { padding: max(42px, calc(env(safe-area-inset-top) + 16px)) 0 8px; }
.app-date { color: var(--ink); font-weight: 600; font-size: 15px; letter-spacing: .005em; margin-bottom: 2px; }
/* no opacity, filter, backdrop-filter, entrance animation or gradient layer on the date */
```
Requires `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.

## Carousel track that doesn't get cut off

```css
.carousel-wrap { display: grid; grid-template-columns: minmax(0, 1fr); }
.carousel-track { width: 100%; display: grid; grid-auto-flow: column; grid-auto-columns: 86%; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; }
.carousel-track > * { scroll-snap-align: center; }
```
