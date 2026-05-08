import HeroSection from "@/components/hero/HeroSection";
import ProvidersMarquee from "@/components/home/ProvidersMarquee";
import GalleryCarousel from "@/components/hero/GalleryCarousel";
import PhilippineMap from "@/components/map/PhilippineMap";
import ShuffleCards from "@/components/home/ShuffleCards";
import {
  Stethoscope,
  HeartPulse,
  Users,
  Shield,
  Clock,
  Smartphone,
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

export default function Home() {
  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Providers Marquee */}
      <ProvidersMarquee />

      {/* Gallery Carousel */}
      <GalleryCarousel />

      {/* Services */}
      <section id="services" className="py-24 lg:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 mb-20">
            <div className="col-span-12 lg:col-span-4">
              <div className="chapter-mark mb-6">
                <span className="roman">I.</span>
                <span className="rule" />
                <span className="eyebrow">What we offer</span>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <h2
                className="text-4xl sm:text-5xl lg:text-6xl text-[#2D3748] leading-[1.05]"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 500, letterSpacing: "-0.02em" }}
              >
                Care that{" "}
                <span className="italic-accent" style={{ color: "#d97757" }}>goes beyond</span>{" "}
                a checklist.
              </h2>
              <p
                className="mt-5 text-lg text-[#5b5851] max-w-2xl"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Comprehensive healthcare services designed around the unique
                needs of Filipino seniors and their families — built on trust,
                tested in practice.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => (
              <article
                key={service.title}
                className="group editorial-card p-7 hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${service.color}15` }}
                  >
                    <service.icon className="w-6 h-6" style={{ color: service.color }} />
                  </div>
                  <span
                    className="text-xs tracking-[0.32em] uppercase text-[#b0aea5]"
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    {String(i + 1).padStart(2, "0")} / 06
                  </span>
                </div>
                <h3
                  className="text-2xl text-[#2D3748] mb-3 leading-tight"
                  style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
                >
                  {service.title}
                </h3>
                <p className="text-[#6b6862] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Philippine Map */}
      <PhilippineMap />

      {/* About SeniorLiving PH */}
      <section id="about" className="py-24 lg:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="grid grid-cols-12 gap-8 mb-16">
            <div className="col-span-12 lg:col-span-4">
              <div className="chapter-mark mb-6" style={{ color: "#6a9bcc" }}>
                <span className="roman">II.</span>
                <span className="rule" />
                <span className="eyebrow">About</span>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <h2
                className="text-4xl sm:text-5xl lg:text-6xl text-[#2D3748] leading-[1.04]"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 500, letterSpacing: "-0.02em" }}
              >
                A quiet promise to{" "}
                <span className="italic-accent" style={{ color: "#6a9bcc" }}>Filipino families</span>.
              </h2>
              <p
                className="drop-cap mt-8 text-lg text-[#3d3a35] leading-[1.75]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                SeniorLiving PH is a trusted platform that helps Filipino families find the right assisted living and senior care options for their loved ones. Our mission is simple: make the search for quality senior care easier, more transparent, and less stressful for families.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* Challenge & Solution */}
            <div className="grid grid-cols-12 gap-8 items-start">
              <div className="col-span-12 sm:col-span-3">
                <div className="text-[11px] tracking-[0.32em] uppercase text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                  ¶ The challenge
                </div>
              </div>
              <p className="col-span-12 sm:col-span-9 text-[1.05rem] text-[#3d3a35] leading-[1.8]" style={{ fontFamily: "var(--font-body)" }}>
                Finding the right care environment can be overwhelming. Families often struggle to compare facilities, understand pricing, or determine which services best meet their loved one&apos;s needs. SeniorLiving PH was created to simplify this process by connecting families with reputable assisted living communities and senior care providers across the Philippines.
              </p>
            </div>

            <div className="editorial-rule" />

            {/* How Matching Works */}
            <div className="grid grid-cols-12 gap-8 items-start">
              <div className="col-span-12 sm:col-span-3">
                <div className="text-[11px] tracking-[0.32em] uppercase text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                  ¶ The matching
                </div>
              </div>
              <div className="col-span-12 sm:col-span-9">
                <h3
                  className="text-2xl sm:text-3xl text-[#2D3748] mb-5 leading-tight"
                  style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
                >
                  How our matching process{" "}
                  <span className="italic-accent" style={{ color: "#2DD1AC" }}>actually works</span>.
                </h3>
                <p className="text-[1.05rem] text-[#3d3a35] leading-[1.8] mb-4" style={{ fontFamily: "var(--font-body)" }}>
                  Our platform uses a neutral matching process designed to prioritize the needs of seniors and their families. When families reach out, we learn about their situation — care needs, location preferences, budget, and lifestyle considerations. From that, we present suitable assisted living options from our network of trusted facility partners.
                </p>
                <p className="text-[1.05rem] text-[#6b6862] leading-[1.8]" style={{ fontFamily: "var(--font-body)" }}>
                  Families can then review, compare, and connect directly with these providers to explore the best fit.
                </p>
              </div>
            </div>

            <div className="editorial-rule" />

            {/* Always Free */}
            <div className="grid grid-cols-12 gap-8 items-start bg-gradient-to-br from-[#2DD1AC]/4 to-[#6a9bcc]/4 rounded-3xl p-8 sm:p-10 border border-[#2DD1AC]/15">
              <div className="col-span-12 sm:col-span-3">
                <div className="text-[11px] tracking-[0.32em] uppercase" style={{ fontFamily: "var(--font-ui)", color: "#2DD1AC" }}>
                  ¶ The price
                </div>
              </div>
              <div className="col-span-12 sm:col-span-9">
                <h3
                  className="text-2xl sm:text-3xl text-[#2D3748] mb-5 leading-tight"
                  style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
                >
                  Always <span className="italic-accent" style={{ color: "#2DD1AC" }}>free</span> for families.
                </h3>
                <p className="text-[1.05rem] text-[#3d3a35] leading-[1.8] mb-4" style={{ fontFamily: "var(--font-body)" }}>
                  SeniorLiving PH is completely free for families seeking assisted living options. No consultation fees. No referral fees. No hidden charges.
                </p>
                <p className="text-[1.05rem] text-[#6b6862] leading-[1.8]" style={{ fontFamily: "var(--font-body)" }}>
                  Our platform is supported by partner communities and care providers, who pay a referral fee when families choose their facilities — so the financial burden never falls on the family during an already-difficult decision.
                </p>
              </div>
            </div>

            <div className="editorial-rule" />

            {/* Our Commitment */}
            <div className="grid grid-cols-12 gap-8 items-start">
              <div className="col-span-12 sm:col-span-3">
                <div className="text-[11px] tracking-[0.32em] uppercase text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                  ¶ The promise
                </div>
              </div>
              <div className="col-span-12 sm:col-span-9">
                <h3
                  className="text-2xl sm:text-3xl text-[#2D3748] mb-5 leading-tight"
                  style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
                >
                  Our <span className="italic-accent" style={{ color: "#d97757" }}>commitment</span>.
                </h3>
                <p className="text-[1.05rem] text-[#3d3a35] leading-[1.8]" style={{ fontFamily: "var(--font-body)" }}>
                  We are committed to helping Filipino families make informed and confident decisions about senior care. By providing clear information, trusted facility connections, and a supportive matching process, SeniorLiving PH aims to make the journey to finding the right assisted living community simpler and more reassuring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32 bg-[#faf9f5] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 mb-14">
            <div className="col-span-12 lg:col-span-4">
              <div className="chapter-mark mb-6" style={{ color: "#2DD1AC" }}>
                <span className="roman">III.</span>
                <span className="rule" />
                <span className="eyebrow">Voices</span>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <h2
                className="text-4xl sm:text-5xl lg:text-6xl text-[#2D3748] leading-[1.04]"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 500, letterSpacing: "-0.02em" }}
              >
                Loved by{" "}
                <span className="italic-accent" style={{ color: "#2DD1AC" }}>Filipino families</span>.
              </h2>
              <p
                className="mt-5 text-lg text-[#5b5851] max-w-2xl"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Real stories from families who found the perfect care for their loved ones — in their own words.
              </p>
            </div>
          </div>

          <ShuffleCards />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-[#2D3748] to-[#1a2030] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-[#2DD1AC]/12 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#d97757]/12 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="chapter-mark justify-center mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
            <span className="roman" style={{ color: "#2DD1AC" }}>IV.</span>
            <span className="rule" style={{ background: "rgba(255,255,255,0.4)" }} />
            <span className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>Begin</span>
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-[1.05]"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 500, letterSpacing: "-0.02em" }}
          >
            Ready to find the{" "}
            <span className="italic-accent" style={{ color: "#2DD1AC" }}>right care</span>?
          </h2>
          <p
            className="text-lg text-white/65 max-w-2xl mx-auto mb-10"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Join thousands of Filipino families who trust SeniorLiving PH to help
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
