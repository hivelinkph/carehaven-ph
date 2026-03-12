"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Facility } from "@/lib/types";
import { SERVICES_LIST } from "@/lib/constants";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Building2,
} from "lucide-react";

export default function EditFacilityPage() {
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [capacity, setCapacity] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("facilities")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (!data) { router.push("/dashboard/provider"); return; }

      setFacility(data);
      setName(data.name);
      setCity(data.city);
      setAddress(data.address || "");
      setDescription(data.description || "");
      setPhone(data.phone || "");
      setEmail(data.email || "");
      setWebsite(data.website || "");
      setCapacity(data.capacity?.toString() || "");
      setPriceMin(data.price_range_min?.toString() || "");
      setPriceMax(data.price_range_max?.toString() || "");
      setSelectedServices(data.services || []);
      setImageUrls(data.image_urls || []);
      setVideoUrls(data.video_urls || []);
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  function toggleService(service: string) {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  }

  function addImageUrl() {
    if (newImageUrl.trim()) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  }

  function removeImageUrl(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function addVideoUrl() {
    if (newVideoUrl.trim()) {
      setVideoUrls((prev) => [...prev, newVideoUrl.trim()]);
      setNewVideoUrl("");
    }
  }

  function removeVideoUrl(index: number) {
    setVideoUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!facility) return;
    setSaving(true);
    setError("");
    setSuccess(false);

    const { error: updateError } = await supabase
      .from("facilities")
      .update({
        name,
        city,
        address: address || null,
        description: description || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        capacity: capacity ? parseInt(capacity) : null,
        price_range_min: priceMin ? parseFloat(priceMin) : null,
        price_range_max: priceMax ? parseFloat(priceMax) : null,
        services: selectedServices,
        image_urls: imageUrls,
        video_urls: videoUrls,
      })
      .eq("id", facility.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
        <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/provider"
          className="inline-flex items-center gap-2 text-sm text-[#b0aea5] hover:text-[#2DD1AC] transition-colors mb-6"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Building2 className="w-6 h-6 text-[#2DD1AC]" />
          <h1 className="text-3xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
            Edit Facility
          </h1>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Info */}
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-lg font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>Basic Information</h2>
            <Input label="Facility Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />

            <div>
              <label className="block text-sm font-medium text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-ui)" }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 text-[#141413] bg-white border-2 border-[#e8e6dc] rounded-xl transition-all placeholder:text-[#b0aea5] focus:outline-none focus:border-[#2DD1AC]"
                style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
              />
            </div>
          </div>

          {/* Contact & Pricing */}
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-lg font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>Contact & Pricing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Input label="Website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              <Input label="Min Price (₱/mo)" type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
              <Input label="Max Price (₱/mo)" type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
            </div>
          </div>

          {/* Services */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Services</h2>
            <div className="flex flex-wrap gap-2">
              {SERVICES_LIST.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-all ${selectedServices.includes(service)
                    ? "bg-[#2DD1AC] text-white border-[#2DD1AC]"
                    : "bg-white text-[#2D3748] border-[#e8e6dc] hover:border-[#2DD1AC]"
                    }`}
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              <ImageIcon className="w-5 h-5 inline mr-2 text-[#6a9bcc]" />
              Photos
            </h2>
            <p className="text-xs text-[#b0aea5] mb-4" style={{ fontFamily: "var(--font-ui)" }}>
              Add image URLs for your facility photos. These will appear on your public profile.
            </p>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border border-[#e8e6dc]">
                    <img src={url} alt={`Facility ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(i)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 px-4 py-2.5 bg-white border-2 border-[#e8e6dc] rounded-xl text-sm focus:outline-none focus:border-[#2DD1AC]"
                style={{ fontFamily: "var(--font-body)" }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
                <Upload className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>

          {/* Videos */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              <Video className="w-5 h-5 inline mr-2 text-[#d97757]" />
              Videos
            </h2>
            <p className="text-xs text-[#b0aea5] mb-4" style={{ fontFamily: "var(--font-ui)" }}>
              Add YouTube or video URLs to showcase your facility.
            </p>

            {videoUrls.length > 0 && (
              <div className="space-y-2 mb-4">
                {videoUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-[#e8e6dc]/20 rounded-xl border border-[#e8e6dc]/50">
                    <Video className="w-4 h-4 text-[#d97757] shrink-0" />
                    <span className="text-sm text-[#2D3748] truncate flex-1" style={{ fontFamily: "var(--font-ui)" }}>{url}</span>
                    <button type="button" onClick={() => removeVideoUrl(i)} className="text-red-400 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="url"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-4 py-2.5 bg-white border-2 border-[#e8e6dc] rounded-xl text-sm focus:outline-none focus:border-[#2DD1AC]"
                style={{ fontFamily: "var(--font-body)" }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVideoUrl(); } }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addVideoUrl}>
                <Upload className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>

          {/* Submit */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600" style={{ fontFamily: "var(--font-ui)" }}>
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-[#788c5d]/10 border border-[#788c5d]/20 text-sm text-[#788c5d]" style={{ fontFamily: "var(--font-ui)" }}>
              Changes saved successfully!
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={saving}>
            <Save className="w-5 h-5" />
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
