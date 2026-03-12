"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Facility, Location } from "@/lib/types";
import {
  Building2,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2
} from "lucide-react";

export default function AdminDashboard() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      // Verify admin role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      const [facRes, locRes] = await Promise.all([
        supabase.from("facilities").select("*").order("created_at", { ascending: false }),
        supabase.from("locations").select("*").order("name", { ascending: true })
      ]);

      setFacilities(facRes.data || []);
      setLocations(locRes.data || []);
      setLoading(false);
    }
    load();
  }, [router, supabase]);

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
    if (!window.confirm("Are you sure you want to delete this location? Facilities associated with this city may need to be updated manually.")) return;

    const { error } = await supabase.from("locations").delete().eq("id", id);

    if (error) {
      alert("Failed to delete location. It might be in use.");
      console.error(error);
    } else {
      setLocations(prev => prev.filter(loc => loc.id !== id));
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
        <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-7 h-7 text-[#2DD1AC]" />
            <h1 className="text-3xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
              Admin Dashboard
            </h1>
          </div>
          <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-body)" }}>
            Manage all facility listings and provider profiles
          </p>
        </div>

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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? "bg-white text-[#2D3748] shadow-sm" : "text-[#b0aea5] hover:text-[#2D3748]"
                  }`}
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
      </div>
    </div>
  );
}
