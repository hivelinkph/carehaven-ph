// POST /api/kb/:id/reembed — Re-extract + re-embed an existing document.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractText } from "@/lib/agents/extract";
import { chunkText } from "@/lib/agents/chunk";
import { embedBatch } from "@/lib/agents/embeddings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: doc, error: docErr } = await supabase
    .from("kb_documents")
    .select("*")
    .eq("id", id)
    .single();
  if (docErr || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Mark processing
  await supabase
    .from("kb_documents")
    .update({ status: "processing", error_message: null })
    .eq("id", id);

  // Wipe old chunks
  await supabase.from("kb_chunks").delete().eq("document_id", id);

  try {
    const { data: blob, error: dlErr } = await supabase.storage
      .from("knowledge-base-docs")
      .download(doc.storage_path);
    if (dlErr || !blob) throw new Error(dlErr?.message || "Failed to download original");

    const buffer = Buffer.from(await blob.arrayBuffer());
    const { text, pageCount } = await extractText(buffer, doc.mime_type || "", doc.filename);
    if (!text.trim()) throw new Error("No extractable text in document.");
    const chunks = chunkText(text);
    if (chunks.length === 0) throw new Error("Chunking produced no usable segments.");

    const BATCH = 16;
    for (let i = 0; i < chunks.length; i += BATCH) {
      const slice = chunks.slice(i, i + BATCH);
      const vectors = await embedBatch(slice.map((c) => c.content), "RETRIEVAL_DOCUMENT");
      const rows = slice.map((c, j) => ({
        document_id: id,
        chunk_index: c.index,
        content: c.content,
        embedding: vectors[j],
        metadata: { filename: doc.filename, mime_type: doc.mime_type },
      }));
      const { error: chunkErr } = await supabase.from("kb_chunks").insert(rows);
      if (chunkErr) throw new Error(chunkErr.message);
    }

    await supabase
      .from("kb_documents")
      .update({ status: "ready", chunk_count: chunks.length, page_count: pageCount ?? null })
      .eq("id", id);

    return NextResponse.json({ ok: true, chunk_count: chunks.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Re-embed failed";
    await supabase
      .from("kb_documents")
      .update({ status: "failed", error_message: msg })
      .eq("id", id);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
