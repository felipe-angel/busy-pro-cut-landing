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

  // Extract and validate required fields
  const {
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
    page,
  } = body || {};

  // Validate required fields
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  if (!gender) {
    return res.status(400).json({ success: false, message: 'Gender is required' });
  }
  if (!situation) {
    return res.status(400).json({ success: false, message: 'Situation description is required' });
  }
  if (!primary_goal) {
    return res.status(400).json({ success: false, message: 'Primary goal is required' });
  }
  if (!experience_level) {
    return res.status(400).json({ success: false, message: 'Experience level is required' });
  }
  if (!contact || !contact.trim()) {
    return res.status(400).json({ success: false, message: 'Contact information is required' });
  }

  // Validate contact (phone, email, or Instagram)
  const normalizedContact = String(contact || '').trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedContact);
  const isInstagram = /^@?[a-zA-Z0-9._]+$/.test(normalizedContact.replace(/^@/, ''));
  const isPhone = normalizedContact.replace(/\D/g, '').length >= 7;
  
  if (!isEmail && !isInstagram && !isPhone) {
    return res.status(400).json({ success: false, message: 'Please enter a valid phone number, email, or Instagram handle' });
  }

  try {
    const coachingWebhookUrl = process.env.COACHING_WEBHOOK_URL;
    if (!coachingWebhookUrl) {
      return res.status(500).json({ success: false, message: 'Server not configured' });
    }

    const payload = {
      source: 'coaching',
      name: (name || '').trim(),
      age: age ? String(age).trim() : '',
      height: (height || '').trim(),
      weight: weight ? String(weight).trim() : '',
      gender: (gender || '').trim(),
      situation: (situation || '').trim(),
      primary_goal: (primary_goal || '').trim(),
      experience_level: (experience_level || '').trim(),
      employed: (employed || '').trim(),
      contact: normalizedContact,
      userAgent: req.headers['user-agent'] || '',
      referrer: req.headers['referer'] || '',
      page: String(page || req.headers['referer'] || '').trim(),
    };

    const response = await fetch(coachingWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Coaching webhook error:', response.status, text);
      return res.status(502).json({ success: false, message: 'Unable to save submission' });
    }

    return res.status(200).json({ success: true, redirect: '/thank-you.html?product=coaching' });
  } catch (error) {
    console.error('Coaching application API error:', error);
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





