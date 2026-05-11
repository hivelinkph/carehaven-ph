"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

export interface StatTile {
  label: string;
  value: number | string;
  sublabel?: string;
  icon: LucideIcon;
  tone: "teal" | "pink" | "orange" | "purple";
}

interface Props {
  profile: Profile;
  panelTitle: string;
  panelSubtitle: string;
  badge: string;
  navItems: NavItem[];
  activeKey: string;
  onNavSelect: (key: string) => void;
  greeting?: string;
  pageTitle: string;
  pageEyebrow: string;
  stats: StatTile[];
  hero: {
    image: string;
    eyebrow: string;
    title: ReactNode;
    body: string;
  };
  children: ReactNode;
}

const TONE_BG: Record<StatTile["tone"], string> = {
  teal: "var(--d-stat-teal-bg)",
  pink: "var(--d-stat-pink-bg)",
  orange: "var(--d-stat-orange-bg)",
  purple: "var(--d-stat-purple-bg)",
};
const TONE_FG: Record<StatTile["tone"], string> = {
  teal: "var(--d-stat-teal)",
  pink: "var(--d-stat-pink)",
  orange: "var(--d-stat-orange)",
  purple: "var(--d-stat-purple)",
};

export default function DashboardChrome({
  profile,
  panelTitle,
  panelSubtitle,
  badge,
  navItems,
  activeKey,
  onNavSelect,
  greeting = "Welcome back",
  pageTitle,
  pageEyebrow,
  stats,
  hero,
  children,
}: Props) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const firstName = (profile.full_name || "").trim().split(" ")[0] || "";
  const initials = (profile.full_name || "U")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--d-bg)" }}>
      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 w-64 transition-transform duration-300 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: "var(--d-sidebar)", color: "var(--d-sidebar-text)" }}
      >
        <div className="flex flex-col h-full px-4 py-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-9 px-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--d-primary)" }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                <path d="M12 21s-7.5-4.7-7.5-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 19.5 10c0 6.3-7.5 11-7.5 11z" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="text-white text-[15px] font-semibold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                SeniorLiving
              </div>
              <div className="text-[10px] tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.55)" }}>
                Senior Living PH
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = item.key === activeKey;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onNavSelect(item.key);
                    setMobileNavOpen(false);
                  }}
                  className={`cursor-pointer w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] transition-all ${
                    isActive ? "font-medium" : "font-normal"
                  }`}
                  style={{
                    background: isActive ? "var(--d-sidebar-active)" : "transparent",
                    color: isActive ? "var(--d-sidebar-text-active)" : "var(--d-sidebar-text)",
                  }}
                >
                  <Icon className="w-[17px] h-[17px]" />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--d-primary)" }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quote / footer */}
          <div className="mt-6 px-3.5">
            <p
              className="text-[12px] leading-snug italic"
              style={{ fontFamily: "var(--font-accent)", color: "rgba(255,255,255,0.6)" }}
            >
              &ldquo;{panelSubtitle}&rdquo;
            </p>
            <p className="mt-1 text-[10px] tracking-[0.22em] uppercase" style={{ color: "rgba(255,255,255,0.32)" }}>
              {panelTitle}
            </p>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="cursor-pointer mt-4 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] transition-colors hover:bg-white/5"
            style={{ color: "rgba(255,200,180,0.85)" }}
          >
            <LogOut className="w-[17px] h-[17px]" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-0 min-w-0">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
          {/* Top bar */}
          <header className="flex items-center gap-4 mb-8">
            <button
              className="lg:hidden p-2 rounded-xl bg-white border border-[#ebe4d3]"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium" style={{ color: "var(--d-ink-muted)" }}>
                {greeting}{firstName ? `, ${firstName}` : ""}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <h1
                  className="text-[22px] sm:text-[24px] leading-tight"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)", fontWeight: 600 }}
                >
                  {pageTitle}
                </h1>
                <span className="dash-pill">{pageEyebrow}</span>
              </div>
            </div>



            {/* Notification */}
            <button
              className="relative w-10 h-10 rounded-full bg-white border border-[#ebe4d3] flex items-center justify-center hover:border-[#1a8576]/40 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" style={{ color: "var(--d-ink)" }} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
            </button>

            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
              style={{ background: "var(--d-primary)", fontFamily: "var(--font-ui)" }}
              title={profile.full_name || "User"}
            >
              {initials}
              <span
                className="absolute mt-7 ml-7 w-2.5 h-2.5 rounded-full border-2 border-white"
                style={{ background: "#7ed957" }}
                aria-hidden
              />
            </div>
          </header>

          {/* Stats row */}
          {stats.length > 0 && (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="bg-white rounded-2xl border border-[#ebe4d3] p-5"
                    style={{ boxShadow: "var(--d-card-shadow)" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: TONE_BG[s.tone] }}
                      >
                        <Icon className="w-[18px] h-[18px]" style={{ color: TONE_FG[s.tone] }} />
                      </div>
                    </div>
                    <div
                      className="text-[28px] leading-none"
                      style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)", fontWeight: 600 }}
                    >
                      {s.value}
                    </div>
                    <div className="mt-1.5 text-[12.5px]" style={{ color: "var(--d-ink-soft)" }}>
                      {s.label}
                    </div>
                    {s.sublabel && (
                      <div className="mt-0.5 text-[11px]" style={{ color: "var(--d-ink-muted)" }}>
                        {s.sublabel}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {/* Hero banner */}
          <section className="dash-hero mb-7 h-[200px] sm:h-[220px]">
            <img src={hero.image} alt="" />
            <div className="dash-hero-content h-full flex flex-col justify-center px-7 sm:px-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" style={{ color: "#9ee6d4" }}>
                    <path d="M12 21s-7.5-4.7-7.5-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 19.5 10c0 6.3-7.5 11-7.5 11z" />
                  </svg>
                </span>
                <span className="text-[11px] tracking-[0.22em] uppercase text-white/80">{hero.eyebrow}</span>
              </div>
              <h2
                className="text-[28px] sm:text-[34px] leading-tight text-white"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
              >
                {hero.title}
              </h2>
              <p className="mt-2 text-[13.5px] text-white/85 max-w-md leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                {hero.body}
              </p>
            </div>
          </section>

          {/* Page content */}
          <div className="space-y-6">{children}</div>

          {/* Footnote */}
          <p
            className="mt-10 text-center text-[11px] tracking-[0.22em] uppercase"
            style={{ color: "var(--d-ink-muted)", fontFamily: "var(--font-ui)" }}
          >
            Every detail matters · {badge}
          </p>
        </div>
      </main>
    </div>
  );
}
