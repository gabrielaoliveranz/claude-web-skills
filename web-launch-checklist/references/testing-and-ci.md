# Testing and CI: checks that tell the truth

A check that passes without testing anything is worse than no check: it makes you stop looking. Every rule here comes from a check that passed, or failed, for the wrong reason on a real site.

## Trust a check only after it fails
- **Break it on purpose before you trust it.** Point a link at a missing page, change the accent colour, mismatch a declared image size. Confirm the check fails and names the right file, then revert and confirm the file matches the commit again.
- **A selector can quietly start testing something else.** A contrast check targeted `.button--secondary`, whose first match was a hero button. When that button was removed, the same selector matched a footer link instead: same selector, same PASS, but no longer testing the case it was written for. Scope each target to where it lives (`.site-footer .button--primary`), give each style its own entry, and re-read the targets after every markup change.
- **Piping hides the exit code.** `npm run check | tail -5` reports the exit code of `tail`, which is always 0. Read the real code (`set -o pipefail` in bash, or run the command alone) before saying a check passed.
- **A mistyped option must fail, not be ignored.** A run with `--scheme dark` (for `--schemes`) tested only the light theme and reported success. Every script in this skill stops on an option it doesn't know; give your own scripts the same guard.
- **Say what each check skips.** A domain-wide skip in the link checker (`example\.github\.io`) meant to avoid re-checking the site's own root also stopped checking a case study hosted on the same domain. Anchor every skip to the narrowest pattern (`example\.github\.io/$`) and write the reason next to it.
- **Temporary skips get an end date.** A new page's own URL 404s until the host has deployed it, so the first CI run for a new page fails. Either re-run after deployment or add a narrow, commented skip and remove it in the very next commit.

## Animation and timing
- **CI runners are slower than your laptop.** An element fading in was caught mid-fade on the CI runner and failed contrast, while it passed every local run. Reproduce with CPU throttling (4x and 8x in Chrome DevTools, or `Emulation.setCPUThrottlingRate` over CDP) before calling a CI failure flaky.
- **Prefer movement to fading.** Text that slides in at full opacity passes contrast on every frame; text that fades in fails on some. The same goes for exits: let a word drop away instead of fading out.
- **A short wait after hover is deliberate.** A state check that measures about 60 to 80 ms after hovering catches a slow colour transition half-way, at 1.3:1. Visitors see that frame too: make link colour changes instant and keep longer transitions for larger elements.
- **Polling breaks what it measures.** Repeated screenshots or script calls in a tight loop starve `requestAnimationFrame`, so working animations look frozen or blank. Take one screenshot after a plain wait, or record state inside the page and read it once at the end. Time animations with `performance.now()`, never chained `setTimeout`s.
- **Run layout checks with motion on as well as off.** An overflow check that forced reduced motion never ran the scroll animation that pushed a section 8px past the screen edge. `check-pages.mjs` runs with motion by default; add `--reduced-motion` as a second pass.
- **Animated text and accessibility scanners:** text whose opacity follows scroll will be flagged mid-animation. Keep the real sentence in an always-rendered `.sr-only` element and mark the animated copy `aria-hidden="true"` in the markup itself, not toggled by script.
- **Content must not wait for an animation.** With reduced motion, show the final state at once (all words lit, all counters at their final value).

## Measuring layout honestly
- **Test a true 320px viewport.** Resizing a desktop browser window often stops at about 500px. Use device emulation (Playwright's `viewport`, or CDP `Emulation.setDeviceMetricsOverride`).
- **Hidden is not the same as zero size.** The links inside a closed `<details>` mobile menu still report a position and size, so a check counted them as a second header line on every page of a site whose header was fine. Ask the browser whether an element is really rendered (`el.checkVisibility()`), not whether it has a box.
- **Count lines by overlap, not by position buckets.** A header check that grouped items into 8px bands and wanted three bands missed a header that really wrapped onto two lines. Items share a line when their vertical ranges overlap.
- **Test the widths where layouts switch.** A two-column layout that starts at 1280px was never tested at 1280px; add each breakpoint you use to the widths you check.
- **Reveal-on-scroll thresholds fail on tall sections.** An `IntersectionObserver` with `threshold: 0.2` never fired for a section taller than five screens on a phone, because 20% of it can never be visible at once. Use a small threshold (0 to 0.1) or a `rootMargin`, and test on a short phone screen.
- **Make failures readable from the log alone.** Print axe's `failureSummary` (the measured colours and ratio) and the element, so a CI-only failure can be fixed without reproducing it.

## Files and the repository
- **Case-sensitive servers.** Windows and macOS open `assets/Logo.png` when the page asks for `assets/logo.png`; Linux hosts (GitHub Pages, Netlify, Cloudflare) return 404. `check-static.mjs` compares every path with the real file names.
- **Relative paths resolve from the page's own folder.** A checker that resolved every path from the site root flagged correct `../assets/` links on nested pages as broken, and would have missed real ones.
- **Line endings belong to the repository.** Add `.gitattributes` (`* text=auto eol=lf`, and binary types listed explicitly). If a file shows hundreds of changed lines that look identical, run `git diff --ignore-cr-at-eol`; if that's empty, discard the change instead of committing it.
- **Tool leftovers never ship.** Design tools and AI sessions leave previews, mock-ups and exports in the working folder. Ignore their folders in `.gitignore`, and fail the build on untracked, unignored files.
- **`npm audit fix` may find nothing to do** when the fix needs a new major version of a dev tool. Upgrade that package directly, then run the checks it powers and break one on purpose to confirm it still fails.

## A check suite for a static site
Run these on every push (GitHub Actions or similar), in this order so the cheap ones fail first:

| Check | Tool |
|---|---|
| HTML validity | `html-validate` |
| Paths, canonical URLs, share images, sitemap, shared footer, unlinked files | `scripts/check-static.mjs` |
| Links, including external ones | `linkinator`, with narrow, commented skips |
| Overflow, cut-off text, wrapped header, console and network errors | `scripts/check-pages.mjs` |
| Accessibility at rest | axe (`@axe-core/playwright`) |
| Contrast at hover, focus and pressed, visible focus | `scripts/check-states.mjs` |
| Nothing untracked slipping into a commit | `git ls-files --others --exclude-standard` must be empty |

Keep the README honest: it lists the checks CI really runs, and CI runs every check the README lists.
