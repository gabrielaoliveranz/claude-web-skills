# Newsletter and email: keep the inbox, the archive and the site in step

Lessons from adding a newsletter archive to a static site and moving the email design onto the site's current look. Read it before touching a newsletter issue, an archive page or a campaign email.

## The look has to move everywhere at once
- **When the site's design changes, list every place that carries it:** the home page, case studies, legal pages, the 404 page, the newsletter pages, the emails, the brand notes (`DESIGN.md` or a design-system file). A newsletter page left on the old fonts looked "old" next to the new home page, even though nobody had touched it.
- **Build secondary pages on the site's own tokens** (the same CSS variables and stylesheets as the home page), not on a copy of an older page. Copying an issue page for the archive carried the old headline font along.
- **When a style is retired (for example diagonal section cuts), retire it in the emails too:** header image, footer image and any wedge between bands. A patch layer that forces `clip-path: none` on the site does nothing in an email.
- **Record the new look in the brand notes the same day,** and say what is retired, so the next page does not bring it back.

## An archive page for a newsletter
- If the site only links to the latest issue, add a page that lists every issue (date, title, one-line summary, link). Visitors who arrive from a later issue can then read the earlier ones.
- Link it from the home page next to "Read the latest issue" ("See all issues"), from the navigation on every page, and from the sitemap.
- **A new page has to be added to every list the checks use:** the HTML validation list, the link checker list, the page-screenshot list, and the sitemap. Otherwise CI passes without ever looking at it.
- Use a plain `<ol>` for the list. An `aria-label` on a list without a role fails the HTML validator (`aria-label-misuse`).
- Bump the `?v=` on the stylesheets in the same change, or phones keep the old CSS.

## Building the HTML email
- **Layout:** a 600px table, inline styles, a `max-width` with a mobile rule for padding and headline size. No grid, no flex.
- **Fonts:** web fonts are not reliable in mail apps. Use a serif stack that exists everywhere (`Georgia, 'Times New Roman', serif`) for titles and the signature, a sans stack with an Arial fallback for body text, and a monospace stack for small labels.
- **Never put a font the visitor may have installed first in the stack for titles.** A locally installed variable font matched an italic face and the headline previewed in italics. Set `font-style: normal` on titles and use a stack that matches the same face everywhere.
- **Images:** a plain header image (logo and photo on a flat colour) hosted on the site. Colour blocks for the rest. No diagonal or cut images, they break the "plain" look and add weight.
- **The hosted image must be live before the email is used.** The header lived on the website, so the website had to be pushed and deployed first. Check the image URL returns 200 before creating the campaign.
- **Buttons:** a coloured table cell with the radius of the site's buttons, a link inside with padding. No image buttons.
- **Merge tags** (`{$unsubscribe}`) stay exactly as the provider writes them. Keep the provider's link ids on links that already have them.
- **Make a reusable template,** with comments marking what changes per issue (label, title, text, button link and label).
- **Preview at phone width** and look at the whole email, including the footer, before anything is uploaded.

## Working with the email provider (MailerLite)
- **Create a draft and stop.** A campaign created through the API is a draft. Sending or scheduling is a separate step that the owner does, or confirms in writing first.
- **A new draft defaults to "all active subscribers".** Set the group before anyone sends it.
- **Custom-HTML campaigns cannot be edited block by block,** and the tools that edit blocks refuse them. Keep the HTML source in the project and regenerate the whole email for each issue.
- **Account-level brand styles (font, colours) are a dashboard setting.** The API only styles one email. Give the owner the values to paste.
- **Editing the body of an automation email needs the automation switched off first.** It is live for every new subscriber, so: say so, get a yes, turn it off, change the email, turn it on, and check it is on again.
- **Emails already sent never change.** Redesigns apply from the next send; say so when asked "does it go out again?".
- **New issues:** check every figure against its source and ask before anything is published or sent.
