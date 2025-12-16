# Stripe Payment Integration Setup Guide

## Overview
This site uses Stripe Payment Links for processing payments. After a successful payment, customers are redirected to a thank you page with download links for their purchased blueprints.

## Setup Steps

### 1. Configure Stripe Payment Links

For each product (Training Blueprint, Fat Loss Blueprint, and Complete Bundle), create a Stripe Payment Link in your Stripe Dashboard:

1. Go to Stripe Dashboard → Products → Payment Links
2. Create a new Payment Link for each product:
   - **Training Blueprint**: $49.99
   - **Fat Loss Blueprint**: $49.99
   - **Complete Bundle**: $79.99

3. For each Payment Link, configure the **Success URL**:
   - Training Blueprint: `https://angel-coaching.app/thank-you?product=training`
   - Fat Loss Blueprint: `https://angel-coaching.app/thank-you?product=fat-loss`
   - Complete Bundle: `https://angel-coaching.app/thank-you?product=bundle`

### 2. Update Payment Links in Code

Edit `script.js` and replace the placeholder URLs:

```javascript
const STRIPE_LINKS = {
  training: 'https://buy.stripe.com/YOUR_TRAINING_LINK', // Replace with actual link
  fatLoss: 'https://buy.stripe.com/YOUR_FAT_LOSS_LINK',   // Replace with actual link
  bundle: 'https://buy.stripe.com/YOUR_BUNDLE_LINK'       // Replace with actual link
};
```

### 3. Set Up Webhook (Optional but Recommended)

To securely verify payments and trigger post-purchase actions:

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://angel-coaching.app/api/stripe-webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the **Webhook signing secret**
5. Add to Vercel environment variables:
   - `STRIPE_WEBHOOK_SECRET` = (your webhook secret)
   - `STRIPE_SECRET_KEY` = (your Stripe secret key - starts with `sk_`)

### 4. Install Dependencies

The Stripe package is already listed in `package.json`. Vercel will automatically install it on deployment.

### 5. Deploy

After updating the payment links in `script.js`, commit and push:

```bash
git add .
git commit -m "Add Stripe payment links"
git push
```

Vercel will automatically deploy the changes.

## How It Works

1. Customer clicks "Get [Product]" button
2. Redirected to Stripe Payment Link
3. Completes payment on Stripe
4. Redirected to `/thank-you?product=[product-id]`
5. Thank you page displays download links based on product purchased
6. Webhook (if configured) receives payment confirmation for logging/email triggers

## Testing

1. Use Stripe test mode Payment Links for testing
2. Use test card: `4242 4242 4242 4242`
3. Verify redirect to thank you page works correctly
4. Verify download links are correct for each product

## Troubleshooting

- **Buttons show alert**: Payment links not configured yet - update `STRIPE_LINKS` in `script.js`
- **Webhook not working**: Check `STRIPE_WEBHOOK_SECRET` and `STRIPE_SECRET_KEY` in Vercel environment variables
- **Wrong product on thank you page**: Verify success URLs in Stripe Payment Link settings match the pattern above







