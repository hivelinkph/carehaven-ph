"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";

interface Props {
  onClose: () => void;
}

type Stage = "permission" | "connecting" | "live" | "ended" | "error";

interface ConnectResponse {
  wsUrl: string;
  setup: Record<string, unknown>;
  maxDurationSeconds: number;
  isAuthenticated: boolean;
  openingSpiel: string;
}

const CAPTURE_RATE = 16000;
const PLAYBACK_RATE = 24000;

export default function VoiceWidget({ onClose }: Props) {
  const [stage, setStage] = useState<Stage>("permission");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMsg, setAuthMsg] = useState("");
  const [maxSeconds, setMaxSeconds] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [transcript, setTranscript] = useState<{ role: "you" | "agent"; text: string }[]>([]);
  const [speaking, setSpeaking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const captureCtxRef = useRef<AudioContext | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playbackCursorRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cutoffRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  useEffect(() => {
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    try { wsRef.current?.close(); } catch {}
    wsRef.current = null;
    try { processorRef.current?.disconnect(); } catch {}
    try { sourceRef.current?.disconnect(); } catch {}
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    try { captureCtxRef.current?.close(); } catch {}
    try { playbackCtxRef.current?.close(); } catch {}
    if (tickRef.current) clearInterval(tickRef.current);
    if (cutoffRef.current) clearTimeout(cutoffRef.current);
  }

  function endSession(reason: "manual" | "expired" | "error") {
    setStage(reason === "error" ? "error" : "ended");
    cleanup();
  }

  async function start() {
    setStage("connecting");
    setError(null);

    try {
      // 1. Connect details from server
      const res = await fetch("/api/voice/connect");
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Server: ${detail}`);
      }
      const cfg = (await res.json()) as ConnectResponse;
      setMaxSeconds(cfg.maxDurationSeconds);
      setRemaining(cfg.maxDurationSeconds);
      setAuthMsg(
        cfg.isAuthenticated
          ? "Logged in — you have 3 minutes for this voice call."
          : "Anonymous — voice calls are limited to 1 minute. Sign in for longer.",
      );

      // 2. Mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. WebSocket
      const ws = new WebSocket(cfg.wsUrl);
      wsRef.current = ws;
      let setupAcked = false;
      ws.onopen = () => {
        ws.send(JSON.stringify({ setup: cfg.setup }));
      };
      ws.onerror = () => {
        if (!setupAcked) {
          setError("Could not reach the voice service. Please try again in a moment.");
        }
      };
      ws.onclose = (ev) => {
        // Surface close reason instead of silently transitioning.
        if (!setupAcked) {
          // Gemini closes 1007 / 1008 / 1011 on bad setup or quota issues.
          const reason = ev.reason || "unknown";
          setError(
            `Voice service closed the connection (code ${ev.code}). ${reason && reason !== "unknown" ? reason : "This usually means the live model is over quota or temporarily unavailable. Please try again in a minute."}`,
          );
          endSession("error");
          return;
        }
        // Mark expired only if we'd been live.
        endSession("expired");
      };
      ws.onmessage = (ev) => {
        // The first server message after our setup is `setupComplete` — that's our ack.
        if (!setupAcked) {
          setupAcked = true;
          try {
            const parsed = typeof ev.data === "string" ? JSON.parse(ev.data) : null;
            if (parsed && "setupComplete" in parsed) {
              // Setup confirmed; nothing else to do.
            }
          } catch {
            // Non-JSON ack — ignore.
          }
        }
        handleIncoming(ev.data);
      };

      // 4. Capture pipeline
      const captureCtx = new AudioContext({ sampleRate: CAPTURE_RATE });
      captureCtxRef.current = captureCtx;
      const source = captureCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const processor = captureCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      source.connect(processor);
      processor.connect(captureCtx.destination);
      processor.onaudioprocess = (e) => {
        if (mutedRef.current || ws.readyState !== WebSocket.OPEN) return;
        const channel = e.inputBuffer.getChannelData(0);
        const pcm16 = floatToPcm16(channel);
        const b64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
        ws.send(
          JSON.stringify({
            realtimeInput: {
              audio: { data: b64, mimeType: `audio/pcm;rate=${CAPTURE_RATE}` },
            },
          }),
        );
      };

      // 5. Playback context
      playbackCtxRef.current = new AudioContext({ sampleRate: PLAYBACK_RATE });
      playbackCursorRef.current = 0;

      setStage("live");
      // 6. Countdown + cutoff
      tickRef.current = setInterval(() => {
        setRemaining((r) => Math.max(0, r - 1));
      }, 1000);
      cutoffRef.current = setTimeout(() => {
        endSession("expired");
      }, cfg.maxDurationSeconds * 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not start voice session.";
      setError(msg);
      setStage("error");
      cleanup();
    }
  }

  async function handleIncoming(raw: unknown) {
    let payload: string;
    if (typeof raw === "string") {
      payload = raw;
    } else if (raw instanceof Blob) {
      payload = await raw.text();
    } else {
      return;
    }

    let msg: Record<string, unknown>;
    try { msg = JSON.parse(payload); } catch { return; }

    const serverContent = msg.serverContent as
      | { modelTurn?: { parts?: { inlineData?: { mimeType?: string; data?: string }; text?: string }[] };
          inputTranscription?: { text?: string };
          outputTranscription?: { text?: string };
          turnComplete?: boolean; }
      | undefined;
    if (!serverContent) return;

    if (serverContent.inputTranscription?.text) {
      appendTranscript("you", serverContent.inputTranscription.text);
    }
    if (serverContent.outputTranscription?.text) {
      appendTranscript("agent", serverContent.outputTranscription.text);
    }

    const parts = serverContent.modelTurn?.parts || [];
    for (const part of parts) {
      const audio = part.inlineData?.data;
      if (audio) {
        playPcm(audio);
      }
    }

    if (serverContent.turnComplete) {
      setSpeaking(false);
    }
  }

  function appendTranscript(role: "you" | "agent", text: string) {
    setTranscript((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === role) {
        return [...prev.slice(0, -1), { role, text: last.text + text }];
      }
      return [...prev, { role, text }];
    });
  }

  function playPcm(b64: string) {
    const ctx = playbackCtxRef.current;
    if (!ctx) return;
    setSpeaking(true);
    const bytes = atob(b64);
    const len = bytes.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = bytes.charCodeAt(i);
    const i16 = new Int16Array(u8.buffer);
    const f32 = new Float32Array(i16.length);
    for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;

    const buffer = ctx.createBuffer(1, f32.length, PLAYBACK_RATE);
    buffer.copyToChannel(f32, 0);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);

    const now = ctx.currentTime;
    const start = Math.max(now, playbackCursorRef.current);
    src.start(start);
    playbackCursorRef.current = start + buffer.duration;
    src.onended = () => {
      // If queue drained, mark not speaking
      if (ctx.currentTime + 0.05 >= playbackCursorRef.current) setSpeaking(false);
    };
  }

  function floatToPcm16(input: Float32Array): Int16Array {
    const out = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  }

  const mins = Math.floor(remaining / 60);
  const secs = String(remaining % 60).padStart(2, "0");
  const pct = (remaining / Math.max(maxSeconds, 1)) * 100;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ background: "rgba(8,49,43,0.55)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-label="Voice assistant"
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 text-white" style={{ background: "linear-gradient(135deg, #0c4039 0%, #08312b 100%)" }}>
          <div className="flex items-center gap-3 mb-3">
            <span className={`w-10 h-10 rounded-full flex items-center justify-center ${speaking ? "animate-pulse" : ""}`} style={{ background: "#1a8576" }}>
              <Mic className="w-5 h-5" />
            </span>
            <div>
              <div className="text-[14px] font-semibold">SeniorLiving Voice</div>
              <div className="text-[11.5px] text-white/70">Live conversation</div>
            </div>
            {stage === "live" && (
              <div className="ml-auto text-right">
                <div className="text-[12px] font-mono">{mins}:{secs}</div>
                <div className="text-[10px] text-white/55">remaining</div>
              </div>
            )}
          </div>

          {stage === "live" && (
            <div className="h-1 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${pct}%`, background: pct < 25 ? "#f6c66e" : "#9ee6d4" }} />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-7 py-6 min-h-[260px] max-h-[60vh] overflow-y-auto" style={{ background: "#f6f1e6" }}>
          {stage === "permission" && (
            <div className="text-center py-4">
              <p className="text-[14px] mb-4" style={{ color: "#0c4039" }}>
                Tap below to start a voice conversation. We&rsquo;ll ask for mic permission.
              </p>
              <p className="text-[12px]" style={{ color: "#4a6b66" }}>
                Anonymous calls are limited to 1 minute. Sign in for 3 minutes.
              </p>
            </div>
          )}

          {stage === "connecting" && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full border-4 mx-auto mb-3 animate-spin" style={{ borderColor: "#e0f1ec", borderTopColor: "#1a8576" }} />
              <p className="text-[13.5px]" style={{ color: "#4a6b66" }}>
                Connecting to the assistant…
              </p>
            </div>
          )}

          {stage === "live" && (
            <div>
              <p className="text-[12px] mb-3" style={{ color: "#4a6b66" }}>
                {authMsg}
              </p>
              <div className="space-y-2">
                {transcript.map((t, i) => (
                  <div key={i} className={t.role === "you" ? "text-right" : ""}>
                    <span
                      className="inline-block px-3 py-1.5 rounded-2xl text-[13px] max-w-[85%]"
                      style={{
                        background: t.role === "you" ? "#0c4039" : "#ffffff",
                        color: t.role === "you" ? "#ffffff" : "#0c4039",
                        border: t.role === "you" ? "none" : "1px solid #ebe4d3",
                      }}
                    >
                      {t.text}
                    </span>
                  </div>
                ))}
                {transcript.length === 0 && (
                  <p className="text-center text-[12.5px] mt-6" style={{ color: "#8a9c97" }}>
                    Speak naturally — the assistant is listening.
                  </p>
                )}
              </div>
            </div>
          )}

          {stage === "ended" && (
            <div className="text-center py-6">
              <Phone className="w-7 h-7 mx-auto mb-3" style={{ color: "#4a6b66" }} />
              <p className="text-[15px] font-semibold mb-1" style={{ color: "#0c4039" }}>
                Session ended
              </p>
              <p className="text-[12.5px] mb-4" style={{ color: "#4a6b66" }}>
                Your time limit was reached. {!authMsg.includes("Logged in") && "Sign in to extend future voice calls to 3 minutes."}
              </p>
            </div>
          )}

          {stage === "error" && (
            <div className="text-center py-6">
              <PhoneOff className="w-7 h-7 mx-auto mb-3 text-rose-500" />
              <p className="text-[15px] font-semibold mb-1" style={{ color: "#0c4039" }}>
                Something went wrong
              </p>
              <p className="text-[12.5px]" style={{ color: "#4a6b66" }}>
                {error || "We couldn't start the call. Please try again."}
              </p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-7 py-4 border-t flex items-center justify-between gap-3" style={{ borderColor: "#ebe4d3" }}>
          {stage === "permission" && (
            <button
              onClick={start}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full text-white font-semibold text-[14px] shadow-md hover:shadow-lg transition-all"
              style={{ background: "#1a8576" }}
            >
              <Mic className="w-4 h-4" />
              Start voice call
            </button>
          )}
          {stage === "live" && (
            <>
              <button
                onClick={() => setMuted((m) => !m)}
                className="w-12 h-12 rounded-full border flex items-center justify-center transition-colors"
                style={{ borderColor: "#ebe4d3", background: muted ? "#fce8ec" : "#ffffff", color: muted ? "#d8527a" : "#0c4039" }}
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={() => endSession("manual")}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full bg-rose-500 text-white font-semibold text-[14px] shadow-md hover:bg-rose-600 transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                End call
              </button>
            </>
          )}
          {(stage === "ended" || stage === "error") && (
            <>
              <button
                onClick={() => { setStage("permission"); setTranscript([]); setError(null); }}
                className="flex-1 py-3 rounded-full border text-[13.5px] font-semibold hover:bg-[#fbf9f3] transition-colors"
                style={{ borderColor: "#ebe4d3", color: "#0c4039" }}
              >
                Try again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-full text-white font-semibold text-[13.5px]"
                style={{ background: "#1a8576" }}
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
