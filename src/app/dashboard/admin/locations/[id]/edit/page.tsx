"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LocationForm } from "@/components/locations/LocationForm";
import type { Location } from "@/lib/types";

export default function AdminEditLocationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [locationItem, setLocationItem] = useState<Location | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLocation() {
            const supabase = createClient();
            const { data } = await supabase.from("locations").select("*").eq("id", id).single();
            setLocationItem(data);
            setLoading(false);
        }
        fetchLocation();
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
                    Back to Admin Dashboard
                </Link>

                {loading ? (
                    <div className="animate-pulse flex items-center justify-center p-12 text-[#b0aea5]">Loading location info...</div>
                ) : !locationItem ? (
                    <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-[#e8e6dc] text-red-500">
                        Location not found.
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 md:p-8 bg-white/50 border-b border-[#e8e6dc]/50">
                            <h1 className="text-2xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                                Admin Edit: {locationItem.name}
                            </h1>
                            <p className="text-[#b0aea5] mt-1" style={{ fontFamily: "var(--font-ui)" }}>
                                You are modifying this city location as an administrator.
                            </p>
                        </div>
                        <div className="p-6 md:p-8">
                            <LocationForm mode="edit" locationItem={locationItem} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
