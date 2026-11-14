# App code
- Inline handlers inside HTML attributes: build URLs with single quotes plus escaping. `JSON.stringify` adds double quotes that close the attribute, and the button silently does nothing.
- Anything that depends on account state (trial, subscribed, cancelled) checks every state. Don't show "Free trial" to a subscriber.
- Starting a trial should send a welcome email that says when reminders will arrive (before the trial ends and before each renewal).
