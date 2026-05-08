"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { SERVICES_LIST } from "@/lib/constants";
import AuthLayout from "@/components/auth/AuthLayout";
import { CheckCircle2, Building2, ChevronRight, ArrowRight } from "lucide-react";

export default function ProviderSignupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Step 1: Account
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2: Facility
  const [facilityName, setFacilityName] = useState("");
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
      <AuthLayout
        title={
          <>
            Application{" "}
            <span style={{ fontFamily: "var(--font-accent)", fontStyle: "italic", color: "#1a8576" }}>submitted</span>
          </>
        }
        subtitle="We'll review your facility and get back to you soon."
      >
        <div className="rounded-2xl border bg-[#f5fbf9] p-5 flex items-start gap-3" style={{ borderColor: "#cfe9e0" }}>
          <span className="w-9 h-9 rounded-full bg-[#1a8576]/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" style={{ color: "#1a8576" }} />
          </span>
          <div className="text-[14px] leading-relaxed" style={{ color: "#0c4039", fontFamily: "var(--font-body)" }}>
            Check your email at <strong>{email}</strong> to verify your account.
            Your facility listing will be reviewed by our admin team and activated once approved.
          </div>
        </div>
        <Link
          href="/auth/login"
          className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-white text-[14.5px] font-semibold shadow-md hover:opacity-95 transition-all"
          style={{ background: "#1a8576", fontFamily: "var(--font-ui)" }}
        >
          Go to login
          <ArrowRight className="w-4 h-4" />
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      wide
      topRight={
        <>
          Already registered?{" "}
          <Link href="/auth/login" className="font-semibold" style={{ color: "#1a8576" }}>
            Sign in
          </Link>
        </>
      }
      title={
        <>
          Register your{" "}
          <span style={{ fontFamily: "var(--font-accent)", fontStyle: "italic", color: "#1a8576" }}>facility</span>
        </>
      }
      subtitle="Join CareHaven PH and reach families looking for quality care"
    >
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-7" style={{ fontFamily: "var(--font-ui)" }}>
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium ${step >= 1 ? "text-white" : ""}`}
          style={{
            background: step >= 1 ? "#1a8576" : "#f3eee3",
            color: step >= 1 ? "white" : "#7a8a86",
          }}
        >
          <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px]">1</span>
          Account
        </div>
        <ChevronRight className="w-4 h-4" style={{ color: "#b0aea5" }} />
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium`}
          style={{
            background: step >= 2 ? "#1a8576" : "#f3eee3",
            color: step >= 2 ? "white" : "#7a8a86",
          }}
        >
          <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px]">2</span>
          Facility
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Account Details */}
        {step === 1 && (
          <div className="space-y-4">
              <Input label="Full Name" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Phone Number" type="tel" placeholder="+63 9XX XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <Input label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-700" style={{ fontFamily: "var(--font-ui)" }}>
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
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4" style={{ color: "#1a8576" }} />
                <h2 className="text-[15px] font-semibold" style={{ color: "#0c4039", fontFamily: "var(--font-ui)" }}>
                  Facility Information
                </h2>
              </div>

              <Input label="Facility Name" placeholder="Name of your facility" value={facilityName} onChange={(e) => setFacilityName(e.target.value)} required />

              <Input label="City" placeholder="e.g. Quezon City" value={city} onChange={(e) => setCity(e.target.value)} required />

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
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-700" style={{ fontFamily: "var(--font-ui)" }}>
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
    </AuthLayout>
  );
}
