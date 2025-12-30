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

  const { name, email, phone, product, page } = body || {};
  const normalizedEmail = String(email || '').trim();
  const normalizedPhone = String(phone || '').trim();
  if (!normalizedEmail || !normalizedPhone) {
    return res.status(400).json({ success: false, message: 'Email and phone are required' });
  }
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email' });
  }
  if (normalizedPhone.replace(/\D/g, '').length < 7) {
    return res.status(400).json({ success: false, message: 'Please enter a valid phone number' });
  }

  try {
    const leadsWebhookUrl = process.env.LEADS_WEBHOOK_URL;
    if (!leadsWebhookUrl) {
      return res.status(500).json({ success: false, message: 'Server not configured' });
    }

    const normalizedProduct = product === 'bundle' ? 'bundle' : 'workout';
    const redirect = normalizedProduct === 'bundle'
      ? '/thank-you.html?product=bundle'
      : '/thank-you.html?product=workout';

    const payload = {
      source: normalizedProduct,
      name: (name || '').trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      userAgent: req.headers['user-agent'] || '',
      referrer: req.headers['referer'] || '',
      page: String(page || req.headers['referer'] || '').trim(),
    };

    const response = await fetch(leadsWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Leads webhook error:', response.status, text);
      return res.status(502).json({ success: false, message: 'Unable to save submission' });
    }

    return res.status(200).json({ success: true, redirect });
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
