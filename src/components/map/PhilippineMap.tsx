"use client";

import { useState, useEffect } from "react";
import { MapPin, Building2, ChevronRight, Heart, Star } from "lucide-react";
import Link from "next/link";
import { PHILIPPINE_REGIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { Facility } from "@/lib/types";

interface RegionData {
  id: string;
  name: string;
  shortName: string;
  majorCities: string[];
  facilityCount: number;
  cx: number;
  cy: number;
}

const REGION_MARKERS: RegionData[] = [
  { id: "ncr", ...PHILIPPINE_REGIONS["ncr"], facilityCount: 28, cx: 248, cy: 308 },
  { id: "car", ...PHILIPPINE_REGIONS["car"], facilityCount: 5, cx: 240, cy: 220 },
  { id: "region-1", ...PHILIPPINE_REGIONS["region-1"], facilityCount: 8, cx: 210, cy: 248 },
  { id: "region-2", ...PHILIPPINE_REGIONS["region-2"], facilityCount: 4, cx: 275, cy: 235 },
  { id: "region-3", ...PHILIPPINE_REGIONS["region-3"], facilityCount: 12, cx: 235, cy: 285 },
  { id: "region-4a", ...PHILIPPINE_REGIONS["region-4a"], facilityCount: 15, cx: 260, cy: 335 },
  { id: "region-4b", ...PHILIPPINE_REGIONS["region-4b"], facilityCount: 3, cx: 195, cy: 380 },
  { id: "region-5", ...PHILIPPINE_REGIONS["region-5"], facilityCount: 6, cx: 305, cy: 370 },
  { id: "region-6", ...PHILIPPINE_REGIONS["region-6"], facilityCount: 10, cx: 225, cy: 450 },
  { id: "region-7", ...PHILIPPINE_REGIONS["region-7"], facilityCount: 14, cx: 290, cy: 460 },
  { id: "region-8", ...PHILIPPINE_REGIONS["region-8"], facilityCount: 5, cx: 340, cy: 440 },
  { id: "region-9", ...PHILIPPINE_REGIONS["region-9"], facilityCount: 4, cx: 195, cy: 560 },
  { id: "region-10", ...PHILIPPINE_REGIONS["region-10"], facilityCount: 8, cx: 270, cy: 530 },
  { id: "region-11", ...PHILIPPINE_REGIONS["region-11"], facilityCount: 11, cx: 310, cy: 570 },
  { id: "region-12", ...PHILIPPINE_REGIONS["region-12"], facilityCount: 6, cx: 270, cy: 580 },
  { id: "region-13", ...PHILIPPINE_REGIONS["region-13"], facilityCount: 4, cx: 330, cy: 520 },
  { id: "barmm", ...PHILIPPINE_REGIONS["barmm"], facilityCount: 2, cx: 235, cy: 540 },
];

// Build all location options from region major cities
const ALL_LOCATIONS = Object.entries(PHILIPPINE_REGIONS)
  .flatMap(([regionId, region]) =>
    region.majorCities.map((city) => ({ city, regionId, regionName: region.name }))
  )
  .sort((a, b) => a.city.localeCompare(b.city));

export default function PhilippineMap() {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all active facilities on mount
  useEffect(() => {
    async function fetchFacilities() {
      const supabase = createClient();
      const { data } = await supabase
        .from("facilities")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      setFacilities(data || []);
      setFilteredFacilities(data || []);
    }
    fetchFacilities();
  }, []);

  // Filter facilities when region or location changes
  useEffect(() => {
    if (!selectedRegion && !selectedLocation) {
      setFilteredFacilities(facilities);
      return;
    }

    let filtered = facilities;

    if (selectedLocation) {
      const loc = ALL_LOCATIONS.find((l) => l.city === selectedLocation);
      if (loc) {
        filtered = facilities.filter(
          (f) => f.city.toLowerCase() === loc.city.toLowerCase() || f.region === loc.regionName
        );
        // Also highlight the matching region on the map
        const matchingRegion = REGION_MARKERS.find((r) => r.id === loc.regionId);
        if (matchingRegion && selectedRegion?.id !== matchingRegion.id) {
          setSelectedRegion(matchingRegion);
        }
      }
    } else if (selectedRegion) {
      filtered = facilities.filter((f) => f.region === selectedRegion.name);
    }

    setFilteredFacilities(filtered);
  }, [selectedRegion, selectedLocation, facilities]);

  function handleRegionClick(region: RegionData) {
    setSelectedRegion(region);
    setSelectedLocation(""); // clear dropdown when clicking map
  }

  function handleLocationChange(city: string) {
    setSelectedLocation(city);
    if (!city) {
      setSelectedRegion(null);
    }
  }

  return (
    <section id="facilities-map" className="py-20 lg:py-28 bg-[#faf9f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DD1AC]/10 border border-[#2DD1AC]/20 mb-6"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <MapPin className="w-4 h-4 text-[#2DD1AC]" />
            <span className="text-sm font-medium text-[#2D3748]">Browse by Location</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Find Care Across the{" "}
            <span className="text-[#2DD1AC]">Philippines</span>
          </h2>
          <p
            className="text-lg text-[#b0aea5] max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Click a heart on the map or choose a location from the dropdown
          </p>
        </div>

        {/* Map + Facility List Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Map */}
          <div className="lg:col-span-3 relative">
            <div className="relative bg-gradient-to-b from-[#e8e6dc]/30 to-[#faf9f5] rounded-3xl p-8 border border-[#e8e6dc]/50">
              <svg
                viewBox="0 0 500 700"
                className="w-full max-w-md mx-auto"
                style={{ filter: "drop-shadow(0 4px 12px rgba(45, 55, 72, 0.08))" }}
              >
                {/* Map Image */}
                <image
                  href="/assets/maps/ph_map.png"
                  x="0"
                  y="0"
                  width="500"
                  height="700"
                  preserveAspectRatio="xMidYMid contain"
                  opacity="0.9"
                  style={{ filter: "drop-shadow(0 4px 12px rgba(45, 55, 72, 0.15))" }}
                />

                {/* Region Markers */}
                {REGION_MARKERS.map((region) => (
                  <g
                    key={region.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredRegion(region.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() => handleRegionClick(region)}
                  >
                    {/* Glowing pulse for hover/active */}
                    {(hoveredRegion === region.id || selectedRegion?.id === region.id) && (
                      <circle
                        cx={region.cx}
                        cy={region.cy}
                        r={selectedRegion?.id === region.id ? 24 : 18}
                        fill="#ff0000"
                        opacity={selectedRegion?.id === region.id ? 0.25 : 0.15}
                        className="animate-pulse"
                      />
                    )}

                    {/* Heart Marker */}
                    <g
                      transform={`translate(${region.cx - 12}, ${region.cy - 12})`}
                      style={{
                        filter: selectedRegion?.id === region.id
                          ? "drop-shadow(0 0 12px rgba(255, 0, 0, 0.9))"
                          : "drop-shadow(0 0 5px rgba(255, 0, 0, 0.5))",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Heart
                        width={24}
                        height={24}
                        color="white"
                        fill={selectedRegion?.id === region.id ? "#ff0000" : "rgba(255, 0, 0, 0.85)"}
                        strokeWidth={1.5}
                        className={
                          selectedRegion?.id === region.id
                            ? "scale-125 transition-transform"
                            : "scale-100 transition-transform hover:scale-110"
                        }
                      />
                    </g>

                    {/* Label on hover */}
                    {hoveredRegion === region.id && (
                      <g className="animate-fade-in">
                        <rect
                          x={region.cx + 12}
                          y={region.cy - 14}
                          width={region.shortName.length * 8 + 20}
                          height={24}
                          rx="6"
                          fill="#2D3748"
                          opacity="0.9"
                        />
                        <text
                          x={region.cx + 22}
                          y={region.cy + 2}
                          fill="white"
                          fontSize="11"
                          fontFamily="var(--font-ui)"
                          fontWeight="500"
                        >
                          {region.shortName}
                        </text>
                      </g>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Right Panel: Dropdown + Facility List */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 sticky top-24">
              {/* Location Dropdown */}
              <div className="mb-6" style={{ fontFamily: "var(--font-ui)" }}>
                <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                  Select Location...
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-[#e8e6dc] rounded-xl text-[#141413] focus:outline-none focus:border-[#2DD1AC] transition-all cursor-pointer appearance-none"
                  style={{ fontSize: "16px" }}
                >
                  <option value="">All Locations</option>
                  {ALL_LOCATIONS.map((loc) => (
                    <option key={`${loc.city}-${loc.regionId}`} value={loc.city}>
                      {loc.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region info badge */}
              {selectedRegion && (
                <div className="flex items-center justify-between mb-4 px-3 py-2 bg-[#2DD1AC]/5 rounded-xl border border-[#2DD1AC]/15">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#2DD1AC]" />
                    <span className="text-sm font-semibold text-[#2D3748]" style={{ fontFamily: "var(--font-ui)" }}>
                      {selectedRegion.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#2DD1AC]" style={{ fontFamily: "var(--font-ui)" }}>
                    {filteredFacilities.length} {filteredFacilities.length === 1 ? "facility" : "facilities"}
                  </span>
                </div>
              )}

              {/* Facility Rankings List */}
              <div>
                <h3
                  className="text-lg font-bold text-[#2D3748] mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {selectedRegion ? "Regional" : "National"} Rankings
                </h3>
                <p className="text-xs text-[#b0aea5] mb-4" style={{ fontFamily: "var(--font-ui)" }}>
                  {selectedRegion
                    ? `Facilities in ${selectedRegion.shortName} sorted alphabetically`
                    : "Top facilities across all regions"}
                </p>

                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {filteredFacilities.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="w-10 h-10 text-[#b0aea5] mx-auto mb-3" />
                      <p className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                        {facilities.length === 0
                          ? "No facilities listed yet"
                          : "No facilities in this location"}
                      </p>
                    </div>
                  ) : (
                    filteredFacilities.map((facility, index) => (
                      <Link
                        key={facility.id}
                        href={`/facilities/${facility.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#2DD1AC]/5 border border-transparent hover:border-[#2DD1AC]/15 transition-all group"
                      >
                        {/* Rank Number */}
                        <span
                          className="text-2xl font-bold text-[#2DD1AC] w-8 text-right shrink-0"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {index + 1}
                        </span>

                        {/* Facility Info */}
                        <div className="flex-1 min-w-0">
                          <h4
                            className="text-sm font-bold text-[#2D3748] truncate group-hover:text-[#2DD1AC] transition-colors"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {facility.name}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                            <MapPin className="w-3 h-3" />
                            {facility.city}
                          </div>
                        </div>

                        {/* Rating */}
                        {facility.rating ? (
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-[#d97757]" fill="#d97757" />
                              <span
                                className="text-lg font-bold text-[#2DD1AC]"
                                style={{ fontFamily: "var(--font-heading)" }}
                              >
                                {facility.rating}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#b0aea5] uppercase tracking-wider" style={{ fontFamily: "var(--font-ui)" }}>
                              Score
                            </span>
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#b0aea5] group-hover:text-[#2DD1AC] shrink-0" />
                        )}
                      </Link>
                    ))
                  )}
                </div>

                {/* View All Link */}
                {filteredFacilities.length > 0 && (
                  <Link
                    href={selectedRegion ? `/facilities/region/${selectedRegion.id}` : "/facilities"}
                    className="flex items-center justify-center gap-2 w-full mt-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/85 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all"
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    View All Facilities
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
