"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Facility, QuestionnaireConfig, ProviderCareProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Building2, Eye, LogOut, ClipboardList, Check, Save, Loader2 } from "lucide-react";

export function ProviderDashboard({ profile }: { profile: Profile }) {
    const router = useRouter();
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<QuestionnaireConfig[]>([]);
    const [careProfiles, setCareProfiles] = useState<Record<string, ProviderCareProfile>>({});
    const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
    const [editingAnswers, setEditingAnswers] = useState<Record<string, string | string[]>>({});
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const [facRes, qRes, cpRes] = await Promise.all([
                supabase.from("facilities").select("*").eq("owner_id", profile.id).order("created_at", { ascending: false }),
                supabase.from("questionnaire_config").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
                supabase.from("provider_care_profiles").select("*").eq("provider_id", profile.id),
            ]);

            setFacilities(facRes.data || []);
            setQuestions(qRes.data || []);

            // Index care profiles by facility_id
            const profileMap: Record<string, ProviderCareProfile> = {};
            (cpRes.data || []).forEach((cp: ProviderCareProfile) => {
                profileMap[cp.facility_id] = cp;
            });
            setCareProfiles(profileMap);
            setLoading(false);
        }

        loadData();
    }, [profile.id]);

    const handleStartEditing = (facilityId: string) => {
        const existing = careProfiles[facilityId];
        setEditingFacilityId(facilityId);
        setEditingAnswers(existing?.answers || {});
    };

    const handleSelectAnswer = (stepId: string, value: string, answerType: string) => {
        if (answerType === "single") {
            setEditingAnswers((prev) => ({ ...prev, [stepId]: value }));
        } else {
            setEditingAnswers((prev) => {
                const current = (prev[stepId] as string[]) || [];
                if (value === "none") return { ...prev, [stepId]: ["none"] };
                const filtered = current.filter((v) => v !== "none");
                if (filtered.includes(value)) {
                    return { ...prev, [stepId]: filtered.filter((v) => v !== value) };
                }
                return { ...prev, [stepId]: [...filtered, value] };
            });
        }
    };

    const handleSaveCareProfile = async () => {
        if (!editingFacilityId) return;
        setSavingProfile(true);
        const supabase = createClient();
        const existing = careProfiles[editingFacilityId];

        if (existing) {
            const { data, error } = await supabase
                .from("provider_care_profiles")
                .update({ answers: editingAnswers, updated_at: new Date().toISOString() })
                .eq("id", existing.id)
                .select()
                .single();
            if (!error && data) {
                setCareProfiles((prev) => ({ ...prev, [editingFacilityId]: data }));
            }
        } else {
            const { data, error } = await supabase
                .from("provider_care_profiles")
                .insert({
                    provider_id: profile.id,
                    facility_id: editingFacilityId,
                    answers: editingAnswers,
                })
                .select()
                .single();
            if (!error && data) {
                setCareProfiles((prev) => ({ ...prev, [editingFacilityId]: data }));
            }
        }

        setEditingFacilityId(null);
        setSavingProfile(false);
    };

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
                <div className="flex items-center gap-3 shrink-0">
                    <Link
                        href="/dashboard/provider/facilities/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2DD1AC] rounded-full hover:bg-[#2DD1AC]/90 transition-all shadow-md"
                        style={{ fontFamily: "var(--font-ui)" }}
                    >
                        <Plus className="w-4 h-4" />
                        Add Facility
                    </Link>
                    <button
                        onClick={async () => {
                            const supabase = createClient();
                            await supabase.auth.signOut();
                            router.push("/");
                            router.refresh();
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-full hover:bg-red-600 transition-all shadow-md"
                        style={{ fontFamily: "var(--font-ui)" }}
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Your Facilities */}
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-lg font-bold text-white truncate drop-shadow-md" style={{ fontFamily: "var(--font-heading)" }}>
                                            {facility.name}
                                        </h3>
                                        <p className="text-sm text-white/90 drop-shadow-md" style={{ fontFamily: "var(--font-ui)" }}>{facility.city}</p>
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

            {/* Care Profile Questionnaire */}
            {facilities.length > 0 && questions.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-[#2D3748] mb-2 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
                        <ClipboardList className="w-6 h-6 text-[#2DD1AC]" />
                        Care Profile Questionnaire
                    </h2>
                    <p className="text-[#b0aea5] mb-6" style={{ fontFamily: "var(--font-body)" }}>
                        Answer these questions for each facility to match with families looking for care. This helps us connect you with the right clients.
                    </p>

                    <div className="space-y-4">
                        {facilities.map((facility) => {
                            const hasProfile = !!careProfiles[facility.id];
                            const isEditing = editingFacilityId === facility.id;
                            const answeredCount = hasProfile ? Object.keys(careProfiles[facility.id].answers).length : 0;

                            return (
                                <div key={facility.id} className="glass-card overflow-hidden">
                                    <div className="p-5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#e8e6dc]/30 border border-[#e8e6dc]/50 flex items-center justify-center shrink-0 overflow-hidden">
                                                {facility.image_urls?.[0] ? (
                                                    <img src={facility.image_urls[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 className="w-6 h-6 text-[#b0aea5]" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-[#2D3748]" style={{ fontFamily: "var(--font-ui)" }}>
                                                    {facility.name}
                                                </h3>
                                                <p className="text-xs text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                                                    {hasProfile ? (
                                                        <span className="text-[#788c5d]">{answeredCount} of {questions.length} questions answered</span>
                                                    ) : (
                                                        "No care profile yet"
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => isEditing ? setEditingFacilityId(null) : handleStartEditing(facility.id)}
                                            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                                                isEditing
                                                    ? "bg-[#e8e6dc]/50 text-[#2D3748]"
                                                    : hasProfile
                                                    ? "bg-[#6a9bcc]/10 text-[#6a9bcc] hover:bg-[#6a9bcc]/20"
                                                    : "bg-[#2DD1AC] text-white hover:bg-[#1E957A] shadow-md"
                                            }`}
                                            style={{ fontFamily: "var(--font-ui)" }}
                                        >
                                            {isEditing ? "Close" : hasProfile ? "Edit Answers" : "Fill Out Questionnaire"}
                                        </button>
                                    </div>

                                    {/* Questionnaire Form */}
                                    {isEditing && (
                                        <div className="border-t border-[#e8e6dc]/50 p-6 bg-[#faf9f5]/50">
                                            <div className="space-y-8">
                                                {questions.map((q) => {
                                                    const answer = editingAnswers[q.step_id];
                                                    return (
                                                        <div key={q.id}>
                                                            <h4 className="text-sm font-semibold text-[#2D3748] mb-1" style={{ fontFamily: "var(--font-ui)" }}>
                                                                {q.title}
                                                            </h4>
                                                            {q.subtitle && (
                                                                <p className="text-xs text-[#b0aea5] mb-3" style={{ fontFamily: "var(--font-body)" }}>
                                                                    {q.subtitle}
                                                                </p>
                                                            )}
                                                            <div className="flex flex-wrap gap-2">
                                                                {q.options.map((opt) => {
                                                                    const isSelected = q.answer_type === "single"
                                                                        ? answer === opt.value
                                                                        : Array.isArray(answer) && answer.includes(opt.value);
                                                                    return (
                                                                        <button
                                                                            key={opt.value}
                                                                            onClick={() => handleSelectAnswer(q.step_id, opt.value, q.answer_type)}
                                                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                                                                                isSelected
                                                                                    ? "border-[#2DD1AC] bg-[#2DD1AC]/10 text-[#2D3748]"
                                                                                    : "border-[#e8e6dc] bg-white text-[#2D3748]/70 hover:border-[#2DD1AC]/40"
                                                                            }`}
                                                                            style={{ fontFamily: "var(--font-ui)" }}
                                                                        >
                                                                            {q.answer_type === "multi" && (
                                                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                                                                                    isSelected ? "border-[#2DD1AC] bg-[#2DD1AC]" : "border-[#e8e6dc]"
                                                                                }`}>
                                                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                                                </div>
                                                                            )}
                                                                            {opt.icon && <span>{opt.icon}</span>}
                                                                            {opt.label}
                                                                            {q.answer_type === "single" && isSelected && (
                                                                                <Check className="w-4 h-4 text-[#2DD1AC] ml-1" />
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-8 flex items-center gap-3">
                                                <button
                                                    onClick={handleSaveCareProfile}
                                                    disabled={savingProfile}
                                                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#2DD1AC] text-white font-semibold rounded-full hover:bg-[#1E957A] transition-colors disabled:opacity-50 shadow-md"
                                                    style={{ fontFamily: "var(--font-ui)" }}
                                                >
                                                    {savingProfile ? (
                                                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                                    ) : (
                                                        <><Save className="w-4 h-4" /> Save Care Profile</>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setEditingFacilityId(null)}
                                                    className="px-6 py-3 text-sm font-medium text-[#b0aea5] hover:text-[#2D3748] transition-colors"
                                                    style={{ fontFamily: "var(--font-ui)" }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}
