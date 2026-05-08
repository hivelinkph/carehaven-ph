"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import CustomerDashboardShell from "@/components/dashboard/CustomerDashboardShell";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--d-bg, #f3eee3)" }}>
      <div className="animate-pulse text-sm" style={{ fontFamily: "var(--font-ui)", color: "var(--d-ink-muted, #8a9c97)" }}>
        Loading your dashboard…
      </div>
    </div>
  );
}

function DashboardInner() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData?.role === "admin") {
        router.replace("/admin");
        return;
      }
      if (profileData?.role === "provider") {
        router.replace("/dashboard/provider");
        return;
      }

      setProfile(profileData);
      setLoading(false);
    }

    loadData();
  }, [router]);

  if (loading || !profile) return <DashboardSkeleton />;

  return (
    <CustomerDashboardShell profile={profile}>
      <UserDashboard profile={profile} />
    </CustomerDashboardShell>
  );
}
