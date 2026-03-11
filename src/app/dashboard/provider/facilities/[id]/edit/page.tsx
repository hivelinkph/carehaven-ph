"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FacilityForm } from "@/components/facilities/FacilityForm";
import type { Facility } from "@/lib/types";

export default function EditFacilityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [facility, setFacility] = useState<Facility | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFacility() {
            const supabase = createClient();
            const { data } = await supabase.from("facilities").select("*").eq("id", id).single();
            setFacility(data);
            setLoading(false);
        }
        fetchFacility();
    }, [id]);

    return (
        <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-[#b0aea5] hover:text-[#2DD1AC] mb-6 transition-colors"
                    style={{ fontFamily: "var(--font-ui)" }}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {loading ? (
                    <div className="animate-pulse flex items-center justify-center p-12 text-[#b0aea5]">Loading facility info...</div>
                ) : !facility ? (
                    <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-[#e8e6dc] text-red-500">
                        Facility not found.
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 md:p-8 bg-white/50 border-b border-[#e8e6dc]/50">
                            <h1 className="text-2xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                                Edit Facility Profile
                            </h1>
                            <p className="text-[#b0aea5] mt-1" style={{ fontFamily: "var(--font-ui)" }}>
                                Update {facility.name} public profile and settings.
                            </p>
                        </div>
                        <div className="p-6 md:p-8">
                            <FacilityForm mode="edit" facility={facility} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
