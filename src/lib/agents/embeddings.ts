// Server-only: wrap Google's text-embedding-004 REST API.
// Returns a 768-dim vector by default.

const EMBED_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent";
const BATCH_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents";

function apiKey(): string {
  const k = process.env.GEMINI_API_KEY;
  if (!k) throw new Error("GEMINI_API_KEY is not set");
  return k;
}

export type EmbedTaskType =
  | "RETRIEVAL_QUERY"
  | "RETRIEVAL_DOCUMENT"
  | "SEMANTIC_SIMILARITY"
  | "CLASSIFICATION";

export async function embedContent(
  text: string,
  taskType: EmbedTaskType = "RETRIEVAL_QUERY",
): Promise<number[]> {
  const res = await fetch(`${EMBED_URL}?key=${apiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      taskType,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`embedContent failed: ${res.status} ${detail}`);
  }
  const json = (await res.json()) as { embedding: { values: number[] } };
  return json.embedding.values;
}

export async function embedBatch(
  texts: string[],
  taskType: EmbedTaskType = "RETRIEVAL_DOCUMENT",
): Promise<number[][]> {
  if (texts.length === 0) return [];
  const requests = texts.map((t) => ({
    model: "models/text-embedding-004",
    content: { parts: [{ text: t }] },
    taskType,
  }));
  const res = await fetch(`${BATCH_URL}?key=${apiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requests }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`batchEmbedContents failed: ${res.status} ${detail}`);
  }
  const json = (await res.json()) as { embeddings: { values: number[] }[] };
  return json.embeddings.map((e) => e.values);
}
