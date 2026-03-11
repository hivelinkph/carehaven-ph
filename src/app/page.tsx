import HeroSection from "@/components/hero/HeroSection";
import GalleryCarousel from "@/components/hero/GalleryCarousel";
import PhilippineMap from "@/components/map/PhilippineMap";
import {
  Stethoscope,
  HeartPulse,
  Users,
  Shield,
  Clock,
  Smartphone,
  Star,
  ArrowRight,
  Heart,
} from "lucide-react";
import Link from "next/link";

const SERVICES = [
  {
    icon: HeartPulse,
    title: "Daily Health Monitoring",
    description:
      "Blood pressure, sugar levels, CBC, and vital signs checked and recorded daily by licensed professionals.",
    color: "#2DD1AC",
  },
  {
    icon: Stethoscope,
    title: "Professional Medical Care",
    description:
      "Round-the-clock nursing care with licensed caregivers who treat your loved ones like family.",
    color: "#d97757",
  },
  {
    icon: Users,
    title: "Family Dashboard",
    description:
      "View your patient's daily test results, health trends, and care updates from anywhere in the world.",
    color: "#6a9bcc",
  },
  {
    icon: Shield,
    title: "Verified Facilities",
    description:
      "Every facility is vetted for quality, safety, and compassionate care standards before listing.",
    color: "#788c5d",
  },
  {
    icon: Clock,
    title: "24/7 Care & Support",
    description:
      "Emergency response teams and round-the-clock caregivers ensure your loved ones are always safe.",
    color: "#2DD1AC",
  },
  {
    icon: Smartphone,
    title: "Real-Time Updates",
    description:
      "Get notified of health readings, medication schedules, and care activities through your dashboard.",
    color: "#d97757",
  },
];

const TESTIMONIALS = [
  {
    name: "Maria Santos",
    location: "Quezon City",
    quote:
      "CareHaven helped us find the perfect facility for our Lola. The daily health updates give us peace of mind even though we live abroad.",
    rating: 5,
  },
  {
    name: "Roberto Cruz",
    location: "Cebu City",
    quote:
      "The health monitoring dashboard is incredible. I can check my father's blood pressure and sugar levels every day from my phone.",
    rating: 5,
  },
  {
    name: "Elena Reyes",
    location: "Davao City",
    quote:
      "Finding a compassionate care home for my mother was so stressful until we found CareHaven. The Philippine map feature made it so easy.",
    rating: 5,
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Gallery Carousel */}
      <GalleryCarousel />

      {/* Services */}
      <section id="services" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d97757]/10 border border-[#d97757]/20 mb-6"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              <Stethoscope className="w-4 h-4 text-[#d97757]" />
              <span className="text-sm font-medium text-[#2D3748]">What We Offer</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Care That Goes{" "}
              <span className="text-[#d97757]">Beyond</span>
            </h2>
            <p className="text-lg text-[#b0aea5] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
              Comprehensive healthcare services designed around the unique needs of
              Filipino seniors and their families
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, i) => (
              <div
                key={service.title}
                className="group p-8 rounded-2xl border border-[#e8e6dc]/50 bg-[#faf9f5]/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${service.color}15` }}
                >
                  <service.icon className="w-7 h-7" style={{ color: service.color }} />
                </div>
                <h3
                  className="text-xl font-bold text-[#2D3748] mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {service.title}
                </h3>
                <p className="text-[#b0aea5] leading-relaxed text-base" style={{ fontFamily: "var(--font-body)" }}>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philippine Map */}
      <PhilippineMap />

      {/* About / Why CareHaven */}
      <section id="about" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6a9bcc]/10 border border-[#6a9bcc]/20 mb-6"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <Heart className="w-4 h-4 text-[#6a9bcc]" fill="#6a9bcc" />
                <span className="text-sm font-medium text-[#2D3748]">Why CareHaven</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Because Your Loved Ones Deserve{" "}
                <span className="text-[#6a9bcc]">the Very Best</span>
              </h2>
              <p className="text-lg text-[#b0aea5] leading-relaxed mb-8" style={{ fontFamily: "var(--font-body)" }}>
                We understand how difficult it is to entrust the care of a parent, grandparent,
                or loved one to someone else. That&apos;s why CareHaven PH was built — to give
                Filipino families transparency, trust, and peace of mind.
              </p>
              <div className="space-y-4">
                {[
                  "Every facility verified for quality and safety",
                  "Daily health reports sent directly to your dashboard",
                  "Licensed Filipino caregivers with genuine compassion",
                  "Transparent pricing with no hidden fees",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#2DD1AC]/10 flex items-center justify-center mt-0.5 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#2DD1AC]" />
                    </div>
                    <span className="text-[#2D3748]" style={{ fontFamily: "var(--font-body)" }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-[#e8e6dc]/30 to-[#2DD1AC]/5 border border-[#e8e6dc]/50 flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-[#2DD1AC]/10 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-[#2DD1AC]" fill="#2DD1AC" />
                  </div>
                  <p className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                    Place your facility image here
                  </p>
                  <p className="text-xs text-[#b0aea5]/60 mt-1" style={{ fontFamily: "var(--font-ui)" }}>
                    /public/assets/images/
                  </p>
                </div>
              </div>
              {/* Decorative */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#2DD1AC]/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#d97757]/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-[#faf9f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Loved by Filipino{" "}
              <span className="text-[#2DD1AC]">Families</span>
            </h2>
            <p className="text-lg text-[#b0aea5] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
              Real stories from families who found the perfect care for their loved ones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="glass-card p-8 flex flex-col"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#d97757]" fill="#d97757" />
                  ))}
                </div>
                <p
                  className="text-[#2D3748] leading-relaxed mb-6 flex-1"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ fontFamily: "var(--font-ui)" }}>
                  <p className="text-sm font-semibold text-[#2D3748]">{t.name}</p>
                  <p className="text-xs text-[#b0aea5]">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-[#2D3748] to-[#2D3748]/95 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2DD1AC]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#d97757]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ready to Find the Right Care?
          </h2>
          <p
            className="text-lg text-white/60 max-w-2xl mx-auto mb-10"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Join thousands of Filipino families who trust CareHaven PH to help
            them find compassionate, professional care for their loved ones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ fontFamily: "var(--font-ui)" }}>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-[#2D3748] bg-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/facilities"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/20 rounded-full hover:bg-white/10 transition-all"
            >
              Browse Facilities
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
