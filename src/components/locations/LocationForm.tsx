"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Location } from "@/lib/types";
import { latLngToSvg, svgToLatLng } from "@/lib/mapUtils";

interface LocationFormProps {
    locationItem?: Location;
    mode: "create" | "edit";
}

export function LocationForm({ locationItem, mode }: LocationFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: locationItem?.name || "",
        region: locationItem?.region || "",
        latitude: locationItem?.latitude?.toString() || "",
        longitude: locationItem?.longitude?.toString() || "",
        is_active: locationItem ? locationItem.is_active : true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        if (type === "checkbox") {
            setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

        if (svgP) {
            const { lat, lng } = svgToLatLng(svgP.x, svgP.y);
            setFormData((prev) => ({
                ...prev,
                latitude: lat.toString(),
                longitude: lng.toString()
            }));
        }
    };

    const mapLat = parseFloat(formData.latitude);
    const mapLng = parseFloat(formData.longitude);
    const currentPin = (!isNaN(mapLat) && !isNaN(mapLng)) ? latLngToSvg(mapLat, mapLng) : null;

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
            region: formData.region,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            is_active: formData.is_active,
        };

        try {
            if (mode === "create") {
                const { error: insertError } = await supabase.from("locations").insert([payload]);
                if (insertError) throw insertError;
            } else {
                const { error: updateError } = await supabase
                    .from("locations")
                    .update(payload)
                    .eq("id", locationItem!.id);
                if (updateError) throw updateError;
            }

            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "An error occurred while saving the location.");
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
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2D3748]">City Name *</label>
                    <input
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Quezon City"
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
                </div>

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

                {/* Interactive Map Picker */}
                <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Pin City Location on Map</label>
                    <p className="text-xs text-gray-500 mb-2">Click anywhere on the map to set the heart marker for this city.</p>
                    <div className="relative bg-[#e8e6dc]/30 rounded-3xl p-4 border border-[#e8e6dc]/50 max-w-[400px] mx-auto overflow-hidden">
                        <svg
                            viewBox="0 0 500 700"
                            className="w-full cursor-crosshair"
                            style={{ filter: "drop-shadow(0 4px 12px rgba(45, 55, 72, 0.08))" }}
                            onClick={handleMapClick}
                        >
                            <image
                                href="/assets/maps/ph_map.png"
                                x="0"
                                y="0"
                                width="500"
                                height="700"
                                preserveAspectRatio="xMidYMid contain"
                                opacity="0.9"
                            />

                            {currentPin && (
                                <g transform={`translate(${currentPin.x - 12}, ${currentPin.y - 12})`}>
                                    <Heart
                                        width={24}
                                        height={24}
                                        color="white"
                                        fill="#ff0000"
                                        strokeWidth={1.5}
                                        className="scale-125"
                                        style={{ filter: "drop-shadow(0 0 8px rgba(255, 0, 0, 0.8))" }}
                                    />
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="20"
                                        fill="#ff0000"
                                        opacity="0.25"
                                        className="animate-pulse"
                                    />
                                </g>
                            )}
                        </svg>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Latitude</label>
                    <input
                        type="number"
                        step="any"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2D3748]">Longitude</label>
                    <input
                        type="number"
                        step="any"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-[#e8e6dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50"
                    />
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
                    <label htmlFor="is_active" className="text-sm font-medium text-[#2D3748]">Location is active and visible</label>
                </div>
            </div>

            <div className="pt-6 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#2DD1AC] text-white font-semibold rounded-full hover:bg-[#1E957A] transition-colors disabled:opacity-50"
                    style={{ fontFamily: "var(--font-heading)" }}
                >
                    {loading ? "Saving..." : "Save Location"}
                </button>
            </div>
        </form>
    );
}
