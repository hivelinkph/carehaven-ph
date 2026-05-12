"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function BackToHomeButton() {
  const pathname = usePathname();
  if (
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/provider") ||
    pathname.startsWith("/auth")
  ) return null;

  return (
    <Link
      href="/"
      aria-label="Back to homepage"
      className="fixed top-4 left-4 z-[60]"
    >
      <Image
        src="/logo2.png"
        alt="SeniorLiving PH"
        width={216}
        height={87}
        /* Main page logo: h-[86px] sm:h-[101px] — 40% smaller = h-[52px] sm:h-[61px] */
        className="h-[52px] sm:h-[61px] w-auto drop-shadow-sm"
        priority
      />
    </Link>
  );
}
