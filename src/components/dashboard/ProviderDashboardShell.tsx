"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, LogOut, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface Props {
  profile: Profile;
  children: React.ReactNode;
}

export default function ProviderDashboardShell({ profile, children }: Props) {
  const router = useRouter();

  const stamp = useMemo(() => {
    const d = new Date();
    return d.toLocaleString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase();
  }, []);

  const firstName = useMemo(() => {
    const full = (profile.full_name || "").trim();
    return full ? full.split(" ")[0] : "Operator";
  }, [profile.full_name]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="pt-8 pb-16">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-10">
        <div
          className="flex items-center justify-between text-[12px]"
          style={{ fontFamily: "var(--font-mono)", color: "var(--p-ink-mute)" }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 hover:text-[var(--p-mint)] transition-colors uppercase tracking-[0.18em]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit station
          </Link>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline tracking-[0.22em]">{stamp}</span>
            <span className="pill">
              <span className="live-dot" />
              LIVE
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 hover:text-[var(--p-coral)] transition-colors uppercase tracking-[0.18em]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Command-station banner */}
      <header className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--p-mint)" }}>
            <span className="inline-block w-8 h-px bg-current" />
            <span className="tracking-[0.32em] uppercase">PROV / OPS / 01</span>
            <span className="inline-block flex-1 h-px" style={{ background: "linear-gradient(to right, currentColor, transparent)" }} />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <p
                className="text-[12px] tracking-[0.32em] uppercase mb-3"
                style={{ fontFamily: "var(--font-mono)", color: "var(--p-ink-mute)" }}
              >
                Operator &nbsp;·&nbsp; {firstName}
              </p>
              <h1
                className="text-5xl sm:text-6xl lg:text-[5.4rem] leading-[0.95] tracking-tight"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--p-paper)",
                  fontWeight: 500,
                }}
              >
                Operations
                <br />
                <span style={{ color: "var(--p-mint)", fontStyle: "italic", fontFamily: "var(--font-accent)" }}>
                  Atelier
                </span>
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-3 min-w-[18rem]">
              {[
                { k: "STATUS", v: "ACTIVE", color: "var(--p-mint)" },
                { k: "REGION", v: "PH·NCR", color: "var(--p-amber)" },
                { k: "TIER", v: "01", color: "var(--p-paper)" },
              ].map((m) => (
                <div
                  key={m.k}
                  className="station-card px-4 py-3"
                >
                  <div
                    className="text-[10px] tracking-[0.22em] uppercase mb-1"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--p-ink-mute)" }}
                  >
                    {m.k}
                  </div>
                  <div
                    className="num text-lg font-semibold"
                    style={{ color: m.color }}
                  >
                    {m.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Activity className="w-4 h-4" style={{ color: "var(--p-mint)" }} />
            <p
              className="text-[13px] max-w-2xl"
              style={{ fontFamily: "var(--font-ui)", color: "var(--p-ink-mute)" }}
            >
              Manage your facility, monitor inquiries, and keep your listing
              tuned. The studio is where craft meets coordination.
            </p>
          </div>
        </div>
      </header>

      {/* Inner content */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-12">
        <div className="station-card p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
