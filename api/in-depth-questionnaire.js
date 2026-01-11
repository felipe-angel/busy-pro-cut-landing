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

  try {
    const questionnaireWebhookUrl = process.env.QUESTIONNAIRE_WEBHOOK_URL;
    if (!questionnaireWebhookUrl) {
      return res.status(500).json({ success: false, message: 'Server not configured' });
    }

    // All fields are optional - just pass through whatever was submitted
    const payload = {
      source: 'in-depth-questionnaire',
      
      // Section 1: Basics & Logistics
      full_name: safe(body.full_name),
      email: safe(body.email),
      phone: safe(body.phone),
      timezone: safe(body.timezone),
      age: safe(body.age),
      sex: safe(body.sex),
      height: safe(body.height),
      current_weight: safe(body.current_weight),
      body_fat: safe(body.body_fat),
      daily_steps: safe(body.daily_steps),
      upcoming_events: safe(body.upcoming_events),
      communication_method: safe(body.communication_method),

      // Section 2: Main Goal & Outcome
      primary_goal: safe(body.primary_goal),
      top_outcomes: safe(body.top_outcomes),
      timeline: safe(body.timeline),
      measure_success: safe(body.measure_success),
      goal_importance: safe(body.goal_importance),
      confidence_level: safe(body.confidence_level),
      decide_phase: safe(body.decide_phase),
      progress_photos: safe(body.progress_photos),

      // Section 3: Training Experience & Current Routine
      lifting_experience: safe(body.lifting_experience),
      current_training: safe(body.current_training),
      what_worked: safe(body.what_worked),
      what_not_worked: safe(body.what_not_worked),
      experience_level: safe(body.experience_level),
      bench: safe(body.bench),
      squat: safe(body.squat),
      deadlift: safe(body.deadlift),
      pullups: safe(body.pullups),
      other_lifts: safe(body.other_lifts),

      // Section 4: Schedule, Availability, and Preferences
      training_days: safe(body.training_days),
      session_length: safe(body.session_length),
      preferred_days: safe(body.preferred_days),
      training_time: safe(body.training_time),
      schedule_preference: safe(body.schedule_preference),
      gym_type: safe(body.gym_type),
      schedule_constraints: safe(body.schedule_constraints),

      // Section 5: Equipment & Gym Access
      equipment: safe(body.equipment),
      dumbbell_weight: safe(body.dumbbell_weight),
      equipment_missing: safe(body.equipment_missing),

      // Section 6: Injuries, Pain, Limitations
      current_injuries: safe(body.current_injuries),
      injury_details: safe(body.injury_details),
      past_injuries: safe(body.past_injuries),
      exercises_avoid: safe(body.exercises_avoid),
      exercises_dislike: safe(body.exercises_dislike),
      exercises_love: safe(body.exercises_love),
      medical_conditions: safe(body.medical_conditions),
      medical_clearance: safe(body.medical_clearance),

      // Section 7: Muscle Priorities & Physique Focus
      muscle_priorities: safe(body.muscle_priorities),
      overdeveloped_areas: safe(body.overdeveloped_areas),
      posture_goals: safe(body.posture_goals),

      // Section 8: Split Preference & Training Style
      preferred_split: safe(body.preferred_split),
      weight_preference: safe(body.weight_preference),
      training_priority: safe(body.training_priority),
      training_intensity: safe(body.training_intensity),

      // Section 9: Cardio, Steps, and Activity
      doing_cardio: safe(body.doing_cardio),
      cardio_details: safe(body.cardio_details),
      cardio_enjoyment: safe(body.cardio_enjoyment),
      cardio_options: safe(body.cardio_options),
      daily_activity: safe(body.daily_activity),
      step_target: safe(body.step_target),

      // Section 10: Recovery, Stress, and Lifestyle
      avg_sleep: safe(body.avg_sleep),
      sleep_quality: safe(body.sleep_quality),
      stress_level: safe(body.stress_level),
      stress_causes: safe(body.stress_causes),
      run_down_days: safe(body.run_down_days),
      recovery_tools: safe(body.recovery_tools),
      recovery_limitations: safe(body.recovery_limitations),

      // Section 11: Nutrition Goal & Strategy Preference
      nutrition_goal: safe(body.nutrition_goal),
      nutrition_support: safe(body.nutrition_support),
      willing_to_track: safe(body.willing_to_track),
      current_tracking: safe(body.current_tracking),
      nutrition_challenges: safe(body.nutrition_challenges),

      // Section 12: Current Eating Pattern & Schedule Constraints
      meals_per_day: safe(body.meals_per_day),
      meal1_time: safe(body.meal1_time),
      meal2_time: safe(body.meal2_time),
      meal3_time: safe(body.meal3_time),
      snacks_time: safe(body.snacks_time),
      intermittent_fasting: safe(body.intermittent_fasting),
      eating_window: safe(body.eating_window),
      training_time_meal: safe(body.training_time_meal),
      preworkout_preference: safe(body.preworkout_preference),
      typical_weekday: safe(body.typical_weekday),
      typical_weekend: safe(body.typical_weekend),

      // Section 13: Food Preferences, Restrictions, and Non-Negotiables
      allergies: safe(body.allergies),
      foods_refuse: safe(body.foods_refuse),
      foods_prefer: safe(body.foods_prefer),
      dietary_style: safe(body.dietary_style),
      religious_restrictions: safe(body.religious_restrictions),
      digestive_issues: safe(body.digestive_issues),

      // Section 14: Cooking, Meal Prep, Budget, and Eating Out
      meal_prep_days: safe(body.meal_prep_days),
      cooking_setup: safe(body.cooking_setup),
      cooking_confidence: safe(body.cooking_confidence),
      bring_meals: safe(body.bring_meals),
      eat_out_frequency: safe(body.eat_out_frequency),
      eat_out_places: safe(body.eat_out_places),
      grocery_budget: safe(body.grocery_budget),
      convenience_foods: safe(body.convenience_foods),

      // Section 15: Protein, Hunger, Cravings, and Trigger Foods
      current_protein: safe(body.current_protein),
      protein_sources: safe(body.protein_sources),
      hunger_level: safe(body.hunger_level),
      cravings_worst: safe(body.cravings_worst),
      trigger_foods: safe(body.trigger_foods),
      struggle_situations: safe(body.struggle_situations),

      // Section 16: Hydration, Alcohol, Supplements
      water_intake: safe(body.water_intake),
      caffeine_intake: safe(body.caffeine_intake),
      alcohol_frequency: safe(body.alcohol_frequency),
      current_supplements: safe(body.current_supplements),
      supplements_refuse: safe(body.supplements_refuse),

      // Meta
      userAgent: req.headers['user-agent'] || '',
      referrer: req.headers['referer'] || '',
      page: safe(body.page) || req.headers['referer'] || '',
    };

    const response = await fetch(questionnaireWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Questionnaire webhook error:', response.status, text);
      return res.status(502).json({ success: false, message: 'Unable to save submission' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('In-depth questionnaire API error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

function safe(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  return String(value).trim();
}

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

