"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen, Upload, Trash2, RefreshCw, Loader2, FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { KBDocument, KBStatus } from "@/lib/agents/types";

const ACCEPT = ".pdf,.txt,.md,.html,.htm,.docx,.json,.csv";

export default function KnowledgeBaseTab() {
  const [docs, setDocs] = useState<KBDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("kb_documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setDocs((data as KBDocument[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-poll while any document is processing/pending
  useEffect(() => {
    const hasPending = docs.some((d) => d.status === "processing" || d.status === "pending");
    if (!hasPending) return;
    const t = setInterval(() => { refresh(); }, 4000);
    return () => clearInterval(t);
  }, [docs, refresh]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", file.name.replace(/\.[^.]+$/, ""));
        const res = await fetch("/api/kb/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) {
          setError(`${file.name}: ${json.error || "Upload failed"}`);
        }
      }
      await refresh();
    } finally {
      setUploading(false);
    }
  }

  async function reembed(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/kb/${id}/reembed`, { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Re-embed failed");
      }
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this document and all its chunks?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/kb/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Delete failed");
      }
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  const totalChunks = docs.reduce((sum, d) => sum + (d.chunk_count || 0), 0);
  const ready = docs.filter((d) => d.status === "ready").length;

  return (
    <div className="space-y-5" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="bg-white border rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between" style={{ borderColor: "var(--d-border)" }}>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--d-primary-soft)", color: "var(--d-primary-deep)" }}>
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-[18px]" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)", fontWeight: 600 }}>Knowledge Base</h2>
            <p className="text-[12.5px]" style={{ color: "var(--d-ink-soft)" }}>
              {docs.length} {docs.length === 1 ? "document" : "documents"} · {ready} ready · {totalChunks} chunks indexed
            </p>
          </div>
        </div>

        <label
          className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white text-[13.5px] font-semibold cursor-pointer transition-opacity ${uploading ? "opacity-50" : ""}`}
          style={{ background: "var(--d-primary)" }}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Uploading…" : "Upload documents"}
          <input
            type="file"
            accept={ACCEPT}
            multiple
            disabled={uploading}
            className="hidden"
            onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
          />
        </label>
      </div>

      <div className="bg-white border rounded-2xl p-6 text-[12.5px]" style={{ borderColor: "var(--d-border)", color: "var(--d-ink-soft)" }}>
        Documents are embedded with Google&rsquo;s <code>text-embedding-004</code> model and made available to both the chat and voice agents. Accepted formats: PDF, DOCX, TXT, MD, HTML, JSON, CSV.
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: "var(--d-border)" }}>
        {loading ? (
          <div className="p-8 text-center" style={{ color: "var(--d-ink-muted)" }}>Loading documents…</div>
        ) : docs.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--d-ink-muted)" }} />
            <p className="text-[14px]" style={{ color: "var(--d-ink-soft)" }}>
              No documents yet. Upload your first PDF to get started.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-[0.18em]" style={{ borderColor: "var(--d-border)", color: "var(--d-ink-muted)" }}>
                <th className="px-6 py-4 font-semibold">Document</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Chunks</th>
                <th className="px-6 py-4 font-semibold">Uploaded</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b last:border-b-0" style={{ borderColor: "var(--d-border)" }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4" style={{ color: "var(--d-primary)" }} />
                      <div>
                        <div className="text-[13.5px] font-semibold" style={{ color: "var(--d-ink)" }}>{d.title}</div>
                        <div className="text-[11.5px]" style={{ color: "var(--d-ink-muted)" }}>
                          {d.filename}
                          {d.file_size_bytes ? ` · ${formatBytes(d.file_size_bytes)}` : ""}
                          {d.page_count ? ` · ${d.page_count} pages` : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><StatusPill status={d.status} error={d.error_message} /></td>
                  <td className="px-6 py-4 text-[13px] tabular-nums" style={{ color: "var(--d-ink)" }}>{d.chunk_count}</td>
                  <td className="px-6 py-4 text-[12.5px]" style={{ color: "var(--d-ink-soft)" }}>
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => reembed(d.id)}
                        disabled={busyId === d.id}
                        title="Re-embed this document"
                        className="p-2 rounded-lg border transition-colors hover:border-[var(--d-primary)] disabled:opacity-50"
                        style={{ borderColor: "var(--d-border)", color: "var(--d-ink)" }}
                      >
                        {busyId === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => remove(d.id)}
                        disabled={busyId === d.id}
                        title="Delete"
                        className="p-2 rounded-lg border transition-colors hover:border-rose-400 hover:text-rose-500 disabled:opacity-50"
                        style={{ borderColor: "var(--d-border)", color: "var(--d-ink)" }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status, error }: { status: KBStatus; error: string | null }) {
  const map: Record<KBStatus, { bg: string; fg: string; icon: typeof CheckCircle2; label: string }> = {
    ready: { bg: "var(--d-stat-teal-bg)", fg: "var(--d-stat-teal)", icon: CheckCircle2, label: "Ready" },
    processing: { bg: "var(--d-stat-orange-bg)", fg: "var(--d-stat-orange)", icon: Loader2, label: "Processing" },
    pending: { bg: "var(--d-stat-purple-bg)", fg: "var(--d-stat-purple)", icon: Clock, label: "Pending" },
    failed: { bg: "var(--d-stat-pink-bg)", fg: "var(--d-stat-pink)", icon: AlertCircle, label: "Failed" },
  };
  const m = map[status];
  const Icon = m.icon;
  const isProcessing = status === "processing";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold"
      style={{ background: m.bg, color: m.fg }}
      title={error || undefined}
    >
      <Icon className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
      {m.label}
    </span>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
