# PWA releases
- Bump the version everywhere it lives, for example `APP_VERSION` in the page, `version.json` and the cache name in `sw.js`. Missing one leaves installed apps on the old version.
- The update check fetches fresh (`cache: "no-store"`), never stores redirected responses in the cache, and reloads old open windows after an update.
- Run every inline script through a syntax check (`new Function(code)`, `node --check`) before shipping.
- Verify a deploy at `/version.json`, then in the app's About screen. Installed PWAs pick up updates after a close and reopen (sometimes two).
- If the app has an unlock or licence, the backup restores it too. Make it open offline after a few seconds on a weak connection.
