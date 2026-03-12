"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Facility } from "@/lib/types";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Users,
  CheckCircle2,
  Building2,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  MessageCircle,
  Send,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

export default function FacilityDetailPage() {
  const params = useParams();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("facilities")
        .select("*")
        .eq("id", params.id)
        .single();
      setFacility(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
        <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Loading facility...</div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-[#b0aea5] mx-auto mb-4" />
          <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Facility not found</p>
          <Link href="/facilities" className="text-[#2DD1AC] text-sm font-semibold mt-2 block" style={{ fontFamily: "var(--font-ui)" }}>
            Browse all facilities
          </Link>
        </div>
      </div>
    );
  }

  const hasImages = facility.image_urls && facility.image_urls.length > 0;
  const hasVideos = facility.video_urls && facility.video_urls.length > 0;

  function prevImage() {
    if (!facility?.image_urls) return;
    setActiveImageIndex((prev) => (prev === 0 ? facility.image_urls.length - 1 : prev - 1));
  }

  function nextImage() {
    if (!facility?.image_urls) return;
    setActiveImageIndex((prev) => (prev === facility.image_urls.length - 1 ? 0 : prev + 1));
  }

  function getYouTubeEmbedUrl(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/facilities"
          className="inline-flex items-center gap-2 text-sm text-[#b0aea5] hover:text-[#2DD1AC] transition-colors mb-6"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Facilities
        </Link>

        {/* Photo Gallery */}
        <div className="mb-8">
          {hasImages ? (
            <div className="relative">
              <div className="aspect-[21/9] rounded-3xl overflow-hidden border border-[#e8e6dc]/50 bg-gradient-to-br from-[#e8e6dc]/40 to-[#2DD1AC]/5">
                <img
                  src={facility.image_urls[activeImageIndex]}
                  alt={`${facility.name} - Photo ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {facility.image_urls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#2D3748]" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-[#2D3748]" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {facility.image_urls.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === activeImageIndex ? "bg-white w-6" : "bg-white/50"
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {facility.image_urls.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {facility.image_urls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${i === activeImageIndex ? "border-[#2DD1AC] opacity-100" : "border-transparent opacity-60 hover:opacity-80"
                        }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[21/9] rounded-3xl bg-gradient-to-br from-[#e8e6dc]/40 to-[#2DD1AC]/5 border border-[#e8e6dc]/50 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-[#b0aea5]" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    {facility.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {facility.city}
                    </span>
                    {facility.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#d97757]" fill="#d97757" />
                        {facility.rating}
                      </span>
                    )}
                    {facility.capacity && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {facility.capacity} beds
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {facility.description && (
                <p className="text-[#2D3748] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  {facility.description}
                </p>
              )}
            </div>

            {/* Video Gallery */}
            {hasVideos && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                  Videos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {facility.video_urls.map((url, i) => {
                    const embedUrl = getYouTubeEmbedUrl(url);
                    return (
                      <div key={i}>
                        {embedUrl ? (
                          <div className="aspect-video rounded-xl overflow-hidden border border-[#e8e6dc]">
                            <iframe
                              src={embedUrl}
                              title={`Video ${i + 1}`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowVideoModal(url)}
                            className="w-full aspect-video rounded-xl bg-[#2D3748] flex items-center justify-center group border border-[#e8e6dc]"
                          >
                            <Play className="w-12 h-12 text-white/80 group-hover:text-white group-hover:scale-110 transition-all" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Services */}
            {facility.services && facility.services.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                  Services
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {facility.services.map((service) => (
                    <div key={service} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2DD1AC] shrink-0" />
                      <span className="text-sm text-[#2D3748]" style={{ fontFamily: "var(--font-ui)" }}>{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {facility.amenities && facility.amenities.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {facility.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="text-sm text-[#2D3748] bg-[#e8e6dc]/40 px-3 py-1.5 rounded-full"
                      style={{ fontFamily: "var(--font-ui)" }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Pricing
              </h3>
              {facility.price_range_min && facility.price_range_max ? (
                <div className="mb-4">
                  <div className="text-2xl font-bold text-[#2DD1AC]" style={{ fontFamily: "var(--font-heading)" }}>
                    ₱{facility.price_range_min.toLocaleString()} - ₱{facility.price_range_max.toLocaleString()}
                  </div>
                  <div className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>per month</div>
                </div>
              ) : (
                <p className="text-[#b0aea5] mb-4" style={{ fontFamily: "var(--font-ui)" }}>Contact for pricing</p>
              )}
              <Link
                href="/auth/signup"
                className="block w-full text-center py-3 text-sm font-semibold text-white bg-[#2DD1AC] rounded-xl hover:bg-[#2DD1AC]/90 transition-all"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                Inquire Now
              </Link>
            </div>

            {/* Contact Card */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Contact
              </h3>
              <div className="space-y-3 text-sm" style={{ fontFamily: "var(--font-ui)" }}>
                {facility.address && (
                  <div className="flex items-start gap-3 text-[#2D3748]">
                    <MapPin className="w-4 h-4 text-[#2DD1AC] shrink-0 mt-0.5" />
                    <span>{facility.address}, {facility.city}</span>
                  </div>
                )}
                {facility.phone && (
                  <div className="flex items-center gap-3 text-[#2D3748]">
                    <Phone className="w-4 h-4 text-[#2DD1AC] shrink-0" />
                    <a href={`tel:${facility.phone}`} className="hover:text-[#2DD1AC] transition-colors">{facility.phone}</a>
                  </div>
                )}
                {facility.email && (
                  <div className="flex items-center gap-3 text-[#2D3748]">
                    <Mail className="w-4 h-4 text-[#2DD1AC] shrink-0" />
                    <a href={`mailto:${facility.email}`} className="hover:text-[#2DD1AC] transition-colors">{facility.email}</a>
                  </div>
                )}
                {facility.website && (
                  <div className="flex items-center gap-3 text-[#2D3748]">
                    <Globe className="w-4 h-4 text-[#2DD1AC] shrink-0" />
                    <a href={facility.website} target="_blank" rel="noopener noreferrer" className="hover:text-[#2DD1AC] transition-colors">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {/* Social & Messaging Icons */}
              {(facility.phone || facility.email || facility.messenger_url || facility.whatsapp || facility.viber || facility.telegram || facility.facebook_url || facility.instagram_url || facility.linkedin_url) && (
                <div className="mt-5 pt-5 border-t border-[#e8e6dc]/50">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {facility.phone && (
                      <a
                        href={`tel:${facility.phone}`}
                        title="Call"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 hover:shadow-lg"
                        style={{ backgroundColor: "#2DD1AC" }}
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                    )}
                    {facility.email && (
                      <a
                        href={`mailto:${facility.email}`}
                        title="Email"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 hover:shadow-lg"
                        style={{ backgroundColor: "#EA4335" }}
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                    {facility.messenger_url && (
                      <a
                        href={facility.messenger_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Messenger"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 hover:shadow-lg"
                        style={{ backgroundColor: "#0084FF" }}
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    )}
                    {facility.whatsapp && (
                      <a
                        href={`https://wa.me/${facility.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="WhatsApp"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 hover:shadow-lg"
                        style={{ backgroundColor: "#25D366" }}
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                    )}
                    {facility.viber && (
                      <a
                        href={`viber://chat?number=${facility.viber.replace(/[^0-9+]/g, "")}`}
                        title="Viber"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 hover:shadow-lg"
                        style={{ backgroundColor: "#7360F2" }}
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    )}
                    {facility.telegram && (
                      <a
                        href={facility.telegram.startsWith("@") ? `https://t.me/${facility.telegram.slice(1)}` : `https://t.me/${facility.telegram.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Telegram"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 hover:shadow-lg"
                        style={{ backgroundColor: "#0088CC" }}
                      >
                        <Send className="w-5 h-5" />
                      </a>
                    )}
                    {facility.facebook_url && (
                      <a
                        href={facility.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Facebook"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 hover:shadow-lg"
                        style={{ backgroundColor: "#1877F2" }}
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {facility.instagram_url && (
                      <a
                        href={facility.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Instagram"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 hover:shadow-lg"
                        style={{ backgroundColor: "#E4405F" }}
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {facility.linkedin_url && (
                      <a
                        href={facility.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="LinkedIn"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 hover:shadow-lg"
                        style={{ backgroundColor: "#0A66C2" }}
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal - Full Screen */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setShowVideoModal(null)}>
          <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowVideoModal(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-full flex items-center justify-center bg-black">
              <video src={showVideoModal} controls autoPlay className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
