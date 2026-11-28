# Sending email as your own domain: SPF, DKIM, DMARC and the "Send mail as" trap

From setting up `hello@`, `hola@` and `ola@` for a product on a personal Gmail account (2026-11-28). Go one step at a time and test after each.

## The trap
Gmail's "Send mail as" with Gmail's own SMTP (`smtp.gmail.com`) delivers, but the mail is authenticated as Gmail, not as your domain:
- the return path is the Gmail address, so **SPF passes for gmail.com, not for your domain**;
- the DKIM signature belongs to Google (`1e100.net`), not to your domain;
- result in "Show original": `SPF: PASS`, `DMARC: FAIL`.

Adding `include:_spf.google.com` to your domain's SPF record does **not** fix this. That include only helps when your domain itself sends through Google's servers (Google Workspace). Keep exactly one SPF record per domain.

With `p=none` nothing is blocked and mail to Gmail arrives, but stricter inboxes (Outlook, Yahoo, iCloud) may send it to spam. Fix it before you write to customers.

## The fix: send through your email provider's SMTP
Use the provider you already use for transactional mail (here Resend). Gmail keeps the inbox and the signatures; the provider signs the mail as your domain.

1. **Verify the exact domain you send From.** In the provider, add the root domain (`example.com`), not only a sending subdomain. A key limited to a verified subdomain cannot send From `hello@example.com`. Check the domain dropdown when you create the key: if only `mail.example.com` is listed, add the root domain first.
2. **Auto configure with Cloudflare** adds the records in about two minutes: a DKIM TXT (`resend._domainkey`) and two CNAMEs on `send`/`rsend` subdomains. It does not touch Email Routing's MX records or your root SPF. Afterwards open Cloudflare DNS and confirm the three MX rows and the SPF row are unchanged.
3. **Create an API key** with "Sending access", limited to that domain. Copy it once. Never paste it in chat, a repo or a page.
4. **Gmail › Settings › Accounts and Import › Send mail as › edit info** for each address: server `smtp.resend.com`, port `587`, username `resend`, password the API key, TLS on. The same key works for every address.
5. **Test each address:** send to a different inbox, open the message, "Show original", and expect `SPF: PASS`, `DKIM: PASS` with your domain, `DMARC: PASS`.
6. Later, once everything passes for a while, raise DMARC from `p=none` to `p=quarantine`.

Check the provider's free-plan limits (daily and monthly sends) before using these addresses for bulk mail.

## Gmail "Send mail as" slips
- **Add another email address** can open as a pop-up outside the automated browser; the person has to do it. If the pop-up shows a 404, reload and retry.
- Gmail prefilled the wrong SMTP server (the inbox-forwarding host from the MX record). Always type the server yourself.
- Gmail's own SMTP needs an **app password** (2-step verification on). It is only for that route.
- **Set the display name** ("Honolia") on the address, or people see a personal name.
- Send in rich-text mode: plain-text mode shows the signature as unformatted text on phones.

## Signatures in several languages
- One signature per address, each in its language, with the link carrying `?lang=`.
- **Host the logo on the live site and publish it first.** It only shows once the site with that image is deployed.
- Gmail copies a signature image through its own proxy and keeps the size set in that signature, so the same logo can come out at different sizes in different signatures. Set the size in each ("Best fit"), then compare a test mail from every address.

## Reading DNS when the shell can't
The workspace's DNS is blocked. Read records through a public resolver's web API: `https://dns.google/resolve?name=example.com&type=TXT`. Check SPF, DKIM, DMARC and MX this way before and after each change.

## Contacting a provider's seller support
- Write from the address registered on the account, and **check the recipient's domain** before sending (a typo such as `paddler.com` bounces and tells nobody).
- Say what you see, where (country, page), and the one question you need answered.
