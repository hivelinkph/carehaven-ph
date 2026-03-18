-- Track how many times a provider/facility appears in top-3 match results
CREATE TABLE IF NOT EXISTS match_impressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_answers JSONB NOT NULL DEFAULT '{}',
  match_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE match_impressions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous users completing the questionnaire)
CREATE POLICY "Anyone can insert match impressions"
  ON match_impressions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can read all
CREATE POLICY "Admins can read match impressions"
  ON match_impressions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Providers can read their own impressions
CREATE POLICY "Providers can read own match impressions"
  ON match_impressions FOR SELECT
  TO authenticated
  USING (provider_id = auth.uid());

-- Index for efficient reporting
CREATE INDEX idx_match_impressions_facility ON match_impressions(facility_id);
CREATE INDEX idx_match_impressions_created ON match_impressions(created_at);
