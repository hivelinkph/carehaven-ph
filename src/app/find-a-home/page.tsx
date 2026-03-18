"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Check, Loader2, Heart, MapPin, Star, Building2, Lock, MessageCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { QuestionnaireConfig, Facility, ProviderCareProfile } from "@/lib/types";

// Step definitions
type StepType = "single" | "multi" | "info" | "loading" | "results" | "confirmation";

interface MatchedFacility {
  facility: Facility;
  providerId: string;
  score: number;
  matchedAreas: string[];
}

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
    id: "results",
    type: "results",
    title: "Your Top Matches",
    subtitle: "Based on your answers, here are the best facilities for your needs.",
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
  const [dbConfigs, setDbConfigs] = useState<QuestionnaireConfig[] | null>(null);
  const [matchedFacilities, setMatchedFacilities] = useState<MatchedFacility[]>([]);
  const [matchingDone, setMatchingDone] = useState(false);

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

  // Matching algorithm: compare client answers with provider care profiles
  const runMatching = useCallback(async () => {
    const supabase = createClient();

    // Fetch all provider care profiles with their facility data
    const { data: profiles } = await supabase
      .from("provider_care_profiles")
      .select("*");

    if (!profiles || profiles.length === 0) {
      setMatchedFacilities([]);
      setMatchingDone(true);
      return;
    }

    // Fetch facilities for those profiles
    const facilityIds = profiles.map((p: ProviderCareProfile) => p.facility_id);
    const { data: facilities } = await supabase
      .from("facilities")
      .select("*")
      .in("id", facilityIds)
      .eq("is_active", true);

    if (!facilities || facilities.length === 0) {
      setMatchedFacilities([]);
      setMatchingDone(true);
      return;
    }

    // Score each provider profile against client answers
    const scored: MatchedFacility[] = [];

    for (const profile of profiles as ProviderCareProfile[]) {
      const facility = facilities.find((f: Facility) => f.id === profile.facility_id);
      if (!facility) continue;

      let score = 0;
      const matchedAreas: string[] = [];
      const providerAnswers = profile.answers;

      // Compare each question's answer
      for (const [stepId, clientAnswer] of Object.entries(answers)) {
        const providerAnswer = providerAnswers[stepId];
        if (!providerAnswer) continue;

        const clientValues = Array.isArray(clientAnswer) ? clientAnswer : [clientAnswer];
        const providerValues = Array.isArray(providerAnswer) ? providerAnswer : [providerAnswer];

        // Count overlapping values
        const overlap = clientValues.filter((v) => providerValues.includes(v));
        if (overlap.length > 0) {
          score += overlap.length;
          // Map step_id to readable label
          const stepLabels: Record<string, string> = {
            who: "Care recipient",
            age: "Age range",
            timeline: "Timeline",
            living: "Living situation",
            "looking-for": "Desired features",
            mobility: "Mobility needs",
            assistance: "Assistance needs",
            cognitive: "Cognitive care",
            budget: "Budget range",
          };
          matchedAreas.push(stepLabels[stepId] || stepId);
        }
      }

      if (score > 0) {
        scored.push({ facility, providerId: profile.provider_id, score, matchedAreas });
      }
    }

    // Sort by score descending, take top 3
    scored.sort((a, b) => b.score - a.score);
    const top3 = scored.slice(0, 3);

    // Record impressions for reporting
    if (top3.length > 0) {
      const impressions = top3.map((m) => ({
        facility_id: m.facility.id,
        provider_id: m.providerId,
        client_answers: answers,
        match_score: m.score,
      }));
      await supabase.from("match_impressions").insert(impressions);
    }

    setMatchedFacilities(top3);
    setMatchingDone(true);
  }, [answers]);

  const STEPS = useMemo(() => buildStepsFromConfig(dbConfigs || FALLBACK_CONFIGS), [dbConfigs]);
  const PROGRESS_STEPS = useMemo(() => STEPS.filter((s) => s.type !== "info" && s.type !== "loading" && s.type !== "confirmation" && s.type !== "results"), [STEPS]);

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
    if (step.type === "info" || step.type === "loading" || step.type === "confirmation" || step.type === "results") return true;
    const answer = answers[step.id];
    if (step.type === "single") return !!answer;
    if (step.type === "multi") return Array.isArray(answer) && answer.length > 0;
    return false;
  }, [step, answers]);

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

      // Auto-advance loading step after matching completes
      if (STEPS[nextStep].type === "loading") {
        setMatchingDone(false);
        runMatching().then(() => {
          setTimeout(() => {
            setCurrentStep(nextStep + 1);
          }, 1500);
        });
      }
    }
  }, [currentStep, runMatching]);

  const goBack = () => {
    if (currentStep > 0) {
      let prev = currentStep - 1;
      // Skip loading step when going back
      if (STEPS[prev].type === "loading") prev--;
      setCurrentStep(prev);
    }
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

          {/* Results Step - Top 3 Matches */}
          {step.type === "results" && (
            <div className="animate-fade-in-up">
              <h1
                className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-3 leading-tight text-center"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {getTitle(step)}
              </h1>
              <p
                className="text-lg text-[#b0aea5] mb-8 text-center"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {getSubtitle(step)}
              </p>

              {matchedFacilities.length > 0 ? (
                <div className="space-y-4 mb-8">
                  {matchedFacilities.map((match, index) => (
                    <div
                      key={match.facility.id}
                      className={`bg-white border-2 rounded-2xl overflow-hidden transition-all hover:shadow-lg ${
                        index === 0
                          ? "border-[#2DD1AC] shadow-md"
                          : "border-[#e8e6dc] hover:border-[#2DD1AC]/40"
                      }`}
                    >
                      {index === 0 && (
                        <div className="bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/80 text-white text-xs font-semibold px-4 py-1.5 text-center" style={{ fontFamily: "var(--font-ui)" }}>
                          Best Match
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Facility Image */}
                          <div className="w-20 h-20 rounded-xl bg-[#e8e6dc]/30 border border-[#e8e6dc]/50 flex items-center justify-center shrink-0 overflow-hidden">
                            {match.facility.image_urls?.[0] ? (
                              <img src={match.facility.image_urls[0]} alt={match.facility.name} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-8 h-8 text-[#b0aea5]" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3
                                className="text-lg font-bold text-[#2D3748] leading-tight"
                                style={{ fontFamily: "var(--font-heading)" }}
                              >
                                {match.facility.name}
                              </h3>
                              <span
                                className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#2DD1AC] bg-[#2DD1AC]/10 px-2.5 py-1 rounded-full"
                                style={{ fontFamily: "var(--font-ui)" }}
                              >
                                #{index + 1}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 mb-2 text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {match.facility.city}
                              </span>
                              {match.facility.rating && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 text-[#d97757]" fill="#d97757" />
                                  {match.facility.rating}
                                </span>
                              )}
                            </div>

                            {match.facility.description && (
                              <p
                                className="text-sm text-[#2D3748]/70 line-clamp-2 mb-3"
                                style={{ fontFamily: "var(--font-body)" }}
                              >
                                {match.facility.description}
                              </p>
                            )}

                            {/* Matched Areas */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {match.matchedAreas.map((area) => (
                                <span
                                  key={area}
                                  className="text-xs bg-[#2DD1AC]/10 text-[#2DD1AC] px-2.5 py-1 rounded-full font-medium"
                                  style={{ fontFamily: "var(--font-ui)" }}
                                >
                                  {area}
                                </span>
                              ))}
                            </div>

                            {/* Services */}
                            {match.facility.services && match.facility.services.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {match.facility.services.slice(0, 4).map((s) => (
                                  <span key={s} className="text-xs bg-[#e8e6dc]/50 text-[#2D3748]/60 px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-ui)" }}>
                                    {s}
                                  </span>
                                ))}
                                {match.facility.services.length > 4 && (
                                  <span className="text-xs text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
                                    +{match.facility.services.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Price Range */}
                            {(match.facility.price_range_min || match.facility.price_range_max) && (
                              <p className="text-sm font-semibold text-[#2D3748] mt-2" style={{ fontFamily: "var(--font-ui)" }}>
                                {match.facility.price_range_min && match.facility.price_range_max
                                  ? `₱${match.facility.price_range_min.toLocaleString()} – ₱${match.facility.price_range_max.toLocaleString()}/mo`
                                  : match.facility.price_range_min
                                  ? `From ₱${match.facility.price_range_min.toLocaleString()}/mo`
                                  : `Up to ₱${match.facility.price_range_max!.toLocaleString()}/mo`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : matchingDone ? (
                <div className="text-center py-12 mb-8">
                  <Building2 className="w-12 h-12 text-[#b0aea5] mx-auto mb-4" />
                  <p className="text-lg font-semibold text-[#2D3748] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    No matches found yet
                  </p>
                  <p className="text-sm text-[#b0aea5] max-w-md mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                    We&apos;re still growing our network. Browse all facilities to find one that fits your needs.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 mb-8">
                  <Loader2 className="w-10 h-10 text-[#2DD1AC] animate-spin mx-auto mb-4" />
                  <p className="text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>Finding your best matches...</p>
                </div>
              )}

              {/* Login prompt */}
              <div className="bg-[#2D3748]/5 border-2 border-[#e8e6dc] rounded-2xl p-5 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6a9bcc]/15 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-[#6a9bcc]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2D3748] mb-1" style={{ fontFamily: "var(--font-ui)" }}>
                      Want to chat with providers?
                    </p>
                    <p className="text-sm text-[#b0aea5] mb-3" style={{ fontFamily: "var(--font-body)" }}>
                      Sign in to see contact details and message facilities directly.
                    </p>
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#6a9bcc] text-white hover:bg-[#5a8bbc] transition-all shadow-sm"
                      style={{ fontFamily: "var(--font-ui)" }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Sign In to Connect
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/facilities"
                  className="px-8 py-4 rounded-full text-base font-semibold bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/85 text-white shadow-lg shadow-[#2DD1AC]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all text-center"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  Browse All Facilities
                </Link>
                <Link
                  href="/"
                  className="px-8 py-4 rounded-full text-base font-semibold text-[#2D3748] bg-white border-2 border-[#e8e6dc] hover:border-[#2DD1AC]/40 hover:shadow-md transition-all text-center"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Confirmation Step - now just a thank you */}
          {step.type === "confirmation" && (
            <div className="animate-fade-in-up text-center">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-[#2DD1AC]/15 flex items-center justify-center">
                <Check className="w-10 h-10 text-[#2DD1AC]" />
              </div>
              <h1
                className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Thank you for using SeniorLiving PH!
              </h1>
              <p
                className="text-lg text-[#b0aea5] mb-8 max-w-md mx-auto"
                style={{ fontFamily: "var(--font-body)" }}
              >
                We hope you found a great match. Create an account to connect directly
                with facilities and get personalized recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/login"
                  className="px-8 py-4 rounded-full text-base font-semibold bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/85 text-white shadow-lg shadow-[#2DD1AC]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  Create Account
                </Link>
                <Link
                  href="/facilities"
                  className="px-8 py-4 rounded-full text-base font-semibold text-[#2D3748] bg-white border-2 border-[#e8e6dc] hover:border-[#2DD1AC]/40 hover:shadow-md transition-all"
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
          {step.type !== "loading" && step.type !== "confirmation" && step.type !== "single" && step.type !== "results" && (
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
              {step.type !== "info" && (
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
