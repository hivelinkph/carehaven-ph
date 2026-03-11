"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Building2, ChevronRight, Heart, Star } from "lucide-react";
import Link from "next/link";
import { PHILIPPINE_REGIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { Facility } from "@/lib/types";
import { latLngToSvg } from "@/lib/mapUtils";

// Build all location options from region major cities
const ALL_LOCATIONS = Object.entries(PHILIPPINE_REGIONS)
  .flatMap(([regionId, region]) =>
    region.majorCities.map((city) => ({ city, regionId, regionName: region.name }))
  )
  .sort((a, b) => a.city.localeCompare(b.city));

export default function PhilippineMap() {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [hoveredFacilityId, setHoveredFacilityId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  // Facilities that have valid coordinates for map rendering
  const mappableFacilities = facilities.filter(
    (f) => f.latitude != null && f.longitude != null && f.is_active
  );

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

  // Filter facilities when location changes
  useEffect(() => {
    if (!selectedLocation) {
      setFilteredFacilities(facilities);
      return;
    }

    const loc = ALL_LOCATIONS.find((l) => l.city === selectedLocation);
    if (loc) {
      const filtered = facilities.filter(
        (f) => f.city.toLowerCase() === loc.city.toLowerCase() || f.region === loc.regionName
      );
      setFilteredFacilities(filtered);
    }
  }, [selectedLocation, facilities]);

  // Filter by clicked facility's region
  useEffect(() => {
    if (!selectedFacilityId) return;
    const facility = facilities.find((f) => f.id === selectedFacilityId);
    if (facility && !selectedLocation) {
      const filtered = facilities.filter((f) => f.region === facility.region);
      setFilteredFacilities(filtered);
    }
  }, [selectedFacilityId, facilities, selectedLocation]);

  function handleFacilityClick(facility: Facility) {
    setSelectedFacilityId(facility.id);
    setSelectedLocation("");

    // Scroll the facility into view in the right panel
    setTimeout(() => {
      const el = document.getElementById(`facility-${facility.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }

  function handleLocationChange(city: string) {
    setSelectedLocation(city);
    setSelectedFacilityId(null);
    if (!city) {
      setFilteredFacilities(facilities);
    }
  }

  function handleClearSelection() {
    setSelectedFacilityId(null);
    setSelectedLocation("");
    setFilteredFacilities(facilities);
  }

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);
  const regionLabel = selectedFacility?.region || (selectedLocation ? ALL_LOCATIONS.find((l) => l.city === selectedLocation)?.regionName : null);

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

                {/* Facility Heart Markers */}
                {mappableFacilities.map((facility) => {
                  const pos = latLngToSvg(facility.latitude!, facility.longitude!);
                  const isSelected = selectedFacilityId === facility.id;
                  const isHovered = hoveredFacilityId === facility.id;
                  const label = facility.name;

                  return (
                    <g
                      key={facility.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredFacilityId(facility.id)}
                      onMouseLeave={() => setHoveredFacilityId(null)}
                      onClick={() => handleFacilityClick(facility)}
                    >
                      {/* Glowing pulse for hover/active */}
                      {(isHovered || isSelected) && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isSelected ? 24 : 18}
                          fill="#ff0000"
                          opacity={isSelected ? 0.25 : 0.15}
                          className="animate-pulse"
                        />
                      )}

                      {/* Heart Marker */}
                      <g
                        transform={`translate(${pos.x - 12}, ${pos.y - 12})`}
                        style={{
                          filter: isSelected
                            ? "drop-shadow(0 0 12px rgba(255, 0, 0, 0.9))"
                            : "drop-shadow(0 0 5px rgba(255, 0, 0, 0.5))",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <Heart
                          width={24}
                          height={24}
                          color="white"
                          fill={isSelected ? "#ff0000" : "rgba(255, 0, 0, 0.85)"}
                          strokeWidth={1.5}
                          className={
                            isSelected
                              ? "scale-125 transition-transform"
                              : "scale-100 transition-transform hover:scale-110"
                          }
                        />
                      </g>

                      {/* Label on hover */}
                      {isHovered && (
                        <g className="animate-fade-in">
                          <rect
                            x={pos.x + 12}
                            y={pos.y - 14}
                            width={Math.min(label.length * 7 + 20, 200)}
                            height={24}
                            rx="6"
                            fill="#2D3748"
                            opacity="0.9"
                          />
                          <text
                            x={pos.x + 22}
                            y={pos.y + 2}
                            fill="white"
                            fontSize="11"
                            fontFamily="var(--font-ui)"
                            fontWeight="500"
                          >
                            {label.length > 24 ? label.slice(0, 22) + "…" : label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Facility count badge */}
              <div
                className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-[#e8e6dc]/50 text-xs font-medium text-[#2D3748]"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <Heart className="w-3 h-3 inline text-red-500 mr-1" fill="red" />
                {mappableFacilities.length} {mappableFacilities.length === 1 ? "location" : "locations"} on map
              </div>
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

              {/* Region / selection info badge */}
              {regionLabel && (
                <div className="flex items-center justify-between mb-4 px-3 py-2 bg-[#2DD1AC]/5 rounded-xl border border-[#2DD1AC]/15">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#2DD1AC]" />
                    <span className="text-sm font-semibold text-[#2D3748]" style={{ fontFamily: "var(--font-ui)" }}>
                      {regionLabel}
                    </span>
                  </div>
                  <button
                    onClick={handleClearSelection}
                    className="text-xs font-medium text-[#b0aea5] hover:text-[#2D3748] transition-colors"
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Facility Rankings List */}
              <div>
                <h3
                  className="text-lg font-bold text-[#2D3748] mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {regionLabel ? "Regional" : "National"} Rankings
                </h3>
                <p className="text-xs text-[#b0aea5] mb-4" style={{ fontFamily: "var(--font-ui)" }}>
                  {regionLabel
                    ? `Facilities in ${regionLabel} sorted alphabetically`
                    : "Top facilities across all regions"}
                </p>

                <div ref={listRef} className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
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
                        id={`facility-${facility.id}`}
                        href={`/facilities/${facility.id}`}
                        className={`flex items-center gap-4 p-3 rounded-xl border transition-all group ${selectedFacilityId === facility.id
                          ? "bg-[#2DD1AC]/10 border-[#2DD1AC]/30"
                          : "hover:bg-[#2DD1AC]/5 border-transparent hover:border-[#2DD1AC]/15"
                          }`}
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
                    href="/facilities"
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
