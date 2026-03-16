import Link from "next/link";
import { Heart, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#2D3748] text-white/80">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DD1AC] to-[#6a9bcc] flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span
                className="text-xl font-bold text-white tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                SeniorLiving <span className="text-[#2DD1AC]">PH</span>
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-6" style={{ fontFamily: "var(--font-body)" }}>
              Connecting Filipino families with compassionate assisted living facilities across the Philippines.
              Because your loved ones deserve the best care.
            </p>
            <div className="flex gap-3 text-sm text-white/50" style={{ fontFamily: "var(--font-ui)" }}>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>+63 2 8888 0000</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ fontFamily: "var(--font-ui)" }}>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: "Find Facilities", href: "/facilities" },
                { label: "Browse by Region", href: "/#facilities-map" },
                { label: "Our Services", href: "/#services" },
                { label: "About SeniorLiving PH", href: "/#about" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-[#2DD1AC] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Families */}
          <div style={{ fontFamily: "var(--font-ui)" }}>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">For Families</h4>
            <ul className="space-y-3">
              {[
                { label: "Sign Up", href: "/auth/signup" },
                { label: "Patient Dashboard", href: "/dashboard" },
                { label: "Health Monitoring", href: "/dashboard/patients" },
                { label: "Support", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-[#2DD1AC] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div style={{ fontFamily: "var(--font-ui)" }}>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#2DD1AC]" />
                <span>Makati City, Metro Manila, Philippines</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-[#2DD1AC]" />
                <span>hello@seniorliving.ph</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-[#2DD1AC]" />
                <span>+63 2 8888 0000</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} SeniorLiving PH. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-white/40">
            <Link href="#" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white/70 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
