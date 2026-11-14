# Phones
- iPhone: inputs at 16px or more (otherwise Safari zooms in), no sideways drift or bounce, date inputs kept inside their box.
- Android: the on-screen keyboard must not cover buttons in sheets or dialogs; scrolling stays inside the sheet.
- Never make `body` its own scroll container with overscroll blocked, because it breaks scrolling on some Android phones.
- Every panel has a close button, and the phone's back button and Escape close it too.
- Paint the page background on `html` so no white strip shows under the footer when the page bounces.
- Add a version query to CSS and JS (`styles.css?v=12`) so phones don't keep stale files.

- **A date or title at the very top looked blurred on iPhone.** It sat under the status bar (time and battery), which iOS softens. Move the header below it: `padding-top: max(42px, calc(env(safe-area-inset-top) + 16px))`. Also give small top text the main ink colour, weight 600, at least 15px, with no opacity, blur or fade layer over it.
- **Pages that fit the screen.** A welcome or unlock screen should fill the screen without scrolling; keep it static (no entrance animation) so it never looks broken on slow phones.
- **Sheets:** slide up from the bottom on phones and open as a centred window on large screens. They close with the X, a tap outside, Escape or the phone's back gesture.
