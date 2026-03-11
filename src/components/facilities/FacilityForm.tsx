"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Facility } from "@/lib/types";

interface FacilityFormProps {
    facility?: Facility;
    mode: "create" | "edit";
    isAdmin?: boolean;
}

export function FacilityForm({ facility, mode, isAdmin }: FacilityFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: facility?.name || "",
        description: facility?.description || "",
        region: facility?.region || "",
        city: facility?.city || "",
        address: facility?.address || "",
        phone: facility?.phone || "",
        email: facility?.email || "",
        website: facility?.website || "",
        image_urls: facility?.image_urls?.join("\n") || "",
        video_urls: facility?.video_urls?.join("\n") || "",
        services: facility?.services?.join(", ") || "",
        amenities: facility?.amenities?.join(", ") || "",
        capacity: facility?.capacity?.toString() || "",
        price_range_min: facility?.price_range_min?.toString() || "",
        price_range_max: facility?.price_range_max?.toString() || "",
        is_active: facility ? facility.is_active : true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        if (type === "checkbox") {
            setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError("Not authenticated");
            setLoading(false);
            return;
        }

        const payload = {
            name: formData.name,
            description: formData.description,
            region: formData.region,
            city: formData.city,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            website: formData.website,
            image_urls: formData.image_urls.split("\n").filter(Boolean),
            video_urls: formData.video_urls.split("\n").filter(Boolean),
            services: formData.services.split(",").map(s => s.trim()).filter(Boolean),
            amenities: formData.amenities.split(",").map(s => s.trim()).filter(Boolean),
            capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
            price_range_min: formData.price_range_min ? parseFloat(formData.price_range_min) : null,
            price_range_max: formData.price_range_max ? parseFloat(formData.price_range_max) : null,
            is_active: formData.is_active,
        };

        try {
            if (mode === "create") {
                const { error: insertError } = await supabase.from("facilities").insert({
                    ...payload,
                    owner_id: user.id,
                });
                if (insertError) throw insertError;
            } else {
                const { error: updateError } = await supabase
                    .from("facilities")
                    .update(payload)
                    .eq("id", facility!.id);
                if (updateError) throw updateError;
            }

            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "An error occurred while saving.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl" style={{ fontFamily: "var(--font-ui)" }}>
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ fontFamily: "var(--font-ui)" }}>
                {/* Basic Info */}
                <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Facility Name *</label>
                    <input
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Description</label>
                    <textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Region *</label>
                    <input
                        required
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        placeholder="e.g. NCR"
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2D3748]">City *</label>
                    <input
                        required
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Quezon City"
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Street Address</label>
                    <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
                </div>

                {/* Contact */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Phone</label>
                    <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Website</label>
                    <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://"
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
                </div>

                {/* Media */}
                <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Image URLs (one per line)</label>
                    <textarea
                        name="image_urls"
                        rows={3}
                        value={formData.image_urls}
                        onChange={handleChange}
                        placeholder="https://example.com/image1.jpg"
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50 font-mono text-xs"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Video URLs (one per line)</label>
                    <textarea
                        name="video_urls"
                        rows={3}
                        value={formData.video_urls}
                        onChange={handleChange}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50 font-mono text-xs"
                    />
                </div>

                {/* Features / Details */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Services (comma separated)</label>
                    <input
                        name="services"
                        value={formData.services}
                        onChange={handleChange}
                        placeholder="24/7 Care, Memory Care, etc."
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Amenities (comma separated)</label>
                    <input
                        name="amenities"
                        value={formData.amenities}
                        onChange={handleChange}
                        placeholder="Garden, Gym, Pool, etc."
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
                </div>

                {/* Pricing / Capacity */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Capacity</label>
                    <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Monthly Price Range (PHP)</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            name="price_range_min"
                            value={formData.price_range_min}
                            onChange={handleChange}
                            placeholder="Min"
                            className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="number"
                            name="price_range_max"
                            value={formData.price_range_max}
                            onChange={handleChange}
                            placeholder="Max"
                            className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                        />
                    </div>
                </div>

                <div className="space-y-2 md:col-span-2 flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="w-5 h-5 text-[#2DD1AC] border-[#e8e6dc] rounded focus:ring-[#2DD1AC]/50"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-[#2D3748]">Facility is visible on public directory</label>
                </div>
            </div>

            <div className="pt-6 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#2DD1AC] text-white font-semibold rounded-full hover:bg-[#1E957A] transition-colors disabled:opacity-50"
                    style={{ fontFamily: "var(--font-heading)" }}
                >
                    {loading ? "Saving..." : "Save Facility"}
                </button>
            </div>
        </form>
    );
}
