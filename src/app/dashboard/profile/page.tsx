"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Save, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          region: profile.region,
        })
        .eq("id", user.id);

      setMessage(error ? error.message : "Profile updated successfully!");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
        <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#b0aea5] hover:text-[#2DD1AC] transition-colors mb-6"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="glass-card p-8 sm:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2DD1AC]/20 to-[#6a9bcc]/20 flex items-center justify-center">
              <User className="w-8 h-8 text-[#2D3748]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                Your Profile
              </h1>
              <p className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                Manage your personal information
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <Input
              label="Full Name"
              value={profile.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Juan dela Cruz"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Email"
                type="email"
                value={profile.email || ""}
                disabled
                className="bg-[#e8e6dc]/20"
              />
              <Input
                label="Phone"
                type="tel"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+63 9XX XXX XXXX"
              />
            </div>
            <Input
              label="Address"
              value={profile.address || ""}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Street, Barangay"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="City"
                value={profile.city || ""}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="City / Municipality"
              />
              <Input
                label="Region"
                value={profile.region || ""}
                onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                placeholder="e.g. NCR, Region VII"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl text-sm ${
                  message.includes("success")
                    ? "bg-[#788c5d]/10 border border-[#788c5d]/20 text-[#788c5d]"
                    : "bg-red-50 border border-red-100 text-red-600"
                }`}
                style={{ fontFamily: "var(--font-ui)" }}
              >
                {message}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" isLoading={saving}>
              <Save className="w-5 h-5" />
              Save Changes
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
