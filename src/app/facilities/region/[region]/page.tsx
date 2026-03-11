"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Facility } from "@/lib/types";
import { PHILIPPINE_REGIONS } from "@/lib/constants";
import FacilityCard from "@/components/facilities/FacilityCard";
import { ArrowLeft, MapPin } from "lucide-react";

export default function RegionFacilitiesPage() {
  const params = useParams();
  const regionId = params.region as string;
  const region = PHILIPPINE_REGIONS[regionId];
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("facilities")
        .select("*")
        .eq("region", region?.name || regionId)
        .eq("is_active", true)
        .order("rating", { ascending: false });
      setFacilities(data || []);
      setLoading(false);
    }
    load();
  }, [regionId, region?.name]);

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/facilities"
          className="inline-flex items-center gap-2 text-sm text-[#b0aea5] hover:text-[#2DD1AC] transition-colors mb-6"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <ArrowLeft className="w-4 h-4" /> All Facilities
        </Link>

        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DD1AC]/10 border border-[#2DD1AC]/20 mb-4"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <MapPin className="w-4 h-4 text-[#2DD1AC]" />
            <span className="text-sm font-medium text-[#2D3748]">{region?.shortName || regionId}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Facilities in {region?.name || regionId}
          </h1>
          {region?.majorCities && (
            <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-body)" }}>
              Covering {region.majorCities.join(", ")}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Loading...</div>
          </div>
        ) : facilities.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <MapPin className="w-12 h-12 text-[#b0aea5] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              No Facilities Yet
            </h3>
            <p className="text-[#b0aea5] mb-4" style={{ fontFamily: "var(--font-body)" }}>
              We&apos;re expanding to this region soon. Check back later or browse other regions.
            </p>
            <Link
              href="/facilities"
              className="text-sm font-semibold text-[#2DD1AC] hover:underline"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              Browse All Facilities
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((f) => (
              <FacilityCard key={f.id} facility={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
