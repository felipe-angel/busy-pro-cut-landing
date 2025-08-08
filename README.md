# Busy Pro Cut — One-Page Landing (Static)

A fast, accessible one-pager for the "Busy Pro Cut" online coaching offer. Built as static HTML with Tailwind CDN for zero-build simplicity.

## Quick Start

- Open `index.html` directly in your browser, or
- Serve locally:
  - Python: `python3 -m http.server 5173`
  - Node: `npx serve .`

Then visit `http://localhost:5173`.

## Replace Placeholders

- Calendar URL:
  - In `script.js`, set `CALENDAR_URL` (default already set).
- Stripe checkout URL:
  - In `script.js`, set `STRIPE_CORE_URL`.
- Email endpoint (lead magnet form):
  - Using Web3Forms. In `index.html`, replace `YOUR_WEB3FORMS_KEY`.
  - Or swap to FormSubmit: set `<form action="https://formsubmit.co/YOUR_EMAIL" method="POST">` and adjust fields.
- Google Analytics:
  - In `index.html`, replace `G-XXXX` with your GA4 Measurement ID.
- Site URL and assets for SEO:
  - In `sitemap.xml` and `robots.txt`, replace `https://example.com/` with your domain.
  - In JSON-LD in `index.html`, update `url` and `logo`.

## Editing Styles

- Global brand tokens live in `brand.css` (accent color, focus rings, buttons, cards).
- Tailwind utilities are used inline; tweak as desired.

## Structure

- `index.html` — Page markup, SEO, schema
- `brand.css` — Design tokens and components
- `script.js` — Interactions (CTAs, menu, accordion, form)
- `favicon.svg` — Simple favicon
- `robots.txt`, `sitemap.xml` — SEO basics

© 2025 Angel Coaching. All rights reserved.
