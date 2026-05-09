// Paragraph-aware sliding-window chunker. ~1200 chars per chunk with 200-char overlap.

const TARGET_SIZE = 1200;
const OVERLAP = 200;
const MIN_CHUNK = 200;

export interface Chunk {
  index: number;
  content: string;
}

export function chunkText(raw: string): Chunk[] {
  const text = raw.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!text) return [];

  // Split by paragraphs first.
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: Chunk[] = [];
  let buffer = "";
  let index = 0;

  const push = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length >= MIN_CHUNK || (chunks.length === 0 && trimmed.length > 0)) {
      chunks.push({ index: index++, content: trimmed });
    }
  };

  for (const p of paragraphs) {
    if (p.length >= TARGET_SIZE) {
      // Flush whatever is already buffered, then break this paragraph into sentence-sized windows.
      if (buffer) {
        push(buffer);
        buffer = "";
      }
      let start = 0;
      while (start < p.length) {
        const end = Math.min(p.length, start + TARGET_SIZE);
        push(p.slice(start, end));
        if (end === p.length) break;
        start = end - OVERLAP;
      }
      continue;
    }

    if ((buffer + "\n\n" + p).length > TARGET_SIZE) {
      push(buffer);
      // Carry an overlap tail to keep continuity.
      const tail = buffer.slice(Math.max(0, buffer.length - OVERLAP));
      buffer = tail + "\n\n" + p;
    } else {
      buffer = buffer ? buffer + "\n\n" + p : p;
    }
  }

  if (buffer) push(buffer);

  return chunks;
}
