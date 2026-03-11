"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Facility } from "@/lib/types";
import { Plus, Edit2, Building2, Eye } from "lucide-react";

export function ProviderDashboard({ profile }: { profile: Profile }) {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const { data: facilitiesData } = await supabase
                .from("facilities")
                .select("*")
                .eq("owner_id", profile.id)
                .order("created_at", { ascending: false });

            setFacilities(facilitiesData || []);
            setLoading(false);
        }

        loadData();
    }, [profile.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                    Loading your facilities...
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1
                        className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-2"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        Provider Dashboard
                    </h1>
                    <p className="text-[#b0aea5] text-lg" style={{ fontFamily: "var(--font-body)" }}>
                        Manage your Assisted Living Facilities
                    </p>
                </div>
                <Link
                    href="/dashboard/provider/facilities/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2DD1AC] rounded-full hover:bg-[#2DD1AC]/90 transition-all shadow-md shrink-0"
                    style={{ fontFamily: "var(--font-ui)" }}
                >
                    <Plus className="w-4 h-4" />
                    Add Facility
                </Link>
            </div>

            <div className="mb-10">
                <h2 className="text-2xl font-bold text-[#2D3748] mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                    Your Facilities
                </h2>

                {facilities.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#2DD1AC]/10 flex items-center justify-center mx-auto mb-6">
                            <Building2 className="w-8 h-8 text-[#2DD1AC]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#2D3748] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                            No Facilities Yet
                        </h3>
                        <p className="text-[#b0aea5] mb-6 max-w-md mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                            Add your first assisted living facility to make it visible to families seeking care for their loved ones.
                        </p>
                        <Link
                            href="/dashboard/provider/facilities/new"
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#2DD1AC] rounded-full hover:bg-[#2DD1AC]/90 transition-all"
                            style={{ fontFamily: "var(--font-ui)" }}
                        >
                            <Plus className="w-4 h-4" />
                            Add Facility
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {facilities.map((facility) => (
                            <div key={facility.id} className="glass-card flex flex-col overflow-hidden">
                                <div
                                    className="h-48 bg-[#e8e6dc] w-full relative"
                                    style={{ backgroundImage: `url(${facility.image_urls?.[0] || 'https://images.unsplash.com/photo-1532009877282-3340270e0529?w=800&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                >
                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-lg font-bold text-white truncate drop-shadow-md" style={{ fontFamily: "var(--font-heading)" }}>
                                            {facility.name}
                                        </h3>
                                        <p className="text-sm text-white/90 drop-shadow-md" style={{ fontFamily: "var(--font-ui)" }}>{facility.city}, {facility.region}</p>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <p className="text-sm text-[#b0aea5] line-clamp-2 mb-4" style={{ fontFamily: "var(--font-body)" }}>
                                        {facility.description || "No description provided."}
                                    </p>

                                    <div className="mt-auto grid grid-cols-2 gap-3" style={{ fontFamily: "var(--font-ui)" }}>
                                        <Link
                                            href={`/facilities/${facility.id}`}
                                            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#e8e6dc] text-sm text-[#2D3748] hover:bg-[#faf9f5] transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Public
                                        </Link>
                                        <Link
                                            href={`/dashboard/provider/facilities/${facility.id}/edit`}
                                            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#6a9bcc]/10 text-sm text-[#6a9bcc] hover:bg-[#6a9bcc]/20 transition-colors font-medium"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
