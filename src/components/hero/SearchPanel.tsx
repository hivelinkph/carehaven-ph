"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Building2,
  Home,
  Brain,
  LayoutGrid,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Facility } from "@/lib/types";

const CATEGORIES = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "Independent Living", label: "Independent Living", icon: Building2 },
  { key: "Assisted Living", label: "Assisted Living", icon: Home },
  { key: "Memory Care Facility", label: "Memory Care Facility", icon: Brain },
];

interface SearchPanelProps {
  onClose: () => void;
}

export default function SearchPanel({ onClose }: SearchPanelProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [regionOpen, setRegionOpen] = useState(false);

  useEffect(() => {
    async function fetchFacilities() {
      const supabase = createClient();
      const { data } = await supabase
        .from("facilities")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });
      setFacilities(data || []);
    }
    fetchFacilities();
  }, []);

  // Filter by category
  const categoryFiltered = useMemo(() => {
    if (activeCategory === "all") return facilities;
    return facilities.filter((f) => f.facility_types?.includes(activeCategory));
  }, [facilities, activeCategory]);

  // Unique sorted regions derived from actual data
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    categoryFiltered.forEach((f) => {
      if (f.region) set.add(f.region);
    });
    return Array.from(set).sort();
  }, [categoryFiltered]);

  // Results: text search over names OR region filter
  const results = useMemo(() => {
    let list = categoryFiltered;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.city.toLowerCase().includes(q) ||
          (f.region && f.region.toLowerCase().includes(q))
      );
    } else if (selectedRegion) {
      list = list.filter((f) => f.region === selectedRegion);
    } else {
      // Nothing typed, no region selected → show nothing yet
      return null;
    }

    return list;
  }, [categoryFiltered, searchQuery, selectedRegion]);

  const showResults = results !== null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full md:w-[55%] lg:w-[50%] z-30 flex flex-col animate-slide-in-right">
      {/* Panel */}
      <div className="h-full bg-white/95 backdrop-blur-xl shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-10 border-b border-[#e8e6dc]/50">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 px-6 lg:px-8 pt-6 pb-3 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveCategory(cat.key);
                  setSelectedRegion("");
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.key
                    ? "bg-[#2D3748] text-white"
                    : "text-[#2D3748]/60 hover:bg-[#e8e6dc]/50"
                }`}
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
            <button
              onClick={onClose}
              className="ml-auto p-2 rounded-full hover:bg-[#e8e6dc]/50 transition-colors shrink-0"
              aria-label="Close search"
            >
              <X className="w-5 h-5 text-[#2D3748]/60" />
            </button>
          </div>

          {/* Search Input */}
          <div className="px-6 lg:px-8 pb-4">
            <div className="flex items-center gap-3 px-4 py-3.5 border-2 border-[#2DD1AC]/40 rounded-xl bg-white focus-within:border-[#2DD1AC] transition-colors">
              <Search className="w-5 h-5 text-[#b0aea5] shrink-0" />
              <input
                type="text"
                placeholder="Search facilities by name or location…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedRegion(""); // clear region when typing
                }}
                className="flex-1 text-base text-[#2D3748] placeholder-[#b0aea5] outline-none bg-transparent"
                style={{ fontFamily: "var(--font-body)" }}
                autoFocus
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
        </div>

        {/* Content */}
        <div className="px-6 lg:px-8 py-5 space-y-6">
          {/* Region Dropdown */}
          {!searchQuery && (
            <div>
              <p
                className="text-base mb-3"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <span className="font-bold text-[#2D3748]">Browse</span>{" "}
                <span className="text-[#b0aea5] text-sm">
                  facilities by region
                </span>
              </p>

              {/* Custom dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRegionOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                    selectedRegion
                      ? "border-[#2DD1AC] bg-[#2DD1AC]/5"
                      : "border-[#e8e6dc] bg-white hover:border-[#2DD1AC]/50"
                  }`}
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  <span
                    className={
                      selectedRegion ? "text-[#2D3748] font-medium" : "text-[#b0aea5]"
                    }
                  >
                    {selectedRegion || "Select a region…"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#b0aea5] transition-transform ${
                      regionOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {regionOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e8e6dc] rounded-xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto">
                    {availableRegions.length === 0 ? (
                      <p
                        className="px-4 py-3 text-sm text-[#b0aea5] italic"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        No regions available.
                      </p>
                    ) : (
                      availableRegions.map((region) => {
                        const count = categoryFiltered.filter(
                          (f) => f.region === region
                        ).length;
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

          {/* Results */}
          {showResults && (
            <div>
              <p
                className="text-sm text-[#b0aea5] mb-3"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                {results!.length > 0 ? (
                  <>
                    <span className="font-semibold text-[#2D3748]">
                      {results!.length}
                    </span>{" "}
                    {results!.length === 1 ? "facility" : "facilities"} found
                    {searchQuery
                      ? ` matching "${searchQuery}"`
                      : selectedRegion
                      ? ` in ${selectedRegion}`
                      : ""}
                  </>
                ) : (
                  <span className="italic">
                    No facilities found
                    {searchQuery
                      ? ` matching "${searchQuery}"`
                      : selectedRegion
                      ? ` in ${selectedRegion}`
                      : ""}
                    .
                  </span>
                )}
              </p>

              <div className="space-y-3">
                {results!.map((facility) => (
                  <Link
                    key={facility.id}
                    href={`/facilities/${facility.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 rounded-xl border border-[#e8e6dc] hover:border-[#2DD1AC]/40 hover:bg-[#2DD1AC]/5 transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-[#e8e6dc]/50 flex items-center justify-center shrink-0 overflow-hidden">
                      {facility.image_urls?.[0] ? (
                        <img
                          src={facility.image_urls[0]}
                          alt={facility.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-[#6a9bcc]" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold text-[#2D3748] leading-tight truncate group-hover:text-[#2DD1AC] transition-colors"
                        style={{ fontFamily: "var(--font-ui)" }}
                      >
                        {facility.name}
                      </p>
                      <p
                        className="text-xs text-[#b0aea5] mt-0.5 flex items-center gap-1"
                        style={{ fontFamily: "var(--font-ui)" }}
                      >
                        <MapPin className="w-3 h-3 shrink-0" />
                        {facility.city}
                        {facility.region ? `, ${facility.region}` : ""}
                      </p>
                      {facility.facility_types?.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {facility.facility_types.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-0.5 bg-[#2DD1AC]/10 text-[#2DD1AC] rounded-full font-medium"
                              style={{ fontFamily: "var(--font-ui)" }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    {facility.rating && (
                      <div className="shrink-0 text-right">
                        <p
                          className="text-sm font-bold text-[#2D3748]"
                          style={{ fontFamily: "var(--font-ui)" }}
                        >
                          ★ {facility.rating.toFixed(1)}
                        </p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty state before any interaction */}
          {!showResults && !searchQuery && !selectedRegion && (
            <p
              className="text-sm text-[#b0aea5] italic py-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Select a region above or type a facility name to search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
