# Leads (Email + Phone) Setup — Google Sheets

This site collects leads (email + phone) for:
- Free workout routine download
- Free training + fat loss blueprint bundle download

Instead of emailing files via Resend, submissions are written to a Google Sheet via a Google Apps Script webhook.

## 1) Create the Google Sheet

1. Create a new Google Sheet (example name: `Angel Coaching Leads`).
2. In row 1, add headers:
   - `timestamp`
   - `source`
   - `name`
   - `email`
   - `phone`
   - `user_agent`
   - `referrer`
   - `page`

Tip: You can later add filters or export as CSV.

## 2) Create the Apps Script webhook

1. In the Sheet, go to **Extensions → Apps Script**.
2. Create a file named `Code.gs` and paste the contents of:
   - `apps-script/Code.gs`
3. Click **Deploy → New deployment**.
4. Select **Web app**.
5. Configure:
   - **Execute as**: Me
   - **Who has access**: Anyone (or “Anyone with the link”)
6. Click **Deploy** and copy the **Web app URL**.

## 3) (Optional) Add a simple secret

In Apps Script:
- Go to **Project Settings → Script properties**
- Add:
  - `LEADS_WEBHOOK_SECRET` = `your-secret-here`

Then you must call the webhook with a query string:
- `https://YOUR_WEB_APP_URL?secret=your-secret-here`

## 4) Set Vercel environment variable

In Vercel → Project → Settings → Environment Variables, set:
- `LEADS_WEBHOOK_URL` = `https://YOUR_WEB_APP_URL` (or include `?secret=...` if using the secret)

Deploy again after setting the env var.

## 5) Test

1. Open the website.
2. Submit the **Free workout routine** form with email + phone.
3. Submit the **bundle** form on `/fat-loss.html`.
4. Confirm new rows appear in the Google Sheet.


