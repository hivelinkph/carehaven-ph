-- Provider care profiles: providers answer the same questionnaire to enable matching
CREATE TABLE IF NOT EXISTS provider_care_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(facility_id)
);

-- Enable RLS
ALTER TABLE provider_care_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (for matching)
CREATE POLICY "Anyone can read provider care profiles"
  ON provider_care_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Providers can manage their own profiles
CREATE POLICY "Providers can insert their own care profiles"
  ON provider_care_profiles FOR INSERT
  TO authenticated
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update their own care profiles"
  ON provider_care_profiles FOR UPDATE
  TO authenticated
  USING (provider_id = auth.uid());

CREATE POLICY "Providers can delete their own care profiles"
  ON provider_care_profiles FOR DELETE
  TO authenticated
  USING (provider_id = auth.uid());

-- Admins can manage all
CREATE POLICY "Admins can manage all provider care profiles"
  ON provider_care_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
