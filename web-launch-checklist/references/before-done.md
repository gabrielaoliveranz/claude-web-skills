# Before saying "done"

Go through every line that applies to the change. If a line couldn't be checked, say so in the handover.

## Run the checks
- Run `scripts/check-static.mjs` (add `--same footer` if the footer is copied into each page). It needs no server and takes a second.
- Serve the site over HTTP (`python -m http.server 8000`, or `python3` on Mac and Linux), never `file://`.
- Run `scripts/check-pages.mjs` on every page the change touches, in every language:
  - add `--schemes light,dark` if the site has a dark theme;
  - run once more with `--reduced-motion` if anything animates, and check that all content still shows.
- Run `scripts/check-states.mjs` if the change touches links, buttons, colours or the header.
- Open a missing page at a nested address (`--pages a/b/missing`) once per site: the 404 page must load its styles, scripts and translations there too.
- Several languages switched by `?lang=`? Load a page in a browser set to US English (as Googlebot renders) and check which language and canonical you get (`references/multilingual.md`).
- Fix every reported console error, failed request and HTTP error. A blocked request often means the CSP is missing a new domain (`references/csp-and-domains.md`).
- Open the screenshots and look at them. The scripts miss things a person sees at once (overlaps, odd spacing, wrong colours).
- Run the project's own CI checks if it has them (`references/testing-and-ci.md`), and read the real exit code, not the end of a pipe.

## Check what the change can break
- **Everywhere the file lives:** preview, local repo and deployed copy. Confirm with a search.
- **Versions:** CSS or JS changed → `scripts/bump-version.mjs --assets`. PWA changed → `scripts/bump-version.mjs <version>`, then check `/version.json` after deploying.
- **Languages:** every new string exists in every language. Test the longest language (often Portuguese or German).
- **Account states:** anything that depends on trial, subscribed or cancelled is checked in each state.
- **Copies of numbers and promises:** a changed figure or promise is updated everywhere it appears (pages, share card, README, PDFs).
- **Real phone:** look at it on a real phone if the change is visible on phones.

## Hand over
- List what changed and where.
- Say plainly what you could not test (a real iPhone, a live payment, an email in the inbox).
