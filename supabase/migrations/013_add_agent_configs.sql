-- Agent configurations (chat + voice)
-- One row per agent_type. Admins edit; API routes read.

CREATE TABLE IF NOT EXISTS agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL CHECK (agent_type IN ('chat', 'voice')),
  opening_spiel TEXT NOT NULL DEFAULT '',
  system_prompt_extra TEXT DEFAULT '',
  model TEXT NOT NULL,
  voice_name TEXT,
  temperature NUMERIC NOT NULL DEFAULT 0.6,
  max_output_tokens INT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_type)
);

-- Seed defaults
INSERT INTO agent_configs (agent_type, opening_spiel, model, voice_name, temperature)
VALUES
  ('chat',
   'Hi! I''m the SeniorLiving PH assistant. I can help you understand how our platform works, browse vetted assisted-living facilities across the Philippines, or get matched to a home that fits your loved one''s needs. What would you like to know?',
   'gemini-2.5-flash',
   NULL,
   0.6),
  ('voice',
   'Hello, I''m the SeniorLiving PH voice assistant. I can answer your questions about senior living facilities in the Philippines, our matching process, or anything else you need help with. How can I help today?',
   'gemini-3.1-flash-live-preview',
   'Kore',
   0.7)
ON CONFLICT (agent_type) DO NOTHING;

ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read the active config — needed by /api/chat and /api/voice/connect
DROP POLICY IF EXISTS "Public can read active agent configs" ON agent_configs;
CREATE POLICY "Public can read active agent configs"
  ON agent_configs FOR SELECT
  USING (is_active = TRUE);

-- Admins can insert
DROP POLICY IF EXISTS "Admins can insert agent configs" ON agent_configs;
CREATE POLICY "Admins can insert agent configs"
  ON agent_configs FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admins can update
DROP POLICY IF EXISTS "Admins can update agent configs" ON agent_configs;
CREATE POLICY "Admins can update agent configs"
  ON agent_configs FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- updated_at trigger
CREATE OR REPLACE FUNCTION agent_configs_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_agent_configs_updated_at ON agent_configs;
CREATE TRIGGER trg_agent_configs_updated_at
BEFORE UPDATE ON agent_configs
FOR EACH ROW EXECUTE FUNCTION agent_configs_set_updated_at();
