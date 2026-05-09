// Server-only: extract plain text from uploaded documents.

export interface ExtractResult {
  text: string;
  pageCount?: number;
}

export async function extractText(
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<ExtractResult> {
  const ext = (filename.split(".").pop() || "").toLowerCase();

  // PDF
  if (mimeType === "application/pdf" || ext === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      return { text: result.text || "", pageCount: result.total };
    } finally {
      await parser.destroy();
    }
  }

  // DOCX
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value };
  }

  // HTML
  if (mimeType === "text/html" || ext === "html" || ext === "htm") {
    const raw = buffer.toString("utf-8");
    const stripped = raw
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();
    return { text: stripped };
  }

  // TXT, MD, JSON, CSV — treat as plain text
  if (
    mimeType.startsWith("text/") ||
    ext === "txt" ||
    ext === "md" ||
    ext === "json" ||
    ext === "csv"
  ) {
    return { text: buffer.toString("utf-8") };
  }

  // Fallback: try utf-8
  try {
    return { text: buffer.toString("utf-8") };
  } catch {
    throw new Error(
      `Unsupported file type: ${mimeType || ext || "unknown"}. Supported: PDF, DOCX, HTML, TXT, MD, JSON, CSV.`,
    );
  }
}
