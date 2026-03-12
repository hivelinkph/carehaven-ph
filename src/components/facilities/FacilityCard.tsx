import Link from "next/link";
import type { Facility } from "@/lib/types";
import { MapPin, Star, Users, ChevronRight } from "lucide-react";

interface FacilityCardProps {
  facility: Facility;
}

export default function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <Link
      href={`/facilities/${facility.id}`}
      className="group bg-white rounded-2xl border border-[#e8e6dc]/50 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-[16/10] bg-gradient-to-br from-[#e8e6dc]/40 to-[#2DD1AC]/5 flex items-center justify-center relative overflow-hidden">
        {facility.image_urls && facility.image_urls[0] ? (
          <img
            src={facility.image_urls[0]}
            alt={facility.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // If image fails to load, hide it and show placeholder
              const target = e.currentTarget;
              target.style.display = "none";
              const placeholder = target.nextElementSibling as HTMLElement;
              if (placeholder) placeholder.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="text-center p-4 flex-col items-center justify-center"
          style={{ display: facility.image_urls && facility.image_urls[0] ? "none" : "flex" }}
        >
          <div className="w-12 h-12 rounded-xl bg-[#2DD1AC]/10 flex items-center justify-center mx-auto mb-2">
            <MapPin className="w-6 h-6 text-[#2DD1AC]" />
          </div>
          <p className="text-xs text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Facility Image</p>
        </div>
        {facility.rating && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <Star className="w-3.5 h-3.5 text-[#d97757]" fill="#d97757" />
            <span className="text-xs font-semibold text-[#2D3748]">{facility.rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="text-lg font-bold text-[#2D3748] mb-1 group-hover:text-[#2DD1AC] transition-colors"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {facility.name}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-[#b0aea5] mb-3" style={{ fontFamily: "var(--font-ui)" }}>
          <MapPin className="w-3.5 h-3.5" />
          {facility.city}
        </div>

        {facility.services && facility.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {facility.services.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-xs text-[#2D3748] bg-[#e8e6dc]/40 px-2 py-1 rounded-full"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                {s}
              </span>
            ))}
            {facility.services.length > 3 && (
              <span className="text-xs text-[#b0aea5] px-2 py-1" style={{ fontFamily: "var(--font-ui)" }}>
                +{facility.services.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#e8e6dc]/40" style={{ fontFamily: "var(--font-ui)" }}>
          <div className="text-sm">
            {facility.price_range_min && facility.price_range_max ? (
              <span className="font-semibold text-[#2D3748]">
                ₱{facility.price_range_min.toLocaleString()} - ₱{facility.price_range_max.toLocaleString()}
                <span className="text-xs font-normal text-[#b0aea5]">/mo</span>
              </span>
            ) : (
              <span className="text-[#b0aea5]">Contact for pricing</span>
            )}
          </div>
          {facility.capacity && (
            <div className="flex items-center gap-1 text-xs text-[#b0aea5]">
              <Users className="w-3.5 h-3.5" />
              {facility.capacity} beds
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
