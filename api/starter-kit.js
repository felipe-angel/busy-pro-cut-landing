const fs = require('fs');
const path = require('path');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  let body = {};
  try {
    body = await readJson(req);
  } catch (_) {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }

  const { name, email, phone, consent, subject } = body || {};
  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const notifyToEmail = process.env.NOTIFY_TO_EMAIL; // destination inbox
    const fromEmail = process.env.FROM_EMAIL || 'Angel Coaching <onboarding@resend.dev>';

    if (!resendApiKey || !notifyToEmail) {
      return res.status(500).json({ success: false, message: 'Server not configured' });
    }

    const html = `
      <h2>New Busy Pro Starter Kit Signup</h2>
      <ul>
        <li><strong>Name:</strong> ${escapeHtml(name)}</li>
        <li><strong>Email:</strong> ${escapeHtml(email)}</li>
        <li><strong>Phone:</strong> ${escapeHtml(phone)}</li>
        <li><strong>Consent:</strong> ${consent ? 'Yes' : 'No'}</li>
      </ul>
    `;

    const notifyPayload = {
      from: fromEmail,
      to: [notifyToEmail],
      subject: subject || 'New Busy Pro Starter Kit Signup',
      html,
      text: `New Busy Pro Starter Kit Signup\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nConsent: ${consent ? 'Yes' : 'No'}`,
    };

    // Build subscriber email with attachment
    const pdfPath = path.join(process.cwd(), 'kit', 'fat-loss-starter-kit.pdf');
    let attachment = null;
    try {
      const fileBuf = fs.readFileSync(pdfPath);
      attachment = {
        filename: 'Fat Loss Starter Kit.pdf',
        content: fileBuf.toString('base64'),
      };
    } catch (e) {
      console.warn('Could not read PDF for attachment:', e?.message || e);
    }

    const publicUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/kit/busy-pro-starter-kit.pdf`;
    const welcomeHtml = `
      <p>Here is your Busy Pro Starter Kit. The PDF is attached.</p>
      <p>If the attachment is missing, you can also download it here: <a href="${publicUrl}">${publicUrl}</a></p>
      <p>— Angel Coaching</p>
    `;
    const welcomePayload = {
      from: fromEmail,
      to: [email],
      subject: 'Your Busy Pro Starter Kit',
      html: welcomeHtml,
      text: `Here is your Busy Pro Starter Kit. Download: ${publicUrl}`,
      attachments: attachment ? [attachment] : undefined,
    };

    await sendResendEmail(resendApiKey, welcomePayload);
    await sendResendEmail(resendApiKey, notifyPayload);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Starter kit API error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendResendEmail(apiKey, payload) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error: ${text}`);
  }
}


