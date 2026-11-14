# Content Security Policy and moving an app

For DNS, HTTPS and email setup, see `connecting-services.md`.

- With `connect-src 'self'`, any fetch to another host fails silently. Call your own API with relative URLs, and update the CSP in the same change that adds a domain or service. `scripts/check-pages.mjs` reports blocked requests as console errors.
- Moving an app to a new address: redirect only after the new address answers (fetch `version.json` with a timeout). Otherwise people hit a dead page while DNS propagates. Code in `recipes.md`.
- On iPhone every home-screen icon has its own storage. Data migrated inside the old icon is not in a reinstalled one. Never tell users to delete or reinstall the icon without a backup, and show a "Make a backup now" prompt after a move.
- After changing nameservers, check from outside your network (mobile data). Home networks can cache old DNS for 24 to 48 hours.
