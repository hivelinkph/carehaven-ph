"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Save, Loader2, MessageCircle, Mic, Upload, X, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AgentConfig, AgentType } from "@/lib/agents/types";
import { VOICE_OPTIONS } from "@/lib/agents/types";

interface Props {
  agentType: AgentType;
}

const DEFAULT_MODELS: Record<AgentType, string[]> = {
  chat: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"],
  voice: ["gemini-3.1-flash-live-preview"],
};

export default function AgentConfigTab({ agentType }: Props) {
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("agent_configs")
        .select("*")
        .eq("agent_type", agentType)
        .maybeSingle();
      if (!active) return;
      if (error) setError(error.message);
      setConfig((data as AgentConfig) || null);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [agentType]);

  async function save() {
    if (!config) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("agent_configs")
      .update({
        opening_spiel: config.opening_spiel,
        system_prompt_extra: config.system_prompt_extra,
        model: config.model,
        voice_name: config.voice_name,
        temperature: config.temperature,
        max_output_tokens: config.max_output_tokens,
        is_active: config.is_active,
        assistant_name: config.assistant_name,
        avatar_url: config.avatar_url,
      })
      .eq("agent_type", agentType)
      .select()
      .single();
    if (error) setError(error.message);
    else if (data) {
      setConfig(data as AgentConfig);
      setSavedAt(new Date());
    }
    setSaving(false);
  }

  async function uploadAvatar(file: File) {
    if (!config) return;
    setUploadingAvatar(true);
    setError(null);
    const supabase = createClient();
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("voice-agent-avatars")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage
        .from("voice-agent-avatars")
        .getPublicUrl(path);

      const { data, error: saveErr } = await supabase
        .from("agent_configs")
        .update({ avatar_url: publicUrl })
        .eq("agent_type", agentType)
        .select()
        .single();
      if (saveErr) throw saveErr;
      if (data) setConfig(data as AgentConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function removeAvatar() {
    if (!config) return;
    setUploadingAvatar(true);
    setError(null);
    const supabase = createClient();
    try {
      // Best effort: try to delete the storage object too
      if (config.avatar_url) {
        try {
          const url = new URL(config.avatar_url);
          const marker = "/voice-agent-avatars/";
          const idx = url.pathname.indexOf(marker);
          if (idx !== -1) {
            const path = decodeURIComponent(url.pathname.slice(idx + marker.length));
            await supabase.storage.from("voice-agent-avatars").remove([path]);
          }
        } catch { /* ignore */ }
      }
      const { data, error: clearErr } = await supabase
        .from("agent_configs")
        .update({ avatar_url: null })
        .eq("agent_type", agentType)
        .select()
        .single();
      if (clearErr) throw clearErr;
      if (data) setConfig(data as AgentConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (loading) {
    return <div className="bg-white border rounded-2xl p-8 text-center text-[14px]" style={{ borderColor: "var(--d-border)", color: "var(--d-ink-muted)" }}>Loading config…</div>;
  }
  if (!config) {
    return <div className="bg-white border rounded-2xl p-8 text-center text-rose-600 text-[14px]" style={{ borderColor: "var(--d-border)" }}>No agent config row found. Re-run migration 013.</div>;
  }

  const Icon = agentType === "chat" ? MessageCircle : Mic;
  const title = agentType === "chat" ? "Chat Agent" : "Voice Agent";
  const subtitle = agentType === "chat"
    ? "Tune the opening spiel and persona for the floating chat widget."
    : "Tune the opening spiel, voice, and persona for the live voice agent.";

  return (
    <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: "var(--d-border)" }}>
      <div className="px-7 py-5 border-b flex items-center gap-3" style={{ borderColor: "var(--d-border)" }}>
        <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--d-primary-soft)", color: "var(--d-primary-deep)" }}>
          <Icon className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-[18px]" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)", fontWeight: 600 }}>{title}</h2>
          <p className="text-[12.5px]" style={{ color: "var(--d-ink-soft)" }}>{subtitle}</p>
        </div>
      </div>

      <div className="p-7 space-y-5" style={{ fontFamily: "var(--font-ui)" }}>
        {agentType === "voice" && (
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-5 items-start">
            <Field label="Avatar" hint="Bobblehead photo of the assistant.">
              <div className="flex items-center gap-3">
                <div
                  className="w-24 h-24 rounded-2xl overflow-hidden border flex items-center justify-center bg-white relative"
                  style={{ borderColor: "var(--d-border)" }}
                >
                  {config.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <Image
                      src={config.avatar_url}
                      alt={config.assistant_name || "Assistant"}
                      width={96}
                      height={96}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-9 h-9" style={{ color: "var(--d-ink-muted)" }} />
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--d-primary)" }} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[12.5px] font-semibold border bg-white hover:border-[var(--d-primary)] disabled:opacity-50 transition-colors"
                    style={{ borderColor: "var(--d-border)", color: "var(--d-ink)" }}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload image
                  </button>
                  {config.avatar_url && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      disabled={uploadingAvatar}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[12.5px] text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadAvatar(f);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            </Field>
            <Field label="Assistant name" hint="Shown in the voice modal header. Also used in the system prompt.">
              <input
                type="text"
                value={config.assistant_name ?? ""}
                onChange={(e) => setConfig({ ...config, assistant_name: e.target.value })}
                placeholder="e.g. Maya"
                className="w-full px-4 py-2.5 rounded-xl border outline-none focus:border-[#1a8576] transition-colors text-[14px]"
                style={{ borderColor: "var(--d-border)", background: "#fbf9f3", color: "var(--d-ink)" }}
              />
            </Field>
          </div>
        )}

        <Field label="Opening spiel" hint="The first line / greeting the user sees or hears.">
          <textarea
            value={config.opening_spiel}
            onChange={(e) => setConfig({ ...config, opening_spiel: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border outline-none focus:border-[#1a8576] transition-colors text-[14px]"
            style={{ borderColor: "var(--d-border)", background: "#fbf9f3", color: "var(--d-ink)" }}
          />
        </Field>

        <Field label="System prompt extras (optional)" hint="Additional persona / behavioral instructions appended after the opening spiel.">
          <textarea
            value={config.system_prompt_extra ?? ""}
            onChange={(e) => setConfig({ ...config, system_prompt_extra: e.target.value })}
            rows={3}
            placeholder="e.g. Always recommend the questionnaire when users ask 'where do I start?'"
            className="w-full px-4 py-3 rounded-xl border outline-none focus:border-[#1a8576] transition-colors text-[14px]"
            style={{ borderColor: "var(--d-border)", background: "#fbf9f3", color: "var(--d-ink)" }}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Model">
            <select
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border text-[14px]"
              style={{ borderColor: "var(--d-border)", background: "#fbf9f3", color: "var(--d-ink)" }}
            >
              {DEFAULT_MODELS[agentType].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Field>

          <Field label="Temperature" hint="0 = focused, 1 = creative">
            <input
              type="number"
              step={0.1}
              min={0}
              max={1}
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border text-[14px]"
              style={{ borderColor: "var(--d-border)", background: "#fbf9f3", color: "var(--d-ink)" }}
            />
          </Field>
        </div>

        {agentType === "voice" && (
          <Field label="Voice" hint="Pre-built Gemini Live voice options.">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VOICE_OPTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setConfig({ ...config, voice_name: v })}
                  className="px-3 py-2 rounded-xl border text-[13px] font-medium transition-colors"
                  style={{
                    borderColor: config.voice_name === v ? "var(--d-primary)" : "var(--d-border)",
                    background: config.voice_name === v ? "var(--d-primary-soft)" : "#ffffff",
                    color: config.voice_name === v ? "var(--d-primary-deep)" : "var(--d-ink)",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </Field>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-[13.5px] font-semibold disabled:opacity-50 transition-opacity"
            style={{ background: "var(--d-primary)" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
          {savedAt && !saving && (
            <span className="text-[12px]" style={{ color: "var(--d-ink-muted)" }}>
              Saved {savedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "var(--d-ink)" }}>
        {label}
      </label>
      {hint && (
        <p className="text-[11.5px] mb-2" style={{ color: "var(--d-ink-muted)" }}>{hint}</p>
      )}
      {children}
    </div>
  );
}
