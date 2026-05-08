"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  ChevronRight,
  MapPin,
  MessageCircle,
  Search,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Conversation, Facility, Profile } from "@/lib/types";
import ConversationList from "./customer/ConversationList";
import ChatThread from "./customer/ChatThread";

export function UserDashboard({ profile }: { profile: Profile }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const facilityParam = searchParams.get("facility");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const loadConversations = useCallback(async (): Promise<Conversation[]> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false });

    if (!convs || convs.length === 0) return [];

    const facilityIds = Array.from(new Set(convs.map((c) => c.facility_id)));
    const { data: facilities } = await supabase
      .from("facilities")
      .select("*")
      .in("id", facilityIds);

    const facilityMap = new Map<string, Facility>(
      (facilities || []).map((f: Facility) => [f.id, f])
    );

    return convs.map((c) => ({
      ...c,
      facility: facilityMap.get(c.facility_id),
    })) as Conversation[];
  }, []);

  // Initial load + handle deep-link to start a conversation
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      let convs = await loadConversations();

      // Handle ?facility=<id> -> create or open conversation
      if (facilityParam) {
        const existing = convs.find((c) => c.facility_id === facilityParam);
        if (existing) {
          if (!cancelled) {
            setActiveId(existing.id);
            setShowChatOnMobile(true);
          }
        } else {
          const { data: facility } = await supabase
            .from("facilities")
            .select("*")
            .eq("id", facilityParam)
            .single();

          if (facility?.owner_id) {
            const { data: created } = await supabase
              .from("conversations")
              .insert({
                user_id: user.id,
                provider_id: facility.owner_id,
                facility_id: facility.id,
                last_message_preview: null,
              })
              .select()
              .single();
            if (created) {
              convs = await loadConversations();
              if (!cancelled) {
                setActiveId(created.id);
                setShowChatOnMobile(true);
              }
            }
          }
        }
        // Clean up URL
        router.replace("/dashboard");
      }

      if (!cancelled) {
        setConversations(convs);
        setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityParam]);

  // Subscribe to conversation updates so the sidebar reflects new messages
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("conversations-user")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        async () => {
          const next = await loadConversations();
          setConversations(next);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadConversations]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId]
  );

  const handleSelect = (id: string) => {
    setActiveId(id);
    setShowChatOnMobile(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div
          className="animate-pulse text-[#b0aea5]"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          Loading your conversations…
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Messenger layout */}
      <div className="surface-paper overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr] h-[calc(100vh-220px)] min-h-[560px]">
          {/* Sidebar */}
          <div
            className={`border-r border-[#e8e6dc]/60 ${
              showChatOnMobile && active ? "hidden md:flex" : "flex"
            } flex-col`}
          >
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
            />
          </div>

          {/* Main pane */}
          <div
            className={`${
              showChatOnMobile && active ? "flex" : "hidden md:flex"
            } flex-col`}
          >
            {/* Mobile back button */}
            {active && (
              <button
                onClick={() => setShowChatOnMobile(false)}
                className="md:hidden flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#2D3748] border-b border-[#e8e6dc]/60"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to chats
              </button>
            )}

            {active ? (
              <ChatThread conversation={active} currentUserId={profile.id} />
            ) : (
              <FacilityOverview conversations={conversations} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function FacilityOverview({ conversations }: { conversations: Conversation[] }) {
  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-[#2DD1AC]/10 flex items-center justify-center mb-6">
          <MessageCircle className="w-10 h-10 text-[#2DD1AC]" />
        </div>
        <h3
          className="text-2xl font-bold text-[#2D3748] mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          No facilities reached out to yet
        </h3>
        <p
          className="text-[#b0aea5] mb-6 max-w-sm"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Browse facilities and tap “Reach Out” to start a conversation with a
          provider.
        </p>
        <div
          className="flex flex-col sm:flex-row gap-3"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <Link
            href="/find-a-home"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/85 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Search className="w-4 h-4" />
            Find a Home
          </Link>
          <Link
            href="/facilities"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-[#2D3748] bg-white border-2 border-[#e8e6dc] hover:border-[#2DD1AC]/40 transition-all"
          >
            <Building2 className="w-4 h-4" />
            Browse Facilities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-[#2D3748] mb-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Facilities you’ve reached out to
        </h2>
        <p
          className="text-sm text-[#b0aea5]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Pick a chat from the left to continue the conversation, or open a
          facility’s page below.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {conversations.map((c) => {
          const f = c.facility;
          if (!f) return null;
          return (
            <div
              key={c.id}
              className="group p-5 rounded-2xl bg-[#faf9f5]/60 border border-[#e8e6dc]/60 hover:border-[#2DD1AC]/40 hover:bg-white hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2DD1AC]/20 to-[#6a9bcc]/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {f.image_urls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.image_urls[0]}
                      alt={f.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-[#2DD1AC]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-base font-bold text-[#2D3748] truncate"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {f.name}
                  </h3>
                  <div
                    className="flex items-center gap-3 text-xs text-[#b0aea5] mt-0.5"
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {f.city}
                    </span>
                  </div>
                </div>
              </div>
              {c.last_message_preview && (
                <p
                  className="text-sm text-[#2D3748]/70 line-clamp-2 mb-3"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {c.last_message_preview}
                </p>
              )}
              <Link
                href={`/facilities/${f.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2DD1AC] hover:text-[#2DD1AC]/80"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                View facility
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
