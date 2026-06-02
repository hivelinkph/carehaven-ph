"use client";

import { useState, lazy, Suspense } from "react";
import { MessageCircle, Mic, X } from "lucide-react";

const ChatWidget = lazy(() => import("./ChatWidget"));
const VoiceWidget = lazy(() => import("./VoiceWidget"));

type Mode = "closed" | "chat" | "voice";

// Temporarily hidden — set to true to re-enable the floating chat/voice icons.
const SHOW_FLOATING_AGENTS = false;

export default function FloatingAgents() {
  const [mode, setMode] = useState<Mode>("closed");

  if (!SHOW_FLOATING_AGENTS) return null;

  return (
    <>
      {/* Floating buttons (hidden when a widget is open) */}
      {mode === "closed" && (
        <div
          className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          {/* Voice */}
          <button
            onClick={() => setMode("voice")}
            className="group flex items-center gap-2 pl-3 pr-4 py-3 rounded-full text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ background: "#1a8576" }}
            aria-label="Talk to the SeniorLiving voice assistant"
          >
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </span>
            <span className="text-[12.5px] font-semibold">Talk to us</span>
          </button>

          {/* Chat */}
          <button
            onClick={() => setMode("chat")}
            className="group flex items-center gap-2 pl-3 pr-4 py-3 rounded-full text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ background: "#0c4039" }}
            aria-label="Chat with the SeniorLiving assistant"
          >
            <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </span>
            <span className="text-[12.5px] font-semibold">Chat with us</span>
          </button>
        </div>
      )}

      {/* Close affordance shared between widgets */}
      {mode !== "closed" && (
        <button
          onClick={() => setMode("closed")}
          aria-label="Close assistant"
          className="fixed top-4 right-4 z-[80] w-10 h-10 rounded-full bg-white/95 border shadow-md flex items-center justify-center hover:bg-white transition-colors"
          style={{ borderColor: "rgba(12,64,57,0.12)" }}
        >
          <X className="w-4 h-4" style={{ color: "#0c4039" }} />
        </button>
      )}

      {/* Widget surfaces */}
      <Suspense fallback={null}>
        {mode === "chat" && <ChatWidget onClose={() => setMode("closed")} />}
        {mode === "voice" && <VoiceWidget onClose={() => setMode("closed")} />}
      </Suspense>
    </>
  );
}
