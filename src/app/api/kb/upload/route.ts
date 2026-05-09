// POST /api/kb/upload
// Multipart form data: { file, title? }
// Admin-only. Extracts text, chunks, embeds, and stores.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractText } from "@/lib/agents/extract";
import { chunkText } from "@/lib/agents/chunk";
import { embedBatch } from "@/lib/agents/embeddings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // up to 5 minutes for large PDFs

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>): Promise<{ ok: boolean; userId: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, userId: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { ok: profile?.role === "admin", userId: user.id };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { ok, userId } = await isAdmin(supabase);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const title = (formData.get("title") as string) || "";
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = file.name || "document";
  const mimeType = file.type || "";
  const docTitle = title || filename.replace(/\.[^.]+$/, "");

  // 1. Insert document row in 'processing'
  const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}-${filename}`;
  const { data: docRow, error: insertErr } = await supabase
    .from("kb_documents")
    .insert({
      title: docTitle,
      filename,
      storage_path: storagePath,
      mime_type: mimeType,
      file_size_bytes: buffer.byteLength,
      status: "processing",
      uploaded_by: userId,
    })
    .select()
    .single();

  if (insertErr || !docRow) {
    return NextResponse.json(
      { error: insertErr?.message || "Failed to create document row" },
      { status: 500 },
    );
  }

  // 2. Upload to storage
  const { error: storageErr } = await supabase.storage
    .from("knowledge-base-docs")
    .upload(storagePath, buffer, {
      contentType: mimeType || "application/octet-stream",
      upsert: false,
    });
  if (storageErr) {
    await supabase
      .from("kb_documents")
      .update({ status: "failed", error_message: `Storage upload failed: ${storageErr.message}` })
      .eq("id", docRow.id);
    return NextResponse.json({ error: storageErr.message }, { status: 500 });
  }

  // 3. Extract → chunk → embed (best-effort; mark failed on error)
  try {
    const { text, pageCount } = await extractText(buffer, mimeType, filename);
    if (!text || !text.trim()) {
      throw new Error("No extractable text in document.");
    }
    const chunks = chunkText(text);
    if (chunks.length === 0) {
      throw new Error("Chunking produced no usable segments.");
    }

    // Embed in batches of 16 to keep payloads modest
    const BATCH = 16;
    for (let i = 0; i < chunks.length; i += BATCH) {
      const slice = chunks.slice(i, i + BATCH);
      const vectors = await embedBatch(
        slice.map((c) => c.content),
        "RETRIEVAL_DOCUMENT",
      );
      const rows = slice.map((c, j) => ({
        document_id: docRow.id,
        chunk_index: c.index,
        content: c.content,
        embedding: vectors[j],
        metadata: { filename, mime_type: mimeType },
      }));
      const { error: chunkErr } = await supabase.from("kb_chunks").insert(rows);
      if (chunkErr) throw new Error(`Chunk insert failed: ${chunkErr.message}`);
    }

    await supabase
      .from("kb_documents")
      .update({
        status: "ready",
        chunk_count: chunks.length,
        page_count: pageCount ?? null,
      })
      .eq("id", docRow.id);

    return NextResponse.json({
      ok: true,
      document_id: docRow.id,
      chunk_count: chunks.length,
      page_count: pageCount ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Processing failed";
    await supabase
      .from("kb_documents")
      .update({ status: "failed", error_message: msg })
      .eq("id", docRow.id);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
