"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Facility } from "@/lib/types";
import FacilityCard from "@/components/facilities/FacilityCard";
import Link from "next/link";
import {
  Search,
  Building2,
  Home,
  Brain,
  LayoutGrid,
  ArrowLeft,
  ChevronDown,
  MapPin,
  X,
} from "lucide-react";

const CATEGORIES = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "Independent Living", label: "Independent Living", icon: Building2 },
  { key: "Assisted Living", label: "Assisted Living", icon: Home },
  { key: "Memory Care Facility", label: "Memory Care Facility", icon: Brain },
];

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [regionOpen, setRegionOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("facilities")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });
      setFacilities(data || []);
      setLoading(false);
    }
    load();
  }, []);

  // Filter by category
  const categoryFiltered = useMemo(() => {
    if (activeCategory === "all") return facilities;
    return facilities.filter((f) => f.facility_types?.includes(activeCategory));
  }, [facilities, activeCategory]);

  // Unique sorted regions from actual data
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    categoryFiltered.forEach((f) => {
      if (f.region) set.add(f.region);
    });
    return Array.from(set).sort();
  }, [categoryFiltered]);

  // Final displayed facilities: search by name/city/region OR filter by region
  const displayedFacilities = useMemo(() => {
    let result = categoryFiltered;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.city.toLowerCase().includes(q) ||
          (f.region && f.region.toLowerCase().includes(q))
      );
    } else if (selectedRegion) {
      result = result.filter((f) => f.region === selectedRegion);
    }

    return result;
  }, [categoryFiltered, searchQuery, selectedRegion]);

  const hasFilter = !!searchQuery.trim() || !!selectedRegion;

  return (
    <div className="min-h-screen pt-16 pb-12 relative" style={{ background: "var(--d-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[12.5px] font-medium mb-10 transition-colors"
          style={{ fontFamily: "var(--font-ui)", color: "var(--d-ink-soft)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>

        {/* Header */}
        <header className="mb-10 max-w-3xl">
          <span className="section-eyebrow mb-5">Browse facilities</span>
          <h1
            className="mt-4 text-4xl sm:text-5xl lg:text-6xl leading-[1.05]"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--d-ink)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Find a senior-living home, your way.
          </h1>
          <p
            className="mt-5 text-[16px] leading-relaxed"
            style={{ fontFamily: "var(--font-body)", color: "var(--d-ink-soft)" }}
          >
            Browse by region, filter by level of care, or search by name. Every
            listing is reviewed before it appears here.
          </p>
        </header>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setSelectedRegion("");
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.key
                  ? "bg-[#2D3748] text-white"
                  : "text-[#2D3748]/60 hover:bg-[#e8e6dc]/50"
              }`}
              style={{ fontFamily: "var(--font-ui)" }}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="mb-5">
          <div className="flex items-center gap-3 px-5 py-4 border-2 border-[#2DD1AC]/40 rounded-xl bg-white focus-within:border-[#2DD1AC] transition-colors">
            <Search className="w-5 h-5 text-[#b0aea5] shrink-0" />
            <input
              type="text"
              placeholder="Search facilities by name, city, or region…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedRegion(""); // clear region filter when typing
              }}
              className="flex-1 text-base text-[#2D3748] placeholder-[#b0aea5] outline-none bg-transparent"
              style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[#b0aea5] hover:text-[#2D3748] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Region Dropdown */}
        {!searchQuery && (
          <div className="mb-8">
            <p className="text-base mb-3" style={{ fontFamily: "var(--font-ui)" }}>
              <span className="font-bold text-[#2D3748]">Browse</span>{" "}
              <span className="text-[#b0aea5] text-sm">facilities by region</span>
            </p>

            <div className="relative max-w-sm">
              <button
                onClick={() => setRegionOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                  selectedRegion
                    ? "border-[#2DD1AC] bg-[#2DD1AC]/5"
                    : "border-[#e8e6dc] bg-white hover:border-[#2DD1AC]/50"
                }`}
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <span className={selectedRegion ? "text-[#2D3748] font-medium" : "text-[#b0aea5]"}>
                  {selectedRegion || "Select a region…"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#b0aea5] transition-transform ${
                    regionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {regionOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e8e6dc] rounded-xl shadow-xl z-20 overflow-hidden max-h-72 overflow-y-auto">
                  {/* Clear option */}
                  {selectedRegion && (
                    <button
                      onClick={() => {
                        setSelectedRegion("");
                        setRegionOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm text-[#b0aea5] hover:bg-[#faf9f5] border-b border-[#e8e6dc]/50 italic"
                      style={{ fontFamily: "var(--font-ui)" }}
                    >
                      <X className="w-3.5 h-3.5" /> Clear selection
                    </button>
                  )}
                  {availableRegions.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-[#b0aea5] italic" style={{ fontFamily: "var(--font-body)" }}>
                      No regions available.
                    </p>
                  ) : (
                    availableRegions.map((region) => {
                      const count = categoryFiltered.filter((f) => f.region === region).length;
                      return (
                        <button
                          key={region}
                          onClick={() => {
                            setSelectedRegion(region);
                            setRegionOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#faf9f5] transition-colors border-b border-[#e8e6dc]/50 last:border-0 ${
                            selectedRegion === region
                              ? "bg-[#2DD1AC]/10 text-[#2DD1AC] font-semibold"
                              : "text-[#2D3748]"
                          }`}
                          style={{ fontFamily: "var(--font-ui)" }}
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#2DD1AC] shrink-0" />
                            {region}
                          </span>
                          <span className="text-xs text-[#b0aea5]">
                            {count} {count === 1 ? "facility" : "facilities"}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
              Loading facilities...
            </div>
          </div>
        ) : (
          <>
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-base" style={{ fontFamily: "var(--font-ui)" }}>
                <span className="font-bold text-[#2D3748]">
                  {hasFilter
                    ? searchQuery
                      ? `Results for "${searchQuery}"`
                      : `Facilities in ${selectedRegion}`
                    : "All Facilities"}
                </span>{" "}
                <span className="text-[#b0aea5] text-sm">({displayedFacilities.length})</span>
              </p>
              {(selectedRegion) && (
                <button
                  onClick={() => setSelectedRegion("")}
                  className="text-sm text-[#2DD1AC] hover:text-[#1E957A] font-medium transition-colors flex items-center gap-1"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  <X className="w-3.5 h-3.5" /> Clear filter
                </button>
              )}
            </div>

            {/* Facility Cards Grid */}
            {displayedFacilities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedFacilities.map((facility) => (
                  <FacilityCard key={facility.id} facility={facility} />
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Building2 className="w-12 h-12 text-[#b0aea5] mx-auto mb-4" />
                <h3
                  className="text-xl font-bold text-[#2D3748] mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  No Facilities Found
                </h3>
                <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-body)" }}>
                  {hasFilter
                    ? "Try adjusting your search or selecting a different region."
                    : "Facilities will appear here once they are added to the platform."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
