"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Patient, HealthRecord } from "@/lib/types";
import { getVitalStatus, VITAL_RANGES } from "@/lib/constants";
import HealthChart from "@/components/dashboard/HealthChart";
import {
  ArrowLeft,
  Heart,
  Thermometer,
  Droplets,
  Activity,
  Wind,
  Weight,
  TestTube,
  Calendar,
  Building2,
  AlertCircle,
  User,
} from "lucide-react";

const VITAL_CONFIG = [
  { key: "blood_pressure_systolic", label: "Blood Pressure", unit: "mmHg", icon: Heart, color: "#e53e3e",
    format: (r: HealthRecord) => r.blood_pressure_systolic && r.blood_pressure_diastolic ? `${r.blood_pressure_systolic}/${r.blood_pressure_diastolic}` : null },
  { key: "heart_rate", label: "Heart Rate", unit: "bpm", icon: Activity, color: "#d97757",
    format: (r: HealthRecord) => r.heart_rate?.toString() ?? null },
  { key: "blood_sugar_level", label: "Blood Sugar", unit: "mg/dL", icon: Droplets, color: "#2DD1AC",
    format: (r: HealthRecord) => r.blood_sugar_level?.toString() ?? null },
  { key: "temperature", label: "Temperature", unit: "°C", icon: Thermometer, color: "#6a9bcc",
    format: (r: HealthRecord) => r.temperature?.toString() ?? null },
  { key: "oxygen_saturation", label: "Oxygen (SpO2)", unit: "%", icon: Wind, color: "#788c5d",
    format: (r: HealthRecord) => r.oxygen_saturation?.toString() ?? null },
  { key: "weight", label: "Weight", unit: "kg", icon: Weight, color: "#b0aea5",
    format: (r: HealthRecord) => r.weight?.toString() ?? null },
] as const;

export default function PatientDetailPage() {
  const params = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVital, setSelectedVital] = useState<string>("blood_pressure_systolic");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: patientData } = await supabase
        .from("patients")
        .select("*, facility:facilities(*)")
        .eq("id", params.id)
        .single();

      const { data: recordsData } = await supabase
        .from("health_records")
        .select("*")
        .eq("patient_id", params.id)
        .order("record_date", { ascending: false })
        .limit(30);

      setPatient(patientData);
      setRecords(recordsData || []);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
        <div className="animate-pulse text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Loading patient data...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-24 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#b0aea5] mx-auto mb-4" />
          <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Patient not found</p>
          <Link href="/dashboard/patients" className="text-[#2DD1AC] text-sm font-semibold mt-2 block" style={{ fontFamily: "var(--font-ui)" }}>
            Back to patients
          </Link>
        </div>
      </div>
    );
  }

  const latestRecord = records[0];

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/patients"
          className="inline-flex items-center gap-2 text-sm text-[#b0aea5] hover:text-[#2DD1AC] transition-colors mb-6"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patients
        </Link>

        {/* Patient Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2DD1AC]/20 to-[#6a9bcc]/20 flex items-center justify-center shrink-0">
              <User className="w-10 h-10 text-[#2D3748]" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                {patient.full_name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                {patient.gender && <span>{patient.gender}</span>}
                {patient.date_of_birth && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Born {patient.date_of_birth}
                  </span>
                )}
                {patient.facility && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {patient.facility.name}
                  </span>
                )}
              </div>
              {patient.medical_conditions && patient.medical_conditions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {patient.medical_conditions.map((c) => (
                    <span key={c} className="text-xs font-medium text-[#d97757] bg-[#d97757]/10 px-3 py-1 rounded-full" style={{ fontFamily: "var(--font-ui)" }}>
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vital Cards */}
        <h2 className="text-xl font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          Latest Vitals {latestRecord && <span className="text-sm font-normal text-[#b0aea5] ml-2">({latestRecord.record_date})</span>}
        </h2>

        {records.length === 0 ? (
          <div className="glass-card p-12 text-center mb-8">
            <TestTube className="w-12 h-12 text-[#b0aea5] mx-auto mb-4" />
            <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-body)" }}>
              No health records yet. Records will appear here once the facility starts logging daily vitals.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {VITAL_CONFIG.map((vital) => {
                const value = vital.format(latestRecord);
                const numericValue = latestRecord[vital.key as keyof HealthRecord] as number | null;
                const status = numericValue != null && vital.key in VITAL_RANGES
                  ? getVitalStatus(vital.key as keyof typeof VITAL_RANGES, numericValue)
                  : "normal";

                return (
                  <button
                    key={vital.key}
                    onClick={() => setSelectedVital(vital.key)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedVital === vital.key
                        ? "border-[#2DD1AC] bg-[#2DD1AC]/5 shadow-md"
                        : "border-[#e8e6dc]/50 bg-white hover:border-[#2DD1AC]/30"
                    } ${status === "critical" ? "vital-critical" : status === "warning" ? "vital-warning" : "vital-normal"}`}
                  >
                    <vital.icon className="w-5 h-5 mb-2" style={{ color: vital.color }} />
                    <div className="text-xs text-[#b0aea5] mb-1" style={{ fontFamily: "var(--font-ui)" }}>
                      {vital.label}
                    </div>
                    <div className="text-lg font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                      {value || "—"}
                    </div>
                    <div className="text-xs text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                      {vital.unit}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Chart */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-lg font-bold text-[#2D3748] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                {VITAL_CONFIG.find((v) => v.key === selectedVital)?.label} Trend
              </h3>
              <HealthChart records={records} vitalKey={selectedVital} />
            </div>

            {/* Records Table */}
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-[#e8e6dc]/50">
                <h3 className="text-lg font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                  Recent Health Records
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ fontFamily: "var(--font-ui)" }}>
                  <thead>
                    <tr className="bg-[#e8e6dc]/20">
                      <th className="text-left py-3 px-4 font-semibold text-[#2D3748]">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D3748]">BP</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D3748]">HR</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D3748]">Sugar</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D3748]">Temp</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D3748]">SpO2</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D3748]">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id} className="border-t border-[#e8e6dc]/30 hover:bg-[#faf9f5]">
                        <td className="py-3 px-4 text-[#2D3748] font-medium">{r.record_date}</td>
                        <td className="py-3 px-4 text-[#2D3748]">
                          {r.blood_pressure_systolic && r.blood_pressure_diastolic
                            ? `${r.blood_pressure_systolic}/${r.blood_pressure_diastolic}`
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-[#2D3748]">{r.heart_rate ?? "—"}</td>
                        <td className="py-3 px-4 text-[#2D3748]">{r.blood_sugar_level ?? "—"}</td>
                        <td className="py-3 px-4 text-[#2D3748]">{r.temperature ?? "—"}</td>
                        <td className="py-3 px-4 text-[#2D3748]">{r.oxygen_saturation ? `${r.oxygen_saturation}%` : "—"}</td>
                        <td className="py-3 px-4 text-[#b0aea5] max-w-[200px] truncate">{r.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
