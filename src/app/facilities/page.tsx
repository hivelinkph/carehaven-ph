"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Facility } from "@/lib/types";
import FacilityCard from "@/components/facilities/FacilityCard";
import { PHILIPPINE_REGIONS } from "@/lib/constants";
import { Search, Building2, SlidersHorizontal } from "lucide-react";

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      let query = supabase
        .from("facilities")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });

      if (regionFilter) {
        query = query.eq("region", regionFilter);
      }

      const { data } = await query;
      setFacilities(data || []);
      setLoading(false);
    }
    load();
  }, [regionFilter]);

  const filtered = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DD1AC]/10 border border-[#2DD1AC]/20 mb-6"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <Building2 className="w-4 h-4 text-[#2DD1AC]" />
            <span className="text-sm font-medium text-[#2D3748]">Browse Facilities</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Assisted Living Facilities
          </h1>
          <p className="text-lg text-[#b0aea5] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            Discover compassionate care homes across the Philippines
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10" style={{ fontFamily: "var(--font-ui)" }}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b0aea5]" />
            <input
              type="text"
              placeholder="Search by name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#e8e6dc] rounded-xl focus:outline-none focus:border-[#2DD1AC] text-[#141413] placeholder:text-[#b0aea5] transition-all"
              style={{ fontSize: "16px" }}
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0aea5]" />
            <select
              value={regionFilter}
              onChange={(e) => { setRegionFilter(e.target.value); setLoading(true); }}
              className="w-full sm:w-64 pl-11 pr-4 py-3.5 bg-white border-2 border-[#e8e6dc] rounded-xl focus:outline-none focus:border-[#2DD1AC] text-[#141413] appearance-none cursor-pointer transition-all"
              style={{ fontSize: "16px" }}
            >
              <option value="">All Regions</option>
              {Object.entries(PHILIPPINE_REGIONS).map(([key, region]) => (
                <option key={key} value={region.name}>
                  {region.shortName} — {region.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
              Loading facilities...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Building2 className="w-12 h-12 text-[#b0aea5] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              No Facilities Found
            </h3>
            <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-body)" }}>
              {search || regionFilter
                ? "Try adjusting your search or filter criteria."
                : "Facilities will appear here once they are added to the platform."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#b0aea5] mb-6" style={{ fontFamily: "var(--font-ui)" }}>
              Showing {filtered.length} {filtered.length === 1 ? "facility" : "facilities"}
              {regionFilter && ` in ${regionFilter}`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((facility) => (
                <FacilityCard key={facility.id} facility={facility} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
