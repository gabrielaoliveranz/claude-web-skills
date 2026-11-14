# Payments with a merchant of record (Paddle, Lemon Squeezy and similar)
- Website approval usually needs live Terms, Privacy and a separate Refund policy page, plus a sentence naming the merchant of record.
- Webhooks: check delivery in the provider's logs and open the payload. A "succeeded" delivery only means your endpoint answered 200, not that it found the customer.
- Pass the customer's email in custom data and key the subscription on it. If the trial and the payment use different emails, the app won't find the payment, so ask for the same email in both places and keep a manual relink path.
- Sandbox quirks: customer emails often go only to the seller's own address, and buyer portals only see live purchases.
- Open every price and check each country override's currency.
- Check which countries the provider can't sell to, and don't advertise those countries.
- Going live means swapping the client token, the price IDs and the environment flag together.
