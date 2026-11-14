# Phones
- iPhone: inputs at 16px or more (otherwise Safari zooms in), no sideways drift or bounce, date inputs kept inside their box.
- Android: the on-screen keyboard must not cover buttons in sheets or dialogs; scrolling stays inside the sheet.
- Never make `body` its own scroll container with overscroll blocked, because it breaks scrolling on some Android phones.
- Every panel has a close button, and the phone's back button and Escape close it too.
- Paint the page background on `html` so no white strip shows under the footer when the page bounces.
- Add a version query to CSS and JS (`styles.css?v=12`) so phones don't keep stale files.
