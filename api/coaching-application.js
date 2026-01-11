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
    exercise_types,
    exercise_other,
    experience_level,
    specific_goal,
    hardest_challenge,
    muscle_groups,
    employed,
    phone,
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
  if (!exercise_types || (Array.isArray(exercise_types) && exercise_types.length === 0)) {
    return res.status(400).json({ success: false, message: 'At least one exercise type is required' });
  }
  if (!experience_level) {
    return res.status(400).json({ success: false, message: 'Experience level is required' });
  }
  if (!specific_goal || !specific_goal.trim()) {
    return res.status(400).json({ success: false, message: 'Specific goal is required' });
  }
  if (!hardest_challenge || !hardest_challenge.trim()) {
    return res.status(400).json({ success: false, message: 'Hardest challenge is required' });
  }
  if (!muscle_groups || !muscle_groups.trim()) {
    return res.status(400).json({ success: false, message: 'Muscle groups to prioritize is required' });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  // Validate phone number
  const normalizedPhone = String(phone || '').trim();
  if (normalizedPhone.replace(/\D/g, '').length < 7) {
    return res.status(400).json({ success: false, message: 'Please enter a valid phone number' });
  }

  try {
    const coachingWebhookUrl = process.env.COACHING_WEBHOOK_URL;
    if (!coachingWebhookUrl) {
      return res.status(500).json({ success: false, message: 'Server not configured' });
    }

    // Format exercise_types as array (handle both array and single value)
    let exerciseTypesArray = [];
    if (Array.isArray(exercise_types)) {
      exerciseTypesArray = exercise_types;
    } else if (exercise_types) {
      exerciseTypesArray = [exercise_types];
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
      exercise_types: exerciseTypesArray.join(', '),
      exercise_other: (exercise_other || '').trim(),
      experience_level: (experience_level || '').trim(),
      specific_goal: (specific_goal || '').trim(),
      hardest_challenge: (hardest_challenge || '').trim(),
      muscle_groups: (muscle_groups || '').trim(),
      employed: (employed || '').trim(),
      phone: normalizedPhone,
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



