"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Patient } from "@/lib/types";
import { UserPlus, ArrowLeft, ChevronRight, Building2, Calendar } from "lucide-react";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("patients")
          .select("*, facility:facilities(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setPatients(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
        <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#b0aea5] hover:text-[#2DD1AC] transition-colors mb-6"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
            Your Patients
          </h1>
          <Link
            href="/dashboard/patients/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2DD1AC] rounded-full hover:bg-[#2DD1AC]/90 shadow-md transition-all"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <UserPlus className="w-4 h-4" /> Add Patient
          </Link>
        </div>

        <div className="space-y-4">
          {patients.map((patient) => (
            <Link
              key={patient.id}
              href={`/dashboard/patients/${patient.id}`}
              className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-[#e8e6dc]/50 hover:shadow-md hover:border-[#2DD1AC]/20 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2DD1AC]/20 to-[#6a9bcc]/20 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                  {patient.full_name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-lg font-bold text-[#2D3748] group-hover:text-[#2DD1AC] transition-colors"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {patient.full_name}
                </h3>
                <div className="flex flex-wrap gap-4 mt-1 text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                  {patient.gender && <span>{patient.gender}</span>}
                  {patient.date_of_birth && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {patient.date_of_birth}
                    </span>
                  )}
                  {patient.facility && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {patient.facility.name}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#b0aea5] group-hover:text-[#2DD1AC] transition-colors shrink-0" />
            </Link>
          ))}

          {patients.length === 0 && (
            <div className="glass-card p-12 text-center">
              <p className="text-[#b0aea5] mb-4" style={{ fontFamily: "var(--font-body)" }}>
                You haven&apos;t added any patients yet.
              </p>
              <Link
                href="/dashboard/patients/new"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#2DD1AC] rounded-full"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <UserPlus className="w-4 h-4" /> Add Your First Patient
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
