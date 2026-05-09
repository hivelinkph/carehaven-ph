// POST /api/chat
// Body: { message: string, session_id?: string, history?: { role, content }[] }
// Streams Gemini chat response (Server-Sent Events). RAG-augmented from kb_chunks.
// Logged-in users: persist to chatbot_sessions / chatbot_messages.
// Anonymous users: stream-only; client maintains history in memory.

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { retrieveContext } from "@/lib/agents/rag";
import { streamChat, type ChatTurn } from "@/lib/agents/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  message: string;
  session_id?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const message = (body.message || "").trim();
  if (!message) {
    return new Response("Missing message", { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Load chat agent config
  const { data: config } = await supabase
    .from("agent_configs")
    .select("*")
    .eq("agent_type", "chat")
    .eq("is_active", true)
    .single();

  if (!config) {
    return new Response("Chat agent is not configured", { status: 500 });
  }

  // Resolve / create session for logged-in users
  let sessionId: string | null = body.session_id || null;
  let history: ChatTurn[] = [];

  if (user) {
    if (!sessionId) {
      const { data: newSession } = await supabase
        .from("chatbot_sessions")
        .insert({ user_id: user.id })
        .select("id")
        .single();
      sessionId = newSession?.id || null;
    }
    if (sessionId) {
      const { data: msgs } = await supabase
        .from("chatbot_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(20);
      history = (msgs || [])
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      // Persist the user message now (assistant message persisted at end)
      await supabase
        .from("chatbot_messages")
        .insert({ session_id: sessionId, role: "user", content: message });
    }
  } else if (body.history) {
    history = body.history.slice(-12);
  }

  // Retrieve RAG context
  const { contextBlock, citations } = await retrieveContext(message, 6, 0.4);

  const systemInstruction = [
    config.opening_spiel || "You are the SeniorLiving PH assistant.",
    config.system_prompt_extra || "",
    "",
    "You help families learn about SeniorLiving PH — a Philippines-based",
    "marketplace that vets assisted-living facilities and connects families",
    "with them. Always answer factually. If a question is outside the scope",
    "of senior living in the Philippines or our platform, politely redirect.",
    "Be warm, concise, and respectful — many users are stressed family",
    "members. Suggest the questionnaire (/find-a-home) when appropriate.",
    contextBlock
      ? `\n\nReference material from our knowledge base (cite freely):\n${contextBlock}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        if (sessionId) send("session", { session_id: sessionId });
        if (citations.length) send("citations", citations);

        let assembled = "";
        for await (const delta of streamChat({
          model: config.model || "gemini-2.5-flash",
          systemInstruction,
          history,
          userMessage: message,
          temperature: Number(config.temperature ?? 0.6),
          maxOutputTokens: config.max_output_tokens ?? null,
        })) {
          assembled += delta;
          send("delta", delta);
        }

        send("done", { length: assembled.length });

        // Persist the assistant message (after streaming completes)
        if (user && sessionId && assembled) {
          await supabase.from("chatbot_messages").insert({
            session_id: sessionId,
            role: "assistant",
            content: assembled,
            citations,
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "stream error";
        send("error", { error: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
