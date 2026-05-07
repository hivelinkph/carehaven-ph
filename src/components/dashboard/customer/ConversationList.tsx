"use client";

import { Building2, MessageCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Conversation } from "@/lib/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w`;
  return new Date(iso).toLocaleDateString();
}

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export default function ConversationList({ conversations, activeId, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.facility?.name.toLowerCase().includes(q) ||
        c.last_message_preview?.toLowerCase().includes(q)
    );
  }, [conversations, query]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#e8e6dc]/60">
        <h2
          className="text-xl font-bold text-[#2D3748] mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Chats
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0aea5]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#faf9f5] border border-[#e8e6dc] rounded-full focus:outline-none focus:border-[#2DD1AC] transition-colors"
            style={{ fontFamily: "var(--font-ui)" }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#2DD1AC]/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#2DD1AC]" />
            </div>
            <p
              className="text-sm font-medium text-[#2D3748] mb-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {query ? "No matches" : "No conversations yet"}
            </p>
            <p
              className="text-xs text-[#b0aea5]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {query
                ? "Try a different search term."
                : "Reach out to a facility to start a conversation."}
            </p>
          </div>
        ) : (
          <ul>
            {filtered.map((c) => {
              const isActive = c.id === activeId;
              const facility = c.facility;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => onSelect(c.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4 ${
                      isActive
                        ? "bg-[#2DD1AC]/8 border-[#2DD1AC]"
                        : "border-transparent hover:bg-[#faf9f5]"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2DD1AC]/20 to-[#6a9bcc]/20 flex items-center justify-center shrink-0 overflow-hidden">
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
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className="text-sm font-semibold text-[#2D3748] truncate"
                          style={{ fontFamily: "var(--font-ui)" }}
                        >
                          {facility?.name || "Facility"}
                        </span>
                        <span
                          className="text-[10px] text-[#b0aea5] shrink-0"
                          style={{ fontFamily: "var(--font-ui)" }}
                        >
                          {timeAgo(c.last_message_at)}
                        </span>
                      </div>
                      <p
                        className="text-xs text-[#b0aea5] truncate mt-0.5"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {c.last_message_preview || "Say hello to get started."}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
