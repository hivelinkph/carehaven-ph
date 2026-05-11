"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

export default function BackToHomeButton() {
  const pathname = usePathname();
  if (
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/provider")
  ) return null;

  return (
    <Link
      href="/"
      aria-label="Back to homepage"
      className="fixed top-4 right-4 z-[60] inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-[#e8e6dc] shadow-md hover:shadow-lg hover:border-[#2DD1AC]/40 hover:bg-white text-sm font-semibold text-[#2D3748] transition-all"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <Home className="w-4 h-4 text-[#2DD1AC]" />
      <span className="hidden sm:inline">Home</span>
    </Link>
  );
}
