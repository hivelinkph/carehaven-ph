"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Facility, QuestionnaireConfig, ProviderCareProfile, Conversation } from "@/lib/types";
import { Plus, Edit2, Building2, Eye, Check, Save, Loader2, MessageSquare, Heart, BarChart2, Settings, User, Phone, Mail } from "lucide-react";

const CARE_TYPES = [
  { value: "Independent Living", label: "Independent Living", desc: "Self-sufficient seniors in a community setting" },
  { value: "Assisted Living",    label: "Assisted Living",    desc: "Daily assistance with personal care needs" },
  { value: "Memory Care Facility", label: "Memory Care",     desc: "Specialized care for dementia & Alzheimer's" },
];

export function ProviderDashboard({ profile, activeTab }: { profile: Profile; activeTab: string }) {
  const [facilities, setFacilities]   = useState<Facility[]>([]);
  const [questions,  setQuestions]    = useState<QuestionnaireConfig[]>([]);
  const [careProfiles, setCareProfiles] = useState<Record<string, ProviderCareProfile>>({});
  const [convos,     setConvos]       = useState<Conversation[]>([]);
  const [impressions, setImpressions] = useState<{ facility_id: string; match_score: number; created_at: string }[]>([]);
  const [loading,    setLoading]      = useState(true);

  // Questionnaire edit state
  const [editingId,  setEditingId]    = useState<string | null>(null);
  const [editAnswers,setEditAnswers]  = useState<Record<string, string | string[]>>({});
  const [saving,     setSaving]       = useState(false);

  // Care profile type state
  const [careTypeEdits, setCareTypeEdits] = useState<Record<string, string[]>>({});
  const [savingCare, setSavingCare]   = useState<string | null>(null);

  // Settings state
  const [settingsForm, setSettingsForm] = useState({ full_name: profile.full_name || "", phone: profile.phone || "", email: profile.email || "" });
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const sb = createClient();
      const [facR, qR, cpR, convR, impR] = await Promise.all([
        sb.from("facilities").select("*").eq("owner_id", profile.id).order("created_at", { ascending: false }),
        sb.from("questionnaire_config").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        sb.from("provider_care_profiles").select("*").eq("provider_id", profile.id),
        sb.from("conversations").select("*, facility:facilities(name,city), user:profiles!conversations_user_id_fkey(full_name)").eq("provider_id", profile.id).order("last_message_at", { ascending: false }),
        sb.from("match_impressions").select("facility_id,match_score,created_at").eq("provider_id", profile.id).order("created_at", { ascending: false }).limit(50),
      ]);
      setFacilities(facR.data || []);
      setQuestions(qR.data || []);
      const map: Record<string, ProviderCareProfile> = {};
      (cpR.data || []).forEach((cp: ProviderCareProfile) => { map[cp.facility_id] = cp; });
      setCareProfiles(map);
      setConvos((convR.data as Conversation[]) || []);
      setImpressions(impR.data || []);

      // Init care type edits from existing facility_types
      const typeMap: Record<string, string[]> = {};
      (facR.data || []).forEach((f: Facility) => { typeMap[f.id] = f.facility_types || []; });
      setCareTypeEdits(typeMap);
      setLoading(false);
    }
    load();
  }, [profile.id]);

  const handleQSave = async () => {
    if (!editingId) return;
    setSaving(true);
    const sb = createClient();
    const existing = careProfiles[editingId];
    if (existing) {
      const { data } = await sb.from("provider_care_profiles").update({ answers: editAnswers, updated_at: new Date().toISOString() }).eq("id", existing.id).select().single();
      if (data) setCareProfiles(p => ({ ...p, [editingId]: data }));
    } else {
      const { data } = await sb.from("provider_care_profiles").insert({ provider_id: profile.id, facility_id: editingId, answers: editAnswers }).select().single();
      if (data) setCareProfiles(p => ({ ...p, [editingId]: data }));
    }
    setEditingId(null);
    setSaving(false);
  };

  const toggleQAnswer = (stepId: string, value: string, type: string) => {
    if (type === "single") {
      setEditAnswers(p => ({ ...p, [stepId]: value }));
    } else {
      setEditAnswers(p => {
        const cur = (p[stepId] as string[]) || [];
        if (value === "none") return { ...p, [stepId]: ["none"] };
        const f = cur.filter(v => v !== "none");
        return { ...p, [stepId]: f.includes(value) ? f.filter(v => v !== value) : [...f, value] };
      });
    }
  };

  const toggleCareType = (facilityId: string, value: string) => {
    setCareTypeEdits(p => {
      const cur = p[facilityId] || [];
      return { ...p, [facilityId]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value] };
    });
  };

  const saveCareType = async (facilityId: string) => {
    setSavingCare(facilityId);
    const sb = createClient();
    await sb.from("facilities").update({ facility_types: careTypeEdits[facilityId] }).eq("id", facilityId);
    setFacilities(p => p.map(f => f.id === facilityId ? { ...f, facility_types: careTypeEdits[facilityId] } : f));
    setSavingCare(null);
  };

  const saveSettings = async () => {
    const sb = createClient();
    await sb.from("profiles").update({ full_name: settingsForm.full_name, phone: settingsForm.phone }).eq("id", profile.id);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-[#2DD1AC]" />
    </div>
  );

  /* ── MY FACILITIES ── */
  if (activeTab === "facilities") return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>My Facilities</h2>
        <Link href="/dashboard/provider/facilities/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-full text-white"
          style={{ background: "var(--d-primary)" }}>
          <Plus className="w-3.5 h-3.5" /> New Facility
        </Link>
      </div>
      {facilities.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Building2 className="w-10 h-10 text-[#2DD1AC] mx-auto mb-4" />
          <p className="text-[#b0aea5] mb-6" style={{ fontFamily: "var(--font-body)" }}>No facilities yet. Add your first listing to reach families.</p>
          <Link href="/dashboard/provider/facilities/new" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#2DD1AC] rounded-full hover:bg-[#1E957A] transition-all">
            <Plus className="w-4 h-4" /> Add Facility
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map(f => (
            <div key={f.id} className="glass-card flex flex-col overflow-hidden">
              <div className="h-44 relative" style={{ backgroundImage: `url(${f.image_urls?.[0] || "https://images.unsplash.com/photo-1532009877282-3340270e0529?w=800&auto=format&fit=crop"})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white font-bold truncate" style={{ fontFamily: "var(--font-heading)" }}>{f.name}</p>
                  <p className="text-white/80 text-sm">{f.city}</p>
                </div>
                <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${f.is_active ? "bg-emerald-500/90 text-white" : "bg-amber-400/90 text-white"}`}>
                  {f.is_active ? "Active" : "Pending"}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="text-sm text-[#b0aea5] line-clamp-2 mb-4" style={{ fontFamily: "var(--font-body)" }}>{f.description || "No description."}</p>
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <Link href={`/facilities/${f.id}`} className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#e8e6dc] text-sm text-[#2D3748] hover:bg-[#faf9f5]">
                    <Eye className="w-4 h-4" /> View
                  </Link>
                  <Link href={`/dashboard/provider/facilities/${f.id}/edit`} className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#6a9bcc]/10 text-sm text-[#6a9bcc] hover:bg-[#6a9bcc]/20 font-medium">
                    <Edit2 className="w-4 h-4" /> Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ── INQUIRIES ── */
  if (activeTab === "inquiries") return (
    <div>
      <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>Inquiries</h2>
      {convos.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MessageSquare className="w-10 h-10 text-[#2DD1AC] mx-auto mb-4" />
          <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-body)" }}>No inquiries yet. Families will message you here once they find your facility.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {convos.map(c => (
            <div key={c.id} className="glass-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-[#2DD1AC]/15 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-[#2DD1AC]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#2D3748] text-sm truncate" style={{ fontFamily: "var(--font-ui)" }}>
                  {(c.user as unknown as Profile)?.full_name || "Anonymous"}
                </p>
                <p className="text-xs text-[#b0aea5] truncate">{c.last_message_preview || "No message preview"}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-[#b0aea5]">{(c.facility as unknown as Facility)?.name}</p>
                <p className="text-xs text-[#b0aea5]">{new Date(c.last_message_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ── QUESTIONNAIRE ── */
  if (activeTab === "questionnaire") return (
    <div>
      <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>Care Questionnaire</h2>
      <p className="text-sm text-[#b0aea5] mb-6" style={{ fontFamily: "var(--font-body)" }}>Answer these questions for each facility to match with the right families.</p>
      {facilities.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-[#b0aea5]">Add a facility first before filling out the questionnaire.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {facilities.map(f => {
            const has = !!careProfiles[f.id];
            const isEditing = editingId === f.id;
            return (
              <div key={f.id} className="glass-card overflow-hidden">
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-[#2DD1AC]" />
                    <div>
                      <p className="font-semibold text-[#2D3748] text-sm" style={{ fontFamily: "var(--font-ui)" }}>{f.name}</p>
                      <p className="text-xs text-[#b0aea5]">{has ? `${Object.keys(careProfiles[f.id].answers).length} of ${questions.length} answered` : "No answers yet"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { if (isEditing) { setEditingId(null); } else { setEditingId(f.id); setEditAnswers(careProfiles[f.id]?.answers || {}); } }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${isEditing ? "bg-[#e8e6dc] text-[#2D3748]" : has ? "bg-[#6a9bcc]/10 text-[#6a9bcc]" : "bg-[#2DD1AC] text-white"}`}>
                    {isEditing ? "Close" : has ? "Edit" : "Fill Out"}
                  </button>
                </div>
                {isEditing && (
                  <div className="border-t border-[#e8e6dc]/50 p-6 bg-[#faf9f5]/50 space-y-6">
                    {questions.map(q => {
                      const ans = editAnswers[q.step_id];
                      return (
                        <div key={q.id}>
                          <p className="text-sm font-semibold text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-ui)" }}>{q.title}</p>
                          <div className="flex flex-wrap gap-2">
                            {q.options.map(opt => {
                              const sel = q.answer_type === "single" ? ans === opt.value : Array.isArray(ans) && ans.includes(opt.value);
                              return (
                                <button key={opt.value} onClick={() => toggleQAnswer(q.step_id, opt.value, q.answer_type)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border-2 transition-all ${sel ? "border-[#2DD1AC] bg-[#2DD1AC]/10 text-[#2D3748]" : "border-[#e8e6dc] bg-white text-[#2D3748]/70"}`}>
                                  {q.answer_type === "multi" && <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center ${sel ? "border-[#2DD1AC] bg-[#2DD1AC]" : "border-[#e8e6dc]"}`}>{sel && <Check className="w-2.5 h-2.5 text-white" />}</div>}
                                  {opt.icon && <span>{opt.icon}</span>}
                                  {opt.label}
                                  {q.answer_type === "single" && sel && <Check className="w-3.5 h-3.5 text-[#2DD1AC]" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleQSave} disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2DD1AC] text-white text-sm font-semibold rounded-full hover:bg-[#1E957A] disabled:opacity-50">
                        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2.5 text-sm text-[#b0aea5] hover:text-[#2D3748]">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ── CARE PROFILE ── */
  if (activeTab === "care-profile") return (
    <div>
      <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>Care Profile</h2>
      <p className="text-sm text-[#b0aea5] mb-6" style={{ fontFamily: "var(--font-body)" }}>Select the type(s) of care each facility provides. You can choose multiple.</p>
      {facilities.length === 0 ? (
        <div className="glass-card p-10 text-center"><p className="text-[#b0aea5]">Add a facility first.</p></div>
      ) : (
        <div className="space-y-6">
          {facilities.map(f => (
            <div key={f.id} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <Building2 className="w-5 h-5 text-[#2DD1AC]" />
                <p className="font-semibold text-[#2D3748]" style={{ fontFamily: "var(--font-ui)" }}>{f.name}</p>
                <span className="text-xs text-[#b0aea5]">· {f.city}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {CARE_TYPES.map(ct => {
                  const sel = (careTypeEdits[f.id] || []).includes(ct.value);
                  return (
                    <button key={ct.value} onClick={() => toggleCareType(f.id, ct.value)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${sel ? "border-[#2DD1AC] bg-[#2DD1AC]/8" : "border-[#e8e6dc] bg-white hover:border-[#2DD1AC]/40"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${sel ? "border-[#2DD1AC] bg-[#2DD1AC]" : "border-[#e8e6dc]"}`}>
                          {sel && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <Heart className={`w-4 h-4 ${sel ? "text-[#2DD1AC]" : "text-[#b0aea5]"}`} />
                      </div>
                      <p className="text-sm font-semibold text-[#2D3748]">{ct.label}</p>
                      <p className="text-xs text-[#b0aea5] mt-0.5">{ct.desc}</p>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => saveCareType(f.id)} disabled={savingCare === f.id}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#2DD1AC] text-white text-sm font-semibold rounded-full hover:bg-[#1E957A] disabled:opacity-50">
                {savingCare === f.id ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Care Profile</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ── INSIGHTS ── */
  if (activeTab === "insights") return (
    <div>
      <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>Insights</h2>
      <p className="text-sm text-[#b0aea5] mb-6" style={{ fontFamily: "var(--font-body)" }}>How your facilities are performing on the platform.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Match Appearances", value: impressions.length, icon: BarChart2, color: "#2DD1AC" },
          { label: "Avg. Match Score", value: impressions.length ? (impressions.reduce((a, b) => a + b.match_score, 0) / impressions.length).toFixed(1) : "—", icon: Eye, color: "#6a9bcc" },
          { label: "Facilities Listed", value: facilities.length, icon: Building2, color: "#d97757" },
        ].map(s => (
          <div key={s.label} className="glass-card p-5">
            <s.icon className="w-6 h-6 mb-3" style={{ color: s.color }} />
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>{s.value}</p>
            <p className="text-sm text-[#b0aea5] mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      {impressions.length > 0 && (
        <div className="glass-card p-5">
          <p className="font-semibold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-ui)" }}>Recent Match Appearances</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {impressions.slice(0, 20).map((imp, i) => {
              const fac = facilities.find(f => f.id === imp.facility_id);
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#e8e6dc]/50 last:border-0">
                  <p className="text-sm text-[#2D3748]">{fac?.name || "Unknown facility"}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-[#2DD1AC]">Score: {imp.match_score}</span>
                    <span className="text-xs text-[#b0aea5]">{new Date(imp.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  /* ── SETTINGS ── */
  if (activeTab === "settings") return (
    <div>
      <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)" }}>Settings</h2>
      <div className="glass-card p-6 max-w-lg">
        <p className="font-semibold text-[#2D3748] mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-ui)" }}>
          <User className="w-4 h-4 text-[#2DD1AC]" /> Account Information
        </p>
        <div className="space-y-4">
          {[
            { key: "full_name", label: "Full Name", icon: User,  type: "text",  placeholder: "Your full name" },
            { key: "phone",     label: "Phone",     icon: Phone, type: "tel",   placeholder: "+63 912 345 6789" },
            { key: "email",     label: "Email",     icon: Mail,  type: "email", placeholder: "you@example.com", disabled: true },
          ].map(({ key, label, icon: Icon, type, placeholder, disabled }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-[#2D3748] mb-1.5 flex items-center gap-1.5" style={{ fontFamily: "var(--font-ui)" }}>
                <Icon className="w-3.5 h-3.5 text-[#2DD1AC]" /> {label}
              </label>
              <input
                type={type}
                value={settingsForm[key as keyof typeof settingsForm]}
                onChange={e => !disabled && setSettingsForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e8e6dc] text-sm text-[#2D3748] bg-white focus:outline-none focus:border-[#2DD1AC] disabled:bg-[#faf9f5] disabled:text-[#b0aea5]"
                style={{ fontFamily: "var(--font-ui)" }}
              />
              {disabled && <p className="text-xs text-[#b0aea5] mt-1">Email cannot be changed here.</p>}
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button onClick={saveSettings}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2DD1AC] text-white text-sm font-semibold rounded-full hover:bg-[#1E957A]">
            <Save className="w-4 h-4" /> Save Changes
          </button>
          {settingsSaved && <span className="text-sm text-emerald-600 font-medium">Saved ✓</span>}
        </div>
      </div>
    </div>
  );

  return null;
}
