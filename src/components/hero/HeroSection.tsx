"use client";

import { useRef } from "react";
import Link from "next/link";
import { Search, Building2 } from "lucide-react";
import FloatingNav from "@/components/layout/FloatingNav";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Video Background - full, no overlay */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/images/hero-poster.jpg"
          className="w-full h-full object-cover"
        >
          <source src="/assets/videos/herosection.mp4?v=3" type="video/mp4" />
        </video>
      </div>

      {/* Floating Nav - buttons over video */}
      <FloatingNav />

      {/* Content - bottom left */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10 xl:px-16 pb-16 sm:pb-20">
        <div className="max-w-2xl">
          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 animate-fade-in-up"
            style={{ fontFamily: "var(--font-heading)", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            Find the Perfect Home for{" "}
            <span className="text-[#2DD1AC]">Your Loved One</span>
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
              href="/#facilities-map"
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
