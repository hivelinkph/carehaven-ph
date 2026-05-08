"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, LogOut, Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface Props {
  profile: Profile;
  children: React.ReactNode;
}

export default function CustomerDashboardShell({ profile, children }: Props) {
  const router = useRouter();

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Magandang umaga";
    if (h < 18) return "Magandang hapon";
    return "Magandang gabi";
  }, []);

  const firstName = useMemo(() => {
    const full = (profile.full_name || "").trim();
    if (!full) return "";
    return full.split(" ")[0];
  }, [profile.full_name]);

  const today = useMemo(() => {
    return new Date().toLocaleDateString("en-PH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="pt-10 pb-16">
      {/* Top utility bar — kept airy, almost a stationery letterhead */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 mb-10">
        <div className="flex items-center justify-between text-[13px]" style={{ fontFamily: "var(--font-ui)", color: "var(--c-ink-soft)" }}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 hover:text-[var(--c-clay)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to CareHaven
          </Link>
          <div className="flex items-center gap-5">
            <span className="hidden sm:inline tracking-wide uppercase text-[11px]" style={{ letterSpacing: "0.18em" }}>
              {today}
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 hover:text-[var(--c-clay)] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Editorial banner */}
      <header className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="relative">
          <span className="ribbon-tag">
            <Compass className="w-3 h-3" />
            Family Journal &nbsp;·&nbsp; Vol. 01
          </span>

          <div className="mt-6 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p
                className="script text-4xl sm:text-5xl mb-3"
                style={{ color: "var(--c-clay)" }}
              >
                {greeting}{firstName ? `, ${firstName}` : ""}.
              </p>
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--c-ink)",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.02,
                }}
              >
                Today&rsquo;s little
                <br />
                <span style={{ fontStyle: "italic", fontFamily: "var(--font-accent)", color: "var(--c-sage-deep)" }}>
                  notes from home
                </span>
                <span style={{ color: "var(--c-clay)" }}>.</span>
              </h1>
            </div>
            <p
              className="max-w-sm text-[15px] leading-relaxed"
              style={{ fontFamily: "var(--font-body)", color: "var(--c-ink-soft)" }}
            >
              A quiet space to keep up with the people who matter — what their
              day looked like, who&rsquo;s caring for them, and any messages from
              their facility.
            </p>
          </div>

          <div className="editorial-rule mt-10" />
        </div>
      </header>

      {/* Inner page content */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 mt-10">{children}</div>

      {/* Footer ornament */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 mt-16">
        <div className="ornament" style={{ color: "var(--c-clay)" }}>
          <span className="ornament-glyph">✻ &nbsp; ✻ &nbsp; ✻</span>
        </div>
        <p
          className="text-center mt-4 text-[12px] tracking-[0.22em] uppercase"
          style={{ fontFamily: "var(--font-ui)", color: "var(--c-ink-soft)" }}
        >
          Cared for, every day
        </p>
      </div>
    </div>
  );
}
