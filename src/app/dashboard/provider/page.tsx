"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { ProviderDashboard } from "@/components/dashboard/ProviderDashboard";
import ProviderDashboardShell from "@/components/dashboard/ProviderDashboardShell";

export default function ProviderDashboardPage() {
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

            if (profileData?.role === "admin") { router.replace("/admin"); return; }
            if (profileData?.role === "user") { router.replace("/dashboard"); return; }

            setProfile(profileData);
            setLoading(false);
        }

        loadData();
    }, [router]);

    if (loading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--p-bg, #0d1622)" }}>
                <div
                    className="text-[12px] tracking-[0.32em] uppercase animate-pulse"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--p-mint, #4cf2c4)" }}
                >
                    Spinning up the station…
                </div>
            </div>
        );
    }

    return (
        <ProviderDashboardShell profile={profile}>
            <ProviderDashboard profile={profile} />
        </ProviderDashboardShell>
    );
}
