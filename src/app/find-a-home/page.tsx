"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Check, Loader2, Heart, HandHeart } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { QuestionnaireConfig } from "@/lib/types";

// Step definitions
type StepType = "single" | "multi" | "info" | "loading" | "contact" | "confirmation";

interface Option {
  label: string;
  value: string;
  icon?: string;
}

interface Step {
  id: string;
  type: StepType;
  title?: string;
  subtitle?: string;
  options?: Option[];
  dynamicTitle?: (answers: Record<string, string | string[]>) => string;
  dynamicSubtitle?: (answers: Record<string, string | string[]>) => string;
  infoMessage?: (answers: Record<string, string | string[]>) => string;
}

function getPersonLabel(answers: Record<string, string | string[]>): string {
  const who = answers.who as string;
  if (!who) return "loved one";
  const map: Record<string, string> = {
    mom: "Mom",
    dad: "Dad",
    wife: "wife",
    husband: "husband",
    myself: "yourself",
    other: "loved one",
  };
  return map[who] || "loved one";
}

function getPossessive(answers: Record<string, string | string[]>): string {
  const who = answers.who as string;
  if (who === "myself") return "your";
  return `your ${getPersonLabel(answers)}'s`;
}

// Convert DB config to Step format
function buildStepsFromConfig(configs: QuestionnaireConfig[]): Step[] {
  const questionSteps: Step[] = configs
    .filter((c) => c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({
      id: c.step_id,
      type: c.answer_type as StepType,
      title: c.title,
      subtitle: c.subtitle || undefined,
      options: c.options,
    }));

  // Insert special steps: info after timeline, loading + contact + confirmation at end
  const result: Step[] = [];
  for (const s of questionSteps) {
    result.push(s);
    if (s.id === "timeline") {
      result.push({
        id: "timeline-info",
        type: "info",
        infoMessage: (a) => {
          const timeline = a.timeline as string;
          if (timeline === "immediately" || timeline === "30-days") {
            return "Good news: We can help you find care upon very short notice. Our network of facilities across the Philippines is ready to assist.";
          }
          return "Great! Taking time to research is a smart move. We'll help you find the perfect fit at your own pace.";
        },
      });
    }
  }

  result.push({ id: "loading", type: "loading" });
  result.push({
    id: "contact",
    type: "contact",
    title: "Almost there! Where should we send your results?",
    subtitle: "A senior care advisor will reach out to help you find the best match.",
  });
  result.push({ id: "confirmation", type: "confirmation" });

  return result;
}

// Fallback hardcoded steps if DB fetch fails
const FALLBACK_CONFIGS: QuestionnaireConfig[] = [
  { id: "f1", step_id: "who", title: "Who needs senior living?", subtitle: "We'll personalize your search based on your answer.", answer_type: "single", options: [{ label: "Mom", value: "mom", icon: "👩" }, { label: "Dad", value: "dad", icon: "👨" }, { label: "My Wife", value: "wife", icon: "👩‍🦳" }, { label: "My Husband", value: "husband", icon: "👨‍🦳" }, { label: "Myself", value: "myself", icon: "🙋" }, { label: "Other / Several", value: "other", icon: "👥" }], sort_order: 0, is_active: true, created_at: "", updated_at: "" },
  { id: "f2", step_id: "age", title: "What is the age?", subtitle: "This helps us find age-appropriate facilities.", answer_type: "single", options: [{ label: "55 – 64", value: "55-64" }, { label: "65 – 74", value: "65-74" }, { label: "75 – 84", value: "75-84" }, { label: "85+", value: "85+" }], sort_order: 1, is_active: true, created_at: "", updated_at: "" },
  { id: "f3", step_id: "timeline", title: "How quickly do you need to find an option?", subtitle: "We'll prioritize based on your timeline.", answer_type: "single", options: [{ label: "Immediately", value: "immediately" }, { label: "Within 30 days", value: "30-days" }, { label: "Within 60 days", value: "60-days" }, { label: "No rush, just exploring", value: "no-rush" }], sort_order: 2, is_active: true, created_at: "", updated_at: "" },
  { id: "f4", step_id: "living", title: "Where is your loved one living now?", subtitle: "This helps us understand current care needs.", answer_type: "single", options: [{ label: "Home alone", value: "home-alone", icon: "🏠" }, { label: "Home with someone", value: "home-with-someone", icon: "🏡" }, { label: "Assisted Living / Nursing Home", value: "assisted-living", icon: "🏥" }, { label: "Hospital", value: "hospital", icon: "🏨" }, { label: "Rehab Facility", value: "rehab", icon: "🏢" }], sort_order: 3, is_active: true, created_at: "", updated_at: "" },
  { id: "f5", step_id: "looking-for", title: "What are you looking for in a senior living facility?", subtitle: "Select all that apply.", answer_type: "multi", options: [{ label: "Companionship & social life", value: "companionship" }, { label: "Safety & security", value: "safety" }, { label: "Access to medical care", value: "medical-care" }, { label: "Activities & enrichment", value: "activities" }, { label: "Relief for caregiver", value: "caregiver-relief" }, { label: "Peace of mind", value: "peace-of-mind" }], sort_order: 4, is_active: true, created_at: "", updated_at: "" },
  { id: "f6", step_id: "mobility", title: "How is the current mobility?", subtitle: "This helps match facilities with the right accessibility features.", answer_type: "single", options: [{ label: "Great – fully independent", value: "great" }, { label: "Good – mostly independent", value: "good" }, { label: "Can walk with assistance", value: "walk-with-help" }, { label: "Uses a wheelchair", value: "wheelchair" }, { label: "Mostly immobile / bedridden", value: "immobile" }], sort_order: 5, is_active: true, created_at: "", updated_at: "" },
  { id: "f7", step_id: "assistance", title: "What assistance is needed?", subtitle: "Select all that apply.", answer_type: "multi", options: [{ label: "Housekeeping", value: "housekeeping" }, { label: "Meal preparation", value: "meal-prep" }, { label: "Toileting", value: "toileting" }, { label: "Bathing & grooming", value: "bathing" }, { label: "Medication management", value: "medication" }, { label: "Diabetic care", value: "diabetic-care" }, { label: "Social activities", value: "social" }, { label: "Other", value: "other" }, { label: "None of these", value: "none" }], sort_order: 6, is_active: true, created_at: "", updated_at: "" },
  { id: "f8", step_id: "cognitive", title: "Has your loved one experienced any of the following?", subtitle: "Select all that apply. This helps us identify memory care needs.", answer_type: "multi", options: [{ label: "Forgetfulness", value: "forgetfulness" }, { label: "Memory loss", value: "memory-loss" }, { label: "Confusion or disorientation", value: "confusion" }, { label: "Social withdrawal", value: "withdrawal" }, { label: "Aggressiveness", value: "aggressiveness" }, { label: "Hallucinations", value: "hallucinations" }, { label: "Needs 24/7 care", value: "24-7-care" }, { label: "Diagnosed with Alzheimer's", value: "alzheimers" }, { label: "None of these", value: "none" }], sort_order: 7, is_active: true, created_at: "", updated_at: "" },
  { id: "f9", step_id: "budget", title: "What is your monthly budget for senior living?", subtitle: "This helps us find options within your range.", answer_type: "single", options: [{ label: "Below ₱20,000", value: "below-20k" }, { label: "₱20,000 – ₱40,000", value: "20k-40k" }, { label: "₱40,000 – ₱70,000", value: "40k-70k" }, { label: "₱70,000 – ₱100,000", value: "70k-100k" }, { label: "₱100,000+", value: "100k-plus" }, { label: "Not sure yet", value: "not-sure" }], sort_order: 8, is_active: true, created_at: "", updated_at: "" },
];

export default function FindAHomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [dbConfigs, setDbConfigs] = useState<QuestionnaireConfig[] | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("questionnaire_config")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });
        if (data && data.length > 0) setDbConfigs(data);
        else setDbConfigs(FALLBACK_CONFIGS);
      } catch {
        setDbConfigs(FALLBACK_CONFIGS);
      }
    }
    fetchConfig();
  }, []);

  const STEPS = useMemo(() => buildStepsFromConfig(dbConfigs || FALLBACK_CONFIGS), [dbConfigs]);
  const PROGRESS_STEPS = useMemo(() => STEPS.filter((s) => s.type !== "info" && s.type !== "loading" && s.type !== "confirmation"), [STEPS]);

  const step = STEPS[currentStep];

  const getTitle = useCallback(
    (s: Step) => {
      if (s.dynamicTitle) return s.dynamicTitle(answers);
      return s.title || "";
    },
    [answers]
  );

  const getSubtitle = useCallback(
    (s: Step) => {
      if (s.dynamicSubtitle) return s.dynamicSubtitle(answers);
      return s.subtitle || "";
    },
    [answers]
  );

  const canGoNext = useCallback(() => {
    if (step.type === "info" || step.type === "loading" || step.type === "confirmation") return true;
    if (step.type === "contact") {
      return contactForm.firstName && contactForm.lastName && contactForm.email && contactForm.phone;
    }
    const answer = answers[step.id];
    if (step.type === "single") return !!answer;
    if (step.type === "multi") return Array.isArray(answer) && answer.length > 0;
    return false;
  }, [step, answers, contactForm]);

  const handleSingleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
    // Auto-advance after short delay
    setTimeout(() => {
      goNext();
    }, 350);
  };

  const handleMultiSelect = (value: string) => {
    setAnswers((prev) => {
      const current = (prev[step.id] as string[]) || [];
      // If selecting "none", clear others
      if (value === "none") return { ...prev, [step.id]: ["none"] };
      // If selecting something else, remove "none"
      const filtered = current.filter((v) => v !== "none");
      if (filtered.includes(value)) {
        return { ...prev, [step.id]: filtered.filter((v) => v !== value) };
      }
      return { ...prev, [step.id]: [...filtered, value] };
    });
  };

  const goNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Auto-advance loading step after delay
      if (STEPS[nextStep].type === "loading") {
        setTimeout(() => {
          setCurrentStep(nextStep + 1);
        }, 2500);
      }
    }
  }, [currentStep]);

  const goBack = () => {
    if (currentStep > 0) {
      let prev = currentStep - 1;
      // Skip loading step when going back
      if (STEPS[prev].type === "loading") prev--;
      setCurrentStep(prev);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Store lead in Supabase
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("care_leads").insert({
        first_name: contactForm.firstName,
        last_name: contactForm.lastName,
        email: contactForm.email,
        phone: contactForm.phone,
        answers: answers,
      });
    } catch {
      // Continue to confirmation even if save fails
    }
    setSubmitting(false);
    goNext();
  };

  // Progress calculation
  const progressIndex = PROGRESS_STEPS.findIndex((s) => s.id === step.id);
  const progressPercent = step.type === "confirmation"
    ? 100
    : progressIndex >= 0
    ? Math.round(((progressIndex + 1) / PROGRESS_STEPS.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col">
      {/* Progress Bar */}
      {step.type !== "confirmation" && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e8e6dc]/50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
            {currentStep > 0 && step.type !== "loading" && (
              <button
                onClick={goBack}
                className="p-2 rounded-full hover:bg-[#e8e6dc]/50 transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 text-[#2D3748]" />
              </button>
            )}
            <div className="flex-1">
              <div className="h-2 bg-[#e8e6dc] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/80 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <span
              className="text-xs text-[#b0aea5] font-medium min-w-[3rem] text-right"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              {progressPercent}%
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-2xl">
          {/* Single Select Step */}
          {step.type === "single" && (
            <div className="animate-fade-in-up">
              <h1
                className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-3 leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {getTitle(step)}
              </h1>
              <p
                className="text-lg text-[#b0aea5] mb-10"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {getSubtitle(step)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {step.options?.map((opt) => {
                  const isSelected = answers[step.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSingleSelect(opt.value)}
                      className={`flex items-center gap-4 px-6 py-5 rounded-2xl text-left transition-all border-2 ${
                        isSelected
                          ? "border-[#2DD1AC] bg-[#2DD1AC]/10 shadow-md"
                          : "border-[#e8e6dc] bg-white hover:border-[#2DD1AC]/40 hover:shadow-md"
                      }`}
                    >
                      {opt.icon && (
                        <span className="text-2xl">{opt.icon}</span>
                      )}
                      <span
                        className={`text-base font-medium ${
                          isSelected ? "text-[#2D3748]" : "text-[#2D3748]/80"
                        }`}
                        style={{ fontFamily: "var(--font-ui)" }}
                      >
                        {opt.label}
                      </span>
                      {isSelected && (
                        <Check className="w-5 h-5 text-[#2DD1AC] ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Multi Select Step */}
          {step.type === "multi" && (
            <div className="animate-fade-in-up">
              <h1
                className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-3 leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {getTitle(step)}
              </h1>
              <p
                className="text-lg text-[#b0aea5] mb-10"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {getSubtitle(step)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {step.options?.map((opt) => {
                  const selected = ((answers[step.id] as string[]) || []).includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleMultiSelect(opt.value)}
                      className={`flex items-center gap-4 px-6 py-5 rounded-2xl text-left transition-all border-2 ${
                        selected
                          ? "border-[#2DD1AC] bg-[#2DD1AC]/10 shadow-md"
                          : "border-[#e8e6dc] bg-white hover:border-[#2DD1AC]/40 hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                          selected
                            ? "border-[#2DD1AC] bg-[#2DD1AC]"
                            : "border-[#e8e6dc]"
                        }`}
                      >
                        {selected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span
                        className={`text-base font-medium ${
                          selected ? "text-[#2D3748]" : "text-[#2D3748]/80"
                        }`}
                        style={{ fontFamily: "var(--font-ui)" }}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={goNext}
                disabled={!canGoNext()}
                className={`w-full sm:w-auto px-10 py-4 rounded-full text-base font-semibold transition-all ${
                  canGoNext()
                    ? "bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/85 text-white shadow-lg shadow-[#2DD1AC]/25 hover:shadow-xl hover:-translate-y-0.5"
                    : "bg-[#e8e6dc] text-[#b0aea5] cursor-not-allowed"
                }`}
                style={{ fontFamily: "var(--font-ui)" }}
              >
                Continue
              </button>
            </div>
          )}

          {/* Info Step */}
          {step.type === "info" && (
            <div className="animate-fade-in-up text-center">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-[#2DD1AC]/15 flex items-center justify-center">
                <Heart className="w-10 h-10 text-[#2DD1AC]" />
              </div>
              <p
                className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-6 leading-relaxed"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {step.infoMessage?.(answers)}
              </p>
              <button
                onClick={goNext}
                className="px-10 py-4 rounded-full text-base font-semibold bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/85 text-white shadow-lg shadow-[#2DD1AC]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                Continue
              </button>
            </div>
          )}

          {/* Loading Step */}
          {step.type === "loading" && (
            <div className="animate-fade-in-up text-center">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-[#2DD1AC]/15 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#2DD1AC] animate-spin" />
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                We&apos;re tailoring your list...
              </h2>
              <p
                className="text-lg text-[#b0aea5]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Finding the best senior living options for{" "}
                {answers.who === "myself" ? "you" : `your ${getPersonLabel(answers)}`}.
              </p>
              <div className="mt-10 flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full bg-[#2DD1AC] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Contact Form Step */}
          {step.type === "contact" && (
            <div className="animate-fade-in-up">
              <h1
                className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-3 leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {getTitle(step)}
              </h1>
              <p
                className="text-lg text-[#b0aea5] mb-10"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {getSubtitle(step)}
              </p>
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-[#2D3748] mb-1.5"
                      style={{ fontFamily: "var(--font-ui)" }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      value={contactForm.firstName}
                      onChange={(e) =>
                        setContactForm((p) => ({ ...p, firstName: e.target.value }))
                      }
                      className="w-full px-5 py-4 rounded-xl border-2 border-[#e8e6dc] bg-white text-[#2D3748] outline-none focus:border-[#2DD1AC] transition-colors text-base"
                      style={{ fontFamily: "var(--font-body)" }}
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-[#2D3748] mb-1.5"
                      style={{ fontFamily: "var(--font-ui)" }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={contactForm.lastName}
                      onChange={(e) =>
                        setContactForm((p) => ({ ...p, lastName: e.target.value }))
                      }
                      className="w-full px-5 py-4 rounded-xl border-2 border-[#e8e6dc] bg-white text-[#2D3748] outline-none focus:border-[#2DD1AC] transition-colors text-base"
                      style={{ fontFamily: "var(--font-body)" }}
                      placeholder="Dela Cruz"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-[#2D3748] mb-1.5"
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className="w-full px-5 py-4 rounded-xl border-2 border-[#e8e6dc] bg-white text-[#2D3748] outline-none focus:border-[#2DD1AC] transition-colors text-base"
                    style={{ fontFamily: "var(--font-body)" }}
                    placeholder="juan@email.com"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-[#2D3748] mb-1.5"
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) =>
                      setContactForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full px-5 py-4 rounded-xl border-2 border-[#e8e6dc] bg-white text-[#2D3748] outline-none focus:border-[#2DD1AC] transition-colors text-base"
                    style={{ fontFamily: "var(--font-body)" }}
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!canGoNext() || submitting}
                className={`w-full py-4 rounded-full text-base font-semibold transition-all ${
                  canGoNext() && !submitting
                    ? "bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/85 text-white shadow-lg shadow-[#2DD1AC]/25 hover:shadow-xl hover:-translate-y-0.5"
                    : "bg-[#e8e6dc] text-[#b0aea5] cursor-not-allowed"
                }`}
                style={{ fontFamily: "var(--font-ui)" }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Get My Results"
                )}
              </button>
              <p
                className="text-xs text-[#b0aea5] text-center mt-4"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                By submitting, you agree to be contacted by a SeniorLiving PH advisor.
              </p>
            </div>
          )}

          {/* Confirmation Step */}
          {step.type === "confirmation" && (
            <div className="animate-fade-in-up text-center">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-[#2DD1AC]/15 flex items-center justify-center">
                <Check className="w-10 h-10 text-[#2DD1AC]" />
              </div>
              <h1
                className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                We&apos;ve received your details!
              </h1>
              <p
                className="text-lg text-[#b0aea5] mb-4 max-w-md mx-auto"
                style={{ fontFamily: "var(--font-body)" }}
              >
                A dedicated senior care advisor will review your preferences and
                reach out within 24 hours with personalized facility recommendations.
              </p>
              <div className="bg-white border-2 border-[#e8e6dc] rounded-2xl p-6 max-w-sm mx-auto mb-8">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#2DD1AC]/15 flex items-center justify-center">
                    <HandHeart className="w-6 h-6 text-[#2DD1AC]" />
                  </div>
                  <div className="text-left">
                    <p
                      className="text-sm font-semibold text-[#2D3748]"
                      style={{ fontFamily: "var(--font-ui)" }}
                    >
                      Your Care Advisor
                    </p>
                    <p
                      className="text-xs text-[#b0aea5]"
                      style={{ fontFamily: "var(--font-ui)" }}
                    >
                      Will contact you within 24 hours
                    </p>
                  </div>
                </div>
                <p
                  className="text-sm text-[#2D3748]/70"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  In the meantime, feel free to browse our facilities or explore
                  our resources.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/facilities"
                  className="px-8 py-4 rounded-full text-base font-semibold bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/85 text-white shadow-lg shadow-[#2DD1AC]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  Browse Facilities
                </Link>
                <Link
                  href="/"
                  className="px-8 py-4 rounded-full text-base font-semibold text-[#2D3748] bg-white border-2 border-[#e8e6dc] hover:border-[#2DD1AC]/40 hover:shadow-md transition-all"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Arrows - for multi-select and info steps */}
          {step.type !== "loading" && step.type !== "confirmation" && step.type !== "single" && (
            <div className="flex items-center justify-between mt-12">
              <button
                onClick={goBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  currentStep === 0
                    ? "text-[#b0aea5] cursor-not-allowed"
                    : "text-[#2D3748] hover:bg-white hover:shadow-md border border-transparent hover:border-[#e8e6dc]"
                }`}
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              {step.type !== "contact" && step.type !== "info" && (
                <button
                  onClick={goNext}
                  disabled={!canGoNext()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                    canGoNext()
                      ? "text-[#2DD1AC] hover:bg-[#2DD1AC]/10"
                      : "text-[#b0aea5] cursor-not-allowed"
                  }`}
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  Skip
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
