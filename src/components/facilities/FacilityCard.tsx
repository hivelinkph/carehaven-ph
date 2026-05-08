import Link from "next/link";
import type { Facility } from "@/lib/types";
import { MapPin, Star, Users } from "lucide-react";

interface FacilityCardProps {
  facility: Facility;
}

export default function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <Link
      href={`/facilities/${facility.id}`}
      className="group editorial-card overflow-hidden hover:-translate-y-1 transition-all duration-300 block"
    >
      {/* Image */}
      <div className="aspect-[16/10] bg-gradient-to-br from-[#e8e6dc]/40 to-[#2DD1AC]/5 flex items-center justify-center relative overflow-hidden">
        {facility.image_urls && facility.image_urls[0] ? (
          <img
            src={facility.image_urls[0]}
            alt={facility.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
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
            className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <Star className="w-3.5 h-3.5 text-[#d97757]" fill="#d97757" />
            <span className="text-xs font-semibold text-[#2D3748] tabular-nums">{facility.rating}</span>
          </div>
        )}
        <div
          className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] tracking-[0.22em] uppercase"
          style={{ fontFamily: "var(--font-ui)", color: "#2D3748" }}
        >
          <MapPin className="w-3 h-3" />
          {facility.city}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3
          className="text-xl text-[#2D3748] mb-3 leading-tight group-hover:text-[#2DD1AC] transition-colors"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
        >
          {facility.name}
        </h3>

        {facility.services && facility.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {facility.services.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[11px] tracking-wide text-[#5b5851] bg-[#faf9f5] border border-[#e8e6dc]/60 px-2.5 py-1 rounded-full"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                {s}
              </span>
            ))}
            {facility.services.length > 3 && (
              <span className="text-[11px] text-[#b0aea5] italic px-2 py-1" style={{ fontFamily: "var(--font-accent)" }}>
                + {facility.services.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#e8e6dc]/60" style={{ fontFamily: "var(--font-ui)" }}>
          <span className="text-[11px] tracking-[0.18em] uppercase text-[#2DD1AC] font-medium group-hover:text-[#1E957A] transition-colors">
            View listing →
          </span>
          {facility.capacity && (
            <div className="flex items-center gap-1 text-xs text-[#b0aea5]">
              <Users className="w-3.5 h-3.5" />
              <span className="tabular-nums">{facility.capacity} beds</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
