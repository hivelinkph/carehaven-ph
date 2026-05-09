// Retrieve top-K matching KB chunks for a query.
// Uses the match_kb_chunks RPC defined in migration 014.

import { createClient } from "@/lib/supabase/server";
import { embedContent } from "./embeddings";
import type { Citation } from "./types";

export interface RetrievedChunk {
  id: string;
  document_id: string;
  document_title: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

export async function retrieveContext(
  query: string,
  k: number = 6,
  threshold: number = 0.4,
): Promise<{ chunks: RetrievedChunk[]; citations: Citation[]; contextBlock: string }> {
  if (!query.trim()) {
    return { chunks: [], citations: [], contextBlock: "" };
  }
  const queryVector = await embedContent(query, "RETRIEVAL_QUERY");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("match_kb_chunks", {
    query_embedding: queryVector,
    match_count: k,
    similarity_threshold: threshold,
  });

  if (error || !data) {
    return { chunks: [], citations: [], contextBlock: "" };
  }

  const chunks = (data as RetrievedChunk[]).filter(Boolean);
  const citations: Citation[] = chunks.map((c) => ({
    document_id: c.document_id,
    document_title: c.document_title,
    chunk_id: c.id,
    snippet: c.content.slice(0, 240),
    similarity: c.similarity,
  }));

  const contextBlock = chunks.length
    ? chunks
        .map(
          (c, i) =>
            `[${i + 1}] (${c.document_title})\n${c.content}`,
        )
        .join("\n\n---\n\n")
    : "";

  return { chunks, citations, contextBlock };
}
