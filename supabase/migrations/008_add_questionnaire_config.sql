-- Questionnaire configuration table for admin-managed Find a Home questions
CREATE TABLE IF NOT EXISTS questionnaire_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  answer_type TEXT NOT NULL DEFAULT 'single' CHECK (answer_type IN ('single', 'multi')),
  options JSONB NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE questionnaire_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read questions (for Find a Home page)
CREATE POLICY "Anyone can read questionnaire config"
  ON questionnaire_config FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can manage
CREATE POLICY "Admins can insert questionnaire config"
  ON questionnaire_config FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update questionnaire config"
  ON questionnaire_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete questionnaire config"
  ON questionnaire_config FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Seed with default questions from Find a Home wizard
INSERT INTO questionnaire_config (step_id, title, subtitle, answer_type, options, sort_order) VALUES
  ('who', 'Who needs senior living?', 'We''ll personalize your search based on your answer.', 'single',
   '[{"label":"Mom","value":"mom","icon":"👩"},{"label":"Dad","value":"dad","icon":"👨"},{"label":"My Wife","value":"wife","icon":"👩‍🦳"},{"label":"My Husband","value":"husband","icon":"👨‍🦳"},{"label":"Myself","value":"myself","icon":"🙋"},{"label":"Other / Several","value":"other","icon":"👥"}]',
   0),
  ('age', 'What is the age?', 'This helps us find age-appropriate facilities.', 'single',
   '[{"label":"55 – 64","value":"55-64"},{"label":"65 – 74","value":"65-74"},{"label":"75 – 84","value":"75-84"},{"label":"85+","value":"85+"}]',
   1),
  ('timeline', 'How quickly do you need to find an option?', 'We''ll prioritize based on your timeline.', 'single',
   '[{"label":"Immediately","value":"immediately"},{"label":"Within 30 days","value":"30-days"},{"label":"Within 60 days","value":"60-days"},{"label":"No rush, just exploring","value":"no-rush"}]',
   2),
  ('living', 'Where is your loved one living now?', 'This helps us understand current care needs.', 'single',
   '[{"label":"Home alone","value":"home-alone","icon":"🏠"},{"label":"Home with someone","value":"home-with-someone","icon":"🏡"},{"label":"Assisted Living / Nursing Home","value":"assisted-living","icon":"🏥"},{"label":"Hospital","value":"hospital","icon":"🏨"},{"label":"Rehab Facility","value":"rehab","icon":"🏢"}]',
   3),
  ('looking-for', 'What are you looking for in a senior living facility?', 'Select all that apply.', 'multi',
   '[{"label":"Companionship & social life","value":"companionship"},{"label":"Safety & security","value":"safety"},{"label":"Access to medical care","value":"medical-care"},{"label":"Activities & enrichment","value":"activities"},{"label":"Relief for caregiver","value":"caregiver-relief"},{"label":"Peace of mind","value":"peace-of-mind"}]',
   4),
  ('mobility', 'How is the current mobility?', 'This helps match facilities with the right accessibility features.', 'single',
   '[{"label":"Great – fully independent","value":"great"},{"label":"Good – mostly independent","value":"good"},{"label":"Can walk with assistance","value":"walk-with-help"},{"label":"Uses a wheelchair","value":"wheelchair"},{"label":"Mostly immobile / bedridden","value":"immobile"}]',
   5),
  ('assistance', 'What assistance is needed?', 'Select all that apply.', 'multi',
   '[{"label":"Housekeeping","value":"housekeeping"},{"label":"Meal preparation","value":"meal-prep"},{"label":"Toileting","value":"toileting"},{"label":"Bathing & grooming","value":"bathing"},{"label":"Medication management","value":"medication"},{"label":"Diabetic care","value":"diabetic-care"},{"label":"Social activities","value":"social"},{"label":"Other","value":"other"},{"label":"None of these","value":"none"}]',
   6),
  ('cognitive', 'Has your loved one experienced any of the following?', 'Select all that apply. This helps us identify memory care needs.', 'multi',
   '[{"label":"Forgetfulness","value":"forgetfulness"},{"label":"Memory loss","value":"memory-loss"},{"label":"Confusion or disorientation","value":"confusion"},{"label":"Social withdrawal","value":"withdrawal"},{"label":"Aggressiveness","value":"aggressiveness"},{"label":"Hallucinations","value":"hallucinations"},{"label":"Needs 24/7 care","value":"24-7-care"},{"label":"Diagnosed with Alzheimer''s","value":"alzheimers"},{"label":"None of these","value":"none"}]',
   7),
  ('budget', 'What is your monthly budget for senior living?', 'This helps us find options within your range.', 'single',
   '[{"label":"Below ₱20,000","value":"below-20k"},{"label":"₱20,000 – ₱40,000","value":"20k-40k"},{"label":"₱40,000 – ₱70,000","value":"40k-70k"},{"label":"₱70,000 – ₱100,000","value":"70k-100k"},{"label":"₱100,000+","value":"100k-plus"},{"label":"Not sure yet","value":"not-sure"}]',
   8);
