"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Facility, Profile } from "@/lib/types";
import Button from "@/components/ui/Button";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Star,
  Users,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Video,
  User,
  ShieldCheck,
} from "lucide-react";

export default function AdminFacilityReviewPage() {
  const params = useParams();
  const facilityId = params.id as string;
  const [facility, setFacility] = useState<Facility | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      const { data: facilityData } = await supabase
        .from("facilities")
        .select("*")
        .eq("id", facilityId)
        .single();

      setFacility(facilityData);

      if (facilityData?.owner_id) {
        const { data: ownerData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", facilityData.owner_id)
          .single();
        setOwner(ownerData);
      }

      setLoading(false);
    }
    load();
  }, [facilityId, router, supabase]);

  async function handleToggleStatus() {
    if (!facility) return;
    setActionLoading(true);
    const { error } = await supabase
      .from("facilities")
      .update({ is_active: !facility.is_active })
      .eq("id", facility.id);

    if (!error) {
      setFacility({ ...facility, is_active: !facility.is_active });
    }
    setActionLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
        <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Loading...</div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-[#b0aea5] mx-auto mb-4" />
          <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Facility not found</p>
          <Link href="/admin" className="text-[#2DD1AC] text-sm font-semibold mt-2 block">Back to Admin</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-[#b0aea5] hover:text-[#2DD1AC] transition-colors mb-6"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-6 h-6 text-[#2DD1AC]" />
          <h1 className="text-2xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
            Facility Review
          </h1>
        </div>

        {/* Status + Actions */}
        <div className="flex items-center gap-4 mb-8">
          {facility.is_active ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#788c5d] bg-[#788c5d]/10 px-3 py-1.5 rounded-full" style={{ fontFamily: "var(--font-ui)" }}>
              <CheckCircle2 className="w-4 h-4" /> Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#d97757] bg-[#d97757]/10 px-3 py-1.5 rounded-full" style={{ fontFamily: "var(--font-ui)" }}>
              <XCircle className="w-4 h-4" /> Pending Review
            </span>
          )}
          <Button
            onClick={handleToggleStatus}
            isLoading={actionLoading}
            variant={facility.is_active ? "outline" : "primary"}
            size="sm"
          >
            {facility.is_active ? "Deactivate" : "Approve & Activate"}
          </Button>
          <Link href={`/facilities/${facility.id}`}>
            <Button variant="ghost" size="sm">View Public Page</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            <div className="aspect-[21/9] rounded-3xl bg-gradient-to-br from-[#e8e6dc]/40 to-[#2DD1AC]/5 border border-[#e8e6dc]/50 overflow-hidden">
              {facility.image_urls?.[0] ? (
                <img src={facility.image_urls[0]} alt={facility.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Building2 className="w-16 h-16 text-[#b0aea5]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                {facility.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#b0aea5] mb-4" style={{ fontFamily: "var(--font-ui)" }}>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{facility.city}</span>
                {facility.rating && <span className="flex items-center gap-1"><Star className="w-4 h-4 text-[#d97757]" fill="#d97757" />{facility.rating}</span>}
                {facility.capacity && <span className="flex items-center gap-1"><Users className="w-4 h-4" />{facility.capacity} beds</span>}
              </div>
              {facility.description && (
                <p className="text-sm text-[#2D3748] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  {facility.description}
                </p>
              )}
            </div>

            {/* Services */}
            {facility.services?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-[#2D3748] mb-3" style={{ fontFamily: "var(--font-heading)" }}>Services</h3>
                <div className="flex flex-wrap gap-2">
                  {facility.services.map((s) => (
                    <span key={s} className="text-sm text-[#2D3748] bg-[#2DD1AC]/10 px-3 py-1.5 rounded-full" style={{ fontFamily: "var(--font-ui)" }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Media */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Media</h3>
              {facility.image_urls?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-[#6a9bcc]" />
                    <span className="text-sm font-medium text-[#2D3748]" style={{ fontFamily: "var(--font-ui)" }}>Photos ({facility.image_urls.length})</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {facility.image_urls.map((url, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-[#e8e6dc]">
                        <img src={url} alt={`${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {facility.video_urls?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-[#d97757]" />
                    <span className="text-sm font-medium text-[#2D3748]" style={{ fontFamily: "var(--font-ui)" }}>Videos ({facility.video_urls.length})</span>
                  </div>
                  <div className="space-y-2">
                    {facility.video_urls.map((url, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-[#e8e6dc]/20 rounded-lg border border-[#e8e6dc]/50">
                        <Video className="w-4 h-4 text-[#d97757] shrink-0" />
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#6a9bcc] hover:underline truncate" style={{ fontFamily: "var(--font-ui)" }}>
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(!facility.image_urls?.length && !facility.video_urls?.length) && (
                <p className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>No media uploaded yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Provider Owner</h3>
              {owner ? (
                <div className="space-y-3 text-sm" style={{ fontFamily: "var(--font-ui)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2DD1AC]/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#2DD1AC]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#2D3748]">{owner.full_name || "No name"}</div>
                      <div className="text-xs text-[#b0aea5]">{owner.role}</div>
                    </div>
                  </div>
                  {owner.email && <div className="flex items-center gap-2 text-[#2D3748]"><Mail className="w-3.5 h-3.5 text-[#b0aea5]" />{owner.email}</div>}
                  {owner.phone && <div className="flex items-center gap-2 text-[#2D3748]"><Phone className="w-3.5 h-3.5 text-[#b0aea5]" />{owner.phone}</div>}
                </div>
              ) : (
                <p className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>No owner linked</p>
              )}
            </div>

            {/* Contact Info */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Facility Contact</h3>
              <div className="space-y-3 text-sm" style={{ fontFamily: "var(--font-ui)" }}>
                {facility.address && (
                  <div className="flex items-start gap-2 text-[#2D3748]"><MapPin className="w-3.5 h-3.5 text-[#b0aea5] mt-0.5 shrink-0" />{facility.address}, {facility.city}</div>
                )}
                {facility.phone && (
                  <div className="flex items-center gap-2 text-[#2D3748]"><Phone className="w-3.5 h-3.5 text-[#b0aea5]" />{facility.phone}</div>
                )}
                {facility.email && (
                  <div className="flex items-center gap-2 text-[#2D3748]"><Mail className="w-3.5 h-3.5 text-[#b0aea5]" />{facility.email}</div>
                )}
                {facility.website && (
                  <div className="flex items-center gap-2 text-[#2D3748]"><Globe className="w-3.5 h-3.5 text-[#b0aea5]" /><a href={facility.website} target="_blank" rel="noopener noreferrer" className="hover:text-[#2DD1AC]">{facility.website}</a></div>
                )}
              </div>
            </div>

            {/* Pricing */}
            {(facility.price_range_min || facility.price_range_max) && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-heading)" }}>Pricing</h3>
                <div className="text-xl font-bold text-[#2DD1AC]" style={{ fontFamily: "var(--font-heading)" }}>
                  ₱{(facility.price_range_min || 0).toLocaleString()} - ₱{(facility.price_range_max || 0).toLocaleString()}
                </div>
                <div className="text-xs text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>per month</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
