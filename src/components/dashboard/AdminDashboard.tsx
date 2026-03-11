"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Facility } from "@/lib/types";
import { Building2, Edit2, ShieldAlert, Plus } from "lucide-react";

export function AdminDashboard({ profile }: { profile: Profile }) {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const { data: facilitiesData } = await supabase
                .from("facilities")
                .select("*")
                .order("created_at", { ascending: false });

            setFacilities(facilitiesData || []);
            setLoading(false);
        }

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                    Loading master facility list...
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d97757]/10 text-[#d97757] rounded-full text-xs font-bold mb-3 uppercase tracking-wider">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Admin Mode
                    </div>
                    <h1
                        className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-2"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        Admin Dashboard
                    </h1>
                    <p className="text-[#b0aea5] text-lg" style={{ fontFamily: "var(--font-body)" }}>
                        Master Administration for All Facilities
                    </p>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-[#e8e6dc]/50 bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-[#2D3748] flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                        <Building2 className="w-5 h-5 text-[#2DD1AC]" />
                        All Facilities Directory
                    </h2>
                    <Link
                        href="/dashboard/admin/facilities/new"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2DD1AC] text-white font-semibold rounded-full hover:bg-[#1E957A] transition-colors shadow-sm hover:shadow-md"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        <Plus className="w-4 h-4" />
                        Add Location
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#faf9f5] border-b border-[#e8e6dc]/50 text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                                <th className="p-4 font-medium">Facility Name</th>
                                <th className="p-4 font-medium">Location</th>
                                <th className="p-4 font-medium text-center">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facilities.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-[#b0aea5] py-12">
                                        No facilities found in the database.
                                    </td>
                                </tr>
                            ) : (
                                facilities.map((fac) => (
                                    <tr key={fac.id} className="border-b border-[#e8e6dc]/30 hover:bg-white/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-[#2D3748]">{fac.name}</div>
                                            <div className="text-xs text-[#b0aea5] mt-0.5">{fac.id}</div>
                                        </td>
                                        <td className="p-4 text-sm text-[#2D3748]">
                                            {fac.city}, {fac.region}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${fac.is_active ? 'bg-[#2DD1AC]/10 text-[#1E957A]' : 'bg-[#d97757]/10 text-[#d97757]'
                                                }`}>
                                                {fac.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                href={`/dashboard/admin/facilities/${fac.id}/edit`}
                                                className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#e8e6dc]/50 text-sm text-[#2D3748] border border-transparent hover:border-[#2D3748]/20 transition-all font-medium"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                                Admin Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
