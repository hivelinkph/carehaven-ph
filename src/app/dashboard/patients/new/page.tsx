"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function NewPatientPage() {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("patients").insert({
      user_id: user.id,
      full_name: fullName,
      date_of_birth: dateOfBirth || null,
      gender: gender || null,
      medical_conditions: medicalConditions ? medicalConditions.split(",").map((s) => s.trim()) : [],
      allergies: allergies ? allergies.split(",").map((s) => s.trim()) : [],
      emergency_contact_name: emergencyName || null,
      emergency_contact_phone: emergencyPhone || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/patients");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/patients"
          className="inline-flex items-center gap-2 text-sm text-[#b0aea5] hover:text-[#2DD1AC] transition-colors mb-6"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patients
        </Link>

        <div className="glass-card p-8 sm:p-10">
          <h1 className="text-2xl font-bold text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Add New Patient
          </h1>
          <p className="text-[#b0aea5] mb-8" style={{ fontFamily: "var(--font-body)" }}>
            Enter your loved one&apos;s information to start tracking their care
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name of the patient"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-ui)" }}>
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 text-[#141413] bg-white border-2 border-[#e8e6dc] rounded-xl focus:outline-none focus:border-[#2DD1AC] hover:border-[#b0aea5] transition-all"
                  style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <Input
              label="Medical Conditions"
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
              placeholder="e.g. Diabetes, Hypertension (comma separated)"
            />

            <Input
              label="Allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Shellfish (comma separated)"
            />

            <div className="pt-4 border-t border-[#e8e6dc]/50">
              <h3 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Contact Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Emergency contact name"
                />
                <Input
                  label="Contact Phone"
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600" style={{ fontFamily: "var(--font-ui)" }}>
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" isLoading={loading}>
              <UserPlus className="w-5 h-5" />
              Add Patient
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
