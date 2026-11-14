# Forms, sheets and screen states

## Contact forms
- **One compact modal (name, email, message)** beats email addresses scattered across the page. Open it from every "Get in touch" button and from a floating button that appears after the hero.
- **The send button uses the accent colour.** A dark "ink" button disappeared on a dark modal.
- **After sending, replace the form with a "Message sent" panel** (a tick, one line, a Close button) and move focus to it. A single line of text under the button was missed, and on phones it sat below the fold. Reopening the modal brings back an empty form.
- **Errors show inline, next to the form, which stays filled in** so the visitor can retry.
- **A short privacy note under the form** says where the message goes and why.
- **No JavaScript? It still works:** the form posts normally, and each "Get in touch" button is a real `mailto:` link underneath.
- **Third-party forms take your fonts and colours.** A newsletter form in the provider's own font looked pasted in; style it, or use your own form connected by API.

## Inputs
- **16px or larger** (iPhone zooms otherwise), and date fields with `width: 100%; min-width: 0` (they overflowed their box on iPhone).
- **Accept both "6.10" and "6,10"** in amounts; show round amounts without decimals.
- **Offer "your usual":** places logged at least twice in the last four months, where one tap fills the place, category and account, plus the amount when it's always the same.

## Sheets and dialogs
- **Phones: a sheet slides up from the bottom; large screens: a centred window.**
- **The Android keyboard must not hide the buttons:** keep actions visible above the keyboard, and scroll inside the sheet, not the page.
- **Every sheet closes with its X, a tap outside, Escape and the phone's back gesture.**

## Empty, first-use and demo states
- **Every view has its own empty-state text** that says what will appear and how to start ("No payments yet. Mark a bill as paid and it shows here").
- **Show what the product can do before there is data.** The home screen only showed accounts, the wait list and savings challenges once they had entries; a release made them visible from the first open, empty and inviting, so people can find them.
- **Demo data shows every feature:** repeated purchases (so "your usual" appears), past periods (so charts have history), paid and unpaid items. Build it relative to today, label it as sample data, and never save it.

## Feedback after an action
- **A dark toast with an action:** "Done · Download", "Payment marked · Undo". Undo restores a full snapshot taken just before the action.
- **Warn when two numbers that should match don't** ("Goals add up to $600, the savings account holds $450"), with a button that fixes it.
- **Status colours mean status only** (good, heads-up, over), never decoration.
- **Celebrate milestones, not taps** (see `motion.md`).

## Settings
- **A grouped list** (a profile card, then rows that open sheets) rather than one long form.
- **The version number at the bottom,** so support starts with "which version?".
- **Bottom tab bar with five tabs at most** on phones; on tablets an icon rail, on desktop a full side menu.
