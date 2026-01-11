// Google Apps Script (Web App) for logging coaching applications into Google Sheets.
//
// What it does:
// - Accepts POST requests with JSON containing coaching application form data
// - Appends a row into the active spreadsheet
//
// Setup notes:
// - Create a NEW Google Sheet for coaching applications
// - Extensions → Apps Script
// - Paste this file
// - Deploy → New deployment → "Web app"
//   - Execute as: Me
//   - Who has access: Anyone (or Anyone with the link)
// - Copy the Web App URL and set it as COACHING_WEBHOOK_URL in Vercel
//
// Optional security:
// - Set a script property COACHING_WEBHOOK_SECRET
// - Send request with query param ?secret=...
//

function doPost(e) {
  try {
    var secret = PropertiesService.getScriptProperties().getProperty('COACHING_WEBHOOK_SECRET');
    
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
    var age = safe_(body.age);
    var height = safe_(body.height);
    var weight = safe_(body.weight);
    var gender = safe_(body.gender);
    var situation = safe_(body.situation);
    var primary_goal = safe_(body.primary_goal);
    var exercise_types = safe_(body.exercise_types);
    var exercise_other = safe_(body.exercise_other);
    var experience_level = safe_(body.experience_level);
    var specific_goal = safe_(body.specific_goal);
    var hardest_challenge = safe_(body.hardest_challenge);
    var muscle_groups = safe_(body.muscle_groups);
    var employed = safe_(body.employed);
    var phone = safe_(body.phone);
    var userAgent = safe_(body.userAgent);
    var referrer = safe_(body.referrer);
    var page = safe_(body.page);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // If this is a brand new sheet, add headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'timestamp',
        'source',
        'name',
        'age',
        'height',
        'weight',
        'gender',
        'situation',
        'primary_goal',
        'exercise_types',
        'exercise_other',
        'experience_level',
        'specific_goal',
        'hardest_challenge',
        'muscle_groups',
        'employed',
        'phone',
        'user_agent',
        'referrer',
        'page'
      ]);
    }

    sheet.appendRow([
      ts.toISOString(),
      source,
      name,
      age,
      height,
      weight,
      gender,
      situation,
      primary_goal,
      exercise_types,
      exercise_other,
      experience_level,
      specific_goal,
      hardest_challenge,
      muscle_groups,
      employed,
      phone,
      userAgent,
      referrer,
      page
    ]);

    return json_(200, { ok: true });
  } catch (err) {
    return json_(500, { ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  return json_(200, { ok: true, message: 'Coaching application logger is running' });
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



