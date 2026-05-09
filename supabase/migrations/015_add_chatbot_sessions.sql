-- Chatbot sessions + messages (logged-in user chat history).

CREATE TABLE IF NOT EXISTS chatbot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chatbot_sessions_user_idx ON chatbot_sessions (user_id, last_message_at DESC);

CREATE TABLE IF NOT EXISTS chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chatbot_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chatbot_messages_session_idx ON chatbot_messages (session_id, created_at);

ALTER TABLE chatbot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Sessions: owner-only
DROP POLICY IF EXISTS "Users own chatbot sessions" ON chatbot_sessions;
CREATE POLICY "Users own chatbot sessions"
  ON chatbot_sessions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Messages: only the session owner can read/write
DROP POLICY IF EXISTS "Users own chatbot messages" ON chatbot_messages;
CREATE POLICY "Users own chatbot messages"
  ON chatbot_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM chatbot_sessions s
      WHERE s.id = chatbot_messages.session_id AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chatbot_sessions s
      WHERE s.id = chatbot_messages.session_id AND s.user_id = auth.uid()
    )
  );

-- Trigger: bump last_message_at on insert
CREATE OR REPLACE FUNCTION chatbot_messages_bump_session()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE chatbot_sessions
  SET last_message_at = NEW.created_at,
      title = COALESCE(title, LEFT(NEW.content, 80))
  WHERE id = NEW.session_id;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_chatbot_messages_bump ON chatbot_messages;
CREATE TRIGGER trg_chatbot_messages_bump
AFTER INSERT ON chatbot_messages
FOR EACH ROW EXECUTE FUNCTION chatbot_messages_bump_session();
