// GET /api/voice/connect
// Returns the WebSocket URL (with API key) and the setup blob for the live session.
// Time limits enforced client-side: 60s anon, 180s logged-in.
// We pre-inject some KB context into the system instruction for grounding.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WS_BASE =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

const ALLOWED_VOICES = new Set([
  "Puck",
  "Charon",
  "Kore",
  "Fenrir",
  "Aoede",
  "Leda",
  "Orus",
  "Zephyr",
]);

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: config } = await supabase
    .from("agent_configs")
    .select("*")
    .eq("agent_type", "voice")
    .eq("is_active", true)
    .single();

  if (!config) {
    return NextResponse.json(
      { error: "Voice agent is not configured." },
      { status: 500 },
    );
  }

  // Pre-inject a snapshot of KB titles so the agent knows what it has on hand.
  const { data: docs } = await supabase
    .from("kb_documents")
    .select("title, status")
    .eq("status", "ready")
    .limit(15);
  const docsList = (docs || []).map((d) => `- ${d.title}`).join("\n");

  const systemInstruction = [
    config.opening_spiel || "You are the SeniorLiving PH voice assistant.",
    config.system_prompt_extra || "",
    "",
    "You are speaking out loud, so answer concisely (2-4 sentences typical).",
    "SeniorLiving PH is a Philippines-based marketplace that vets assisted-",
    "living facilities and connects families with them. The platform itself",
    "does not provide medical care; the listed facilities do.",
    "Be warm, patient, and respectful — many callers are stressed family",
    "members. If asked about specific facilities, encourage browsing",
    "/facilities or completing the quick questionnaire at /find-a-home.",
    docsList
      ? `\n\nReference material available:\n${docsList}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const voice = (config.voice_name && ALLOWED_VOICES.has(config.voice_name))
    ? config.voice_name
    : "Kore";

  const setup = {
    model: `models/${config.model || "gemini-3.1-flash-live-preview"}`,
    generation_config: {
      response_modalities: ["AUDIO"],
      speech_config: {
        voice_config: {
          prebuilt_voice_config: { voice_name: voice },
        },
      },
      ...(config.temperature != null
        ? { temperature: Number(config.temperature) }
        : {}),
    },
    system_instruction: { parts: [{ text: systemInstruction }] },
    input_audio_transcription: {},
    output_audio_transcription: {},
  };

  const wsUrl = `${WS_BASE}?key=${apiKey}`;
  const maxDurationSeconds = user ? 180 : 60;

  return NextResponse.json({
    wsUrl,
    setup,
    maxDurationSeconds,
    isAuthenticated: !!user,
    openingSpiel: config.opening_spiel,
  });
}
