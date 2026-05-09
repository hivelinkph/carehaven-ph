-- Knowledge Base: documents + vector chunks for RAG.
-- text-embedding-004 default dim is 768.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS kb_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  file_size_bytes BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  error_message TEXT,
  page_count INT,
  chunk_count INT NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kb_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES kb_documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS kb_chunks_document_id_idx ON kb_chunks (document_id);
CREATE INDEX IF NOT EXISTS kb_chunks_embedding_idx ON kb_chunks
  USING hnsw (embedding vector_cosine_ops);

-- Similarity search RPC. Callable by anyone (used by /api/chat and /api/voice/connect).
CREATE OR REPLACE FUNCTION match_kb_chunks(
  query_embedding vector(768),
  match_count INT DEFAULT 6,
  similarity_threshold FLOAT DEFAULT 0.4
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  document_title TEXT,
  content TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE SQL STABLE AS $$
  SELECT
    c.id,
    c.document_id,
    d.title AS document_title,
    c.content,
    1 - (c.embedding <=> query_embedding) AS similarity,
    c.metadata
  FROM kb_chunks c
  JOIN kb_documents d ON d.id = c.document_id
  WHERE c.embedding IS NOT NULL
    AND d.status = 'ready'
    AND 1 - (c.embedding <=> query_embedding) >= similarity_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

ALTER TABLE kb_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_chunks ENABLE ROW LEVEL SECURITY;

-- Documents: admin-only writes; admins can also read everything
DROP POLICY IF EXISTS "Admins can read kb documents" ON kb_documents;
CREATE POLICY "Admins can read kb documents"
  ON kb_documents FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can write kb documents" ON kb_documents;
CREATE POLICY "Admins can write kb documents"
  ON kb_documents FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Chunks: same admin-only direct access. (Public access is via the SECURITY DEFINER RPC.)
DROP POLICY IF EXISTS "Admins can read kb chunks" ON kb_chunks;
CREATE POLICY "Admins can read kb chunks"
  ON kb_chunks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can write kb chunks" ON kb_chunks;
CREATE POLICY "Admins can write kb chunks"
  ON kb_chunks FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- The match RPC needs to bypass RLS for non-admin callers.
ALTER FUNCTION match_kb_chunks(vector, int, float) SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION match_kb_chunks(vector, int, float) TO anon, authenticated;

-- Storage bucket (private — only admins read/write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-base-docs', 'knowledge-base-docs', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Admins read kb storage" ON storage.objects;
CREATE POLICY "Admins read kb storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'knowledge-base-docs'
    AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins write kb storage" ON storage.objects;
CREATE POLICY "Admins write kb storage"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'knowledge-base-docs'
    AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    bucket_id = 'knowledge-base-docs'
    AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- updated_at trigger for kb_documents
CREATE OR REPLACE FUNCTION kb_documents_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_kb_documents_updated_at ON kb_documents;
CREATE TRIGGER trg_kb_documents_updated_at
BEFORE UPDATE ON kb_documents
FOR EACH ROW EXECUTE FUNCTION kb_documents_set_updated_at();
