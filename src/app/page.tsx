import HeroSection from "@/components/hero/HeroSection";
import ProvidersMarquee from "@/components/home/ProvidersMarquee";
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
      "SeniorLiving PH helped us find the perfect facility for our Lola. The daily health updates give us peace of mind even though we live abroad.",
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
      "Finding a compassionate care home for my mother was so stressful until we found SeniorLiving PH. The Philippine map feature made it so easy.",
    rating: 5,
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

      {/* About SeniorLiving PH */}
      <section id="about" className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6a9bcc]/10 border border-[#6a9bcc]/20 mb-6"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              <Heart className="w-4 h-4 text-[#6a9bcc]" fill="#6a9bcc" />
              <span className="text-sm font-medium text-[#2D3748]">About Us</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              About <span className="text-[#6a9bcc]">SeniorLiving PH</span>
            </h2>
            <p className="text-lg text-[#b0aea5] leading-relaxed max-w-3xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
              SeniorLiving PH is a trusted platform that helps Filipino families find the right assisted living and senior care options for their loved ones. Our mission is simple: make the search for quality senior care easier, more transparent, and less stressful for families.
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-16">
            {/* Challenge & Solution */}
            <div className="bg-[#faf9f5] rounded-3xl p-8 sm:p-10 lg:p-12 border border-[#e8e6dc]/50">
              <p className="text-lg text-[#2D3748] leading-relaxed mb-6" style={{ fontFamily: "var(--font-body)" }}>
                Finding the right care environment can be overwhelming. Families often struggle to compare facilities, understand pricing, or determine which services best meet their loved one&apos;s needs. SeniorLiving PH was created to simplify this process by connecting families with reputable assisted living communities and senior care providers across the Philippines.
              </p>
            </div>

            {/* How Matching Works */}
            <div>
              <h3
                className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                How Our Matching Process{" "}
                <span className="text-[#2DD1AC]">Works</span>
              </h3>
              <p className="text-lg text-[#b0aea5] leading-relaxed mb-6" style={{ fontFamily: "var(--font-body)" }}>
                Our platform uses a neutral matching process designed to prioritize the needs of seniors and their families. When families reach out, we learn about their situation — such as care needs, location preferences, budget, and lifestyle considerations. Based on this information, we present suitable assisted living and senior care options from our network of trusted facility partners.
              </p>
              <p className="text-lg text-[#b0aea5] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                Families can then review, compare, and connect directly with these providers to explore the best fit for their loved ones.
              </p>
            </div>

            {/* Always Free */}
            <div className="bg-gradient-to-br from-[#2DD1AC]/5 to-[#6a9bcc]/5 rounded-3xl p-8 sm:p-10 lg:p-12 border border-[#2DD1AC]/15">
              <h3
                className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Always <span className="text-[#2DD1AC]">Free</span> for Families
              </h3>
              <p className="text-lg text-[#b0aea5] leading-relaxed mb-6" style={{ fontFamily: "var(--font-body)" }}>
                SeniorLiving PH is completely free for families seeking assisted living options. There are no consultation fees, no referral fees, and no hidden charges for using our service.
              </p>
              <p className="text-lg text-[#b0aea5] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                Our platform is supported by our partner assisted living communities and care providers, who pay a referral or marketing fee when families choose their facilities. This allows us to maintain our service without adding financial burden to families during an already challenging decision-making process.
              </p>
            </div>

            {/* Our Commitment */}
            <div>
              <h3
                className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Our <span className="text-[#d97757]">Commitment</span>
              </h3>
              <p className="text-lg text-[#b0aea5] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                We are committed to helping Filipino families make informed and confident decisions about senior care. By providing clear information, trusted facility connections, and a supportive matching process, SeniorLiving PH aims to make the journey to finding the right assisted living community simpler and more reassuring.
              </p>
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
