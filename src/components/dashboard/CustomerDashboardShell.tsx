"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, MessageCircle, Building2, Compass, User, Settings as SettingsIcon, Heart, Star, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import DashboardChrome, { type NavItem, type StatTile } from "./DashboardChrome";

interface Props {
  profile: Profile;
  children: React.ReactNode;
}

const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "messages", label: "Messages", icon: MessageCircle },
  { key: "saved", label: "Saved Facilities", icon: Building2 },
  { key: "find", label: "Find a Home", icon: Compass },
  { key: "profile", label: "Profile", icon: User },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function CustomerDashboardShell({ profile, children }: Props) {
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
      // Approximate unread: conversations updated in last 24h
      const dayAgo = Date.now() - 24 * 3600 * 1000;
      setUnreadCount(
        (convs || []).filter((c) => new Date(c.last_message_at).getTime() > dayAgo).length
      );
    }
    loadCounts();
  }, []);

  const stats: StatTile[] = [
    { label: "Conversations", value: convCount, icon: MessageCircle, tone: "teal" },
    { label: "Recent activity", value: unreadCount, sublabel: "in the last 24 hours", icon: Star, tone: "pink" },
    { label: "Saved homes", value: 0, sublabel: "Bookmarks coming soon", icon: Heart, tone: "orange" },
    { label: "Visits planned", value: 0, sublabel: "Schedule a tour", icon: Calendar, tone: "purple" },
  ];

  return (
    <DashboardChrome
      profile={profile}
      panelTitle="Family Hub"
      panelSubtitle="Care, kept close to home."
      badge="Customer"
      navItems={NAV}
      activeKey={activeKey}
      onNavSelect={setActiveKey}
      pageTitle="Family Hub"
      pageEyebrow="Active"
      stats={stats}
      hero={{
        image: "/assets/images/hero.jpeg",
        eyebrow: "Today's note",
        title: <>Compassion in <em style={{ fontFamily: "var(--font-accent)", fontStyle: "italic" }}>every detail.</em></>,
        body: "A quiet space to keep up with the people who matter — what their day looked like, who's caring for them, and any messages from their facility.",
      }}
    >
      {children}
    </DashboardChrome>
  );
}
