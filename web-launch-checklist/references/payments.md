# Payments with a merchant of record (Paddle, Lemon Squeezy and similar)

Setup steps (products, country prices, webhooks, website approval, going live) are in `connecting-services.md`; tested checkout and webhook code is in `recipes.md`. These are the traps:

- **Webhooks:** check delivery in the provider's logs and open the payload. A "succeeded" delivery only means your endpoint answered 200, not that it found the customer.
- **One email everywhere.** Pass the customer's email in custom data and key the subscription on it. If the trial and the payment use different emails, the app won't find the payment, so ask for the same email in both places and keep a manual relink path.
- **Sandbox quirks:** customer emails often go only to the seller's own address, and buyer portals only see live purchases.
- **Every country override has its own currency.** Open each price and check them one by one; countries without an override pay the base price.
- **Don't advertise countries the provider can't sell to.** Check its list before writing "available in 28 countries".
- **Going live is three swaps at once:** the client token, the price IDs and the environment flag.
