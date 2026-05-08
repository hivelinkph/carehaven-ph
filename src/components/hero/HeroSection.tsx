"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Building2 } from "lucide-react";
import FloatingNav from "@/components/layout/FloatingNav";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Image Background - full, no overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/hero.jpeg"
          alt="Caring assisted living environment"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Floating Nav - buttons over video */}
      <FloatingNav />

      {/* Soft warm gradient over the photo to keep type readable */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,49,43,0.30) 0%, rgba(8,49,43,0.10) 35%, rgba(8,49,43,0.55) 100%)",
        }}
      />

      {/* Content - bottom left */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10 xl:px-16 pb-16 sm:pb-20">
        <div className="max-w-2xl">
          {/* Soft pill eyebrow */}
          <div
            className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 animate-fade-in-up"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#9ee6d4">
              <path d="M12 21s-7.5-4.7-7.5-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 19.5 10c0 6.3-7.5 11-7.5 11z" />
            </svg>
            <span className="text-[11.5px] tracking-[0.18em] uppercase text-white/95" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}>
              Senior Living Philippines
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.02] mb-6 animate-fade-in-up"
            style={{ fontFamily: "var(--font-heading)", textShadow: "0 2px 12px rgba(0,0,0,0.55)", letterSpacing: "-0.015em", fontWeight: 600 }}
          >
            A home for the
            <br />
            <span style={{ color: "#9ee6d4" }}>ones you love.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl text-white/90 leading-relaxed mb-8 max-w-xl animate-fade-in-up delay-100"
            style={{ fontFamily: "var(--font-body)", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
          >
            Browse vetted assisted living facilities across the Philippines, get
            matched to ones that fit your needs, and connect with providers — all
            in one place.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in-up delay-200"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <Link
              href="/find-a-home"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[14.5px] font-semibold text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              style={{ background: "#1a8576" }}
            >
              <Search className="w-4 h-4" />
              Find a Home
            </Link>
            <Link
              href="/facilities"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[14.5px] font-semibold rounded-full border bg-white/90 backdrop-blur-sm hover:bg-white transition-all"
              style={{ color: "#0c4039", borderColor: "rgba(255,255,255,0.4)" }}
            >
              <Building2 className="w-4 h-4" style={{ color: "#1a8576" }} />
              Browse Facilities
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom fade into cream canvas */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 z-[2]"
        style={{ background: "linear-gradient(to top, var(--d-bg) 0%, transparent 100%)" }}
      />
    </section>
  );
}
