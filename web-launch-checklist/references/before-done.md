# Before saying "done"

Go through every line that applies to the change. If a line couldn't be checked, say so in the handover.

## Run the checks
- Serve the site over HTTP (`python -m http.server 8000`, or `python3` on Mac and Linux), never `file://`.
- Run `scripts/check-pages.mjs` on every page the change touches, in every language:
  - add `--schemes light,dark` if the site has a dark theme;
  - run once more with `--reduced-motion` if anything animates, and check that all content still shows.
- Fix every reported console error, failed request and HTTP error. A blocked request often means the CSP is missing a new domain (`references/csp-and-domains.md`).
- Open the screenshots and look at them. The script misses things a person sees at once (overlaps, odd spacing, wrong colours).
- Run the project's own CI checks (validation, links, accessibility) if it has them (`references/static-site-checks.md`).

## Check what the change can break
- **Everywhere the file lives:** preview, local repo and deployed copy. Confirm with a search.
- **Versions:** CSS and JS changed → bump `?v=` on every page. PWA changed → run `scripts/bump-version.mjs`, then check `/version.json` after deploying.
- **Languages:** every new string exists in every language. Test the longest language (often Portuguese or German).
- **Account states:** anything that depends on trial, subscribed or cancelled is checked in each state.
- **Copies of numbers:** a changed figure is updated everywhere it appears (page, social card, README, CV).
- **Real phone:** look at it on a real phone if the change is visible on phones.

## Hand over
- List what changed and where.
- Say plainly what you could not test (a real iPhone, a live payment, an email in the inbox).
