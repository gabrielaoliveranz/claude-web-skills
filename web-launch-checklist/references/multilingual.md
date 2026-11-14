# Multilingual sites
- Test translations through a local HTTP server (`python -m http.server` on Windows, `python3 -m http.server` on Mac and Linux), not `file://`. With `file://` the JSON files often don't load and every language looks fine.
- Test with the longest language. Portuguese and German break headers first.
- Keep `?lang=` on internal links, so the language survives even when storage is blocked.
- A demo or sample data should match the visitor's language (country, currency, holidays).
- Default text in the HTML matches the base language. Keep the 404 page in sync with the home page if it's a copy.

## Search engines and sites that switch language with `?lang=`
One HTML file per page that translates itself by script is quick to build, but search engines only see one language unless you tell them about the others.
- **Detecting the browser language decides what Google indexes.** Google crawls mostly from the US with an English browser, so a page that picks the language from the browser most likely shows Google its English version at the plain URL, whatever language the HTML is written in. Load the page in a browser set to `en-US` to see what it gets.
- **Give each language its own URL** (the `?lang=` links you already use) and list them all in every page's `<head>`:
  ```html
  <link rel="alternate" hreflang="es-AR" href="https://example.com/guide?lang=es-AR">
  <link rel="alternate" hreflang="es" href="https://example.com/guide?lang=es-419">
  <link rel="alternate" hreflang="en" href="https://example.com/guide?lang=en-GB">
  <link rel="alternate" hreflang="x-default" href="https://example.com/guide">
  ```
  The plain URL is `x-default`: it keeps detecting the visitor's language.
- **Google doesn't accept `es-419`** (regions must be two-letter country codes). Use `es` for Latin American Spanish, and add the other bare languages too (`en` pointing at your UK or US English, `pt` at Brazilian Portuguese), so a visitor from a country you didn't list lands on the closest version.
- **A fixed canonical erases the other languages.** A `<link rel="canonical">` to the plain URL, on a page that serves every language, tells Google that `?lang=pt-BR` is a duplicate. Remove it from the HTML and set it by script, once the language is known: the URL with its own `?lang=` (and no tracking parameters), or the plain URL when there is none. Google's advice for script-set canonicals is that the HTML must not contain a different one. Skip it on the 404 page.
- **List every language URL in `sitemap.xml`** with the same alternates (`xmlns:xhtml` and an `<xhtml:link rel="alternate">` per language inside each `<url>`).
- **Link previews stay in the base language.** WhatsApp, LinkedIn and others don't run scripts, so they read the HTML as written: write it in the language most of your visitors share.
- **`check-static.mjs` validates the codes, the targets, the x-default and the canonical** for this setup.
