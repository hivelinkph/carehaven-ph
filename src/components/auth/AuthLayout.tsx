import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

interface Props {
  /** Top-right helper line, e.g. "Already have an account? <Sign in>" */
  topRight?: ReactNode;
  /** Form title (centered above form) */
  title: ReactNode;
  /** Form subtitle (centered above form) */
  subtitle: string;
  children: ReactNode;
  /** Wider form column for multi-field signups */
  wide?: boolean;
}

export default function AuthLayout({ topRight, title, subtitle, children, wide = false }: Props) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT — photo column */}
      <div className="hidden lg:flex relative w-[44%] xl:w-[48%] shrink-0 overflow-hidden">
        <Image
          src="/assets/images/signup_photo.png"
          alt="A caregiver sharing a quiet moment with an elderly woman"
          fill
          priority
          sizes="(max-width: 1280px) 44vw, 48vw"
          className="object-cover"
        />
        {/* Soft white-to-transparent gradient on the right edge for seam */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0) 70%, rgba(0,0,0,0.04) 92%, rgba(255,255,255,0.18) 100%)",
          }}
        />

        {/* Logo top-left */}
        <Link href="/" className="absolute top-7 left-7 flex items-center gap-2.5 z-10">
          <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#1a8576" }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
              <path d="M12 21s-7.5-4.7-7.5-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 19.5 10c0 6.3-7.5 11-7.5 11z" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-white text-[16px]" style={{ fontFamily: "var(--font-heading)", fontWeight: 600, textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
              SeniorLiving
            </span>
            <span className="block text-[10px] tracking-[0.18em] uppercase -mt-0.5 text-white/85" style={{ fontFamily: "var(--font-ui)", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
              Philippines
            </span>
          </span>
        </Link>

        {/* Italic quote bottom-left */}
        <div className="absolute bottom-9 left-8 right-8 z-10 max-w-md">
          <div className="flex items-start gap-2 mb-2">
            <span className="w-7 h-7 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#1a8576">
                <path d="M12 21s-7.5-4.7-7.5-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 19.5 10c0 6.3-7.5 11-7.5 11z" />
              </svg>
            </span>
            <p
              className="text-white text-[28px] sm:text-[32px] leading-[1.05]"
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 500,
                letterSpacing: "-0.015em",
                textShadow: "0 2px 12px rgba(0,0,0,0.4)",
              }}
            >
              More than a place.{" "}
              <span style={{ fontFamily: "var(--font-accent)", fontStyle: "italic", fontWeight: 600 }}>
                It&rsquo;s family.
              </span>
            </p>
          </div>
          <p
            className="text-white/90 text-[14px] leading-snug ml-9"
            style={{ fontFamily: "var(--font-body)", textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
          >
            Join our community and be part of a family that cares.
          </p>
        </div>
      </div>

      {/* RIGHT — form column */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Top-right link */}
        {topRight && (
          <div className="absolute top-7 right-8 text-[13px]" style={{ fontFamily: "var(--font-ui)", color: "#5b6f6b" }}>
            {topRight}
          </div>
        )}

        {/* Mobile-only mini logo on top */}
        <div className="lg:hidden flex items-center gap-2.5 px-6 pt-7">
          <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#1a8576" }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
              <path d="M12 21s-7.5-4.7-7.5-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 19.5 10c0 6.3-7.5 11-7.5 11z" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-[15px]" style={{ fontFamily: "var(--font-heading)", color: "#0c4039", fontWeight: 600 }}>
              SeniorLiving
            </span>
            <span className="block text-[10px] tracking-[0.18em] uppercase -mt-0.5" style={{ fontFamily: "var(--font-ui)", color: "#1a8576" }}>
              Philippines
            </span>
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-12">
          <div className={`w-full ${wide ? "max-w-xl" : "max-w-md"}`}>
            {/* Heart-laurel emblem */}
            <div className="flex justify-center mb-6">
              <HeartLaurel />
            </div>

            <h1
              className="text-center text-[32px] sm:text-[36px] leading-[1.1] mb-2"
              style={{ fontFamily: "var(--font-heading)", color: "#0c4039", fontWeight: 600, letterSpacing: "-0.015em" }}
            >
              {title}
            </h1>
            <p
              className="text-center text-[14.5px] mb-8"
              style={{ fontFamily: "var(--font-body)", color: "#5b6f6b" }}
            >
              {subtitle}
            </p>

            {children}

            {/* Bottom tagline */}
            <div className="mt-10 flex items-center justify-center gap-2 text-[12px]" style={{ color: "#7a8a86", fontFamily: "var(--font-ui)" }}>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Your information is safe with us. We value your privacy and security.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeartLaurel() {
  return (
    <svg viewBox="0 0 80 80" className="w-14 h-14" aria-hidden>
      {/* Left laurel */}
      <g fill="none" stroke="#1a8576" strokeWidth="1.6" strokeLinecap="round">
        <path d="M22 18 C 14 30, 14 50, 24 60" />
        <path d="M22 26 q -3 0 -5 3" />
        <path d="M19 34 q -3 1 -5 4" />
        <path d="M18 42 q -3 2 -4 6" />
        <path d="M19 50 q -2 2 -3 5" />
        <path d="M22 56 q -1 2 -1 4" />
      </g>
      {/* Right laurel */}
      <g fill="none" stroke="#1a8576" strokeWidth="1.6" strokeLinecap="round">
        <path d="M58 18 C 66 30, 66 50, 56 60" />
        <path d="M58 26 q 3 0 5 3" />
        <path d="M61 34 q 3 1 5 4" />
        <path d="M62 42 q 3 2 4 6" />
        <path d="M61 50 q 2 2 3 5" />
        <path d="M58 56 q 1 2 1 4" />
      </g>
      {/* Heart */}
      <path
        d="M40 50 C 30 42, 26 36, 30 30 C 33 25, 38 26, 40 30 C 42 26, 47 25, 50 30 C 54 36, 50 42, 40 50 Z"
        fill="#1a8576"
      />
    </svg>
  );
}
