import HeroSection from "@/components/hero/HeroSection";
import ProvidersMarquee from "@/components/home/ProvidersMarquee";
import GalleryCarousel from "@/components/hero/GalleryCarousel";
import PhilippineMap from "@/components/map/PhilippineMap";
import ShuffleCards from "@/components/home/ShuffleCards";
import {
  ShieldCheck,
  Sparkles,
  MessageCircle,
  HandHeart,
  MapPinned,
  Scale,
  ClipboardList,
  Search,
  ArrowRight,
  Building2,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: ShieldCheck,
    tone: "teal" as const,
    title: "Vetted facilities",
    description:
      "Every listing is reviewed for licensing, capacity, and the services they actually provide. No exaggerations.",
  },
  {
    icon: Sparkles,
    tone: "pink" as const,
    title: "Smart matching",
    description:
      "Tell us about your loved one — care needs, location, budget — and we surface the homes that genuinely fit.",
  },
  {
    icon: MessageCircle,
    tone: "orange" as const,
    title: "Direct messaging",
    description:
      "Talk to providers in one place. Ask questions, share documents, schedule visits — no middleman.",
  },
  {
    icon: HandHeart,
    tone: "purple" as const,
    title: "Free for families",
    description:
      "Always free for the family. We're supported by partner facilities — never by hidden fees on your end.",
  },
  {
    icon: MapPinned,
    tone: "teal" as const,
    title: "Nationwide coverage",
    description:
      "Communities across Luzon, Visayas, and Mindanao — including Metro Manila, Cebu, Davao, Baguio, and beyond.",
  },
  {
    icon: Scale,
    tone: "pink" as const,
    title: "Compare with confidence",
    description:
      "Pricing, services, amenities, and photos side-by-side, so the decision feels clear instead of overwhelming.",
  },
];

const STEPS = [
  {
    n: "01",
    icon: ClipboardList,
    title: "Tell us about your loved one",
    body:
      "Answer a few warm, simple questions about care needs, preferred location, and budget. Takes about three minutes.",
  },
  {
    n: "02",
    icon: Search,
    title: "See your top matches",
    body:
      "We rank vetted facilities to your situation and show you the three that fit best — with everything you need to decide.",
  },
  {
    n: "03",
    icon: MessageCircle,
    title: "Connect directly",
    body:
      "Message providers, schedule a visit, and keep every conversation in one place. We're with you the whole way.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Providers Marquee */}
      <ProvidersMarquee />

      {/* How It Works */}
      <section className="py-20 lg:py-24" style={{ background: "var(--d-bg)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="section-eyebrow mb-5">How it works</span>
            <h2
              className="mt-4 text-3xl sm:text-4xl lg:text-5xl leading-[1.08]"
              style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)", fontWeight: 600, letterSpacing: "-0.02em" }}
            >
              Finding the right home, made gentle.
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed" style={{ color: "var(--d-ink-soft)", fontFamily: "var(--font-body)" }}>
              Three quiet steps. No cold calls, no pressure — just clear options
              and people ready to help.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Soft connector line on desktop */}
            <div
              aria-hidden
              className="hidden md:block absolute top-[3rem] left-[18%] right-[18%] h-px"
              style={{ background: "linear-gradient(to right, transparent, var(--d-divider), transparent)" }}
            />
            {STEPS.map((s) => (
              <div key={s.n} className="care-card p-7 relative">
                <div className="flex items-center gap-3 mb-5">
                  <span className="care-step-num">{s.n}</span>
                  <s.icon className="w-5 h-5" style={{ color: "var(--d-primary)" }} />
                </div>
                <h3
                  className="text-[20px] mb-2 leading-tight"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)", fontWeight: 600 }}
                >
                  {s.title}
                </h3>
                <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--d-ink-soft)", fontFamily: "var(--font-body)" }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/find-a-home"
              className="inline-flex items-center gap-2 px-7 py-3 text-[14.5px] font-semibold text-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              style={{ background: "var(--d-primary)", fontFamily: "var(--font-ui)" }}
            >
              Find a home for your loved one
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Carousel */}
      <GalleryCarousel />

      {/* Features (was Services) — marketplace promises */}
      <section id="services" className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="section-eyebrow mb-5">What we offer</span>
            <h2
              className="mt-4 text-3xl sm:text-4xl lg:text-5xl leading-[1.08]"
              style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)", fontWeight: 600, letterSpacing: "-0.02em" }}
            >
              Built around real Filipino families.
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed" style={{ color: "var(--d-ink-soft)", fontFamily: "var(--font-body)" }}>
              We don&rsquo;t run the facilities. We help you find the ones that
              are right — and stand by you while you choose.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <article key={f.title} className="care-card p-7">
                <div className="flex items-center gap-3 mb-5">
                  <span className={`care-tile-icon tone-${f.tone}`}>
                    <f.icon className="w-5 h-5" />
                  </span>
                </div>
                <h3
                  className="text-[19px] mb-2 leading-tight"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)", fontWeight: 600 }}
                >
                  {f.title}
                </h3>
                <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--d-ink-soft)", fontFamily: "var(--font-body)" }}>
                  {f.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Philippine Map */}
      <PhilippineMap />

      {/* About */}
      <section id="about" className="py-20 lg:py-24" style={{ background: "var(--d-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="section-eyebrow mb-5">About SeniorLiving PH</span>
            <h2
              className="mt-4 text-3xl sm:text-4xl lg:text-5xl leading-[1.08]"
              style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)", fontWeight: 600, letterSpacing: "-0.02em" }}
            >
              A quiet promise to Filipino families.
            </h2>
            <p className="mt-5 text-[16.5px] leading-[1.75]" style={{ color: "var(--d-ink-soft)", fontFamily: "var(--font-body)" }}>
              SeniorLiving PH is a trusted platform that helps Filipino families
              find the right assisted living and senior care options for their
              loved ones. Our mission is simple: make the search for quality
              senior care easier, more transparent, and less stressful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="care-card p-7">
              <div className="text-[11px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--d-primary)", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                The challenge
              </div>
              <p className="text-[14.5px] leading-[1.75]" style={{ color: "var(--d-ink-soft)", fontFamily: "var(--font-body)" }}>
                Finding the right care environment is overwhelming. Families
                struggle to compare facilities, understand pricing, or judge
                which services genuinely fit. We were built to make that easier.
              </p>
            </div>

            <div className="care-card p-7">
              <div className="text-[11px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--d-primary)", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                The matching
              </div>
              <p className="text-[14.5px] leading-[1.75]" style={{ color: "var(--d-ink-soft)", fontFamily: "var(--font-body)" }}>
                A neutral process that prioritises seniors and their families.
                We learn about care needs, location preferences, budget, and
                lifestyle, then surface options from our network of partners.
              </p>
            </div>

            <div
              className="care-card p-7"
              style={{ background: "var(--d-primary-soft)", borderColor: "transparent" }}
            >
              <div className="text-[11px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--d-primary-deep)", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                The price
              </div>
              <p className="text-[14.5px] leading-[1.75]" style={{ color: "var(--d-ink)", fontFamily: "var(--font-body)" }}>
                Always free for families. Our partner communities support the
                platform through referral fees, so the financial weight never
                lands on you during a difficult time.
              </p>
            </div>

            <div className="care-card p-7">
              <div className="text-[11px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--d-primary)", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                The promise
              </div>
              <p className="text-[14.5px] leading-[1.75]" style={{ color: "var(--d-ink-soft)", fontFamily: "var(--font-body)" }}>
                We help families make informed, confident decisions about senior
                care. Clear information, trusted connections, and a supportive
                process — start to finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-24 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="section-eyebrow mb-5">Stories from our families</span>
            <h2
              className="mt-4 text-3xl sm:text-4xl lg:text-5xl leading-[1.08]"
              style={{ fontFamily: "var(--font-heading)", color: "var(--d-ink)", fontWeight: 600, letterSpacing: "-0.02em" }}
            >
              Loved by Filipino families.
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed" style={{ color: "var(--d-ink-soft)", fontFamily: "var(--font-body)" }}>
              Real stories from people who found the right home for someone they love.
            </p>
          </div>

          <ShuffleCards />
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 lg:py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c4039 0%, #08312b 100%)" }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[28rem] h-[28rem] rounded-full blur-3xl" style={{ background: "rgba(26,133,118,0.25)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl" style={{ background: "rgba(158,230,212,0.12)" }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-[11px] tracking-[0.22em] uppercase text-white/95 mb-6" style={{ fontFamily: "var(--font-ui)" }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#9ee6d4" }} />
            Begin
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl text-white mb-5 leading-[1.08]"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "-0.02em" }}
          >
            Ready to find the right care?
          </h2>
          <p
            className="text-[15.5px] text-white/80 max-w-xl mx-auto mb-9"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Join thousands of Filipino families who use SeniorLiving PH to find
            compassionate, professional care for the people who raised them.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center" style={{ fontFamily: "var(--font-ui)" }}>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[14.5px] font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              style={{ background: "#9ee6d4", color: "#0c4039" }}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/facilities"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[14.5px] font-semibold text-white border-2 rounded-full hover:bg-white/10 transition-all"
              style={{ borderColor: "rgba(255,255,255,0.25)" }}
            >
              <Building2 className="w-4 h-4" />
              Browse Facilities
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
