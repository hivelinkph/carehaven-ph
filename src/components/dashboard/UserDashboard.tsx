"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Patient } from "@/lib/types";
import {
    Users,
    UserPlus,
    Activity,
    Building2,
    ChevronRight,
    Heart,
    Calendar,
} from "lucide-react";

export function UserDashboard({ profile }: { profile: Profile }) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: patientsData } = await supabase
                    .from("patients")
                    .select("*, facility:facilities(*)")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                setPatients(patientsData || []);
            }
            setLoading(false);
        }

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                    Loading your dashboard...
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Welcome Header */}
            <div className="mb-10">
                <h1
                    className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                >
                    Welcome back{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
                </h1>
                <p className="text-[#b0aea5] text-lg" style={{ fontFamily: "var(--font-body)" }}>
                    Here&apos;s an overview of your loved ones&apos; care
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { icon: Users, label: "Patients", value: patients.length.toString(), color: "#2DD1AC" },
                    { icon: Activity, label: "Health Checks Today", value: "—", color: "#d97757" },
                    { icon: Building2, label: "Active Facilities", value: new Set(patients.map(p => p.facility_id).filter(Boolean)).size.toString(), color: "#6a9bcc" },
                    { icon: Calendar, label: "Next Review", value: "—", color: "#788c5d" },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${stat.color}15` }}
                            >
                                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-[#2D3748] mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                            {stat.value}
                        </div>
                        <div className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Patients Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2
                        className="text-2xl font-bold text-[#2D3748]"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        Your Patients
                    </h2>
                    <Link
                        href="/dashboard/patients/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2DD1AC] rounded-full hover:bg-[#2DD1AC]/90 transition-all shadow-md"
                        style={{ fontFamily: "var(--font-ui)" }}
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Patient
                    </Link>
                </div>

                {patients.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#2DD1AC]/10 flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-8 h-8 text-[#2DD1AC]" />
                        </div>
                        <h3
                            className="text-xl font-bold text-[#2D3748] mb-3"
                            style={{ fontFamily: "var(--font-heading)" }}
                        >
                            No Patients Yet
                        </h3>
                        <p className="text-[#b0aea5] mb-6 max-w-md mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                            Add your first patient to start tracking their health and care at an assisted living facility.
                        </p>
                        <Link
                            href="/dashboard/patients/new"
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#2DD1AC] rounded-full hover:bg-[#2DD1AC]/90 transition-all"
                            style={{ fontFamily: "var(--font-ui)" }}
                        >
                            <UserPlus className="w-4 h-4" />
                            Add Your First Patient
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {patients.map((patient) => (
                            <Link
                                key={patient.id}
                                href={`/dashboard/patients/${patient.id}`}
                                className="glass-card p-6 group"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2DD1AC]/20 to-[#6a9bcc]/20 flex items-center justify-center shrink-0">
                                        <span className="text-lg font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                                            {patient.full_name.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3
                                            className="text-lg font-bold text-[#2D3748] truncate group-hover:text-[#2DD1AC] transition-colors"
                                            style={{ fontFamily: "var(--font-heading)" }}
                                        >
                                            {patient.full_name}
                                        </h3>
                                        <p className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                                            {patient.gender || "—"} {patient.date_of_birth ? `• Born ${patient.date_of_birth}` : ""}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-[#b0aea5] group-hover:text-[#2DD1AC] transition-colors shrink-0" />
                                </div>

                                {patient.medical_conditions && patient.medical_conditions.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {patient.medical_conditions.slice(0, 3).map((condition) => (
                                            <span
                                                key={condition}
                                                className="text-xs font-medium text-[#d97757] bg-[#d97757]/10 px-2.5 py-1 rounded-full"
                                                style={{ fontFamily: "var(--font-ui)" }}
                                            >
                                                {condition}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {patient.facility && (
                                    <div
                                        className="flex items-center gap-2 text-xs text-[#b0aea5] pt-3 border-t border-[#e8e6dc]/50"
                                        style={{ fontFamily: "var(--font-ui)" }}
                                    >
                                        <Building2 className="w-3.5 h-3.5" />
                                        {patient.facility.name}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ fontFamily: "var(--font-ui)" }}>
                <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#e8e6dc]/50 hover:border-[#2DD1AC]/30 hover:shadow-md transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-[#6a9bcc]/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#6a9bcc]" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-[#2D3748] group-hover:text-[#2DD1AC] transition-colors">
                            Edit Profile
                        </span>
                        <p className="text-xs text-[#b0aea5]">Update your information</p>
                    </div>
                </Link>
                <Link
                    href="/facilities"
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#e8e6dc]/50 hover:border-[#2DD1AC]/30 hover:shadow-md transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-[#2DD1AC]/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#2DD1AC]" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-[#2D3748] group-hover:text-[#2DD1AC] transition-colors">
                            Browse Facilities
                        </span>
                        <p className="text-xs text-[#b0aea5]">Find care near you</p>
                    </div>
                </Link>
                <Link
                    href="/dashboard/patients"
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#e8e6dc]/50 hover:border-[#2DD1AC]/30 hover:shadow-md transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-[#d97757]/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-[#d97757]" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-[#2D3748] group-hover:text-[#2DD1AC] transition-colors">
                            Health Records
                        </span>
                        <p className="text-xs text-[#b0aea5]">View daily monitoring</p>
                    </div>
                </Link>
            </div>
        </>
    );
}
