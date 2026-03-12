"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Facility, Location } from "@/lib/types";
import { SERVICES_LIST } from "@/lib/constants";
import {
    Upload,
    X,
    Image as ImageIcon,
    Video,
    CheckCircle2,
    Loader2,
    Building2,
    Phone,
    Mail,
    Globe,
    MapPin,
    Users,
    DollarSign,
    FileText,
    AlertCircle,
    MessageCircle,
    Send,
    Facebook,
    Instagram,
    Linkedin,
    Share2,
} from "lucide-react";

interface FacilityFormProps {
    facility?: Facility;
    mode: "create" | "edit";
    isAdmin?: boolean;
}

interface UploadedFile {
    url: string;
    name: string;
    uploading?: boolean;
    error?: string;
}

export function FacilityForm({ facility, mode, isAdmin }: FacilityFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    // Form fields
    const [name, setName] = useState(facility?.name || "");
    const [description, setDescription] = useState(facility?.description || "");
    const [city, setCity] = useState(facility?.city || "");
    const [address, setAddress] = useState(facility?.address || "");
    const [phone, setPhone] = useState(facility?.phone || "");
    const [email, setEmail] = useState(facility?.email || "");
    const [website, setWebsite] = useState(facility?.website || "");
    const [capacity, setCapacity] = useState(facility?.capacity?.toString() || "");
    const [priceMin, setPriceMin] = useState(facility?.price_range_min?.toString() || "");
    const [priceMax, setPriceMax] = useState(facility?.price_range_max?.toString() || "");
    const [selectedServices, setSelectedServices] = useState<string[]>(facility?.services || []);
    const [images, setImages] = useState<UploadedFile[]>(
        facility?.image_urls?.map((url) => ({ url, name: url.split("/").pop() || "image" })) || []
    );
    const [videos, setVideos] = useState<UploadedFile[]>(
        facility?.video_urls?.map((url) => ({ url, name: url.split("/").pop() || "video" })) || []
    );
    const [messengerUrl, setMessengerUrl] = useState(facility?.messenger_url || "");
    const [whatsapp, setWhatsapp] = useState(facility?.whatsapp || "");
    const [viber, setViber] = useState(facility?.viber || "");
    const [telegram, setTelegram] = useState(facility?.telegram || "");
    const [facebookUrl, setFacebookUrl] = useState(facility?.facebook_url || "");
    const [instagramUrl, setInstagramUrl] = useState(facility?.instagram_url || "");
    const [linkedinUrl, setLinkedinUrl] = useState(facility?.linkedin_url || "");
    const [imageDragging, setImageDragging] = useState(false);
    const [videoDragging, setVideoDragging] = useState(false);

    useEffect(() => {
        async function loadLocations() {
            const { data } = await supabase.from("locations").select("*").eq("is_active", true).order("name");
            if (data) setLocations(data);
        }
        loadLocations();
    }, []);

    function toggleService(service: string) {
        setSelectedServices((prev) =>
            prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
        );
    }

    async function uploadFile(file: File, bucket: "facility-images" | "facility-videos"): Promise<string> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(path, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
        return publicUrl;
    }

    async function handleImageFiles(files: File[]) {
        const placeholders: UploadedFile[] = files.map((f) => ({
            url: "",
            name: f.name,
            uploading: true,
        }));
        setImages((prev) => [...prev, ...placeholders]);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const url = await uploadFile(file, "facility-images");
                setImages((prev) => {
                    const idx = prev.findIndex((p) => p.name === file.name && p.uploading);
                    if (idx === -1) return prev;
                    const updated = [...prev];
                    updated[idx] = { url, name: file.name, uploading: false };
                    return updated;
                });
            } catch (err: any) {
                setImages((prev) => {
                    const idx = prev.findIndex((p) => p.name === file.name && p.uploading);
                    if (idx === -1) return prev;
                    const updated = [...prev];
                    updated[idx] = { url: "", name: file.name, uploading: false, error: err.message };
                    return updated;
                });
            }
        }
    }

    async function handleVideoFiles(files: File[]) {
        const placeholders: UploadedFile[] = files.map((f) => ({
            url: "",
            name: f.name,
            uploading: true,
        }));
        setVideos((prev) => [...prev, ...placeholders]);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const url = await uploadFile(file, "facility-videos");
                setVideos((prev) => {
                    const idx = prev.findIndex((p) => p.name === file.name && p.uploading);
                    if (idx === -1) return prev;
                    const updated = [...prev];
                    updated[idx] = { url, name: file.name, uploading: false };
                    return updated;
                });
            } catch (err: any) {
                setVideos((prev) => {
                    const idx = prev.findIndex((p) => p.name === file.name && p.uploading);
                    if (idx === -1) return prev;
                    const updated = [...prev];
                    updated[idx] = { url: "", name: file.name, uploading: false, error: err.message };
                    return updated;
                });
            }
        }
    }

    function handleImageDrop(e: React.DragEvent) {
        e.preventDefault();
        setImageDragging(false);
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
        if (files.length) handleImageFiles(files);
    }

    function handleVideoDrop(e: React.DragEvent) {
        e.preventDefault();
        setVideoDragging(false);
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("video/"));
        if (files.length) handleVideoFiles(files);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("Not authenticated");
            setLoading(false);
            return;
        }

        const imageUrlsToSave = images.filter((i) => i.url && !i.uploading && !i.error).map((i) => i.url);
        const videoUrlsToSave = videos.filter((v) => v.url && !v.uploading && !v.error).map((v) => v.url);

        const payload = {
            name,
            description: description || null,
            city,
            address: address || null,
            phone: phone || null,
            email: email || null,
            website: website || null,
            image_urls: imageUrlsToSave,
            video_urls: videoUrlsToSave,
            services: selectedServices,
            capacity: capacity ? parseInt(capacity, 10) : null,
            price_range_min: priceMin ? parseFloat(priceMin) : null,
            price_range_max: priceMax ? parseFloat(priceMax) : null,
            messenger_url: messengerUrl || null,
            whatsapp: whatsapp || null,
            viber: viber || null,
            telegram: telegram || null,
            facebook_url: facebookUrl || null,
            instagram_url: instagramUrl || null,
            linkedin_url: linkedinUrl || null,
            // New facilities are always pending admin approval
            is_active: isAdmin ? (facility?.is_active ?? false) : false,
        };

        try {
            if (mode === "create") {
                const { error: insertError } = await supabase.from("facilities").insert({
                    ...payload,
                    owner_id: user.id,
                });
                if (insertError) throw insertError;
                setSuccess(true);
                setTimeout(() => router.push("/dashboard/provider"), 2000);
            } else {
                const { error: updateError } = await supabase
                    .from("facilities")
                    .update(payload)
                    .eq("id", facility!.id);
                if (updateError) throw updateError;
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err: any) {
            setError(err.message || "An error occurred while saving.");
        } finally {
            setLoading(false);
        }
    };

    if (success && mode === "create") {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-[#2DD1AC]/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-[#2DD1AC]" />
                </div>
                <h2 className="text-2xl font-bold text-[#2D3748] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                    Facility Submitted!
                </h2>
                <p className="text-[#b0aea5] max-w-sm" style={{ fontFamily: "var(--font-body)" }}>
                    Your facility has been submitted for review. Our admin team will approve it shortly. You&apos;ll be notified once it&apos;s live.
                </p>
                <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-[#d97757]/10 border border-[#d97757]/20">
                    <AlertCircle className="w-4 h-4 text-[#d97757]" />
                    <span className="text-sm font-medium text-[#2D3748]" style={{ fontFamily: "var(--font-ui)" }}>
                        Pending admin approval
                    </span>
                </div>
            </div>
        );
    }

    const inputCls = "w-full px-4 py-3 bg-white border-2 border-[#e8e6dc] rounded-xl text-[#141413] placeholder:text-[#b0aea5] focus:outline-none focus:border-[#2DD1AC] transition-all text-sm";
    const labelCls = "block text-sm font-semibold text-[#2D3748] mb-1.5";

    return (
        <form onSubmit={handleSubmit} className="space-y-8" style={{ fontFamily: "var(--font-body)" }}>
            {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600" style={{ fontFamily: "var(--font-ui)" }}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                </div>
            )}

            {/* Section 1: Basic Info */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#e8e6dc]">
                    <Building2 className="w-5 h-5 text-[#2DD1AC]" />
                    <h2 className="text-base font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>Facility Information</h2>
                </div>

                <div>
                    <label className={labelCls}>Facility Name <span className="text-red-400">*</span></label>
                    <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Golden Years Care Home"
                        className={inputCls}
                    />
                </div>

                <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your facility, its care philosophy, and what makes it special..."
                        className={inputCls}
                    />
                </div>
            </div>

            {/* Section 2: Location */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#e8e6dc]">
                    <MapPin className="w-5 h-5 text-[#2DD1AC]" />
                    <h2 className="text-base font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>Location</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>City <span className="text-red-400">*</span></label>
                        <select
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={inputCls}
                        >
                            <option value="" disabled>Select a city...</option>
                            {locations.map((loc) => (
                                <option key={loc.id} value={loc.name}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Street Address</label>
                        <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="123 Care Street, Barangay..."
                            className={inputCls}
                        />
                    </div>
                </div>
            </div>

            {/* Section 3: Contact */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#e8e6dc]">
                    <Phone className="w-5 h-5 text-[#2DD1AC]" />
                    <h2 className="text-base font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>Contact Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Phone Number</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 912 345 6789" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@yourfacility.com" className={inputCls} />
                    </div>
                </div>
                <div>
                    <label className={labelCls}>Website</label>
                    <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourfacility.com" className={inputCls} />
                </div>
            </div>

            {/* Section 3b: Social & Messaging */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#e8e6dc]">
                    <Share2 className="w-5 h-5 text-[#2DD1AC]" />
                    <h2 className="text-base font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>Social & Messaging</h2>
                </div>
                <p className="text-xs text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                    Add your social media and messaging accounts so customers can reach you directly.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>
                            <span className="inline-flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-[#0084FF]" /> Messenger</span>
                        </label>
                        <input type="url" value={messengerUrl} onChange={(e) => setMessengerUrl(e.target.value)} placeholder="https://m.me/yourpage" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>
                            <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#25D366]" /> WhatsApp</span>
                        </label>
                        <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+63 912 345 6789" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>
                            <span className="inline-flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-[#7360F2]" /> Viber</span>
                        </label>
                        <input type="tel" value={viber} onChange={(e) => setViber(e.target.value)} placeholder="+63 912 345 6789" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>
                            <span className="inline-flex items-center gap-1.5"><Send className="w-3.5 h-3.5 text-[#0088CC]" /> Telegram</span>
                        </label>
                        <input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@yourusername or +63 912 345 6789" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>
                            <span className="inline-flex items-center gap-1.5"><Facebook className="w-3.5 h-3.5 text-[#1877F2]" /> Facebook</span>
                        </label>
                        <input type="url" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/yourpage" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>
                            <span className="inline-flex items-center gap-1.5"><Instagram className="w-3.5 h-3.5 text-[#E4405F]" /> Instagram</span>
                        </label>
                        <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/yourprofile" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>
                            <span className="inline-flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" /> LinkedIn</span>
                        </label>
                        <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/company/yourpage" className={inputCls} />
                    </div>
                </div>
            </div>

            {/* Section 4: Capacity & Pricing */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#e8e6dc]">
                    <DollarSign className="w-5 h-5 text-[#2DD1AC]" />
                    <h2 className="text-base font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>Capacity & Pricing</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className={labelCls}>Capacity (beds)</label>
                        <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="50" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Min Price (₱/mo)</label>
                        <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="20,000" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Max Price (₱/mo)</label>
                        <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="80,000" className={inputCls} />
                    </div>
                </div>
            </div>

            {/* Section 5: Services */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#e8e6dc]">
                    <FileText className="w-5 h-5 text-[#2DD1AC]" />
                    <h2 className="text-base font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>Services Offered</h2>
                </div>
                <p className="text-xs text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Select all services your facility provides.</p>
                <div className="flex flex-wrap gap-2">
                    {SERVICES_LIST.map((service) => (
                        <button
                            key={service}
                            type="button"
                            onClick={() => toggleService(service)}
                            className={`text-sm px-4 py-2 rounded-full border-2 transition-all font-medium ${selectedServices.includes(service)
                                ? "bg-[#2DD1AC] text-white border-[#2DD1AC] shadow-sm shadow-[#2DD1AC]/20"
                                : "bg-white text-[#2D3748] border-[#e8e6dc] hover:border-[#2DD1AC]/50"
                                }`}
                            style={{ fontFamily: "var(--font-ui)" }}
                        >
                            {service}
                        </button>
                    ))}
                </div>
            </div>

            {/* Section 6: Photos */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#e8e6dc]">
                    <ImageIcon className="w-5 h-5 text-[#6a9bcc]" />
                    <h2 className="text-base font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>Photos</h2>
                    <span className="text-xs text-[#b0aea5] ml-1">JPG, PNG, WebP — up to 10MB each</span>
                </div>

                {/* Image previews */}
                {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {images.map((img, i) => (
                            <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border-2 border-[#e8e6dc] bg-[#faf9f5]">
                                {img.uploading ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-[#2DD1AC] animate-spin" />
                                    </div>
                                ) : img.error ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                                        <AlertCircle className="w-5 h-5 text-red-400 mb-1" />
                                        <span className="text-xs text-red-400">Failed</span>
                                    </div>
                                ) : (
                                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                )}
                                {!img.uploading && (
                                    <button
                                        type="button"
                                        onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Image drop zone */}
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${imageDragging
                        ? "border-[#2DD1AC] bg-[#2DD1AC]/5"
                        : "border-[#e8e6dc] hover:border-[#2DD1AC]/50 hover:bg-[#2DD1AC]/5"
                        }`}
                    onDragOver={(e) => { e.preventDefault(); setImageDragging(true); }}
                    onDragLeave={() => setImageDragging(false)}
                    onDrop={handleImageDrop}
                    onClick={() => imageInputRef.current?.click()}
                >
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length) handleImageFiles(files);
                            e.target.value = "";
                        }}
                    />
                    <Upload className="w-8 h-8 text-[#b0aea5] mx-auto mb-3" />
                    <p className="text-sm font-medium text-[#2D3748]" style={{ fontFamily: "var(--font-ui)" }}>
                        Drop photos here or <span className="text-[#2DD1AC]">click to browse</span>
                    </p>
                    <p className="text-xs text-[#b0aea5] mt-1">Upload multiple photos at once</p>
                </div>
            </div>

            {/* Section 7: Videos */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#e8e6dc]">
                    <Video className="w-5 h-5 text-[#d97757]" />
                    <h2 className="text-base font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>Videos</h2>
                    <span className="text-xs text-[#b0aea5] ml-1">MP4, WebM — up to 500MB each</span>
                </div>

                {/* Video previews */}
                {videos.length > 0 && (
                    <div className="space-y-2">
                        {videos.map((vid, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-[#e8e6dc]/20 border border-[#e8e6dc] rounded-xl">
                                {vid.uploading ? (
                                    <Loader2 className="w-5 h-5 text-[#d97757] animate-spin shrink-0" />
                                ) : vid.error ? (
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                ) : (
                                    <Video className="w-5 h-5 text-[#d97757] shrink-0" />
                                )}
                                <span className="text-sm text-[#2D3748] truncate flex-1" style={{ fontFamily: "var(--font-ui)" }}>
                                    {vid.error ? `Upload failed: ${vid.error}` : vid.uploading ? `Uploading ${vid.name}...` : vid.name}
                                </span>
                                {!vid.uploading && (
                                    <button
                                        type="button"
                                        onClick={() => setVideos((prev) => prev.filter((_, idx) => idx !== i))}
                                        className="text-[#b0aea5] hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Video drop zone */}
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${videoDragging
                        ? "border-[#d97757] bg-[#d97757]/5"
                        : "border-[#e8e6dc] hover:border-[#d97757]/50 hover:bg-[#d97757]/5"
                        }`}
                    onDragOver={(e) => { e.preventDefault(); setVideoDragging(true); }}
                    onDragLeave={() => setVideoDragging(false)}
                    onDrop={handleVideoDrop}
                    onClick={() => videoInputRef.current?.click()}
                >
                    <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length) handleVideoFiles(files);
                            e.target.value = "";
                        }}
                    />
                    <Upload className="w-8 h-8 text-[#b0aea5] mx-auto mb-3" />
                    <p className="text-sm font-medium text-[#2D3748]" style={{ fontFamily: "var(--font-ui)" }}>
                        Drop videos here or <span className="text-[#d97757]">click to browse</span>
                    </p>
                    <p className="text-xs text-[#b0aea5] mt-1">Upload facility tour videos</p>
                </div>
            </div>

            {/* Admin notice */}
            {!isAdmin && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl" style={{ fontFamily: "var(--font-ui)" }}>
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">Pending Admin Approval</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            Your facility will not be visible to the public until reviewed and approved by our admin team. This typically takes 1–2 business days.
                        </p>
                    </div>
                </div>
            )}

            {/* Submit */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading || images.some((i) => i.uploading) || videos.some((v) => v.uploading)}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/85 rounded-full shadow-lg shadow-[#2DD1AC]/25 hover:shadow-xl hover:shadow-[#2DD1AC]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{ fontFamily: "var(--font-heading)" }}
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                    ) : images.some((i) => i.uploading) || videos.some((v) => v.uploading) ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Uploading files...</>
                    ) : (
                        <>{mode === "create" ? "Submit Facility for Review" : "Save Changes"}</>
                    )}
                </button>
            </div>
        </form>
    );
}
