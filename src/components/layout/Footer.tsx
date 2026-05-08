import Link from "next/link";
import { Heart, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="text-white/80 relative overflow-hidden" style={{ background: "#0c4039" }}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 w-[420px] h-[420px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(26,133,118,0.18), transparent 70%)", filter: "blur(40px)" }}
      />

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#1a8576" }}>
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span
                className="text-xl tracking-tight text-white"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
              >
                SeniorLiving{" "}
                <span style={{ color: "#9ee6d4" }}>PH</span>
              </span>
            </div>
            <p className="text-[14.5px] text-white/65 leading-[1.7] mb-6" style={{ fontFamily: "var(--font-body)" }}>
              Connecting Filipino families with compassionate assisted living
              communities across the archipelago. We vet, you choose, providers
              respond — gently, transparently.
            </p>
            <div className="flex gap-3 text-sm text-white/50" style={{ fontFamily: "var(--font-ui)" }}>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>+63 2 8888 0000</span>
              </div>
            </div>
          </div>

          {/* Explore */}
          <div style={{ fontFamily: "var(--font-ui)" }}>
            <h4 className="text-[12px] font-semibold text-white uppercase tracking-[0.18em] mb-4">Explore</h4>
            <ul className="space-y-3">
              {[
                { label: "Find Facilities", href: "/facilities" },
                { label: "Browse by Region", href: "/#facilities-map" },
                { label: "How It Works", href: "/#services" },
                { label: "About Us", href: "/#about" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[14px] text-white/65 hover:text-[#9ee6d4] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Families */}
          <div style={{ fontFamily: "var(--font-ui)" }}>
            <h4 className="text-[12px] font-semibold text-white uppercase tracking-[0.18em] mb-4">For Families</h4>
            <ul className="space-y-3">
              {[
                { label: "Find a Home", href: "/find-a-home" },
                { label: "Family Dashboard", href: "/dashboard" },
                { label: "Sign Up", href: "/auth/signup" },
                { label: "Sign In", href: "/auth/login" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] text-white/65 hover:text-[#9ee6d4] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div style={{ fontFamily: "var(--font-ui)" }}>
            <h4 className="text-[12px] font-semibold text-white uppercase tracking-[0.18em] mb-4">Contact Us</h4>
            <ul className="space-y-3 text-[14px] text-white/65">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#9ee6d4" }} />
                <span>Makati City, Metro Manila, Philippines</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" style={{ color: "#9ee6d4" }} />
                <span>hello@seniorliving.ph</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" style={{ color: "#9ee6d4" }} />
                <span>+63 2 8888 0000</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <p className="text-[12px] text-white/45">
            &copy; {new Date().getFullYear()} SeniorLiving PH. All rights reserved.
          </p>
          <div className="flex gap-6 text-[12px] text-white/45">
            <Link href="#" className="hover:text-white/80 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white/80 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
