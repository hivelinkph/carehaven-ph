import { LocationForm } from "@/components/locations/LocationForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AdminNewLocationPage() {
    return (
        <div className="min-h-screen bg-[#faf9f5] pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-[#b0aea5] hover:text-[#2DD1AC] mb-6 transition-colors"
                    style={{ fontFamily: "var(--font-ui)" }}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Admin Dashboard
                </Link>
                <div className="glass-card overflow-hidden">
                    <div className="p-6 md:p-8 bg-white/50 border-b border-[#e8e6dc]/50">
                        <h1 className="text-2xl font-bold text-[#2D3748]" style={{ fontFamily: "var(--font-heading)" }}>
                            Add a New City / Location
                        </h1>
                        <p className="text-[#b0aea5] mt-1" style={{ fontFamily: "var(--font-ui)" }}>
                            Create a public city location. This location will become an option for providers, and it will place a heart on the master map.
                        </p>
                    </div>
                    <div className="p-6 md:p-8">
                        <LocationForm mode="create" />
                    </div>
                </div>
            </div>
        </div>
    );
}
