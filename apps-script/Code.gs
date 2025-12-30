// Google Apps Script (Web App) for logging leads into Google Sheets.
//
// What it does:
// - Accepts POST requests with JSON: { source, name, email, phone, userAgent, referrer, page }
// - Appends a row into the active spreadsheet
//
// Setup notes:
// - Create a Google Sheet
// - Extensions → Apps Script
// - Paste this file
// - Deploy → New deployment → "Web app"
//   - Execute as: Me
//   - Who has access: Anyone (or Anyone with the link)
// - Copy the Web App URL and set it as LEADS_WEBHOOK_URL in Vercel
//
// Optional security:
// - Set a script property LEADS_WEBHOOK_SECRET
// - Send request header: x-leads-secret: <secret>
//

function doPost(e) {
  try {
    var secret = PropertiesService.getScriptProperties().getProperty('LEADS_WEBHOOK_SECRET');
    var reqSecret = (e && e.parameter && e.parameter.secret) || (e && e.postData && e.postData.type); // keep backward compat
    // Header access in Apps Script Web Apps is limited; easiest is using query param ?secret=...
    // If you want header-based secret, switch to a Workspace add-on / Cloud Run.
    // We’ll primarily use query param secret in this template.

    // If a secret is set, require it via query param `?secret=...`
    if (secret) {
      var qsSecret = (e && e.parameter && e.parameter.secret) ? String(e.parameter.secret) : '';
      if (!qsSecret || qsSecret !== secret) {
        return json_(401, { ok: false, error: 'Unauthorized' });
      }
    }

    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    var ts = new Date();
    var source = safe_(body.source);
    var name = safe_(body.name);
    var email = safe_(body.email);
    var phone = safe_(body.phone);
    var userAgent = safe_(body.userAgent);
    var referrer = safe_(body.referrer);
    var page = safe_(body.page);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // If this is a brand new sheet, you can optionally add headers once
    // (commented out to avoid overwriting existing layouts)
    // if (sheet.getLastRow() === 0) {
    //   sheet.appendRow(['timestamp', 'source', 'name', 'email', 'phone', 'user_agent', 'referrer', 'page']);
    // }

    sheet.appendRow([ts.toISOString(), source, name, email, phone, userAgent, referrer, page]);

    return json_(200, { ok: true });
  } catch (err) {
    return json_(500, { ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  return json_(200, { ok: true, message: 'Lead logger is running' });
}

function json_(status, obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function safe_(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}


