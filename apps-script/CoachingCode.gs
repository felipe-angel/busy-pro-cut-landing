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
    var experience_level = safe_(body.experience_level);
    var employed = safe_(body.employed);
    var contact = safe_(body.contact);
    // Backward compatibility: if contact is empty, try phone
    if (!contact || contact === '') {
      contact = safe_(body.phone);
    }
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
        'experience_level',
        'employed',
        'contact',
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
      experience_level,
      employed,
      contact,
      userAgent,
      referrer,
      page
    ]);

    // Send email notification
    try {
      var notificationEmail = PropertiesService.getScriptProperties().getProperty('COACHING_NOTIFICATION_EMAIL');
      if (notificationEmail) {
        var subject = 'New Coaching Application: ' + name;
        var emailBody = 'A new coaching application has been submitted:\n\n';
        emailBody += 'Name: ' + name + '\n';
        emailBody += 'Age: ' + age + '\n';
        emailBody += 'Height: ' + height + '\n';
        emailBody += 'Weight: ' + weight + '\n';
        emailBody += 'Gender: ' + gender + '\n';
        emailBody += 'Situation: ' + situation + '\n';
        emailBody += 'Primary Goal: ' + primary_goal + '\n';
        emailBody += 'Experience Level: ' + experience_level + '\n';
        emailBody += 'Employed: ' + employed + '\n';
        emailBody += 'Contact: ' + contact + '\n';
        emailBody += 'Timestamp: ' + ts.toISOString() + '\n';
        emailBody += 'Page: ' + page + '\n';
        
        // Try GmailApp first (better authorization), fallback to MailApp
        try {
          GmailApp.sendEmail(notificationEmail, subject, emailBody);
          Logger.log('Email notification sent successfully via GmailApp to: ' + notificationEmail);
        } catch (gmailError) {
          // Fallback to MailApp if GmailApp fails
          MailApp.sendEmail({
            to: notificationEmail,
            subject: subject,
            body: emailBody
          });
          Logger.log('Email notification sent successfully via MailApp to: ' + notificationEmail);
        }
      } else {
        Logger.log('COACHING_NOTIFICATION_EMAIL not set - skipping email notification');
      }
    } catch (emailError) {
      // Log error but don't fail the request
      Logger.log('Email notification error: ' + emailError.toString());
      Logger.log('Error details: ' + JSON.stringify(emailError));
    }

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

// Test function to verify email notifications are working
// Run this function manually from the Apps Script editor to test email sending
function testEmailNotification() {
  try {
    var notificationEmail = PropertiesService.getScriptProperties().getProperty('COACHING_NOTIFICATION_EMAIL');
    
    if (!notificationEmail) {
      Logger.log('ERROR: COACHING_NOTIFICATION_EMAIL not set in script properties');
      return;
    }
    
    Logger.log('Attempting to send test email to: ' + notificationEmail);
    
    // Try GmailApp first (better authorization), fallback to MailApp
    try {
      GmailApp.sendEmail(notificationEmail, 'Test Email - Coaching Application Webhook', 'This is a test email to verify email notifications are working.\n\nIf you received this, email sending is configured correctly!');
      Logger.log('Test email sent successfully via GmailApp!');
    } catch (gmailError) {
      Logger.log('GmailApp failed, trying MailApp... Error: ' + gmailError.toString());
      try {
        MailApp.sendEmail({
          to: notificationEmail,
          subject: 'Test Email - Coaching Application Webhook',
          body: 'This is a test email to verify email notifications are working.\n\nIf you received this, email sending is configured correctly!'
        });
        Logger.log('Test email sent successfully via MailApp!');
      } catch (mailError) {
        Logger.log('Both GmailApp and MailApp failed. Error: ' + mailError.toString());
        throw mailError;
      }
    }
  } catch (error) {
    Logger.log('ERROR sending test email: ' + error.toString());
    Logger.log('Full error: ' + JSON.stringify(error));
  }
}





