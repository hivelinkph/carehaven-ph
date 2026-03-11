"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PHILIPPINE_REGIONS, SERVICES_LIST } from "@/lib/constants";
import { Mail, Heart, Building2, ChevronRight } from "lucide-react";

export default function ProviderSignupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Step 1: Account
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2: Facility
  const [facilityName, setFacilityName] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [facilityPhone, setFacilityPhone] = useState("");
  const [facilityEmail, setFacilityEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [capacity, setCapacity] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  function toggleService(service: string) {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  }

  const regionEntries = Object.entries(PHILIPPINE_REGIONS);
  const selectedRegionData = regionEntries.find(([id]) => id === region)?.[1];
  const availableCities = selectedRegionData?.majorCities || [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    // 1. Create account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setError("Account created but user ID not returned. Please check your email and log in.");
      setLoading(false);
      setSuccess(true);
      return;
    }

    // 2. Update profile role to provider
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "provider", phone, full_name: fullName })
      .eq("id", userId);

    if (profileError) {
      setError(`Profile update failed: ${profileError.message}`);
      setLoading(false);
      return;
    }

    // 3. Create facility
    const { error: facilityError } = await supabase.from("facilities").insert({
      name: facilityName,
      region: selectedRegionData?.name || region,
      city,
      address,
      description,
      phone: facilityPhone,
      email: facilityEmail,
      website: website || null,
      capacity: capacity ? parseInt(capacity) : null,
      price_range_min: priceMin ? parseFloat(priceMin) : null,
      price_range_max: priceMax ? parseFloat(priceMax) : null,
      services: selectedServices,
      amenities: [],
      image_urls: [],
      video_urls: [],
      owner_id: userId,
      is_active: false, // admin must approve
    });

    if (facilityError) {
      setError(`Facility creation failed: ${facilityError.message}`);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5] pt-20 pb-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#2DD1AC]/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-[#2DD1AC]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2D3748] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Application Submitted!
          </h2>
          <p className="text-[#b0aea5] mb-6" style={{ fontFamily: "var(--font-body)" }}>
            Check your email at <strong className="text-[#2D3748]">{email}</strong> to verify your account.
            Your facility listing will be reviewed by our admin team and activated once approved.
          </p>
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-[#2DD1AC] hover:underline"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2DD1AC] to-[#6a9bcc] flex items-center justify-center shadow-md">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-[#2D3748] mt-6 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Register Your Facility
          </h1>
          <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-body)" }}>
            Join CareHaven PH and reach families looking for quality care
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-10" style={{ fontFamily: "var(--font-ui)" }}>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${step >= 1 ? "bg-[#2DD1AC] text-white" : "bg-[#e8e6dc]/50 text-[#b0aea5]"}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
            Account
          </div>
          <ChevronRight className="w-4 h-4 text-[#b0aea5]" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${step >= 2 ? "bg-[#2DD1AC] text-white" : "bg-[#e8e6dc]/50 text-[#b0aea5]"}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
            Facility Info
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Account Details */}
          {step === 1 && (
            <div className="glass-card p-8 space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-5 h-5 text-[#2DD1AC]" />
                <h2 className="text-xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                  Your Account
                </h2>
              </div>

              <Input label="Full Name" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Phone Number" type="tel" placeholder="+63 9XX XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <Input label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600" style={{ fontFamily: "var(--font-ui)" }}>
                  {error}
                </div>
              )}

              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={() => {
                  if (!fullName || !email || !password || !phone) {
                    setError("Please fill in all fields.");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Step 2: Facility Details */}
          {step === 2 && (
            <div className="glass-card p-8 space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-5 h-5 text-[#2DD1AC]" />
                <h2 className="text-xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                  Facility Information
                </h2>
              </div>

              <Input label="Facility Name" placeholder="Name of your facility" value={facilityName} onChange={(e) => setFacilityName(e.target.value)} required />

              {/* Region Dropdown */}
              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-ui)" }}>
                  Region
                </label>
                <select
                  value={region}
                  onChange={(e) => { setRegion(e.target.value); setCity(""); }}
                  className="w-full px-4 py-3 bg-white border-2 border-[#e8e6dc] rounded-xl text-[#141413] focus:outline-none focus:border-[#2DD1AC] transition-all"
                  style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
                  required
                >
                  <option value="">Select region...</option>
                  {regionEntries.map(([id, r]) => (
                    <option key={id} value={id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* City Dropdown */}
              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-ui)" }}>
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-[#e8e6dc] rounded-xl text-[#141413] focus:outline-none focus:border-[#2DD1AC] transition-all"
                  style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
                  required
                  disabled={!region}
                >
                  <option value="">Select city...</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <Input label="Address" placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} />

              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-ui)" }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Tell families about your facility, your mission, and what makes you special..."
                  className="w-full px-4 py-3 text-[#141413] bg-white border-2 border-[#e8e6dc] rounded-xl transition-all placeholder:text-[#b0aea5] focus:outline-none focus:border-[#2DD1AC]"
                  style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Facility Phone" type="tel" placeholder="+63 ..." value={facilityPhone} onChange={(e) => setFacilityPhone(e.target.value)} />
                <Input label="Facility Email" type="email" placeholder="info@facility.com" value={facilityEmail} onChange={(e) => setFacilityEmail(e.target.value)} />
              </div>

              <Input label="Website (optional)" type="url" placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Capacity (beds)" type="number" placeholder="50" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                <Input label="Min Price (₱/mo)" type="number" placeholder="15000" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
                <Input label="Max Price (₱/mo)" type="number" placeholder="50000" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-3" style={{ fontFamily: "var(--font-ui)" }}>
                  Services Offered
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICES_LIST.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                        selectedServices.includes(service)
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

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600" style={{ fontFamily: "var(--font-ui)" }}>
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" size="lg" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" size="lg" isLoading={loading}>
                  Submit Application
                </Button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center mt-8 text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
          Already registered?{" "}
          <Link href="/auth/login" className="font-semibold text-[#2DD1AC] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
