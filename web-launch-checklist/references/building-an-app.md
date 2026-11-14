# Building an app: decide the variables before the first line of code

Almost every serious bug in a small app comes from a variable nobody thought about before coding, not from badly written code. Before building, answer each question below in writing, with one concrete example from your product.

| Variable | Question to answer | What went wrong when we skipped it |
|---|---|---|
| Source of truth | Where does each value live, and which functions may change it? | A bill amount could only be edited in the plan, so this week's real amount had nowhere to go |
| Plan vs reality | Does the main number show an intention or real money? | "Safe to spend" said $107 while the accounts held $48 |
| Estimated vs actual | Which amounts change each time, and where is the real one recorded? | Power estimated at $220 came in at $247 with no place to enter it |
| Time and periods | Does an action belong to the period it's due in or the one it happened in? | A bill paid early threw the current period out by $88 |
| Late, early, skipped | What happens if someone pays late, early, or skips a step? | Editing an overdue bill opened next month's date |
| Automatic actions | Does anything add, subtract or move on its own? | Savings goals grew every payday: a goal said $100 with $50 deposited |
| States and undo | What states can each thing have, and does every change undo exactly? | Un-marking a payment returned the new amount, not the paid one |
| Visibility | Can people see what was taken off, how much and why? | "Bills still to pay" and a breakdown had to be added later |
| Existing data | If a rule changes, how is data already saved corrected? | A one-off migration had to fix a goal to the real balance |
| Several windows or devices | What if the app is open twice, or on two devices? | An old window saved over a newer change |
| Format and rounding | Decimal comma or point, currency, dates | Accept "6.10" and "6,10"; show whole amounts without decimals |
| Empty states and edges | No data yet, zero values, the 31st, next year, first use | Every view needs its own empty-state text |
| Identity of items | Is every item keyed by a unique id? | Items without an id shared one key: setting aside one goal marked them all |
| Emails and accounts | Will people use the same email everywhere? | The trial used one email and the payment another; the app couldn't find the payment |

## Method for every new app
1. Write the data model and this table before coding.
2. Build three test users with real-looking data:
   - a tidy one;
   - one who pays late or skips steps;
   - one with data from the previous version.
3. Write acceptance criteria as testable sentences ("I change the amount in Plan and it shows in Home, Bills and Calendar").
4. Test on a simulated phone with those users, in every language, before each release.
5. Compare what the app says with reality (the bank balance, the person's own screenshots) before calling a fix done.

## Architecture rules that held up
- **No framework, no build step** for small apps: one `index.html` (styles, code, icons, fonts embedded so it works offline), `manifest.webmanifest`, icons, `sw.js`, `version.json`. Edit and publish.
- **Data on the device:** one storage key with profiles, a `migrate()` step for every version that changes data, and a backup as a downloadable JSON file. The backup also restores the unlock.
- **Each value is stored once.** Totals are always computed, never stored.
- **One read function per value and one change function per action.** Every screen calls the same functions (for example `setAmount()`, `markPaid()`, `setAside()`, `undo()`).
- **One `render()` after every change** redraws every screen and saves. Nothing updates a single view by hand.
- **Re-read storage when the app comes back to the foreground,** so an old window never overwrites a newer change.
- **What was paid is frozen.** A paid item keeps the amount it was paid with; changing the plan later never rewrites the past.
- **Never delete payments, void them.** Undo returns the exact amount.
- **Nothing moves by itself.** Money (or any balance) only moves when the person confirms it. A plan is an intention, not a movement. Skipping creates no debt.
- **Warn when two numbers should match and don't** (goals vs savings account), with a button to fix it.
- **Migrate with the person, not by guessing.** If old data can't tell you the real value, ask once.
- **Undo as a toast:** take a full snapshot before the action and restore it.
- **Demo mode (`?demo`):** sample data built relative to today, covering every feature (repeated purchases, past periods, paid and unpaid items), never saved.
- **No free-text fields for sensitive data** (for example notes about patients) if the product promises not to hold it.
- **Encrypted sync, if any, is encrypted on the device:** the server only sees data it can't read.
- **Performance test before launch:** generate two to three years of data and check every screen and export.

## Access and licences
- **Unlock codes:** store only a hash of each code in the app, never the codes. Generate codes without look-alike characters (no O/0, no I/1). To revoke a leaked code, remove its hash and release a new version.
- **Store-order unlock:** a small server endpoint checks the order number with the store's API and allows a fixed number of devices (for example 3), stored in a key-value store.
- **Admin endpoint for new codes,** protected by a secret, so you can let someone back in without a release.
- **The guide the buyer gets (PDF) has the access details on page 1,** and the app's error message points there.
