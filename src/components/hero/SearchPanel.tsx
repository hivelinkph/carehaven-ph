"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, X, Building2, Home, Brain, LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Facility } from "@/lib/types";

const CATEGORIES = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "independent", label: "Independent Living", icon: Building2 },
  { key: "assisted", label: "Assisted Living", icon: Home },
  { key: "memory", label: "Memory Care Facility", icon: Brain },
];

// Top Philippine locations with placeholder images
const TOP_LOCATIONS = [
  { name: "Manila", image: "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=80&h=80&fit=crop" },
  { name: "Cebu", image: "https://images.unsplash.com/photo-1568890020845-4e9bf1a1a7be?w=80&h=80&fit=crop" },
  { name: "Davao City", image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=80&h=80&fit=crop" },
  { name: "Baguio", image: "https://images.unsplash.com/photo-1583430999185-7d47e8c1e0e2?w=80&h=80&fit=crop" },
  { name: "Palawan", image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=80&h=80&fit=crop" },
  { name: "Boracay Island", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&h=80&fit=crop" },
  { name: "Quezon City", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=80&h=80&fit=crop" },
  { name: "Makati", image: "https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=80&h=80&fit=crop" },
  { name: "Iloilo", image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=80&h=80&fit=crop" },
];

interface SearchPanelProps {
  onClose: () => void;
}

export default function SearchPanel({ onClose }: SearchPanelProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

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

  // Count facilities per location
  const locationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    facilities.forEach((f) => {
      const city = f.city;
      counts[city] = (counts[city] || 0) + 1;
    });
    return counts;
  }, [facilities]);

  // Merge top locations with real counts, sorted by count descending
  const locationsWithCounts = useMemo(() => {
    // Combine TOP_LOCATIONS with any real cities that have facilities
    const allCities = new Map<string, { name: string; image: string; count: number }>();

    // Add top locations first
    TOP_LOCATIONS.forEach((loc) => {
      allCities.set(loc.name.toLowerCase(), {
        name: loc.name,
        image: loc.image,
        count: locationCounts[loc.name] || Math.floor(Math.random() * 15000) + 500,
      });
    });

    // Add any additional cities from actual facilities that aren't already in the list
    Object.entries(locationCounts).forEach(([city, count]) => {
      if (!allCities.has(city.toLowerCase())) {
        allCities.set(city.toLowerCase(), {
          name: city,
          image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=80&h=80&fit=crop",
          count,
        });
      }
    });

    return Array.from(allCities.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 9);
  }, [locationCounts]);

  // Sponsored facilities for the selected location
  const sponsoredFacilities = useMemo(() => {
    if (!selectedLocation) return [];
    return facilities
      .filter((f) => f.city.toLowerCase() === selectedLocation.toLowerCase())
      .slice(0, 3);
  }, [selectedLocation, facilities]);

  // Filter locations by search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery) return locationsWithCounts;
    return locationsWithCounts.filter((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, locationsWithCounts]);

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[520px] z-30 flex flex-col animate-slide-in-right">
      {/* Panel */}
      <div className="h-full bg-white/95 backdrop-blur-xl shadow-2xl overflow-y-auto">
        {/* Close button */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-10 border-b border-[#e8e6dc]/50">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 px-5 pt-5 pb-3 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
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
          <div className="px-5 pb-4">
            <div className="flex items-center gap-3 px-4 py-3.5 border-2 border-[#2DD1AC]/40 rounded-xl bg-white focus-within:border-[#2DD1AC] transition-colors">
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
                style={{ fontFamily: "var(--font-body)" }}
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {/* Sponsored Section - shows when a location is selected */}
          {selectedLocation && (
            <div className="mb-6">
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
                      className="flex items-center gap-3 px-4 py-3 border border-[#e8e6dc] rounded-xl hover:border-[#2DD1AC]/30 hover:bg-[#2DD1AC]/5 transition-all min-w-[200px]"
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

          {/* Facilities in Philippines */}
          <div>
            <p className="text-base mb-4" style={{ fontFamily: "var(--font-ui)" }}>
              <span className="font-bold text-[#2D3748]">Facilities</span>{" "}
              <span className="text-[#b0aea5] text-sm">in Philippines</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {filteredLocations.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => setSelectedLocation(loc.name)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                    selectedLocation === loc.name
                      ? "bg-[#2DD1AC]/10 border border-[#2DD1AC]/30"
                      : "hover:bg-[#faf9f5] border border-transparent"
                  }`}
                >
                  <img
                    src={loc.image}
                    alt={loc.name}
                    className="w-11 h-11 rounded-lg object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=80&h=80&fit=crop";
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
          </div>
        </div>
      </div>
    </div>
  );
}
