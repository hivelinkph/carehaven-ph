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

      {/* Content - bottom left */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10 xl:px-16 pb-16 sm:pb-20">
        <div className="max-w-2xl">
          {/* Editorial eyebrow */}
          <div
            className="inline-flex items-center gap-3 mb-6 animate-fade-in-up"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <span className="inline-block w-10 h-px bg-[#2DD1AC]" />
            <span className="text-[11px] tracking-[0.32em] uppercase text-white/85" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
              Vol. 01 &nbsp;·&nbsp; Senior Living, Philippines
            </span>
          </div>

          {/* Headline — editorial pairing */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-medium text-white leading-[1.02] mb-6 animate-fade-in-up"
            style={{ fontFamily: "var(--font-heading)", textShadow: "0 2px 12px rgba(0,0,0,0.55)", letterSpacing: "-0.015em" }}
          >
            A home for the
            <br />
            <span style={{ fontFamily: "var(--font-accent)", fontStyle: "italic", fontWeight: 500, color: "#2DD1AC" }}>
              ones you love
            </span>
            <span className="text-white">.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl text-white/90 leading-relaxed mb-8 max-w-xl animate-fade-in-up delay-100"
            style={{ fontFamily: "var(--font-body)", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
          >
            Find trusted assisted living facilities across the Philippines.
            Your loved ones deserve professional care in a warm, loving environment
            — monitored daily, just a click away.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up delay-200"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <Link
              href="/find-a-home"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/85 rounded-full shadow-lg shadow-[#2DD1AC]/25 hover:shadow-xl hover:shadow-[#2DD1AC]/30 hover:-translate-y-0.5 transition-all"
            >
              <Search className="w-5 h-5" />
              Find a Home
            </Link>
            <Link
              href="/facilities"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-[#2D3748] bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Building2 className="w-5 h-5 text-[#d97757]" />
              Search Facilities
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#faf9f5] to-transparent z-10" />
    </section>
  );
}
