# Payments with a merchant of record (Paddle, Lemon Squeezy and similar)

Setup steps (products, country prices, webhooks, website approval, going live) are in `connecting-services.md`; tested checkout and webhook code is in `recipes.md`. These are the traps:

- **Webhooks:** check delivery in the provider's logs and open the payload. A "succeeded" delivery only means your endpoint answered 200, not that it found the customer.
- **One email everywhere.** Pass the customer's email in custom data and key the subscription on it. If the trial and the payment use different emails, the app won't find the payment, so ask for the same email in both places and keep a manual relink path.
- **Sandbox quirks:** customer emails often go only to the seller's own address, and buyer portals only see live purchases.
- **Every country override has its own currency.** Open each price and check them one by one; countries without an override pay the base price.
- **Don't advertise countries the provider can't sell to.** Check its list before writing "available in 28 countries".
- **Going live is three swaps at once:** the client token, the price IDs and the environment flag.
- **Display currency is the provider's decision, not yours.** The site's own price table is only a fallback. Preview the real price from the provider's JS (Paddle.js `PricePreview`) and overwrite what the page shows; the provider converts per country only for currencies enabled in the account (Business account > Currencies) or set in a country override. A country whose currency is not enabled falls back to the base currency.
- **Say so on the page, but only when it is true.** Show "prices are in US dollars" only while the displayed currency is USD. Hide it when a country sees its own currency. Test with a country that has an override and one that does not.
- **Argentina and similar markets:** an override written in USD means customers pay dollars. If you want local currency, the override's currency must be changed on purpose, and the provider's answer on which currencies it settles comes first.
- **A discounted plan must stay a fixed share of its parent in every currency.** After changing the annual price, open the founders/discount price and check every override again: one currency was still at the old amount (it showed about 58% of the annual price instead of 50%).
- **Sandbox and live are different accounts.** Review the prices in the account you are about to switch to, not only in the sandbox.
