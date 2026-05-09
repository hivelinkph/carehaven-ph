-- Voice agent persona: assistant name + avatar (bobblehead) image.

ALTER TABLE agent_configs
  ADD COLUMN IF NOT EXISTS assistant_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Sensible default for the existing voice row
UPDATE agent_configs
SET assistant_name = COALESCE(assistant_name, 'Maya')
WHERE agent_type = 'voice' AND (assistant_name IS NULL OR assistant_name = '');

-- Public storage bucket for the assistant avatar
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-agent-avatars', 'voice-agent-avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read voice avatars" ON storage.objects;
CREATE POLICY "Public can read voice avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'voice-agent-avatars');

DROP POLICY IF EXISTS "Admins manage voice avatars" ON storage.objects;
CREATE POLICY "Admins manage voice avatars"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'voice-agent-avatars'
    AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    bucket_id = 'voice-agent-avatars'
    AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
