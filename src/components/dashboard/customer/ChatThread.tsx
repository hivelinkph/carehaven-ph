"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, Send, MapPin, ExternalLink, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Conversation, Message } from "@/lib/types";

interface Props {
  conversation: Conversation;
  currentUserId: string;
}

export default function ChatThread({ conversation, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      if (!cancelled) {
        setMessages(data || []);
        setLoading(false);
      }
    }
    load();

    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            const next = payload.new as Message;
            if (prev.some((m) => m.id === next.id)) return prev;
            return [...prev, next];
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [conversation.id]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  async function send() {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_id: currentUserId,
        sender_role: "user",
        content,
      })
      .select()
      .single();
    if (!error && data) {
      setMessages((prev) =>
        prev.some((m) => m.id === data.id) ? prev : [...prev, data]
      );
      setInput("");
    }
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const facility = conversation.facility;

  return (
    <div className="flex flex-col h-full bg-[#faf9f5]/40">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#e8e6dc]/60 bg-white">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2DD1AC]/20 to-[#6a9bcc]/20 flex items-center justify-center shrink-0 overflow-hidden">
          {facility?.image_urls?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={facility.image_urls[0]}
              alt={facility.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 className="w-5 h-5 text-[#2DD1AC]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-bold text-[#2D3748] truncate"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {facility?.name || "Facility"}
          </h3>
          {facility?.city && (
            <p
              className="text-xs text-[#b0aea5] flex items-center gap-1"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              <MapPin className="w-3 h-3" />
              {facility.city}
            </p>
          )}
        </div>
        {facility && (
          <Link
            href={`/facilities/${facility.id}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#2DD1AC] hover:text-[#2DD1AC]/80 px-3 py-1.5 rounded-full border border-[#2DD1AC]/30 hover:bg-[#2DD1AC]/5 transition-all"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            View facility
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-[#2DD1AC] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p
              className="text-sm text-[#b0aea5]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              No messages yet. Send the first one to introduce yourself.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    mine
                      ? "bg-[#2DD1AC] text-white rounded-br-md"
                      : "bg-white text-[#2D3748] border border-[#e8e6dc]/60 rounded-bl-md"
                  }`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div className="p-3 border-t border-[#e8e6dc]/60 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 resize-none px-4 py-2.5 text-sm bg-[#faf9f5] border border-[#e8e6dc] rounded-2xl focus:outline-none focus:border-[#2DD1AC] transition-colors max-h-32"
            style={{ fontFamily: "var(--font-body)" }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-full bg-[#2DD1AC] text-white flex items-center justify-center hover:bg-[#2DD1AC]/90 disabled:bg-[#e8e6dc] disabled:text-[#b0aea5] transition-all shadow-sm shrink-0"
            aria-label="Send message"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
