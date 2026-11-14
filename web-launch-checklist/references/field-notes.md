# Field notes: technical fixes from two websites and two apps

Real bugs from a consultancy website, an installable budgeting app and a paid app. Read the whole list once per project; it's quicker than rediscovering them.

## Installable apps (PWA)
- **Changing only `sw.js` didn't ship the page change.** The commit updated the service worker but not the app page. Check that every changed file is included.
- **"Update now" must fetch fresh pages and clear the saved copy,** or it reloads the old version.
- **Old open windows stay on the old version** until the service worker tells them to reload.
- **Never cache redirected responses.** They broke offline loading.
- **Open offline after about 3 seconds on a weak connection** instead of waiting forever for the network.
- **The backup must restore the unlock as well as the data.**
- **Home-screen shortcuts** (manifest `shortcuts`): press and hold the icon to open straight on the most used action.
- **Reload data when the app comes back to the foreground.**

## Phones
- **iPhone page shifting:** inputs under 16px zoom the page; horizontal drift and bounce came from elements wider than the screen.
- **Date fields overflowed their box on iPhone.** Give them `width: 100%; min-width: 0`.
- **The Android keyboard hid the buttons in sheets.** Keep the action buttons visible above the keyboard, and keep scrolling inside the sheet.
- **Some Android phones couldn't scroll** because `body` was its own scroll box with overscroll blocked.
- **No white strip below the footer** when a page bounces: paint the background on `html`.
- **Every panel needs a close button,** and the phone's back button and Escape close it.

## Data and state
- **Key state by id, never by name or a shared default.** Setting aside one savings goal marked all goals, because goals without an id shared one key. Give every created item an id.
- **Keep history bounded** (for example the last 80 periods and up to 3,000 entries) so local storage doesn't fill up.
- **Count everything a total claims to count.** "Saved" missed money added directly to goals.
- **Show what's real.** "Safe to spend" should reflect real balances and drop when bills are marked paid; people trust numbers that match their bank.

## Static sites and SEO
- **Inline `<style>` inside a section fails HTML validation.** Move it to the stylesheet.
- **Bump the asset version (`?v=`) on every page** when CSS or JS changes, so phones get it.
- **Remove files that are no longer linked.** An old PDF stayed published and indexed by Google.
- **When moving a page, leave a redirect stub** with `noindex`, full Open Graph tags, and the `#hash` passed along, so old links, QR codes and social previews keep working.
- **Remove unused scripts, icons and libraries,** and their licence entries, after a redesign.
- **Link checkers:** some sites (Pinterest, Etsy, LinkedIn) block bots and always show as broken. Skip exactly those hosts. Otherwise the check fails every run and blocks the checks after it.
- **Temporary skips need an end date.** Remove the skip for a new page as soon as it's live.
- **Self-host fonts and list them in the licence file.**
- **The local preview server must not cache pages,** or you review stale versions.
- **Keep docs true:** the README says which checks run in CI, and CI actually runs them.

## Accessibility checks that failed in CI
- Logo strip text with too little contrast.
- A form heading injected at the wrong level (it skipped from h2 to h4).
- Words lit by a scroll effect stayed grey after fast scrolling.
- A low-contrast label on a dark section.
- Content hidden until an animation ran: with reduced motion, show it instantly.

## Languages and money
- **The app follows the phone's language,** with a switch in settings.
- **Currency and number format are a separate setting** from language. A Spanish speaker in the US still wants dollars with US formatting.
- **Links into the app carry `?lang=`** so a shared link opens in the right language.
