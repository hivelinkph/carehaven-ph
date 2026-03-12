"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProviderDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/provider");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
      <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
        Redirecting...
      </div>
    </div>
  );
}
