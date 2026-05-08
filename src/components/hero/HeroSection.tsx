"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  MapPin,
  Calendar,
  Star,
  MessageCircle,
} from "lucide-react";
import FloatingNav from "@/components/layout/FloatingNav";

const NAV_LINKS = [
  { label: "About Us", href: "/#about" },
  { label: "Our Communities", href: "/facilities" },
  { label: "Why Choose Us", href: "/#services" },
  { label: "Care & Services", href: "/#services" },
  { label: "Resources", href: "/find-a-home" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f4ede0]">
      {/* Image Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/hero2.png"
          alt="Filipino family enjoying a meal with their caregiver"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        {/* Soft warm wash to keep type readable while preserving photo warmth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(244,237,224,0.92) 0%, rgba(244,237,224,0.78) 28%, rgba(244,237,224,0.35) 50%, rgba(244,237,224,0.05) 70%, rgba(244,237,224,0) 100%)",
          }}
        />
      </div>

      {/* Top Nav — matches the reference: brand left, links center, pills right */}
      <header className="relative z-20 px-5 sm:px-8 lg:px-12 pt-6">
        <div className="flex items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#1a8576" }}>
              <Heart className="w-4 h-4 text-white" fill="white" />
            </span>
            <span className="leading-tight">
              <span
                className="block text-[20px] tracking-tight"
                style={{ fontFamily: "var(--font-heading)", color: "#0c4039", fontWeight: 600 }}
              >
                SeniorLiving
              </span>
              <span
                className="block text-[10px] tracking-[0.18em] uppercase -mt-0.5"
                style={{ fontFamily: "var(--font-ui)", color: "#1a8576" }}
              >
                Philippines
              </span>
            </span>
          </Link>

          {/* Center nav (desktop only) */}
          <nav
            className="hidden lg:flex items-center gap-7"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-[14px] font-medium transition-colors"
                style={{ color: "#0c4039" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right pills */}
          <div className="flex items-center gap-2.5" style={{ fontFamily: "var(--font-ui)" }}>
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-semibold border bg-white/85 backdrop-blur-sm transition-all hover:bg-white"
              style={{ color: "#0c4039", borderColor: "rgba(12,64,57,0.15)" }}
            >
              <Heart className="w-4 h-4" style={{ color: "#1a8576" }} />
              Dashboard
            </Link>
            <Link
              href="/find-a-home"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-semibold text-white transition-all hover:opacity-90 shadow-md"
              style={{ background: "#1a8576" }}
            >
              <MessageCircle className="w-4 h-4" />
              Contact Us
            </Link>
          </div>
        </div>
      </header>

      {/* Existing FloatingNav (Login button) — repositioned subtly so it doesn't fight the new top nav */}
      <div className="hidden">
        <FloatingNav />
      </div>

      {/* Hero content */}
      <div className="relative z-10 px-5 sm:px-8 lg:px-14 pt-12 sm:pt-16 lg:pt-20 pb-32">
        <div className="max-w-2xl">
          {/* Trust eyebrow */}
          <div
            className="inline-flex items-center gap-2 mb-7 animate-fade-in-up"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <Heart className="w-4 h-4" style={{ color: "#1a8576" }} fill="#1a8576" />
            <span className="text-[13px] font-medium" style={{ color: "#1a8576" }}>
              Trusted. Compassionate. Close to Home.
            </span>
          </div>

          {/* Big serif headline */}
          <h1
            className="text-[3.2rem] sm:text-[4.2rem] lg:text-[5.2rem] leading-[1.0] tracking-tight mb-6 animate-fade-in-up"
            style={{
              fontFamily: "var(--font-heading)",
              color: "#0c4039",
              fontWeight: 600,
              letterSpacing: "-0.022em",
            }}
          >
            A place where
            <br />
            care feels like
            <br />
            <span className="inline-flex items-baseline gap-3">
              <span
                style={{
                  fontFamily: "var(--font-accent)",
                  fontStyle: "italic",
                  color: "#1a8576",
                  fontWeight: 500,
                }}
              >
                family
              </span>
              <span style={{ color: "#0c4039" }}>.</span>
              {/* Hand-drawn heart squiggle */}
              <svg
                viewBox="0 0 90 36"
                className="inline-block w-[58px] sm:w-[78px] lg:w-[92px] h-auto -translate-y-2"
                aria-hidden
              >
                <path
                  d="M2 24 C 14 8, 30 8, 36 22 C 40 32, 52 32, 56 22 C 62 8, 78 8, 88 22"
                  fill="none"
                  stroke="#1a8576"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Body */}
          <p
            className="text-[16px] leading-[1.65] mb-8 max-w-[28rem] animate-fade-in-up delay-100"
            style={{ fontFamily: "var(--font-body)", color: "#3d4f4b" }}
          >
            Thoughtfully designed communities and personalized care that bring
            comfort, connection, and peace of mind.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-3 mb-12 animate-fade-in-up delay-200"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <Link
              href="/facilities"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[14.5px] font-semibold text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              style={{ background: "#0c4039" }}
            >
              <MapPin className="w-4 h-4" />
              Find a Community
            </Link>
            <Link
              href="/find-a-home"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[14.5px] font-semibold rounded-full border bg-white/85 backdrop-blur-sm hover:bg-white transition-all"
              style={{ color: "#0c4039", borderColor: "rgba(12,64,57,0.15)" }}
            >
              <Calendar className="w-4 h-4" style={{ color: "#1a8576" }} />
              Schedule a Tour
            </Link>
          </div>

          {/* Feature row */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[34rem] animate-fade-in-up delay-300"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            {[
              { icon: ShieldCheck, title: "Safe & Secure", body: "24/7 care and monitoring" },
              { icon: HeartHandshake, title: "Personalized Care", body: "Tailored to every individual" },
              { icon: Sparkles, title: "Vibrant Living", body: "Activities, friendships, every day" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-2.5">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "#e0f1ec" }}
                >
                  <f.icon className="w-3.5 h-3.5" style={{ color: "#1a8576" }} />
                </span>
                <div>
                  <div className="text-[13px] font-semibold" style={{ color: "#0c4039" }}>
                    {f.title}
                  </div>
                  <div className="text-[11.5px] leading-snug mt-0.5" style={{ color: "#5b6f6b" }}>
                    {f.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust pill bottom-center */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-4 px-5 py-3 bg-white/95 backdrop-blur-md rounded-full shadow-lg border"
        style={{ borderColor: "rgba(12,64,57,0.08)", fontFamily: "var(--font-ui)" }}
      >
        {/* Avatars */}
        <div className="flex -space-x-2">
          {["#f9c98a", "#f5a78a", "#c8e4d4", "#a3c4ec"].map((c, i) => (
            <span
              key={i}
              className="w-7 h-7 rounded-full border-2 border-white"
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="leading-tight">
          <div className="text-[12.5px] font-semibold" style={{ color: "#0c4039" }}>
            Families trust us. So can you.
          </div>
          <div className="text-[10.5px]" style={{ color: "#5b6f6b" }}>
            Join thousands of happy families
          </div>
        </div>
        <div className="h-6 w-px bg-[#0c4039]/15" />
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[0,1,2,3,4].map((i) => (
              <Star key={i} className="w-3 h-3" fill="#f6c14a" stroke="#f6c14a" />
            ))}
          </div>
          <div className="leading-tight">
            <div className="text-[12.5px] font-semibold" style={{ color: "#0c4039" }}>
              4.9/5
            </div>
            <div className="text-[10px]" style={{ color: "#5b6f6b" }}>
              From 500+ reviews
            </div>
          </div>
        </div>
      </div>

      {/* Floating chat bubble bottom right */}
      <Link
        href="/find-a-home"
        className="absolute bottom-8 right-6 sm:right-10 z-20 inline-flex items-center gap-3 pl-3 pr-5 py-2.5 rounded-full shadow-xl text-white transition-all hover:scale-[1.02]"
        style={{ background: "#1a8576", fontFamily: "var(--font-ui)" }}
      >
        <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <MessageCircle className="w-4.5 h-4.5 text-white" />
        </span>
        <div className="leading-tight text-left">
          <div className="text-[12.5px] font-semibold">We&rsquo;re here to help</div>
          <div className="text-[10.5px] text-white/80">Chat with our care team</div>
        </div>
      </Link>
    </section>
  );
}
