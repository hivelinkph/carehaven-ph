"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { ProviderDashboard } from "@/components/dashboard/ProviderDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(profileData);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
        <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
          Loading your dashboard...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
        <div className="text-xl text-[#d97757]" style={{ fontFamily: "var(--font-heading)" }}>
          Error: Profile not found. Please log in again.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {profile.role === 'admin' && <AdminDashboard profile={profile} />}
        {profile.role === 'provider' && <ProviderDashboard profile={profile} />}
        {(!profile.role || profile.role === 'user') && <UserDashboard profile={profile} />}
      </div>
    </div>
  );
}
