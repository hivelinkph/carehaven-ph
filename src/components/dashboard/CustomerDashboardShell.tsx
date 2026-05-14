"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, MessageCircle, Building2, Compass, User, Settings as SettingsIcon,
  Heart, Star, Calendar, Phone, Mail, MapPin, Bell, Shield, Lock,
  Save, AlertCircle, Search, Trash2,
} from "lucide-react";
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

const PH_REGIONS = [
  "NCR – Metro Manila",
  "Region I – Ilocos Region",
  "Region II – Cagayan Valley",
  "Region III – Central Luzon",
  "Region IV-A – CALABARZON",
  "Region IV-B – MIMAROPA",
  "Region V – Bicol Region",
  "Region VI – Western Visayas",
  "Region VII – Central Visayas",
  "Region VIII – Eastern Visayas",
  "Region IX – Zamboanga Peninsula",
  "Region X – Northern Mindanao",
  "Region XI – Davao Region",
  "Region XII – SOCCSKSARGEN",
  "Region XIII – Caraga",
  "BARMM – Bangsamoro",
  "CAR – Cordillera Administrative Region",
];

export default function CustomerDashboardShell({ profile }: Props) {
  const [activeKey, setActiveKey] = useState("dashboard");
  const [convCount, setConvCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Profile tab state
  const nameParts = (profile.full_name || "").trim().split(" ");
  const [profileForm, setProfileForm] = useState({
    firstName:    nameParts[0] || "",
    lastName:     nameParts.slice(1).join(" ") || "",
    phone:        profile.phone   || "",
    address:      profile.address || "",
    city:         profile.city    || "",
    region:       profile.region  || "",
    relationship: "parent",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved,  setProfileSaved]  = useState(false);

  // Settings tab state
  const [notifEmail,  setNotifEmail]  = useState(true);
  const [notifSMS,    setNotifSMS]    = useState(false);
  const [resetSent,   setResetSent]   = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

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

  const saveProfile = async () => {
    setProfileSaving(true);
    const sb = createClient();
    const full_name = [profileForm.firstName.trim(), profileForm.lastName.trim()].filter(Boolean).join(" ");
    await sb.from("profiles").update({
      full_name,
      phone:   profileForm.phone,
      address: profileForm.address,
      city:    profileForm.city,
      region:  profileForm.region,
    }).eq("id", profile.id);
    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const sendPasswordReset = async () => {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (user?.email) {
      await sb.auth.resetPasswordForEmail(user.email);
      setResetSent(true);
    }
  };

  const stats: StatTile[] = [
    { label: "Conversations",   value: convCount,   icon: MessageCircle, tone: "teal"   },
    { label: "Recent activity", value: unreadCount, sublabel: "in the last 24 hours", icon: Star,     tone: "pink"   },
    { label: "Saved homes",     value: 0,           sublabel: "Bookmarks coming soon", icon: Heart,    tone: "orange" },
    { label: "Visits planned",  value: 0,           sublabel: "Schedule a tour",       icon: Calendar, tone: "purple" },
  ];

  const isHomeDash = activeKey === "dashboard";

  // Shared style helpers
  const card  = "bg-white rounded-2xl border border-[#ebe4d3] p-6 mb-5";
  const input = "w-full px-4 py-2.5 rounded-xl border border-[#ebe4d3] bg-white text-[14px] focus:outline-none focus:border-[#2DD1AC] transition-colors";
  const label = "block text-[11.5px] font-semibold uppercase tracking-wide mb-1.5 text-[#b0aea5]";

  const displayName = [profileForm.firstName, profileForm.lastName].filter(Boolean).join(" ");
  const initials    = profileForm.firstName?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "?";

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
      {/* ── HOME DASHBOARD ── */}
      {isHomeDash ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: "messages", label: "Messages",         icon: MessageCircle, desc: "Continue conversations with care facilities.",      count: convCount,   accent: "#2DD1AC" },
            { key: "find",     label: "Find a Home",      icon: Compass,       desc: "Answer a few questions to find the right fit.",     count: null,        accent: "#6a9bcc", href: "/find-a-home" },
            { key: "saved",    label: "Saved Facilities", icon: Building2,     desc: "Review facilities you've bookmarked for later.",    count: null,        accent: "#d97757" },
            { key: "profile",  label: "Profile",          icon: User,          desc: "Keep your contact details up to date.",             count: null,        accent: "#788c5d" },
            { key: "settings", label: "Settings",         icon: SettingsIcon,  desc: "Manage your account preferences.",                  count: null,        accent: "#b0aea5" },
          ].map(({ key, label: lbl, icon: Icon, desc, count, accent, href }) =>
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
                <div className="text-[14px] font-semibold mb-1" style={{ fontFamily: "var(--font-ui)", color: "var(--d-ink)" }}>{lbl}</div>
                <div className="text-[12.5px] leading-snug" style={{ fontFamily: "var(--font-body)", color: "var(--d-ink-muted)" }}>{desc}</div>
                <div className="mt-3 text-[11.5px] font-medium group-hover:underline" style={{ color: accent, fontFamily: "var(--font-ui)" }}>
                  Go to {lbl} →
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
                <div className="text-[14px] font-semibold mb-1" style={{ fontFamily: "var(--font-ui)", color: "var(--d-ink)" }}>{lbl}</div>
                <div className="text-[12.5px] leading-snug" style={{ fontFamily: "var(--font-body)", color: "var(--d-ink-muted)" }}>{desc}</div>
                <div className="mt-3 text-[11.5px] font-medium group-hover:underline" style={{ color: accent, fontFamily: "var(--font-ui)" }}>
                  Go to {lbl} →
                </div>
              </button>
            )
          )}
        </div>

      ) : activeKey === "messages" ? (
        /* ── MESSAGES ── */
        <UserDashboard profile={profile} />

      ) : activeKey === "profile" ? (
        /* ── PROFILE ── */
        <div className="max-w-2xl">

          {/* Avatar header */}
          <div className={`${card} flex items-center gap-5`}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 select-none"
              style={{ background: "#2DD1AC22", color: "#2DD1AC", fontFamily: "var(--font-heading)" }}
            >
              {initials}
            </div>
            <div>
              <div className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>
                {displayName || "Your Name"}
              </div>
              <div className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--d-ink-muted)" }}>
                {profile.email}
              </div>
              <div
                className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                style={{ background: "#2DD1AC18", color: "#2DD1AC", fontFamily: "var(--font-ui)" }}
              >
                Customer / Family
              </div>
            </div>
          </div>

          {/* Personal information */}
          <div className={card}>
            <h3 className="text-base font-semibold mb-5" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>
              Personal Information
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={label}>First Name</label>
                <input
                  className={input}
                  placeholder="First name"
                  value={profileForm.firstName}
                  onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className={label}>Last Name</label>
                <input
                  className={input}
                  placeholder="Last name"
                  value={profileForm.lastName}
                  onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className={label}>Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0aea5] pointer-events-none" />
                <input
                  className={`${input} pl-10`}
                  type="tel"
                  placeholder="+63 912 345 6789"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className={label}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0aea5] pointer-events-none" />
                <input
                  className={`${input} pl-10 opacity-60 cursor-not-allowed`}
                  type="email"
                  value={profile.email || ""}
                  disabled
                />
              </div>
              <p className="text-[11.5px] mt-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--d-ink-muted)" }}>
                Email is managed through your account. Contact support to update it.
              </p>
            </div>

            <div>
              <label className={label}>Looking for care for</label>
              <select
                className={input}
                value={profileForm.relationship}
                onChange={e => setProfileForm(p => ({ ...p, relationship: e.target.value }))}
                style={{ color: "var(--d-ink)" }}
              >
                <option value="parent">A parent</option>
                <option value="spouse">A spouse or partner</option>
                <option value="myself">Myself</option>
                <option value="sibling">A sibling</option>
                <option value="grandparent">A grandparent</option>
                <option value="other">Someone else</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className={card}>
            <h3 className="text-base font-semibold mb-5" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>
              Location
            </h3>

            <div className="mb-4">
              <label className={label}>Street Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0aea5] pointer-events-none" />
                <input
                  className={`${input} pl-10`}
                  placeholder="House no., street, barangay"
                  value={profileForm.address}
                  onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>City / Municipality</label>
                <input
                  className={input}
                  placeholder="City"
                  value={profileForm.city}
                  onChange={e => setProfileForm(p => ({ ...p, city: e.target.value }))}
                />
              </div>
              <div>
                <label className={label}>Region</label>
                <select
                  className={input}
                  value={profileForm.region}
                  onChange={e => setProfileForm(p => ({ ...p, region: e.target.value }))}
                  style={{ color: profileForm.region ? "var(--d-ink)" : "#b0aea5" }}
                >
                  <option value="">Select region</option>
                  {PH_REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 pb-6">
            <button
              onClick={saveProfile}
              disabled={profileSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "#2DD1AC", fontFamily: "var(--font-ui)" }}
            >
              <Save className="w-4 h-4" />
              {profileSaving ? "Saving…" : "Save Profile"}
            </button>
            {profileSaved && (
              <span className="text-sm font-medium text-emerald-600" style={{ fontFamily: "var(--font-ui)" }}>
                Saved ✓
              </span>
            )}
          </div>
        </div>

      ) : activeKey === "settings" ? (
        /* ── SETTINGS ── */
        <div className="max-w-2xl">

          {/* Notifications */}
          <div className={card}>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-[#2DD1AC]" />
              <h3 className="text-base font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>
                Notifications
              </h3>
            </div>
            {[
              {
                id: "email",
                lbl: "Email notifications",
                sub: "Receive new messages and facility updates via email",
                val: notifEmail,
                set: setNotifEmail,
              },
              {
                id: "sms",
                lbl: "SMS notifications",
                sub: "Get text alerts for urgent updates and replies",
                val: notifSMS,
                set: setNotifSMS,
              },
            ].map(({ id, lbl, sub, val, set }) => (
              <div key={id} className="flex items-center justify-between py-3.5 border-b border-[#f0ede4] last:border-0">
                <div>
                  <div className="text-[13.5px] font-medium" style={{ fontFamily: "var(--font-ui)", color: "var(--d-ink)" }}>{lbl}</div>
                  <div className="text-[12px]" style={{ fontFamily: "var(--font-body)", color: "var(--d-ink-muted)" }}>{sub}</div>
                </div>
                <button
                  onClick={() => set(!val)}
                  aria-label={`Toggle ${lbl}`}
                  className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none"
                  style={{ background: val ? "#2DD1AC" : "#e0ddd5" }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                    style={{ transform: val ? "translateX(20px)" : "translateX(2px)" }}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Account security */}
          <div className={card}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-[#6a9bcc]" />
              <h3 className="text-base font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>
                Account Security
              </h3>
            </div>
            <p className="text-[13px] font-medium mb-2" style={{ fontFamily: "var(--font-ui)", color: "var(--d-ink)" }}>
              Password
            </p>
            <button
              onClick={sendPasswordReset}
              disabled={resetSent}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#ebe4d3] text-sm font-medium transition-all hover:border-[#6a9bcc] disabled:opacity-60"
              style={{ fontFamily: "var(--font-ui)", color: "var(--d-ink)" }}
            >
              <Lock className="w-3.5 h-3.5" />
              {resetSent ? "Reset email sent ✓" : "Send password reset email"}
            </button>
            {resetSent && (
              <p className="text-[12px] text-emerald-600 mt-2" style={{ fontFamily: "var(--font-body)" }}>
                Check your inbox — a reset link has been sent to {profile.email}.
              </p>
            )}
          </div>

          {/* Account details */}
          <div className={card}>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[#788c5d]" />
              <h3 className="text-base font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>
                Account Details
              </h3>
            </div>
            <div className="space-y-0">
              {[
                { lbl: "Account type",  val: "Customer / Family" },
                {
                  lbl: "Member since",
                  val: new Date(profile.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "long" }),
                },
                { lbl: "Email address", val: profile.email || "—" },
              ].map(({ lbl, val }) => (
                <div key={lbl} className="flex justify-between items-center py-3 border-b border-[#f0ede4] last:border-0">
                  <span className="text-[13px]" style={{ fontFamily: "var(--font-body)", color: "var(--d-ink-muted)" }}>{lbl}</span>
                  <span className="text-[13px] font-medium" style={{ fontFamily: "var(--font-ui)", color: "var(--d-ink)" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <h3 className="text-base font-semibold text-red-600" style={{ fontFamily: "var(--font-heading)" }}>
                Danger Zone
              </h3>
            </div>
            <p className="text-[12.5px] mb-4" style={{ fontFamily: "var(--font-body)", color: "var(--d-ink-muted)" }}>
              Permanently delete your account and all associated data. Type{" "}
              <strong style={{ color: "#141413" }}>DELETE</strong> below to confirm. This cannot be undone.
            </p>
            <div className="flex gap-3 items-center">
              <input
                className="flex-1 px-4 py-2 rounded-xl border border-red-200 text-sm focus:outline-none focus:border-red-400 transition-colors"
                placeholder="Type DELETE to confirm"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                style={{ fontFamily: "var(--font-ui)", color: "var(--d-ink)" }}
              />
              <button
                disabled={deleteInput !== "DELETE"}
                className="flex items-center justify-center w-10 h-10 rounded-xl transition-all"
                style={{
                  background: deleteInput === "DELETE" ? "#ef4444" : "#f5f2eb",
                  color: deleteInput === "DELETE" ? "#fff" : "#b0aea5",
                  cursor: deleteInput === "DELETE" ? "pointer" : "not-allowed",
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      ) : activeKey === "saved" ? (
        /* ── SAVED FACILITIES ── */
        <div className="max-w-2xl">
          <div className={`${card} text-center py-12`}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "#d9775718" }}
            >
              <Heart className="w-7 h-7" style={{ color: "#d97757" }} />
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}
            >
              No saved facilities yet
            </h3>
            <p
              className="text-[13.5px] leading-relaxed max-w-sm mx-auto mb-7"
              style={{ fontFamily: "var(--font-body)", color: "var(--d-ink-muted)" }}
            >
              When you run a Find a Home search, you can save facilities here to revisit, compare, and contact them whenever you&apos;re ready.
            </p>
            <Link
              href="/find-a-home"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "#2DD1AC", fontFamily: "var(--font-ui)" }}
            >
              <Search className="w-4 h-4" />
              Start a Search
            </Link>
          </div>
        </div>

      ) : activeKey === "find" ? (
        /* ── FIND A HOME ── */
        <div className="max-w-2xl">
          <div className={card}>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "#6a9bcc18" }}
            >
              <Compass className="w-6 h-6" style={{ color: "#6a9bcc" }} />
            </div>
            <h3
              className="text-xl font-semibold mb-2"
              style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}
            >
              Find the right home
            </h3>
            <p
              className="text-[13.5px] leading-relaxed mb-7 max-w-md"
              style={{ fontFamily: "var(--font-body)", color: "var(--d-ink-muted)" }}
            >
              Answer a few short questions about your loved one&apos;s needs and we&apos;ll match you with vetted facilities that fit — by location, care level, and budget.
            </p>

            <div className="space-y-3 mb-8">
              {[
                "Tell us about who needs care",
                "Share their care requirements",
                "See matched facilities with scores",
                "Contact providers directly or through us",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                    style={{ background: "#6a9bcc", fontFamily: "var(--font-ui)" }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[13px]" style={{ fontFamily: "var(--font-body)", color: "var(--d-ink)" }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/find-a-home"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "#6a9bcc", fontFamily: "var(--font-ui)" }}
            >
              <Compass className="w-4 h-4" />
              Start Your Search
            </Link>
          </div>
          <p
            className="text-[12px] text-center mt-1"
            style={{ fontFamily: "var(--font-body)", color: "var(--d-ink-muted)" }}
          >
            You&apos;re signed in — your results will be saved automatically.
          </p>
        </div>

      ) : (
        /* ── FALLBACK ── */
        <div className="glass-card p-12 text-center">
          <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-body)" }}>
            {NAV.find(n => n.key === activeKey)?.label} — coming soon.
          </p>
        </div>
      )}
    </DashboardChrome>
  );
}
