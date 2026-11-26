# Static sites: going live and staying correct

For the automated checks and the order to run them in, see `testing-and-ci.md`. Run `scripts/check-static.mjs` first: it catches most of the items below straight from the files.

## Files every site needs
- `sitemap.xml` with each indexable page's canonical URL and a real `lastmod`; `robots.txt` with a `Sitemap:` line on the same domain.
- A root `favicon.ico` (search engines ask for it directly, whatever the `<link rel="icon">` says). Build it from your SVG icon with `scripts/make-favicon.mjs`.
- A `404.html` that uses **root-absolute paths** (`/assets/site.css`). The host serves it at whatever missing URL was asked for, so relative paths break as soon as the missing URL is one folder deep. **Scripts too:** a 404 page that was a copy of the home page loaded without styles, scripts or translations at `/a/b/missing`, because `fetch('i18n/es.json')` and a config path (`'assets/shots'`) were relative. `check-static.mjs` finds relative `fetch()` calls; test the real thing with `check-pages.mjs --pages a/b/missing`.
- Verification files (Google Search Console, Pinterest) stay in the repo byte for byte, forever. Deleting one silently un-verifies the site.
- A `.gitattributes` that fixes line endings.

## One source for every URL
- **The canonical URL is the source of truth.** `og:url`, `og:image`, `twitter:image`, the sitemap and `robots.txt` all repeat it. A domain move means changing all of them together; `check-static.mjs` fails when any copy disagrees.
- **Copied pages keep the wrong canonical.** A new page built from a copy of another still declared the old page's canonical URL, telling search engines it was a duplicate.
- **Redirect the old address.** After moving to a custom domain, redirect the `github.io` (or `workers.dev`, `netlify.app`) address, or the same content is indexed twice.
- **Moving a page:** leave a stub at the old address with `noindex`, full Open Graph tags and a redirect that keeps the `#hash`, so old links, QR codes on printed material and social previews keep working.
- **Files outside HTML carry their own copies.** A PDF or a social card that prints the domain needs a manual re-export when the domain changes; no HTML check can see inside it.

## Cloudflare static sites (Workers or Pages)
- **`.html` addresses redirect.** `example.com/guide.html` answers with a 307 to `example.com/guide`, so canonical URLs, the sitemap and `hreflang` links use the address without `.html` (`check-static.mjs` accepts both forms when matching a canonical to its file). **Internal links must use the address without `.html` too** (`/guide`, `/` instead of `guide.html`, `index.html#prices`), also the ones a script rewrites to add `?lang=`. A site that linked to `.html` while its sitemap used clean addresses had 38 pages in Search Console under "Page with redirect" (`/guide.html?lang=es-419` and so on), because every link a crawler followed was a redirect. `check-static.mjs` fails on these links.
- **Read Search Console emails and the Pages report together.** The email only names the reason ("Page with redirect", "Not found (404)", "Duplicate"); the example URLs are in Indexing > Pages > the reason. A 404 for a path of another host (an app subdomain reading files inside a spreadsheet, say) is noise, not a page to fix. After publishing the fix, press Validate fix on each reason; it takes a couple of weeks.
- **A missing page is served from `404.html` with a 404 status** when the config has `"not_found_handling": "404-page"`; test it at a nested address.
- **`robots.txt` may exist before you write one.** Cloudflare can serve a managed `robots.txt` (content signals for AI crawlers) that has no `Sitemap:` line. Add your own `robots.txt` with the `Sitemap:` line; Cloudflare puts its block above yours.

## Caching after a deploy
- **GitHub Pages caches every file for 10 minutes** (`Cache-Control: max-age=600`). Right after a deploy, returning visitors can get new HTML with an old stylesheet, or old HTML entirely, and the fix looks like it didn't ship.
- **Version every local CSS and JS link** (`site.css?v=20261114a`) and change it whenever the file changes: `scripts/bump-version.mjs --dir . --assets 20261114a`. This fixes stale assets; the HTML itself still needs the 10 minutes.
- **The local preview server must not cache either** (`http-server -c-1`, or `python -m http.server`), or you review stale versions.

## Link previews (Open Graph)
- **Generate the share image from an HTML template** with the site's real fonts and colour tokens (`scripts/make-share-card.mjs`, template in `assets/share-card.html`). A hand-edited card kept an old accent colour for months after a redesign.
- **One card per audience.** A services page that reused the portfolio's card showed recruiter-facing stats to prospective clients.
- **Declare the real size** (`og:image:width`/`height`) and keep the image an absolute URL; social sites ignore relative ones.
- **The card is one more copy of your figures.** Regenerate it whenever tokens or numbers change.
- **A template that links the site's stylesheet inherits its classes too.** A card's `.pill` button rendered at a fraction of its size because the site already styled `.pill`. Give template classes their own prefix (`card-cta`).

## Search
- **One title and description per page,** with the words a local customer would type ("bookkeeping dashboards for small businesses in New Zealand"), and headings that name the service.
- **Structured data where it fits:** `FAQPage` for a real FAQ section, `LocalBusiness` or `ProfessionalService` with the service area. Validate it with Google's Rich Results Test.
- **Remove files that are no longer linked.** An old PDF stayed published and indexed long after the last link to it was removed. `check-static.mjs` lists unlinked documents.
- **Analytics:** a privacy-friendly tool (GoatCounter, Plausible), named in the privacy policy. Check that it skips `localhost`, so CI and local previews don't inflate the numbers.

## Forms and promises
- **Never ship a form that goes nowhere.** A newsletter sign-up went live before email delivery was set up and had to be pulled the same day. Connect the service, send yourself a test, then publish.
- **Contact forms go through a form service (Formspree) or your own endpoint,** never `action="mailto:"`: browsers warn "not secure" and phones open the visitor's mail app with raw `name=...&message=...` text.
- **After sending, replace the form with a "Message sent" panel** and move focus to it; a one-line message under the button was missed, and on phones it sat below the fold. Errors stay inline, with the form kept so the visitor can retry.
- **Keep a no-JavaScript fallback:** the form still posts normally, and "Get in touch" buttons are real `mailto:` links underneath the modal.
- **A promise repeated in several places changes in all of them** ("I reply within 2 working days" in the modal, the success message and the contact section).

## Honest content
- **No placeholder sections.** Leave a section out of the markup until it has real content; an empty "Testimonials" or a "Coming soon" grid reads as a site that isn't finished.
- **Client logos and names only with written permission.** One logo isn't a credible "trusted by" row anyway.
- **Reviews are quoted verbatim,** with the reviewer's permission and a link to the source.
- **Demo dashboards use invented businesses, labelled as invented,** never a client's real figures. Screenshots of client work use sample or masked data.
- **Real figures keep their source; examples are labelled as examples.**
- **Every copy of a number is a liability.** If a figure appears on the page, the social card, the README and a PDF, list every copy and update them together. Stating a total that will grow ("covered by 19 tests") goes stale; name what exists instead ("Python and JavaScript test suites").

## More lessons from a 155-commit site
- **`width: 100vw` includes the scrollbar** and causes sideways scroll as soon as the page is tall enough to scroll. Full-bleed sections use their natural block width.
- **A global `a:hover` rule can beat a button's own colour** and make its label vanish on hover. Resting-state scanners never see it: run `check-states.mjs`.
- **LICENSE matches reality in both directions:** every third-party font, icon set and library in use is credited, and nothing credited is gone. Self-host fonts so the privacy policy can say there are no third-party requests.
- **Remove what the redesign left behind:** unused scripts, icons and libraries, and their licence entries.
- **Shared JavaScript runs only the parts whose markup the page has** (`if (document.querySelector('#hero')) ...`). A section removed from one page crashed the script for everything after it.
- **Class names collide.** A button given the class `ghost` picked up the absolute positioning of a decorative `.ghost` number elsewhere and was pulled off-screen on phones. Prefix component classes (`btn-ghost`, `step-num`).
- **When porting a design reference, the reference wins** for colour, type and motion. "Close enough" existing tokens had to be redone.
- **Try big visual changes on a branch,** compare screenshots, then merge.
