"use client";

import Link from "next/link";
import { Search, Heart, Shield } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/images/hero-poster.jpg"
          className="w-full h-full object-cover opacity-[0.85]"
        >
          <source src="/assets/videos/herosection.mp4?v=3" type="video/mp4" />
        </video>
        {/* Warm overlay */}
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
        <div className="max-w-2xl">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DD1AC]/10 border border-[#2DD1AC]/20 mb-8 animate-fade-in-up"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <Heart className="w-4 h-4 text-[#2DD1AC]" fill="#2DD1AC" />
            <span className="text-sm font-medium text-[#2D3748]">
              Trusted by 500+ Filipino families
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D3748] leading-tight mb-6 animate-fade-in-up delay-100"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Compassionate Care,{" "}
            <span className="relative">
              <span className="relative z-10 text-[#2DD1AC]">Close to Home</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#2DD1AC]/15 rounded-sm -z-0" />
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl text-[#2D3748]/70 leading-relaxed mb-10 max-w-xl animate-fade-in-up delay-200"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Find trusted assisted living facilities across the Philippines.
            Your loved ones deserve professional care in a warm, loving environment
            — monitored daily, just a click away.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up delay-300"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <Link
              href="/#facilities-map"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/85 rounded-full shadow-lg shadow-[#2DD1AC]/25 hover:shadow-xl hover:shadow-[#2DD1AC]/30 hover:-translate-y-0.5 transition-all"
            >
              <Search className="w-5 h-5" />
              Find a Facility
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-[#2D3748] bg-white/70 backdrop-blur-sm border border-[#e8e6dc] rounded-full hover:bg-white hover:shadow-md transition-all"
            >
              <Shield className="w-5 h-5 text-[#d97757]" />
              Get Started Free
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-8 animate-fade-in-up delay-400" style={{ fontFamily: "var(--font-ui)" }}>
            {[
              { number: "120+", label: "Facilities" },
              { number: "17", label: "Regions" },
              { number: "24/7", label: "Monitoring" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-[#2D3748]">{stat.number}</div>
                <div className="text-xs font-medium text-[#b0aea5] uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#faf9f5] to-transparent z-10" />
      <div className="absolute top-1/4 right-10 w-72 h-72 bg-[#2DD1AC]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#d97757]/5 rounded-full blur-3xl" />
    </section>
  );
}
