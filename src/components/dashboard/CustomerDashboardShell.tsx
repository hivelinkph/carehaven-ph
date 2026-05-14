"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, MessageCircle, Building2, Compass, User, Settings as SettingsIcon, Heart, Star, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import DashboardChrome, { type NavItem, type StatTile } from "./DashboardChrome";
import { UserDashboard } from "./UserDashboard";

interface Props {
  profile: Profile;
}

const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard",        icon: LayoutDashboard },
  { key: "messages",  label: "Messages",          icon: MessageCircle },
  { key: "saved",     label: "Saved Facilities",  icon: Building2 },
  { key: "find",      label: "Find a Home",       icon: Compass },
  { key: "profile",   label: "Profile",           icon: User },
  { key: "settings",  label: "Settings",          icon: SettingsIcon },
];

export default function CustomerDashboardShell({ profile }: Props) {
  const [activeKey, setActiveKey] = useState("dashboard");
  const [convCount, setConvCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadCounts() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: convs } = await supabase
        .from("conversations")
        .select("id, last_message_at")
        .eq("user_id", user.id);
      setConvCount((convs || []).length);
      const dayAgo = Date.now() - 24 * 3600 * 1000;
      setUnreadCount(
        (convs || []).filter((c) => new Date(c.last_message_at).getTime() > dayAgo).length
      );
    }
    loadCounts();
  }, []);

  const stats: StatTile[] = [
    { label: "Conversations",  value: convCount,   icon: MessageCircle, tone: "teal" },
    { label: "Recent activity", value: unreadCount, sublabel: "in the last 24 hours", icon: Star,     tone: "pink"   },
    { label: "Saved homes",    value: 0,           sublabel: "Bookmarks coming soon", icon: Heart,    tone: "orange" },
    { label: "Visits planned", value: 0,           sublabel: "Schedule a tour",       icon: Calendar, tone: "purple" },
  ];

  const isHomeDash = activeKey === "dashboard";

  return (
    <DashboardChrome
      profile={profile}
      badge="Customer"
      navItems={NAV}
      activeKey={activeKey}
      onNavSelect={setActiveKey}
      pageTitle={isHomeDash ? "Family Hub" : NAV.find(n => n.key === activeKey)?.label ?? "Dashboard"}
      pageEyebrow="Active"
      stats={isHomeDash ? stats : []}
      hero={isHomeDash ? {
        image: "/assets/images/hero.jpeg",
        eyebrow: "Today's note",
        title: <>Compassion in <em style={{ fontFamily: "var(--font-accent)", fontStyle: "italic" }}>every detail.</em></>,
        body: "A quiet space to keep up with the people who matter — what their day looked like, who's caring for them, and any messages from their facility.",
      } : undefined}
    >
      {isHomeDash ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: "messages", label: "Messages",         icon: MessageCircle, desc: "Continue conversations with care facilities.",      count: convCount,   accent: "#2DD1AC" },
            { key: "find",     label: "Find a Home",      icon: Compass,       desc: "Answer a few questions to find the right fit.",     count: null,        accent: "#6a9bcc", href: "/find-a-home" },
            { key: "saved",    label: "Saved Facilities", icon: Building2,     desc: "Review facilities you've bookmarked for later.",    count: null,        accent: "#d97757" },
            { key: "profile",  label: "Profile",          icon: User,          desc: "Keep your contact details up to date.",             count: null,        accent: "#788c5d" },
            { key: "settings", label: "Settings",         icon: SettingsIcon,  desc: "Manage your account preferences.",                  count: null,        accent: "#b0aea5" },
          ].map(({ key, label, icon: Icon, desc, count, accent, href }) =>
            href ? (
              <Link
                key={key}
                href={href}
                className="text-left bg-white rounded-2xl border border-[#ebe4d3] p-5 hover:border-[#2DD1AC]/40 hover:shadow-md transition-all group block"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
                    <Icon className="w-5 h-5" style={{ color: accent }} />
                  </div>
                </div>
                <div className="text-[14px] font-semibold mb-1" style={{ fontFamily: "var(--font-ui)", color: "var(--d-ink)" }}>{label}</div>
                <div className="text-[12.5px] leading-snug" style={{ fontFamily: "var(--font-body)", color: "var(--d-ink-muted)" }}>{desc}</div>
                <div className="mt-3 text-[11.5px] font-medium group-hover:underline" style={{ color: accent, fontFamily: "var(--font-ui)" }}>
                  Go to {label} →
                </div>
              </Link>
            ) : (
              <button
                key={key}
                onClick={() => setActiveKey(key)}
                className="text-left bg-white rounded-2xl border border-[#ebe4d3] p-5 hover:border-[#2DD1AC]/40 hover:shadow-md transition-all group"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
                    <Icon className="w-5 h-5" style={{ color: accent }} />
                  </div>
                  {count !== null && (
                    <span className="text-[22px] font-bold leading-none" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>
                      {count}
                    </span>
                  )}
                </div>
                <div className="text-[14px] font-semibold mb-1" style={{ fontFamily: "var(--font-ui)", color: "var(--d-ink)" }}>{label}</div>
                <div className="text-[12.5px] leading-snug" style={{ fontFamily: "var(--font-body)", color: "var(--d-ink-muted)" }}>{desc}</div>
                <div className="mt-3 text-[11.5px] font-medium group-hover:underline" style={{ color: accent, fontFamily: "var(--font-ui)" }}>
                  Go to {label} →
                </div>
              </button>
            )
          )}
        </div>
      ) : activeKey === "messages" ? (
        <UserDashboard profile={profile} />
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-body)" }}>
            {NAV.find(n => n.key === activeKey)?.label} — coming soon.
          </p>
        </div>
      )}
    </DashboardChrome>
  );
}
