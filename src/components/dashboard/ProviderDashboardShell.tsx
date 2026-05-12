"use client";

import { useEffect, useState } from "react";
import { Building2, MessageSquareQuote, BarChart3, ClipboardList, Settings as SettingsIcon, Eye, CheckCircle2, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import DashboardChrome, { type NavItem, type StatTile } from "./DashboardChrome";
import { ProviderDashboard } from "./ProviderDashboard";

interface Props {
  profile: Profile;
}

const NAV: NavItem[] = [
  { key: "facilities",   label: "My Facilities", icon: Building2 },
  { key: "inquiries",    label: "Inquiries",      icon: MessageSquareQuote },
  { key: "questionnaire",label: "Questionnaire",  icon: ClipboardList },
  { key: "care-profile", label: "Care Profile",   icon: Heart },
  { key: "insights",     label: "Insights",       icon: BarChart3 },
  { key: "settings",     label: "Settings",       icon: SettingsIcon },
];

export default function ProviderDashboardShell({ profile }: Props) {
  const [activeKey, setActiveKey] = useState("facilities");
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

  return (
    <DashboardChrome
      profile={profile}
      panelTitle="Provider Studio"
      panelSubtitle="Where care meets coordination."
      badge="Provider"
      navItems={NAV}
      activeKey={activeKey}
      onNavSelect={setActiveKey}
      pageTitle="Provider Studio"
      pageEyebrow="Live"
      stats={stats}
      hero={{
        image: "/assets/images/hero.jpeg",
        eyebrow: "Today's outlook",
        title: <>Care, <em style={{ fontFamily: "var(--font-accent)", fontStyle: "italic" }}>thoughtfully</em> presented.</>,
        body: "Manage your facility listings, monitor inquiries from families, and keep your care profile tuned. Everything in one quiet, focused place.",
      }}
    >
      {/* activeKey is passed directly — tab switching now works */}
      <ProviderDashboard profile={profile} activeTab={activeKey} />
    </DashboardChrome>
  );
}
