# Multilingual sites
- Test translations through a local HTTP server (`python -m http.server` on Windows, `python3 -m http.server` on Mac and Linux), not `file://`. With `file://` the JSON files often don't load and every language looks fine.
- Test with the longest language. Portuguese and German break headers first.
- Keep `?lang=` on internal links, so the language survives even when storage is blocked.
- A demo or sample data should match the visitor's language (country, currency, holidays).
- Default text in the HTML matches the base language. Keep the 404 page in sync with the home page if it's a copy.
