// Gemini text generation (streaming) for the chat agent.

const STREAM_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

function apiKey(): string {
  const k = process.env.GEMINI_API_KEY;
  if (!k) throw new Error("GEMINI_API_KEY is not set");
  return k;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface StreamChatArgs {
  model: string;
  systemInstruction: string;
  history: ChatTurn[];
  userMessage: string;
  temperature?: number;
  maxOutputTokens?: number | null;
}

/** Calls streamGenerateContent and yields text deltas. */
export async function* streamChat({
  model,
  systemInstruction,
  history,
  userMessage,
  temperature = 0.6,
  maxOutputTokens,
}: StreamChatArgs): AsyncGenerator<string, void, unknown> {
  const url = `${STREAM_BASE}/${model}:streamGenerateContent?alt=sse&key=${apiKey()}`;

  const contents = [
    ...history.map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const body = {
    contents,
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      temperature,
      ...(maxOutputTokens ? { maxOutputTokens } : {}),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text();
    throw new Error(`streamChat failed: ${res.status} ${detail}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by blank lines; each "data:" line carries JSON.
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const parsed = JSON.parse(payload);
        const text =
          parsed?.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p?.text || "")
            .join("") || "";
        if (text) yield text;
      } catch {
        // Ignore malformed lines.
      }
    }
  }
}
