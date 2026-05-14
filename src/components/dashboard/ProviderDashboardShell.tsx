"use client";

import { useEffect, useState } from "react";
import { Building2, MessageSquareQuote, BarChart3, ClipboardList, Settings as SettingsIcon, Eye, CheckCircle2, Heart, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import DashboardChrome, { type NavItem, type StatTile } from "./DashboardChrome";
import { ProviderDashboard } from "./ProviderDashboard";

interface Props {
  profile: Profile;
}

const NAV: NavItem[] = [
  { key: "dashboard",    label: "Dashboard",     icon: LayoutDashboard },
  { key: "facilities",   label: "My Facilities", icon: Building2 },
  { key: "inquiries",    label: "Inquiries",      icon: MessageSquareQuote },
  { key: "questionnaire",label: "Questionnaire",  icon: ClipboardList },
  { key: "care-profile", label: "Care Profile",   icon: Heart },
  { key: "insights",     label: "Insights",       icon: BarChart3 },
  { key: "settings",     label: "Settings",       icon: SettingsIcon },
];

export default function ProviderDashboardShell({ profile }: Props) {
  const [activeKey, setActiveKey] = useState("dashboard");
  const [counts, setCounts] = useState({ facilities: 0, active: 0, impressions: 0, pending: 0 });

  useEffect(() => {
    async function loadCounts() {
      const supabase = createClient();
      const { data: facilities } = await supabase
        .from("facilities")
        .select("id, is_active")
        .eq("owner_id", profile.id);
      const arr = facilities || [];

      let impressions = 0;
      if (arr.length) {
        const ids = arr.map((f) => f.id);
        const { data: imps } = await supabase
          .from("match_impressions")
          .select("id", { count: "exact", head: false })
          .in("facility_id", ids);
        impressions = (imps || []).length;
      }

      setCounts({
        facilities: arr.length,
        active: arr.filter((f) => f.is_active).length,
        impressions,
        pending: arr.filter((f) => !f.is_active).length,
      });
    }
    loadCounts();
  }, [profile.id]);

  const stats: StatTile[] = [
    { label: "My Facilities",      value: counts.facilities,  sublabel: `${counts.active} active`,                                    icon: Building2,   tone: "teal"   },
    { label: "Active Listings",    value: counts.active,      sublabel: counts.pending ? `${counts.pending} pending review` : "All approved", icon: CheckCircle2, tone: "pink"   },
    { label: "Match Appearances",  value: counts.impressions, sublabel: "Shown to families",                                          icon: Eye,         tone: "orange" },
    { label: "Profile Visitors",   value: 0,                  sublabel: "This month",                                                 icon: Eye,         tone: "purple" },
  ];

  const isHomeDash = activeKey === "dashboard";

  return (
    <DashboardChrome
      profile={profile}
      panelTitle="Provider Studio"
      panelSubtitle="Where care meets coordination."
      badge="Provider"
      navItems={NAV}
      activeKey={activeKey}
      onNavSelect={setActiveKey}
      pageTitle={isHomeDash ? "Provider Studio" : NAV.find(n => n.key === activeKey)?.label ?? "Provider"}
      pageEyebrow="Live"
      stats={isHomeDash ? stats : []}
      hero={isHomeDash ? {
        image: "/assets/images/hero.jpeg",
        eyebrow: "Today's outlook",
        title: <>Care, <em style={{ fontFamily: "var(--font-accent)", fontStyle: "italic" }}>thoughtfully</em> presented.</>,
        body: "Manage your facility listings, monitor inquiries from families, and keep your care profile tuned. Everything in one quiet, focused place.",
      } : undefined}
    >
      {isHomeDash ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: "facilities",    label: "My Facilities",  icon: Building2,         desc: "View and manage your care home listings.",        count: counts.facilities,  accent: "#2DD1AC" },
            { key: "inquiries",     label: "Inquiries",      icon: MessageSquareQuote, desc: "Respond to messages from families.",              count: null,               accent: "#6a9bcc" },
            { key: "questionnaire", label: "Questionnaire",  icon: ClipboardList,      desc: "Answer care questions to improve your matches.",  count: null,               accent: "#d97757" },
            { key: "care-profile",  label: "Care Profile",   icon: Heart,              desc: "Set the types of care each facility provides.",   count: null,               accent: "#e07a9b" },
            { key: "insights",      label: "Insights",       icon: BarChart3,          desc: "See how often your facilities appear in results.", count: counts.impressions, accent: "#788c5d" },
            { key: "settings",      label: "Settings",       icon: SettingsIcon,       desc: "Update your account name, phone, and details.",   count: null,               accent: "#b0aea5" },
          ].map(({ key, label, icon: Icon, desc, count, accent }) => (
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
          ))}
        </div>
      ) : (
        <ProviderDashboard profile={profile} activeTab={activeKey} />
      )}
    </DashboardChrome>
  );
}
