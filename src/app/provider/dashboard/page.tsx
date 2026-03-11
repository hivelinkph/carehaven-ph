"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Facility } from "@/lib/types";
import {
  Building2,
  Edit3,
  MapPin,
  Star,
  Users,
  Phone,
  Mail,
  Globe,
  Image as ImageIcon,
  Video,
  Eye,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function ProviderDashboard() {
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from("facilities")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      setFacility(data);
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
        <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Loading...</div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Building2 className="w-16 h-16 text-[#b0aea5] mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-[#2D3748] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            No Facility Found
          </h1>
          <p className="text-[#b0aea5] mb-6" style={{ fontFamily: "var(--font-body)" }}>
            You haven&apos;t registered a facility yet. Register one to get started.
          </p>
          <Link href="/auth/provider-signup">
            <Button>Register a Facility</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Provider Dashboard
            </h1>
            <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-body)" }}>
              Manage your facility profile
            </p>
          </div>
          <Link href="/provider/dashboard/edit">
            <Button size="md">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Status Banner */}
        {!facility.is_active && (
          <div className="flex items-center gap-3 p-4 mb-8 bg-[#d97757]/10 border border-[#d97757]/20 rounded-xl" style={{ fontFamily: "var(--font-ui)" }}>
            <AlertCircle className="w-5 h-5 text-[#d97757] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#2D3748]">Pending Approval</p>
              <p className="text-xs text-[#b0aea5]">Your facility is under review. It will be visible to families once approved by our admin team.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Facility Card */}
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#e8e6dc]/40 to-[#2DD1AC]/5 border border-[#e8e6dc]/50 flex items-center justify-center shrink-0 overflow-hidden">
                  {facility.image_urls?.[0] ? (
                    <img src={facility.image_urls[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-[#b0aea5]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-[#2D3748] truncate" style={{ fontFamily: "var(--font-heading)" }}>
                      {facility.name}
                    </h2>
                    {facility.is_active ? (
                      <span className="text-xs font-medium text-white bg-[#788c5d] px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-ui)" }}>Active</span>
                    ) : (
                      <span className="text-xs font-medium text-white bg-[#d97757] px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-ui)" }}>Pending</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{facility.city}, {facility.region}</span>
                    {facility.rating && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#d97757]" fill="#d97757" />{facility.rating}</span>}
                    {facility.capacity && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{facility.capacity} beds</span>}
                  </div>
                </div>
              </div>
              {facility.description && (
                <p className="mt-4 text-sm text-[#2D3748] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  {facility.description}
                </p>
              )}
            </div>

            {/* Services */}
            {facility.services?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Services</h3>
                <div className="flex flex-wrap gap-2">
                  {facility.services.map((s) => (
                    <span key={s} className="text-sm text-[#2D3748] bg-[#2DD1AC]/10 px-3 py-1.5 rounded-full" style={{ fontFamily: "var(--font-ui)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Media Summary */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Media</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#e8e6dc]/20 border border-[#e8e6dc]/50">
                  <ImageIcon className="w-6 h-6 text-[#6a9bcc]" />
                  <div>
                    <div className="text-lg font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                      {facility.image_urls?.length || 0}
                    </div>
                    <div className="text-xs text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Photos</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#e8e6dc]/20 border border-[#e8e6dc]/50">
                  <Video className="w-6 h-6 text-[#d97757]" />
                  <div>
                    <div className="text-lg font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                      {facility.video_urls?.length || 0}
                    </div>
                    <div className="text-xs text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Videos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Quick Actions</h3>
              <div className="space-y-2" style={{ fontFamily: "var(--font-ui)" }}>
                <Link
                  href="/provider/dashboard/edit"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#2DD1AC]/5 transition-colors text-sm font-medium text-[#2D3748]"
                >
                  <Edit3 className="w-4 h-4 text-[#2DD1AC]" />
                  Edit Facility Info
                </Link>
                <Link
                  href={`/facilities/${facility.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#2DD1AC]/5 transition-colors text-sm font-medium text-[#2D3748]"
                >
                  <Eye className="w-4 h-4 text-[#6a9bcc]" />
                  View Public Profile
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Contact Info</h3>
              <div className="space-y-3 text-sm" style={{ fontFamily: "var(--font-ui)" }}>
                {facility.phone && (
                  <div className="flex items-center gap-3 text-[#2D3748]">
                    <Phone className="w-4 h-4 text-[#2DD1AC] shrink-0" />
                    {facility.phone}
                  </div>
                )}
                {facility.email && (
                  <div className="flex items-center gap-3 text-[#2D3748]">
                    <Mail className="w-4 h-4 text-[#2DD1AC] shrink-0" />
                    {facility.email}
                  </div>
                )}
                {facility.website && (
                  <div className="flex items-center gap-3 text-[#2D3748]">
                    <Globe className="w-4 h-4 text-[#2DD1AC] shrink-0" />
                    {facility.website}
                  </div>
                )}
                {facility.price_range_min && facility.price_range_max && (
                  <div className="pt-3 border-t border-[#e8e6dc]">
                    <div className="text-xs text-[#b0aea5] mb-1">Price Range</div>
                    <div className="text-lg font-bold text-[#2DD1AC]" style={{ fontFamily: "var(--font-heading)" }}>
                      ₱{facility.price_range_min.toLocaleString()} - ₱{facility.price_range_max.toLocaleString()}
                    </div>
                    <div className="text-xs text-[#b0aea5]">per month</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
