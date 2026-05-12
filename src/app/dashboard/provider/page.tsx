"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import ProviderDashboardShell from "@/components/dashboard/ProviderDashboardShell";

export default function ProviderDashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.replace("/auth/login"); return; }
            const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            if (profileData?.role === "admin") { router.replace("/admin"); return; }
            if (profileData?.role === "user")  { router.replace("/dashboard"); return; }
            setProfile(profileData);
            setLoading(false);
        }
        loadData();
    }, [router]);

    if (loading || !profile) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--d-bg, #f3eee3)" }}>
            <div className="text-sm animate-pulse" style={{ fontFamily: "var(--font-ui)", color: "var(--d-ink-muted)" }}>
                Loading your provider studio…
            </div>
        </div>
    );

    return <ProviderDashboardShell profile={profile} />;
}

