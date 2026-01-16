# Coaching Application Setup — Google Sheets

This site collects coaching applications via a comprehensive questionnaire form. Submissions are written to a Google Sheet via a Google Apps Script webhook.

## 1) Create the Google Sheet

1. Create a **new** Google Sheet (example name: `Angel Coaching Applications`).
2. The Apps Script will automatically create headers on first submission, but you can manually add them in row 1:
   - `timestamp`
   - `source`
   - `name`
   - `age`
   - `height`
   - `weight`
   - `gender`
   - `situation`
   - `primary_goal`
   - `experience_level`
   - `employed`
   - `contact`
   - `user_agent`
   - `referrer`
   - `page`

Tip: You can later add filters, conditional formatting, or export as CSV.

## 2) Create the Apps Script webhook

1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete any default code and paste the contents of:
   - `apps-script/CoachingCode.gs`
3. Click **Deploy → New deployment**.
4. Select **Web app**.
5. Configure:
   - **Execute as**: Me
   - **Who has access**: Anyone (or "Anyone with the link")
6. Click **Deploy** and copy the **Web app URL**.

**Important:** This is a separate webhook from the leads webhook. You need a separate Google Sheet and separate Apps Script deployment.

## 3) (Optional) Add a simple secret

In Apps Script:
- Go to **Project Settings → Script properties**
- Add:
  - `COACHING_WEBHOOK_SECRET` = `your-secret-here`

Then you must call the webhook with a query string:
- `https://YOUR_WEB_APP_URL?secret=your-secret-here`

## 3.5) (Optional) Set up email notifications

To receive email alerts when someone submits a coaching application:

1. In Apps Script, go to **Project Settings → Script properties**
2. Add:
   - `COACHING_NOTIFICATION_EMAIL` = `your-email@example.com`

**Important:** The email address must be the same Google account that owns the Apps Script project, or you need to grant the script permission to send emails on your behalf.

When a new application is submitted, you'll receive an email with all the form details.

## 4) Set Vercel environment variable

In Vercel → Project → Settings → Environment Variables, set:
- `COACHING_WEBHOOK_URL` = `https://YOUR_WEB_APP_URL` (or include `?secret=...` if using the secret)

Deploy again after setting the env var.

## 5) Test

1. Open the website and navigate to `/coaching-application.html`.
2. Fill out the coaching application form completely.
3. Submit the form.
4. Confirm a new row appears in the Google Sheet with all the form data.
5. Verify you're redirected to `/thank-you.html?product=coaching` with a thank you message.

## Form Fields

The form collects the following information:
- **Required fields**: Name, Gender, Situation, Primary Goal, Experience Level, Contact (phone number, email, or Instagram handle)
- **Optional fields**: Age, Height, Weight, Employment Status

**Contact Field:** Users can enter their phone number, email address, or Instagram handle (e.g., `@username`). The form validates that the input matches one of these formats.

All submissions are timestamped and include user agent, referrer, and page URL for tracking purposes.





