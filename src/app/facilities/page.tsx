"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Facility } from "@/lib/types";
import FacilityCard from "@/components/facilities/FacilityCard";
import Link from "next/link";
import { Search, Building2, Home, Brain, LayoutGrid, ArrowLeft } from "lucide-react";

const CATEGORIES = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "Independent Living", label: "Independent Living", icon: Building2 },
  { key: "Assisted Living", label: "Assisted Living", icon: Home },
  { key: "Memory Care Facility", label: "Memory Care Facility", icon: Brain },
];

const LOCATION_IMAGES: Record<string, string> = {
  "manila": "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=80&h=80&fit=crop",
  "cebu": "https://images.unsplash.com/photo-1568890020845-4e9bf1a1a7be?w=80&h=80&fit=crop",
  "davao city": "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=80&h=80&fit=crop",
  "baguio": "https://images.unsplash.com/photo-1583430999185-7d47e8c1e0e2?w=80&h=80&fit=crop",
  "palawan": "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=80&h=80&fit=crop",
  "boracay island": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&h=80&fit=crop",
  "quezon city": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=80&h=80&fit=crop",
  "makati": "https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=80&h=80&fit=crop",
  "iloilo": "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=80&h=80&fit=crop",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=80&h=80&fit=crop";

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

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

  // Location counts
  const locationsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoryFiltered.forEach((f) => {
      counts[f.city] = (counts[f.city] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        image: LOCATION_IMAGES[name.toLowerCase()] || DEFAULT_IMAGE,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 9);
  }, [categoryFiltered]);

  // Filter locations by search
  const filteredLocations = useMemo(() => {
    if (!searchQuery) return locationsWithCounts;
    return locationsWithCounts.filter((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, locationsWithCounts]);

  // Sponsored facilities for selected location
  const sponsoredFacilities = useMemo(() => {
    if (!selectedLocation) return [];
    return categoryFiltered
      .filter((f) => f.city.toLowerCase() === selectedLocation.toLowerCase())
      .slice(0, 3);
  }, [selectedLocation, categoryFiltered]);

  // Facility cards: filter by location + search
  const displayedFacilities = useMemo(() => {
    let result = categoryFiltered;
    if (selectedLocation) {
      result = result.filter((f) => f.city.toLowerCase() === selectedLocation.toLowerCase());
    }
    if (searchQuery) {
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [categoryFiltered, selectedLocation, searchQuery]);

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#2D3748] hover:text-[#2DD1AC] transition-colors mb-6"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setSelectedLocation(null);
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
        <div className="mb-8">
          <div className="flex items-center gap-3 px-5 py-4 border-2 border-[#2DD1AC]/40 rounded-xl bg-white focus-within:border-[#2DD1AC] transition-colors">
            <Search className="w-5 h-5 text-[#b0aea5] shrink-0" />
            <input
              type="text"
              placeholder="Enter a location or property"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedLocation(null);
              }}
              className="flex-1 text-base text-[#2D3748] placeholder-[#b0aea5] outline-none bg-transparent"
              style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
              Loading facilities...
            </div>
          </div>
        ) : (
          <>
            {/* Sponsored Section - shows when a location is selected */}
            {selectedLocation && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                    Well-known <span className="font-semibold text-[#2D3748]">facilities</span> in {selectedLocation}
                  </p>
                  <span className="text-xs text-[#b0aea5] border border-[#e8e6dc] px-2.5 py-1 rounded-full" style={{ fontFamily: "var(--font-ui)" }}>
                    Sponsored
                  </span>
                </div>
                {sponsoredFacilities.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {sponsoredFacilities.map((facility) => (
                      <Link
                        key={facility.id}
                        href={`/facilities/${facility.id}`}
                        className="flex items-center gap-3 px-4 py-3 border border-[#e8e6dc] rounded-xl hover:border-[#2DD1AC]/30 hover:bg-[#2DD1AC]/5 transition-all min-w-[220px] bg-white"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#e8e6dc]/50 flex items-center justify-center shrink-0 overflow-hidden">
                          {facility.image_urls?.[0] ? (
                            <img src={facility.image_urls[0]} alt={facility.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-[#6a9bcc]" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#2D3748] leading-tight" style={{ fontFamily: "var(--font-ui)" }}>
                            {facility.name}
                          </p>
                          <p className="text-xs text-[#2DD1AC]" style={{ fontFamily: "var(--font-ui)" }}>
                            View Details
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#b0aea5] italic" style={{ fontFamily: "var(--font-body)" }}>
                    No sponsored facilities in this location yet.
                  </p>
                )}
              </div>
            )}

            {/* Facilities in Philippines - Location Grid */}
            <div className="mb-10">
              <p className="text-base mb-4" style={{ fontFamily: "var(--font-ui)" }}>
                <span className="font-bold text-[#2D3748]">Facilities</span>{" "}
                <span className="text-[#b0aea5] text-sm">in Philippines</span>
              </p>
              {filteredLocations.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => setSelectedLocation(selectedLocation === loc.name ? null : loc.name)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                        selectedLocation === loc.name
                          ? "bg-[#2DD1AC]/10 border border-[#2DD1AC]/30"
                          : "hover:bg-white border border-transparent hover:border-[#e8e6dc]"
                      }`}
                    >
                      <img
                        src={loc.image}
                        alt={loc.name}
                        className="w-11 h-11 rounded-lg object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#2D3748] leading-tight" style={{ fontFamily: "var(--font-ui)" }}>
                          {loc.name}
                        </p>
                        <p className="text-xs text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                          ({loc.count.toLocaleString()})
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#b0aea5] italic py-4" style={{ fontFamily: "var(--font-body)" }}>
                  No facilities found{searchQuery ? ` matching "${searchQuery}"` : ""}{activeCategory !== "all" ? ` for ${activeCategory}` : ""}.
                </p>
              )}
            </div>

            {/* Facility Cards Grid */}
            {displayedFacilities.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-base" style={{ fontFamily: "var(--font-ui)" }}>
                    <span className="font-bold text-[#2D3748]">
                      {selectedLocation ? `Facilities in ${selectedLocation}` : "All Facilities"}
                    </span>{" "}
                    <span className="text-[#b0aea5] text-sm">
                      ({displayedFacilities.length})
                    </span>
                  </p>
                  {selectedLocation && (
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="text-sm text-[#2DD1AC] hover:text-[#1E957A] font-medium transition-colors"
                      style={{ fontFamily: "var(--font-ui)" }}
                    >
                      View all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedFacilities.map((facility) => (
                    <FacilityCard key={facility.id} facility={facility} />
                  ))}
                </div>
              </div>
            )}

            {displayedFacilities.length === 0 && (
              <div className="glass-card p-12 text-center">
                <Building2 className="w-12 h-12 text-[#b0aea5] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  No Facilities Found
                </h3>
                <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-body)" }}>
                  {searchQuery || selectedLocation || activeCategory !== "all"
                    ? "Try adjusting your search or filter criteria."
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
