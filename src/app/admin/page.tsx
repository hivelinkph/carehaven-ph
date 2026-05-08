"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Facility, Location, Testimonial, QuestionnaireConfig, GalleryImage } from "@/lib/types";
import DashboardChrome, { type NavItem, type StatTile } from "@/components/dashboard/DashboardChrome";
import {
  Building2,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Plus,
  Trash2,
  Edit2,
  MessageSquareQuote,
  Image,
  Save,
  X,
  Upload,
  Loader2,
  ClipboardList,
  ToggleLeft,
  ToggleRight,
  GripVertical,
  BarChart3,
  TrendingUp,
  Trophy,
  Images,
  LayoutDashboard,
} from "lucide-react";

type AdminTab = "facilities" | "questionnaire" | "testimonials" | "gallery" | "reports";

const ADMIN_NAV: NavItem[] = [
  { key: "facilities", label: "Facilities", icon: Building2 },
  { key: "questionnaire", label: "Questionnaire", icon: ClipboardList },
  { key: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { key: "gallery", label: "Gallery", icon: Images },
  { key: "reports", label: "Reports", icon: BarChart3 },
];

export default function AdminDashboard() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [questions, setQuestions] = useState<QuestionnaireConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [savingTestimonial, setSavingTestimonial] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("facilities");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuestionnaireConfig> | null>(null);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [reportData, setReportData] = useState<{ facility_id: string; facility_name: string; impression_count: number; avg_score: number }[]>([]);
  const [reportTotal, setReportTotal] = useState(0);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData?.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      setProfile(profileData as Profile);

      const [facRes, locRes, testRes, qRes, impRes, galRes] = await Promise.all([
        supabase.from("facilities").select("*").order("created_at", { ascending: false }),
        supabase.from("locations").select("*").order("name", { ascending: true }),
        supabase.from("testimonials").select("*").order("sort_order", { ascending: true }),
        supabase.from("questionnaire_config").select("*").order("sort_order", { ascending: true }),
        supabase.from("match_impressions").select("*"),
        supabase.from("gallery_images").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
      ]);

      setFacilities(facRes.data || []);
      setLocations(locRes.data || []);
      setTestimonials(testRes.data || []);
      setQuestions(qRes.data || []);
      setGalleryImages(galRes.data || []);

      // Build report data from impressions
      const impressions = impRes.data || [];
      setReportTotal(impressions.length);
      const facilityMap = new Map<string, { count: number; totalScore: number }>();
      for (const imp of impressions) {
        const existing = facilityMap.get(imp.facility_id) || { count: 0, totalScore: 0 };
        existing.count += 1;
        existing.totalScore += Number(imp.match_score) || 0;
        facilityMap.set(imp.facility_id, existing);
      }
      const allFacs = facRes.data || [];
      const report = Array.from(facilityMap.entries())
        .map(([fid, stats]) => ({
          facility_id: fid,
          facility_name: allFacs.find((f: Facility) => f.id === fid)?.name || "Unknown Facility",
          impression_count: stats.count,
          avg_score: stats.count > 0 ? Math.round((stats.totalScore / stats.count) * 10) / 10 : 0,
        }))
        .sort((a, b) => b.impression_count - a.impression_count);
      setReportData(report);

      setLoading(false);
    }
    load();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // --- Facility handlers ---
  async function toggleFacilityStatus(facilityId: string, currentlyActive: boolean) {
    const { error } = await supabase
      .from("facilities")
      .update({ is_active: !currentlyActive })
      .eq("id", facilityId);

    if (!error) {
      setFacilities((prev) =>
        prev.map((f) => (f.id === facilityId ? { ...f, is_active: !currentlyActive } : f))
      );
    }
  }

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (!error) setLocations(prev => prev.filter(loc => loc.id !== id));
  };

  // --- Testimonial handlers ---
  const handleSaveTestimonial = async () => {
    if (!editingTestimonial?.name || !editingTestimonial?.quote || !editingTestimonial?.location) return;
    setSavingTestimonial(true);

    const payload = {
      name: editingTestimonial.name,
      location: editingTestimonial.location,
      quote: editingTestimonial.quote,
      image_url: editingTestimonial.image_url || null,
      is_active: editingTestimonial.is_active ?? true,
      sort_order: editingTestimonial.sort_order ?? testimonials.length,
    };

    if (editingTestimonial.id) {
      const { data, error } = await supabase
        .from("testimonials")
        .update(payload)
        .eq("id", editingTestimonial.id)
        .select()
        .single();
      if (!error && data) setTestimonials((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    } else {
      const { data, error } = await supabase
        .from("testimonials")
        .insert(payload)
        .select()
        .single();
      if (!error && data) setTestimonials((prev) => [...prev, data]);
    }

    setEditingTestimonial(null);
    setSavingTestimonial(false);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!editingTestimonial) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("testimonial-avatars")
        .upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("testimonial-avatars").getPublicUrl(path);
      setEditingTestimonial({ ...editingTestimonial, image_url: publicUrl });
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Failed to upload image. Please try again.");
    }
    setUploadingAvatar(false);
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (!error) setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Questionnaire handlers ---
  const handleSaveQuestion = async () => {
    if (!editingQuestion?.title || !editingQuestion?.step_id) return;
    setSavingQuestion(true);

    const payload = {
      step_id: editingQuestion.step_id,
      title: editingQuestion.title,
      subtitle: editingQuestion.subtitle || null,
      answer_type: editingQuestion.answer_type || "single",
      options: editingQuestion.options || [],
      sort_order: editingQuestion.sort_order ?? questions.length,
      is_active: editingQuestion.is_active ?? true,
    };

    if (editingQuestion.id) {
      const { data, error } = await supabase
        .from("questionnaire_config")
        .update(payload)
        .eq("id", editingQuestion.id)
        .select()
        .single();
      if (!error && data) setQuestions((prev) => prev.map((q) => (q.id === data.id ? data : q)));
    } else {
      const { data, error } = await supabase
        .from("questionnaire_config")
        .insert(payload)
        .select()
        .single();
      if (!error && data) setQuestions((prev) => [...prev, data]);
    }

    setEditingQuestion(null);
    setSavingQuestion(false);
  };

  const handleToggleAnswerType = async (q: QuestionnaireConfig) => {
    const newType = q.answer_type === "single" ? "multi" : "single";
    const { error } = await supabase
      .from("questionnaire_config")
      .update({ answer_type: newType })
      .eq("id", q.id);
    if (!error) {
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, answer_type: newType } : item))
      );
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    const { error } = await supabase.from("questionnaire_config").delete().eq("id", id);
    if (!error) setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleAddOption = () => {
    if (!editingQuestion) return;
    const options = [...(editingQuestion.options || []), { label: "", value: "" }];
    setEditingQuestion({ ...editingQuestion, options });
  };

  const handleUpdateOption = (index: number, field: "label" | "value" | "icon", value: string) => {
    if (!editingQuestion) return;
    const options = [...(editingQuestion.options || [])];
    options[index] = { ...options[index], [field]: value };
    // Auto-generate value from label if value is empty
    if (field === "label" && !options[index].value) {
      options[index].value = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    }
    setEditingQuestion({ ...editingQuestion, options });
  };

  const handleRemoveOption = (index: number) => {
    if (!editingQuestion) return;
    const options = (editingQuestion.options || []).filter((_, i) => i !== index);
    setEditingQuestion({ ...editingQuestion, options });
  };

  // --- Gallery handlers ---
  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const newRows: GalleryImage[] = [];
      let nextSort = galleryImages.length;
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("gallery-images")
          .upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("gallery-images").getPublicUrl(path);
        const { data, error } = await supabase
          .from("gallery_images")
          .insert({
            image_url: publicUrl,
            alt_text: file.name,
            sort_order: nextSort,
            is_active: true,
          })
          .select()
          .single();
        if (error) throw error;
        if (data) newRows.push(data);
        nextSort += 1;
      }
      if (newRows.length) setGalleryImages((prev) => [...prev, ...newRows]);
    } catch (err) {
      console.error("Gallery upload failed:", err);
      alert("Failed to upload one or more images. Please try again.");
    }
    setUploadingGallery(false);
  };

  const handleToggleGalleryActive = async (img: GalleryImage) => {
    const { error } = await supabase
      .from("gallery_images")
      .update({ is_active: !img.is_active })
      .eq("id", img.id);
    if (!error) {
      setGalleryImages((prev) =>
        prev.map((g) => (g.id === img.id ? { ...g, is_active: !img.is_active } : g))
      );
    }
  };

  const handleDeleteGalleryImage = async (img: GalleryImage) => {
    if (!window.confirm("Delete this gallery image? This cannot be undone.")) return;
    const { error } = await supabase.from("gallery_images").delete().eq("id", img.id);
    if (error) {
      alert("Failed to delete image.");
      return;
    }
    try {
      const url = new URL(img.image_url);
      const marker = "/gallery-images/";
      const idx = url.pathname.indexOf(marker);
      if (idx !== -1) {
        const path = decodeURIComponent(url.pathname.slice(idx + marker.length));
        await supabase.storage.from("gallery-images").remove([path]);
      }
    } catch (e) {
      console.warn("Could not remove gallery file from storage:", e);
    }
    setGalleryImages((prev) => prev.filter((g) => g.id !== img.id));
  };

  // --- Filter ---
  const filtered = facilities.filter((f) => {
    const matchesSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.city.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && f.is_active) ||
      (filter === "pending" && !f.is_active);
    return matchesSearch && matchesFilter;
  });

  const activeCount = facilities.filter((f) => f.is_active).length;
  const pendingCount = facilities.filter((f) => !f.is_active).length;

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--d-bg, #f3eee3)" }}>
        <div className="animate-pulse" style={{ fontFamily: "var(--font-ui)", color: "var(--d-ink-muted, #8a9c97)" }}>Loading admin control…</div>
      </div>
    );
  }

  const adminStats: StatTile[] = [
    { label: "Facilities", value: facilities.length, sublabel: `${activeCount} active`, icon: Building2, tone: "teal" },
    { label: "Testimonials", value: testimonials.length, icon: MessageSquareQuote, tone: "pink" },
    { label: "Questionnaires", value: questions.length, sublabel: "Steps configured", icon: ClipboardList, tone: "orange" },
    { label: "Gallery items", value: galleryImages.length, sublabel: `${galleryImages.filter(g=>g.is_active).length} published`, icon: Images, tone: "purple" },
  ];

  return (
    <DashboardChrome
      profile={profile}
      panelTitle="Admin Console"
      panelSubtitle="Every detail matters."
      badge="Admin"
      navItems={ADMIN_NAV}
      activeKey={activeTab}
      onNavSelect={(k) => setActiveTab(k as AdminTab)}
      pageTitle="Admin Control"
      pageEyebrow="Active"
      stats={adminStats}
      hero={{
        image: "/assets/images/hero.jpeg",
        eyebrow: "Today's note",
        title: <>Compassion in <em style={{ fontFamily: "var(--font-accent)", fontStyle: "italic" }}>every detail.</em></>,
        body: "Each entry below shapes a family's first impression — keep listings vetted, respected, and at home.",
      }}
    >
      {/* Page content begins here */}
      <div>
        <div className="hidden">{/* spacer to keep diff stable */}</div>

          {/* ===== FACILITIES TAB ===== */}
          {activeTab === "facilities" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-5">
                  <div className="text-2xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>{facilities.length}</div>
                  <div className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Total Facilities</div>
                </div>
                <div className="glass-card p-5">
                  <div className="text-2xl font-bold text-[#788c5d]" style={{ fontFamily: "var(--font-heading)" }}>{activeCount}</div>
                  <div className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Active</div>
                </div>
                <div className="glass-card p-5">
                  <div className="text-2xl font-bold text-[#d97757]" style={{ fontFamily: "var(--font-heading)" }}>{pendingCount}</div>
                  <div className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Pending Review</div>
                </div>
              </div>

              {/* Search + Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0aea5]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search facilities..."
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[#e8e6dc] rounded-xl text-sm focus:outline-none focus:border-[#2DD1AC]"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </div>
                <div className="flex rounded-xl bg-[#e8e6dc]/40 p-1" style={{ fontFamily: "var(--font-ui)" }}>
                  {(["all", "active", "pending"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? "bg-white text-[#2D3748] shadow-sm" : "text-[#b0aea5] hover:text-[#2D3748]"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Facility Table */}
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ fontFamily: "var(--font-ui)" }}>
                    <thead>
                      <tr className="border-b border-[#e8e6dc]">
                        <th className="text-left text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Facility</th>
                        <th className="text-left text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Location</th>
                        <th className="text-left text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Rating</th>
                        <th className="text-left text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Status</th>
                        <th className="text-right text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12">
                            <Building2 className="w-10 h-10 text-[#b0aea5] mx-auto mb-3" />
                            <p className="text-sm text-[#b0aea5]">No facilities found</p>
                          </td>
                        </tr>
                      ) : (
                        filtered.map((facility) => (
                          <tr key={facility.id} className="border-b border-[#e8e6dc]/50 hover:bg-[#2DD1AC]/3 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#e8e6dc]/30 border border-[#e8e6dc]/50 flex items-center justify-center shrink-0 overflow-hidden">
                                  {facility.image_urls?.[0] ? (
                                    <img src={facility.image_urls[0]} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Building2 className="w-5 h-5 text-[#b0aea5]" />
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-[#2D3748]">{facility.name}</div>
                                  <div className="text-xs text-[#b0aea5]">{facility.services?.length || 0} services</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-sm text-[#2D3748]">
                                <MapPin className="w-3.5 h-3.5 text-[#b0aea5]" />
                                {facility.city}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {facility.rating ? (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 text-[#d97757]" fill="#d97757" />
                                  <span className="text-sm font-semibold text-[#2D3748]">{facility.rating}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-[#b0aea5]">No rating</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {facility.is_active ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#788c5d] bg-[#788c5d]/10 px-2.5 py-1 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#d97757] bg-[#d97757]/10 px-2.5 py-1 rounded-full">
                                  <XCircle className="w-3 h-3" /> Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/admin/providers/${facility.id}`}
                                  className="text-xs font-medium text-[#6a9bcc] hover:text-[#2DD1AC] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#2DD1AC]/5"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => toggleFacilityStatus(facility.id, facility.is_active)}
                                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${facility.is_active
                                    ? "text-[#d97757] hover:bg-[#d97757]/10"
                                    : "text-[#788c5d] hover:bg-[#788c5d]/10"
                                    }`}
                                >
                                  {facility.is_active ? "Deactivate" : "Approve"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Locations Table */}
              <div className="glass-card overflow-hidden mt-8">
                <div className="p-6 border-b border-[#e8e6dc]/50 bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-[#2D3748] flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                    <MapPin className="w-5 h-5 text-[#2DD1AC]" />
                    All Locations Directory
                  </h2>
                  <Link
                    href="/dashboard/admin/locations/new"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2DD1AC] text-white font-semibold rounded-full hover:bg-[#1E957A] transition-colors shadow-sm hover:shadow-md"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Map Location
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#faf9f5] border-b border-[#e8e6dc]/50 text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">City / Location</th>
                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Region</th>
                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Status</th>
                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-[#b0aea5] py-12" style={{ fontFamily: "var(--font-ui)" }}>
                            No locations found in the database.
                          </td>
                        </tr>
                      ) : (
                        locations.map((loc) => (
                          <tr key={loc.id} className="border-b border-[#e8e6dc]/50 hover:bg-[#2DD1AC]/3 transition-colors" style={{ fontFamily: "var(--font-ui)" }}>
                            <td className="px-6 py-4 font-semibold text-[#2D3748]">{loc.name}</td>
                            <td className="px-6 py-4 text-sm text-[#2D3748]">{loc.region}</td>
                            <td className="px-6 py-4 text-center">
                              {loc.is_active ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#788c5d] bg-[#788c5d]/10 px-2.5 py-1 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#d97757] bg-[#d97757]/10 px-2.5 py-1 rounded-full">
                                  <XCircle className="w-3 h-3" /> Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/dashboard/admin/locations/${loc.id}/edit`}
                                  className="inline-flex items-center justify-center p-2 rounded-lg bg-[#e8e6dc]/50 text-[#2D3748] hover:bg-[#2DD1AC]/10 hover:text-[#1E957A] transition-all"
                                  title="Edit Location"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteLocation(loc.id)}
                                  className="inline-flex items-center justify-center p-2 rounded-lg bg-[#e8e6dc]/50 text-[#2D3748] hover:bg-red-500/10 hover:text-red-500 transition-all"
                                  title="Delete Location"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ===== QUESTIONNAIRE TAB ===== */}
          {activeTab === "questionnaire" && (
            <>
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-[#e8e6dc]/50 bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-[#2D3748] flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                    <ClipboardList className="w-5 h-5 text-[#2DD1AC]" />
                    Questionnaire Configuration ({questions.length})
                  </h2>
                  <button
                    onClick={() => setEditingQuestion({ step_id: "", title: "", subtitle: "", answer_type: "single", options: [], sort_order: questions.length, is_active: true })}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2DD1AC] text-white font-semibold rounded-full hover:bg-[#1E957A] transition-colors shadow-sm hover:shadow-md"
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>

                {/* Edit/Add Question Form */}
                {editingQuestion && (
                  <div className="p-6 border-b border-[#e8e6dc]/50 bg-[#2DD1AC]/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                        {editingQuestion.id ? "Edit Question" : "New Question"}
                      </h3>
                      <button onClick={() => setEditingQuestion(null)} className="p-1.5 rounded-lg hover:bg-[#e8e6dc]/50 transition-colors">
                        <X className="w-5 h-5 text-[#b0aea5]" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4" style={{ fontFamily: "var(--font-ui)" }}>
                      <div>
                        <label className="block text-xs font-semibold text-[#b0aea5] uppercase tracking-wider mb-1.5">Step ID *</label>
                        <input
                          type="text"
                          value={editingQuestion.step_id || ""}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, step_id: e.target.value })}
                          placeholder="e.g. mobility"
                          className="w-full px-4 py-3 bg-white border-2 border-[#e8e6dc] rounded-xl text-sm focus:outline-none focus:border-[#2DD1AC]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#b0aea5] uppercase tracking-wider mb-1.5">Answer Type</label>
                        <div className="flex rounded-xl bg-[#e8e6dc]/40 p-1">
                          <button
                            onClick={() => setEditingQuestion({ ...editingQuestion, answer_type: "single" })}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${editingQuestion.answer_type === "single" ? "bg-white text-[#2D3748] shadow-sm" : "text-[#b0aea5]"}`}
                          >
                            Single Select
                          </button>
                          <button
                            onClick={() => setEditingQuestion({ ...editingQuestion, answer_type: "multi" })}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${editingQuestion.answer_type === "multi" ? "bg-white text-[#2D3748] shadow-sm" : "text-[#b0aea5]"}`}
                          >
                            Multi Select
                          </button>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#b0aea5] uppercase tracking-wider mb-1.5">Question Title *</label>
                        <input
                          type="text"
                          value={editingQuestion.title || ""}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                          placeholder="e.g. What assistance is needed?"
                          className="w-full px-4 py-3 bg-white border-2 border-[#e8e6dc] rounded-xl text-sm focus:outline-none focus:border-[#2DD1AC]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#b0aea5] uppercase tracking-wider mb-1.5">Subtitle</label>
                        <input
                          type="text"
                          value={editingQuestion.subtitle || ""}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, subtitle: e.target.value })}
                          placeholder="e.g. Select all that apply."
                          className="w-full px-4 py-3 bg-white border-2 border-[#e8e6dc] rounded-xl text-sm focus:outline-none focus:border-[#2DD1AC]"
                        />
                      </div>
                    </div>

                    {/* Options Editor */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-semibold text-[#b0aea5] uppercase tracking-wider" style={{ fontFamily: "var(--font-ui)" }}>
                          Options ({(editingQuestion.options || []).length})
                        </label>
                        <button
                          onClick={handleAddOption}
                          className="text-xs font-medium text-[#2DD1AC] hover:text-[#1E957A] transition-colors flex items-center gap-1"
                          style={{ fontFamily: "var(--font-ui)" }}
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Option
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(editingQuestion.options || []).map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-[#b0aea5] shrink-0" />
                            <input
                              type="text"
                              value={opt.icon || ""}
                              onChange={(e) => handleUpdateOption(i, "icon", e.target.value)}
                              placeholder="Icon"
                              className="w-14 px-2 py-2.5 bg-white border-2 border-[#e8e6dc] rounded-lg text-sm text-center focus:outline-none focus:border-[#2DD1AC]"
                            />
                            <input
                              type="text"
                              value={opt.label}
                              onChange={(e) => handleUpdateOption(i, "label", e.target.value)}
                              placeholder="Label"
                              className="flex-1 px-3 py-2.5 bg-white border-2 border-[#e8e6dc] rounded-lg text-sm focus:outline-none focus:border-[#2DD1AC]"
                            />
                            <input
                              type="text"
                              value={opt.value}
                              onChange={(e) => handleUpdateOption(i, "value", e.target.value)}
                              placeholder="Value"
                              className="w-32 px-3 py-2.5 bg-white border-2 border-[#e8e6dc] rounded-lg text-sm focus:outline-none focus:border-[#2DD1AC]"
                            />
                            <button
                              onClick={() => handleRemoveOption(i)}
                              className="p-2 rounded-lg hover:bg-red-50 text-[#b0aea5] hover:text-red-500 transition-all shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSaveQuestion}
                        disabled={savingQuestion || !editingQuestion.title || !editingQuestion.step_id}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2DD1AC] text-white font-semibold rounded-full hover:bg-[#1E957A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: "var(--font-ui)" }}
                      >
                        <Save className="w-4 h-4" />
                        {savingQuestion ? "Saving..." : "Save Question"}
                      </button>
                      <button
                        onClick={() => setEditingQuestion(null)}
                        className="px-6 py-2.5 text-sm font-medium text-[#b0aea5] hover:text-[#2D3748] transition-colors"
                        style={{ fontFamily: "var(--font-ui)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Questions List */}
                <div className="divide-y divide-[#e8e6dc]/50">
                  {questions.length === 0 ? (
                    <div className="text-center py-12">
                      <ClipboardList className="w-10 h-10 text-[#b0aea5] mx-auto mb-3" />
                      <p className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>No questions configured yet. Add your first one!</p>
                    </div>
                  ) : (
                    questions.map((q) => (
                      <div key={q.id} className="p-6 hover:bg-[#2DD1AC]/3 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-xs font-mono text-[#b0aea5] bg-[#e8e6dc]/50 px-2 py-0.5 rounded" style={{ fontFamily: "var(--font-ui)" }}>
                                {q.step_id}
                              </span>
                              <button
                                onClick={() => handleToggleAnswerType(q)}
                                className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                                style={{ fontFamily: "var(--font-ui)" }}
                                title="Click to toggle answer type"
                              >
                                {q.answer_type === "single" ? (
                                  <>
                                    <ToggleLeft className="w-4 h-4 text-[#6a9bcc]" />
                                    <span className="text-[#6a9bcc]">Single</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="w-4 h-4 text-[#2DD1AC]" />
                                    <span className="text-[#2DD1AC]">Multi</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <h4 className="text-sm font-semibold text-[#2D3748] mb-1" style={{ fontFamily: "var(--font-ui)" }}>
                              {q.title}
                            </h4>
                            {q.subtitle && (
                              <p className="text-xs text-[#b0aea5] mb-2" style={{ fontFamily: "var(--font-body)" }}>
                                {q.subtitle}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              {q.options.map((opt, i) => (
                                <span key={i} className="text-xs bg-[#e8e6dc]/50 text-[#2D3748]/70 px-2.5 py-1 rounded-full" style={{ fontFamily: "var(--font-ui)" }}>
                                  {opt.icon && <span className="mr-1">{opt.icon}</span>}
                                  {opt.label}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setEditingQuestion(q)}
                              className="inline-flex items-center justify-center p-2 rounded-lg bg-[#e8e6dc]/50 text-[#2D3748] hover:bg-[#2DD1AC]/10 hover:text-[#1E957A] transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="inline-flex items-center justify-center p-2 rounded-lg bg-[#e8e6dc]/50 text-[#2D3748] hover:bg-red-500/10 hover:text-red-500 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* ===== TESTIMONIALS TAB ===== */}
          {activeTab === "testimonials" && (
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-[#e8e6dc]/50 bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-[#2D3748] flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                  <MessageSquareQuote className="w-5 h-5 text-[#2DD1AC]" />
                  Testimonials ({testimonials.length})
                </h2>
                <button
                  onClick={() => setEditingTestimonial({ name: "", location: "", quote: "", image_url: "", is_active: true, sort_order: testimonials.length })}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2DD1AC] text-white font-semibold rounded-full hover:bg-[#1E957A] transition-colors shadow-sm hover:shadow-md"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  <Plus className="w-4 h-4" />
                  Add Testimonial
                </button>
              </div>

              {/* Edit/Add Testimonial */}
              {editingTestimonial && (
                <div className="p-6 border-b border-[#e8e6dc]/50 bg-[#2DD1AC]/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                      {editingTestimonial.id ? "Edit Testimonial" : "New Testimonial"}
                    </h3>
                    <button onClick={() => setEditingTestimonial(null)} className="p-1.5 rounded-lg hover:bg-[#e8e6dc]/50 transition-colors">
                      <X className="w-5 h-5 text-[#b0aea5]" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4" style={{ fontFamily: "var(--font-ui)" }}>
                    <div>
                      <label className="block text-xs font-semibold text-[#b0aea5] uppercase tracking-wider mb-1.5">Name *</label>
                      <input
                        type="text"
                        value={editingTestimonial.name || ""}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                        placeholder="e.g. Maria Santos"
                        className="w-full px-4 py-3 bg-white border-2 border-[#e8e6dc] rounded-xl text-sm focus:outline-none focus:border-[#2DD1AC]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#b0aea5] uppercase tracking-wider mb-1.5">Location *</label>
                      <input
                        type="text"
                        value={editingTestimonial.location || ""}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, location: e.target.value })}
                        placeholder="e.g. Quezon City"
                        className="w-full px-4 py-3 bg-white border-2 border-[#e8e6dc] rounded-xl text-sm focus:outline-none focus:border-[#2DD1AC]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#b0aea5] uppercase tracking-wider mb-1.5">Quote *</label>
                      <textarea
                        value={editingTestimonial.quote || ""}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                        placeholder="Their testimonial..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-2 border-[#e8e6dc] rounded-xl text-sm focus:outline-none focus:border-[#2DD1AC] resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#b0aea5] uppercase tracking-wider mb-1.5">
                        <span className="flex items-center gap-1"><Image className="w-3 h-3" /> Avatar Photo</span>
                      </label>
                      <div className="flex items-center gap-4">
                        {editingTestimonial.image_url ? (
                          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#e8e6dc] shrink-0">
                            <img src={editingTestimonial.image_url} alt="Avatar" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setEditingTestimonial({ ...editingTestimonial, image_url: "" })}
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#e8e6dc] flex items-center justify-center shrink-0 bg-[#faf9f5]">
                            <Image className="w-5 h-5 text-[#b0aea5]" />
                          </div>
                        )}
                        <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#e8e6dc] rounded-xl cursor-pointer hover:border-[#2DD1AC] hover:bg-[#2DD1AC]/5 transition-all ${uploadingAvatar ? "opacity-50 pointer-events-none" : ""}`}>
                          {uploadingAvatar ? (
                            <><Loader2 className="w-4 h-4 text-[#2DD1AC] animate-spin" /><span className="text-sm text-[#b0aea5]">Uploading...</span></>
                          ) : (
                            <><Upload className="w-4 h-4 text-[#b0aea5]" /><span className="text-sm text-[#b0aea5]">Choose photo</span></>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleAvatarUpload(file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#b0aea5] uppercase tracking-wider mb-1.5">Sort Order</label>
                      <input
                        type="number"
                        value={editingTestimonial.sort_order ?? 0}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, sort_order: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-white border-2 border-[#e8e6dc] rounded-xl text-sm focus:outline-none focus:border-[#2DD1AC]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveTestimonial}
                      disabled={savingTestimonial || !editingTestimonial.name || !editingTestimonial.quote || !editingTestimonial.location}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2DD1AC] text-white font-semibold rounded-full hover:bg-[#1E957A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: "var(--font-ui)" }}
                    >
                      <Save className="w-4 h-4" />
                      {savingTestimonial ? "Saving..." : "Save Testimonial"}
                    </button>
                    <button
                      onClick={() => setEditingTestimonial(null)}
                      className="px-6 py-2.5 text-sm font-medium text-[#b0aea5] hover:text-[#2D3748] transition-colors"
                      style={{ fontFamily: "var(--font-ui)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Testimonials List */}
              <div className="overflow-x-auto">
                <table className="w-full" style={{ fontFamily: "var(--font-ui)" }}>
                  <thead>
                    <tr className="border-b border-[#e8e6dc]">
                      <th className="text-left text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Person</th>
                      <th className="text-left text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Quote</th>
                      <th className="text-left text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-right text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12">
                          <MessageSquareQuote className="w-10 h-10 text-[#b0aea5] mx-auto mb-3" />
                          <p className="text-sm text-[#b0aea5]">No testimonials yet. Add your first one!</p>
                        </td>
                      </tr>
                    ) : (
                      testimonials.map((t) => (
                        <tr key={t.id} className="border-b border-[#e8e6dc]/50 hover:bg-[#2DD1AC]/3 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#e8e6dc]/30 border border-[#e8e6dc]/50 flex items-center justify-center shrink-0 overflow-hidden">
                                {t.image_url ? (
                                  <img src={t.image_url} alt={t.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-sm font-bold text-[#b0aea5]">{t.name.charAt(0)}</span>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-[#2D3748]">{t.name}</div>
                                <div className="text-xs text-[#b0aea5]">{t.location}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-[#2D3748] line-clamp-2 max-w-xs">&ldquo;{t.quote}&rdquo;</p>
                          </td>
                          <td className="px-6 py-4">
                            {t.is_active ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#788c5d] bg-[#788c5d]/10 px-2.5 py-1 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#d97757] bg-[#d97757]/10 px-2.5 py-1 rounded-full">
                                <XCircle className="w-3 h-3" /> Hidden
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingTestimonial(t)}
                                className="inline-flex items-center justify-center p-2 rounded-lg bg-[#e8e6dc]/50 text-[#2D3748] hover:bg-[#2DD1AC]/10 hover:text-[#1E957A] transition-all"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTestimonial(t.id)}
                                className="inline-flex items-center justify-center p-2 rounded-lg bg-[#e8e6dc]/50 text-[#2D3748] hover:bg-red-500/10 hover:text-red-500 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* ===== GALLERY TAB ===== */}
          {activeTab === "gallery" && (
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-[#e8e6dc]/50 bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#2D3748] flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                    <Images className="w-5 h-5 text-[#2DD1AC]" />
                    Home Page Gallery ({galleryImages.length})
                  </h2>
                  <p className="text-sm text-[#b0aea5] mt-1" style={{ fontFamily: "var(--font-body)" }}>
                    Upload photos to feature on the home page gallery carousel. Inactive images are hidden from visitors.
                  </p>
                </div>
                <label className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2DD1AC] text-white font-semibold rounded-full hover:bg-[#1E957A] transition-colors shadow-sm hover:shadow-md cursor-pointer ${uploadingGallery ? "opacity-50 pointer-events-none" : ""}`} style={{ fontFamily: "var(--font-ui)" }}>
                  {uploadingGallery ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Upload Images</>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleGalleryUpload(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              {galleryImages.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <Images className="w-10 h-10 text-[#b0aea5] mx-auto mb-3" />
                  <p className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                    No gallery images yet. Upload your first photos to populate the home page gallery.
                  </p>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((img) => (
                    <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-[#e8e6dc] bg-[#faf9f5] aspect-square">
                      <img
                        src={img.image_url}
                        alt={img.alt_text || "Gallery image"}
                        className={`w-full h-full object-cover transition-opacity ${img.is_active ? "" : "opacity-40"}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 left-2">
                        {img.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#788c5d] bg-white/95 px-2 py-1 rounded-full shadow-sm">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#d97757] bg-white/95 px-2 py-1 rounded-full shadow-sm">
                            <XCircle className="w-3 h-3" /> Hidden
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleGalleryActive(img)}
                          className="p-2 rounded-lg bg-white/95 text-[#2D3748] hover:bg-[#2DD1AC] hover:text-white transition-all shadow-md"
                          title={img.is_active ? "Hide" : "Show"}
                        >
                          {img.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteGalleryImage(img)}
                          className="p-2 rounded-lg bg-white/95 text-[#2D3748] hover:bg-red-500 hover:text-white transition-all shadow-md"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== REPORTS TAB ===== */}
          {activeTab === "reports" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#2DD1AC]/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-[#2DD1AC]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>{reportTotal}</div>
                      <div className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Total Match Impressions</div>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#d97757]/10 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-[#d97757]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>{reportData.length}</div>
                      <div className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Providers in Results</div>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#6a9bcc]/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#6a9bcc]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                        {reportData.length > 0 ? reportData[0].avg_score : 0}
                      </div>
                      <div className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Top Avg Match Score</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider Engagement Table */}
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-[#e8e6dc]/50 bg-white/50">
                  <h2 className="text-xl font-bold text-[#2D3748] flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                    <BarChart3 className="w-5 h-5 text-[#2DD1AC]" />
                    Provider Engagement — Top 3 Appearances
                  </h2>
                  <p className="text-sm text-[#b0aea5] mt-1" style={{ fontFamily: "var(--font-body)" }}>
                    Shows how often each facility appears in client match results.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ fontFamily: "var(--font-ui)" }}>
                    <thead>
                      <tr className="border-b border-[#e8e6dc]">
                        <th className="text-left text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Rank</th>
                        <th className="text-left text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Facility</th>
                        <th className="text-left text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Times in Top 3</th>
                        <th className="text-left text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Avg Match Score</th>
                        <th className="text-left text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-6 py-4">Engagement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12">
                            <BarChart3 className="w-10 h-10 text-[#b0aea5] mx-auto mb-3" />
                            <p className="text-sm text-[#b0aea5]">No match data yet. Results appear when clients complete the Find a Home questionnaire.</p>
                          </td>
                        </tr>
                      ) : (
                        reportData.map((row, index) => {
                          const maxCount = reportData[0]?.impression_count || 1;
                          const barWidth = Math.round((row.impression_count / maxCount) * 100);
                          return (
                            <tr key={row.facility_id} className="border-b border-[#e8e6dc]/50 hover:bg-[#2DD1AC]/3 transition-colors">
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                  index === 0
                                    ? "bg-[#d97757]/10 text-[#d97757]"
                                    : index === 1
                                    ? "bg-[#b0aea5]/15 text-[#b0aea5]"
                                    : index === 2
                                    ? "bg-[#d97757]/5 text-[#d97757]/70"
                                    : "bg-[#e8e6dc]/30 text-[#b0aea5]"
                                }`}>
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-semibold text-[#2D3748]">{row.facility_name}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-lg font-bold text-[#2D3748]">{row.impression_count}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-semibold text-[#2DD1AC]">{row.avg_score}</span>
                              </td>
                              <td className="px-6 py-4 min-w-[180px]">
                                <div className="h-3 bg-[#e8e6dc] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/60 rounded-full transition-all duration-500"
                                    style={{ width: `${barWidth}%` }}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
      </div>
    </DashboardChrome>
  );
}
