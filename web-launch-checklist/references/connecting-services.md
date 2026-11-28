# Connecting services: domain, hosting, email, payments

Step-by-step lessons from connecting a domain, Cloudflare, an email provider, Paddle and GitHub Pages. Go one step at a time, and confirm each one works before the next.

## Domain and Cloudflare
- **Move the nameservers** at the registrar (for example Namecheap) to the two Cloudflare nameservers. Wait until the zone shows "Active".
- **Check from outside your network.** Use mobile data or an online DNS checker. Home WiFi can keep old DNS for 24 to 48 hours. Workarounds: restart the router; set DNS to `1.1.1.1` / `1.0.0.1`; on Windows run `ipconfig /flushdns` in a terminal opened with "Run as administrator".
- **Turn on SSL/TLS › Edge Certificates › Always Use HTTPS,** or people who type the bare domain land on "Not secure".
- **Workers from GitHub (Workers Builds):** each push to the main branch deploys. If a build shows 0% of traffic, open ⋯ › "Deploy version" at 100%.
- **Custom domains:** attach each hostname to the right worker (for example the site on `example.com` and `www`, the app on `app.example.com`). Attaching the app's hostname to the site's worker is an easy mistake.
- **Secrets:** in the worker's Settings › Variables and Secrets, the *name* goes in the name field and the *value* in the value field. Pasting the key into the name field is a common slip.
- **Scheduled jobs:** add `"triggers": { "crons": ["0 20 * * *"] }` in `wrangler.jsonc` (cron times are UTC) and check the dashboard shows it after deploying.
- **Key-value storage:** prefix keys by type (`app:sub:`, `app:ev:`, `app:trial:`) and give temporary keys an expiry.
- **Turn on two-factor authentication** for Cloudflare, GitHub, the registrar and the payment provider.
- **Fallbacks:** if a direct upload fails, a drag-and-drop host such as Netlify Drop is enough to test on a phone.
- **A Worker from one folder of a repo:** Workers & Pages › Create › Import a repository; build command empty, deploy command `npx wrangler deploy`, and Advanced › Root directory = the app's folder. The drag-and-drop upload only takes static files and leaves the Worker (the API) out. Then in Settings › Domains & Routes turn on the Production `workers.dev` address only.
- **A private app, behind a sign-in, without writing any login code:** Cloudflare Access. Set up Zero Trust once (Free plan, up to 50 users; it asks for a card but charges nothing), then on the Worker › Domains › Enable Access: Scope **All traffic** (not "Previews only"), policy "Cloudflare account" or a list of emails. Visitors get a one-time code by email. Test in a private window. Your own fetch and browser tools can no longer open the app either, so test locally.

## Google Calendar from an app with no server
- **Ask only for the app's own calendar:** Google Identity Services token client with scope `https://www.googleapis.com/auth/calendar.app.created`. The app creates its own calendar and can't read or change the person's other calendars, which is easy to explain and to trust. Weekly items become recurring events (`RRULE:FREQ=WEEKLY`) with a popup reminder, so the phone alerts without any push server.
- **The Client ID:** Google Cloud project › enable Google Calendar API › Google Auth Platform (External; add the person's Gmail as a test user; add the scope under Data Access) › Clients › Web application, with the app's exact address under Authorised JavaScript origins and no redirect URI. The Client ID isn't secret; it can be pasted into the app's settings.
- **"Google hasn't verified this app"** appears while the project is in testing. Expected for a personal app; a public one needs Google's verification for sensitive scopes.

## Receiving email at your domain
- **Cloudflare Email Routing** forwards `hello@`, `hola@` and so on to your inbox. Before turning it on, delete the registrar's old MX and SPF records, or activation fails.

## Sending email (transactional)
- Sending *as* your domain from a personal inbox (Gmail "Send mail as") has its own traps and a fix: see `email-deliverability.md`.
- Use a **sending subdomain** (`mail.example.com`) so it never interferes with inbox routing.
- **Records in Cloudflare (DNS only, not proxied):**
  - the DKIM TXT record (for example `resend._domainkey.mail`);
  - the MX and SPF TXT records on the bounce subdomain;
  - a `_dmarc` TXT record.
- **Wait for "Verified"** before sending. Store the API key as a worker secret.
- **Send from `name@mail.example.com`,** with `reply_to` set to the person who wrote (for contact forms), in the customer's language.
- **Rate-limit contact forms** (for example 5 per IP per hour).

## Payments with Paddle (merchant of record)
- **Onboarding:** individual or company, what you sell (software as a service), website URL, sandbox first.
- **Product and prices:**
  - one product with one price per plan;
  - custom data on each price (for example `plan: monthly`);
  - "includes tax" if your prices are shown tax-inclusive;
  - quantity fixed at 1;
  - no trial at Paddle if your app runs its own trial.
- **Website review can take days.** Until it ends, buyers may see only the base currency; see `payments.md` for what to show meanwhile.
- **Country prices:** add overrides per region or currency. Then open every price and check every override's currency. Countries without an override pay the base price (USD).
- **Countries:** check which countries the provider can't sell to, and don't advertise them.
- **Client token and price IDs** go in the site's config. The secret API key never goes in the browser.
- **Webhook destination:** your worker's `/api/paddle`. Events:
  - `transaction.completed`;
  - `subscription.created`, `subscription.updated`, `subscription.canceled` and `subscription.past_due`;
  - `adjustment.created` and `adjustment.updated` (for refunds).

  Copy the secret into a worker secret.
- **Default payment link:** your site's URL, which needs Paddle.js loaded.
- **Payment methods:** turn on the wallets and local methods you want, checking each one supports subscriptions.
- **Website approval:** live Terms, Privacy and a separate Refund policy, a clear product description and prices, and the merchant of record named. Then verify your identity.
- **Going live:** swap the client token, the price IDs and the environment together.

## Static site on GitHub Pages
- Add a `CNAME` file, point the canonical URLs and Open Graph URLs at the custom domain, and redirect the old `github.io` address.
- Search Console and Pinterest verification files stay in the repo, byte for byte, forever.
- Forms go through a form service (for example Formspree) or your own worker. Never use a `mailto:` form.
- Analytics: a privacy-friendly tool (for example GoatCounter), named in the privacy policy.

## Before every connection step
- Say in one sentence what the step is for.
- Give the exact button names as they appear on screen (in the interface language the person uses).
- Ask for a screenshot when something doesn't match.
