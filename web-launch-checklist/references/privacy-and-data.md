# Privacy, erasure and legal pages: keep the promise true

Lessons from auditing a small paid app and its website before launch (2026-11-27). The rule behind all of them: a privacy page is a list of promises, and each promise must be true in the code, in the dashboards and in every language.

## Make the page match what the system really does
- **Read the server code before you write the retention section.** The page said "90 days after your subscription ends". The server deleted the sync copy after 400 days without use, and subscription records never expired at all. Write the text from what the code does, then change the code if the text is the better promise.
- **Put an expiry on every stored record, in code.** On a key-value store, give every `put` an `expirationTtl`: trial records 30 days, subscription records the paid period plus the retention you promised (for example 12 months), pointer records the same as the record they point to.
- **Records saved before the expiry existed need a sweep.** A daily job lists keys, finds those with no `expiration` (the list result shows it) and sets one. Delete pointers whose record has gone.
- **Leave out a promise you cannot verify.** The page said access to systems was protected with two-factor authentication. Not every account had it, so the sentence came out until it is true for all of them. Check the real settings (Cloudflare, GitHub, domain registrar, payment provider, email sender, mailbox) before claiming anything about them.
- **Remove every third party you stop using, in the text too.** Self-hosting fonts (see below) also meant deleting the sentence that named the font provider.
- **Self-host fonts.** Loading them from Google sends every visitor's IP address to Google, which European regulators have treated as a personal-data transfer. Download the variable `woff2` (the Fontsource packages are a clean source, latin subset), add `@font-face` with `font-display: swap`, delete the three `<link>` tags from every page (two `preconnect` and the stylesheet), and confirm in the browser that no request goes to a Google host.
- **Check logging and analytics in the dashboards,** not only in your code. We opened the worker's observability settings and confirmed logs were off, because a promise like "we do not keep message content" is only true if the platform is not keeping it either.
- **Data that must never be typed.** If the product deliberately has no fields for sensitive data (health, say), say so on the contact form too: one line above the fields asking people not to write it.

## Erasure: be able to do it, and prove it
- **Write the runbook, then run it once.** Create a test record with an email alias you own, find its key, delete it, search again to confirm, and check the other keys are untouched. Keep the log (date, key, result). A runbook nobody has run fails on the day it matters.
- **Know which records belong to one person,** and which cannot be linked to them. In our case: trial record, subscription record and its pointer (found from the email hash), but the encrypted sync copy is stored under an id derived from a code the server never sees. Say plainly how that one is deleted: the person does it in the app, or sends the code, which is also the key to the copy, so use it only to delete and never store it. If there is no code, the copy expires on its own.
- **A shared database means exact keys.** When two products share one store, delete one full key, never a prefix, and say so in the runbook.
- **The "delete" button must tell the truth.** It showed "deleted" even when the request failed offline. Show success only when the server confirmed it, otherwise say it could not connect and keep the local state so the person can retry.
- **Name the response deadlines per country in the runbook** (they differ: days in some countries, a month in others), and an internal target shorter than all of them.

## Translated legal pages
- **Compare each language file with the source language to find strings left untranslated** (recipe in `recipes.md`). Two languages had their whole privacy, terms and refund pages still in English because the key existed, so no check complained.
- **A machine translation is better than the wrong language,** and a clear plan beats a promise: translate now so every page is in its own language, note which languages have had no human review, and pay for review per country when there are customers there. Do not present unreviewed legal text as reviewed.
- **Keep a "when I have customers in X" list** per country (regulator, representative, registration, response deadline, who must review the text) so the work starts from the first sale in that country, not from zero.
