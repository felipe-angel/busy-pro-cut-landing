// Google Apps Script (Web App) for logging in-depth questionnaire responses into Google Sheets.
//
// What it does:
// - Accepts POST requests with JSON containing questionnaire form data
// - Appends a row into the active spreadsheet
//
// Setup notes:
// 1. Create a NEW Google Sheet for in-depth questionnaire responses
// 2. Go to Extensions → Apps Script
// 3. Paste this entire file
// 4. Deploy → New deployment → "Web app"
//    - Execute as: Me
//    - Who has access: Anyone (or Anyone with the link)
// 5. Copy the Web App URL
// 6. In Vercel, add environment variable: QUESTIONNAIRE_WEBHOOK_URL = [your web app URL]
//
// Optional security:
// - Set a script property QUESTIONNAIRE_WEBHOOK_SECRET
// - Send request with query param ?secret=...
//

function doPost(e) {
  try {
    var secret = PropertiesService.getScriptProperties().getProperty('QUESTIONNAIRE_WEBHOOK_SECRET');
    
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
    
    // All the fields from the questionnaire
    var row = [
      ts.toISOString(),
      safe_(body.source),
      
      // Section 1: Basics & Logistics
      safe_(body.full_name),
      safe_(body.email),
      safe_(body.phone),
      safe_(body.timezone),
      safe_(body.age),
      safe_(body.sex),
      safe_(body.height),
      safe_(body.current_weight),
      safe_(body.body_fat),
      safe_(body.daily_steps),
      safe_(body.upcoming_events),
      safe_(body.communication_method),

      // Section 2: Main Goal & Outcome
      safe_(body.primary_goal),
      safe_(body.top_outcomes),
      safe_(body.timeline),
      safe_(body.measure_success),
      safe_(body.goal_importance),
      safe_(body.confidence_level),
      safe_(body.decide_phase),
      safe_(body.progress_photos),

      // Section 3: Training Experience & Current Routine
      safe_(body.lifting_experience),
      safe_(body.current_training),
      safe_(body.what_worked),
      safe_(body.what_not_worked),
      safe_(body.experience_level),
      safe_(body.bench),
      safe_(body.squat),
      safe_(body.deadlift),
      safe_(body.pullups),
      safe_(body.other_lifts),

      // Section 4: Schedule, Availability, and Preferences
      safe_(body.training_days),
      safe_(body.session_length),
      safe_(body.preferred_days),
      safe_(body.training_time),
      safe_(body.schedule_preference),
      safe_(body.gym_type),
      safe_(body.schedule_constraints),

      // Section 5: Equipment & Gym Access
      safe_(body.equipment),
      safe_(body.dumbbell_weight),
      safe_(body.equipment_missing),

      // Section 6: Injuries, Pain, Limitations
      safe_(body.current_injuries),
      safe_(body.injury_details),
      safe_(body.past_injuries),
      safe_(body.exercises_avoid),
      safe_(body.exercises_dislike),
      safe_(body.exercises_love),
      safe_(body.medical_conditions),
      safe_(body.medical_clearance),

      // Section 7: Muscle Priorities & Physique Focus
      safe_(body.muscle_priorities),
      safe_(body.overdeveloped_areas),
      safe_(body.posture_goals),

      // Section 8: Split Preference & Training Style
      safe_(body.preferred_split),
      safe_(body.weight_preference),
      safe_(body.training_priority),
      safe_(body.training_intensity),

      // Section 9: Cardio, Steps, and Activity
      safe_(body.doing_cardio),
      safe_(body.cardio_details),
      safe_(body.cardio_enjoyment),
      safe_(body.cardio_options),
      safe_(body.daily_activity),
      safe_(body.step_target),

      // Section 10: Recovery, Stress, and Lifestyle
      safe_(body.avg_sleep),
      safe_(body.sleep_quality),
      safe_(body.stress_level),
      safe_(body.stress_causes),
      safe_(body.run_down_days),
      safe_(body.recovery_tools),
      safe_(body.recovery_limitations),

      // Section 11: Nutrition Goal & Strategy Preference
      safe_(body.nutrition_goal),
      safe_(body.nutrition_support),
      safe_(body.willing_to_track),
      safe_(body.current_tracking),
      safe_(body.nutrition_challenges),

      // Section 12: Current Eating Pattern & Schedule Constraints
      safe_(body.meals_per_day),
      safe_(body.meal1_time),
      safe_(body.meal2_time),
      safe_(body.meal3_time),
      safe_(body.snacks_time),
      safe_(body.intermittent_fasting),
      safe_(body.eating_window),
      safe_(body.training_time_meal),
      safe_(body.preworkout_preference),
      safe_(body.typical_weekday),
      safe_(body.typical_weekend),

      // Section 13: Food Preferences, Restrictions, and Non-Negotiables
      safe_(body.allergies),
      safe_(body.foods_refuse),
      safe_(body.foods_prefer),
      safe_(body.dietary_style),
      safe_(body.religious_restrictions),
      safe_(body.digestive_issues),

      // Section 14: Cooking, Meal Prep, Budget, and Eating Out
      safe_(body.meal_prep_days),
      safe_(body.cooking_setup),
      safe_(body.cooking_confidence),
      safe_(body.bring_meals),
      safe_(body.eat_out_frequency),
      safe_(body.eat_out_places),
      safe_(body.grocery_budget),
      safe_(body.convenience_foods),

      // Section 15: Protein, Hunger, Cravings, and Trigger Foods
      safe_(body.current_protein),
      safe_(body.protein_sources),
      safe_(body.hunger_level),
      safe_(body.cravings_worst),
      safe_(body.trigger_foods),
      safe_(body.struggle_situations),

      // Section 16: Hydration, Alcohol, Supplements
      safe_(body.water_intake),
      safe_(body.caffeine_intake),
      safe_(body.alcohol_frequency),
      safe_(body.current_supplements),
      safe_(body.supplements_refuse),

      // Meta
      safe_(body.userAgent),
      safe_(body.referrer),
      safe_(body.page)
    ];

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // If this is a brand new sheet, add headers
    if (sheet.getLastRow() === 0) {
      var headers = [
        'timestamp',
        'source',
        
        // Section 1
        'full_name',
        'email',
        'phone',
        'timezone',
        'age',
        'sex',
        'height',
        'current_weight',
        'body_fat',
        'daily_steps',
        'upcoming_events',
        'communication_method',

        // Section 2
        'primary_goal',
        'top_outcomes',
        'timeline',
        'measure_success',
        'goal_importance',
        'confidence_level',
        'decide_phase',
        'progress_photos',

        // Section 3
        'lifting_experience',
        'current_training',
        'what_worked',
        'what_not_worked',
        'experience_level',
        'bench',
        'squat',
        'deadlift',
        'pullups',
        'other_lifts',

        // Section 4
        'training_days',
        'session_length',
        'preferred_days',
        'training_time',
        'schedule_preference',
        'gym_type',
        'schedule_constraints',

        // Section 5
        'equipment',
        'dumbbell_weight',
        'equipment_missing',

        // Section 6
        'current_injuries',
        'injury_details',
        'past_injuries',
        'exercises_avoid',
        'exercises_dislike',
        'exercises_love',
        'medical_conditions',
        'medical_clearance',

        // Section 7
        'muscle_priorities',
        'overdeveloped_areas',
        'posture_goals',

        // Section 8
        'preferred_split',
        'weight_preference',
        'training_priority',
        'training_intensity',

        // Section 9
        'doing_cardio',
        'cardio_details',
        'cardio_enjoyment',
        'cardio_options',
        'daily_activity',
        'step_target',

        // Section 10
        'avg_sleep',
        'sleep_quality',
        'stress_level',
        'stress_causes',
        'run_down_days',
        'recovery_tools',
        'recovery_limitations',

        // Section 11
        'nutrition_goal',
        'nutrition_support',
        'willing_to_track',
        'current_tracking',
        'nutrition_challenges',

        // Section 12
        'meals_per_day',
        'meal1_time',
        'meal2_time',
        'meal3_time',
        'snacks_time',
        'intermittent_fasting',
        'eating_window',
        'training_time_meal',
        'preworkout_preference',
        'typical_weekday',
        'typical_weekend',

        // Section 13
        'allergies',
        'foods_refuse',
        'foods_prefer',
        'dietary_style',
        'religious_restrictions',
        'digestive_issues',

        // Section 14
        'meal_prep_days',
        'cooking_setup',
        'cooking_confidence',
        'bring_meals',
        'eat_out_frequency',
        'eat_out_places',
        'grocery_budget',
        'convenience_foods',

        // Section 15
        'current_protein',
        'protein_sources',
        'hunger_level',
        'cravings_worst',
        'trigger_foods',
        'struggle_situations',

        // Section 16
        'water_intake',
        'caffeine_intake',
        'alcohol_frequency',
        'current_supplements',
        'supplements_refuse',

        // Meta
        'user_agent',
        'referrer',
        'page'
      ];
      sheet.appendRow(headers);
    }

    sheet.appendRow(row);

    return json_(200, { ok: true });
  } catch (err) {
    return json_(500, { ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  return json_(200, { ok: true, message: 'In-depth questionnaire logger is running' });
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



