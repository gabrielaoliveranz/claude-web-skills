# App features without a server

Patterns from two offline-first apps (one `index.html`, data on the device) that needed reminders, reports, imports and updates with no backend. Read `building-an-app.md` first for the data rules.

## Updates that reach installed apps
- **Check on open and whenever the app comes back to the foreground:** fetch `version.json` with `cache: "no-store"` on load and on `visibilitychange`.
- **Reload once, at a safe moment.** If a sheet or form is open (or the demo is running), skip this check and try again on the next one; reloading mid-entry loses what the person typed.
- **"Update now" clears the saved copy** and fetches the page fresh; otherwise it reloads the old version.
- **The first update check can only reach copies installed after it shipped.** Anyone who installed before the check existed has to reopen the app or reinstall once. Ship the update check in the very first public version.
- **Show the version at the bottom of settings,** so support questions start with "which version do you have?".

## Reminders without push notifications
- **Calendar files (`.ics`) work on every phone today.** Offer a download that the phone's calendar imports: a daily check at a chosen time, a monthly close on the last weekday, a backup reminder on the 1st, each with an alarm (`VALARM`).
- **Give each event a stable `UID`** (for example `session-<id>@yourapp`), so importing a newer file updates the events instead of duplicating them.
- **Privacy:** calendar entries and notifications show on the lock screen. Use initials or counts ("3 sessions to mark"), never names or amounts.
- **Real push notifications (Web Push) need a server and the person's permission;** plan them for when there is one, and say in the app that reminders are calendar-based until then.

## Reports and exports on the device
- **PDF without a library:** build the report as HTML, load it into a hidden `<iframe>` and call `print()` on it. The system dialog's "Save as PDF" does the rest, offline. Put the logo and a print stylesheet (`@page { size: A4; margin: 14mm }`) in the iframe.
- **Excel without a library:** an `.xlsx` is a zip of XML files. Write every text cell as an inline string (`t="inlineStr"`), so a name like `=SUM(A1)` stays text and never runs as a formula. Use real number cells for amounts, so people can sum them.
- **Brand the export like a product:** a header row with the product name and the period on every sheet, a summary sheet with a few KPI cards, coloured status cells, landscape and fit to width for printing.
- **Dates in exports follow the country** (mm/dd/yyyy for the US, dd/mm/yyyy elsewhere), not the language.
- **Test exports with two to three years of generated data,** not just the demo.

## Importing people's existing data
- **Accept what they already have:** `.xlsx` and `.csv`. Detect the separator from the first line (`;`, tab or `,`: Excel in Spanish, Portuguese and most of Europe saves CSV with `;`), and accept decimal comma or point.
- **Excel's CSV is often not UTF-8.** Strip the byte-order mark, decode as UTF-8, and if the result contains `�` (�), decode again as `windows-1252`; otherwise every accented name arrives broken.
- **Guess each column from its header** ("Nombre", "Name", "Teléfono"...), let the person change the guess, and never assign one field to two columns.
- **Review before importing, with the problems shown inline** where the person can fix them. Rejecting the whole file over one bad row makes people give up.
- **Offer a template file to download,** for people starting from scratch.
- **Drop columns the product promised not to keep** (notes, diagnoses) and say so on the import screen.

## Backups and trust
- **Download a backup as a file** (`.json`), restore it with an undo, and record when the last backup was made.
- **Remind after 30 days without a backup,** and warn loudly if there has never been one. On iPhone, deleting the home-screen icon deletes the data.
- **The backup restores everything:** data, settings and the unlock or licence.
- **If the app holds other people's data, encrypt the backup** with the person's code before it leaves the device.

## Legal acceptance
- **Store when and which version of the terms was accepted** (`termsAt`, `termsVersion`). When the terms change, ask again on next open instead of assuming.
- **Draft legal text gets a lawyer's review before launch,** in the base language first; translate after.

## Messaging links
- **Open the person's own messaging app with the text filled in** (`https://wa.me/<number>?text=...`); the app sends nothing itself, which keeps it private.
- **Add the country dialling code** when the number doesn't start with `+` or `00` (and the extra digit some countries need for mobiles).
- **Use a generic message icon,** not another company's logo: brand logos come with usage rules.
- **Editable templates** with tokens (`{name}`, `{total}`, `{period}`) let people keep their own tone.

## Insights people trust
- **Compare a month in progress with the same days of the previous month,** never with the whole previous month; otherwise every month looks like a drop until its last day.
- **Show counts beside money** ("$1,240 from 18 sessions"). With inflation, a rise in money alone can mean higher prices, not more work.
- **Every insight has "How this is calculated"** one tap away, in plain words.
- **Deterministic rules, not guesses:** the same data always gives the same sentence.

## Before charging money
- **A load test (k6 or similar) only matters once there is a server** (accounts, subscriptions, sync). A static app with data on the device has nothing to load-test; test the device instead with years of generated data.
