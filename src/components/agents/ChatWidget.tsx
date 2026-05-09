"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, MessageCircle, BookOpen, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Citation, InMemoryMessage } from "@/lib/agents/types";

interface Props {
  onClose: () => void;
}

export default function ChatWidget({ onClose }: Props) {
  const [messages, setMessages] = useState<InMemoryMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamingCitations, setStreamingCitations] = useState<Citation[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Detect auth state and resume the most recent session if logged in
  useEffect(() => {
    const supabase = createClient();
    let active = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      setIsAuthed(!!user);
      if (user) {
        const { data: session } = await supabase
          .from("chatbot_sessions")
          .select("id")
          .eq("user_id", user.id)
          .order("last_message_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (session) {
          setSessionId(session.id);
          const { data: msgs } = await supabase
            .from("chatbot_messages")
            .select("role, content, citations")
            .eq("session_id", session.id)
            .order("created_at", { ascending: true });
          if (active && msgs) {
            setMessages(
              msgs
                .filter((m) => m.role === "user" || m.role === "assistant")
                .map((m) => ({
                  role: m.role as "user" | "assistant",
                  content: m.content,
                  citations: (m.citations as Citation[]) || [],
                })),
            );
          }
        }
      }
    })();

    return () => {
      active = false;
      abortRef.current?.abort();
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingText]);

  async function send() {
    const message = input.trim();
    if (!message || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);
    setStreamingText("");
    setStreamingCitations([]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Chat request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assembled = "";
      let capturedCitations: Citation[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const block of events) {
          const event = block.match(/^event:\s*(.+)$/m)?.[1];
          const data = block.match(/^data:\s*(.+)$/m)?.[1];
          if (!event || !data) continue;
          let parsed: unknown;
          try { parsed = JSON.parse(data); } catch { continue; }

          if (event === "session" && (parsed as { session_id?: string })?.session_id) {
            setSessionId((parsed as { session_id: string }).session_id);
          } else if (event === "citations") {
            capturedCitations = parsed as Citation[];
            setStreamingCitations(capturedCitations);
          } else if (event === "delta") {
            assembled += parsed as string;
            setStreamingText(assembled);
          } else if (event === "error") {
            assembled += `\n\n_Sorry, something went wrong: ${(parsed as { error: string }).error}_`;
            setStreamingText(assembled);
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assembled, citations: capturedCitations },
      ]);
      setStreamingText("");
      setStreamingCitations([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I couldn't reach the server. (${msg})` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    abortRef.current?.abort();
    setMessages([]);
    setStreamingText("");
    setStreamingCitations([]);
    setSessionId(null);
  }

  return (
    <div
      className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[400px] sm:h-[640px] z-[70] flex flex-col bg-white shadow-2xl rounded-none sm:rounded-3xl border-0 sm:border overflow-hidden"
      style={{ borderColor: "rgba(12,64,57,0.12)", fontFamily: "var(--font-ui)" }}
      role="dialog"
      aria-label="Chat with the SeniorLiving assistant"
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center gap-3 border-b shrink-0"
        style={{ background: "#0c4039", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-white">SeniorLiving Assistant</div>
          <div className="text-[11.5px] text-white/65">
            Here to help you find the right home.
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={newChat}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Start a new conversation"
            title="New chat"
          >
            <RefreshCw className="w-4 h-4 text-white/80" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4" style={{ background: "#f6f1e6" }}>
        {messages.length === 0 && !streamingText && (
          <div className="text-center mt-4">
            <div className="w-12 h-12 rounded-full bg-white border mx-auto mb-3 flex items-center justify-center" style={{ borderColor: "#ebe4d3" }}>
              <MessageCircle className="w-5 h-5" style={{ color: "#1a8576" }} />
            </div>
            <p className="text-[13.5px]" style={{ color: "#4a6b66" }}>
              Ask me anything about senior living in the Philippines — how matching works,
              vetted facilities by city, or how to begin your search.
            </p>
            {isAuthed === false && (
              <p className="mt-3 text-[12px]" style={{ color: "#8a9c97" }}>
                Sign in to keep your chat history.{" "}
                <Link href="/auth/login" className="font-semibold" style={{ color: "#1a8576" }}>
                  Sign in
                </Link>
              </p>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} content={m.content} citations={m.citations} />
        ))}

        {streamingText && (
          <Bubble role="assistant" content={streamingText} citations={streamingCitations} streaming />
        )}

        {loading && !streamingText && (
          <div className="flex items-center gap-2 text-[12px]" style={{ color: "#4a6b66" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#1a8576" }} />
            Thinking…
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="p-3 border-t flex items-center gap-2 shrink-0"
        style={{ borderColor: "#ebe4d3", background: "#ffffff" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          className="flex-1 px-3 py-2.5 text-[14px] rounded-full bg-[#fbf9f3] border outline-none focus:border-[#1a8576] transition-colors"
          style={{ borderColor: "#ebe4d3", color: "#0c4039" }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-full text-white flex items-center justify-center disabled:opacity-50 transition-opacity"
          style={{ background: "#1a8576" }}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Spacer above floating close button on mobile */}
      <button onClick={onClose} className="hidden" aria-hidden />
    </div>
  );
}

function Bubble({
  role,
  content,
  citations,
  streaming,
}: {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  streaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "ml-8" : "mr-8"}`}>
        <div
          className="px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-wrap break-words"
          style={{
            background: isUser ? "#0c4039" : "#ffffff",
            color: isUser ? "#ffffff" : "#0c4039",
            border: isUser ? "none" : "1px solid #ebe4d3",
            borderTopLeftRadius: isUser ? 18 : 6,
            borderTopRightRadius: isUser ? 6 : 18,
          }}
        >
          {content}
          {streaming && <span className="inline-block w-2 h-4 ml-1 align-middle animate-pulse" style={{ background: "#1a8576" }} />}
        </div>
        {!isUser && citations && citations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {citations.slice(0, 4).map((c) => (
              <span
                key={c.chunk_id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px]"
                style={{ background: "#e6f3f0", color: "#0c5e54" }}
                title={c.snippet}
              >
                <BookOpen className="w-3 h-3" />
                {c.document_title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
