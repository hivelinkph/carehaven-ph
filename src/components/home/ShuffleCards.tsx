"use client";

import { useEffect, useState } from "react";
import { TestimonialCard } from "@/components/ui/testimonial-cards";
import { createClient } from "@/lib/supabase/client";

const FALLBACK_TESTIMONIALS = [
  {
    id: "1",
    name: "Maria Santos",
    location: "Quezon City",
    quote: "SeniorLiving PH helped us find the perfect facility for our Lola. The daily health updates give us peace of mind even though we live abroad.",
    image_url: null,
  },
  {
    id: "2",
    name: "Roberto Cruz",
    location: "Cebu City",
    quote: "The health monitoring dashboard is incredible. I can check my father's blood pressure and sugar levels every day from my phone.",
    image_url: null,
  },
  {
    id: "3",
    name: "Elena Reyes",
    location: "Davao City",
    quote: "Finding a compassionate care home for my mother was so stressful until we found SeniorLiving PH. The Philippine map feature made it so easy.",
    image_url: null,
  },
];

export default function ShuffleCards() {
  const [testimonials, setTestimonials] = useState<
    { id: string; name: string; location: string; quote: string; image_url: string | null }[]
  >([]);
  const [positions, setPositions] = useState<number[]>([]);

  useEffect(() => {
    async function fetchTestimonials() {
      const supabase = createClient();
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      const items = data && data.length > 0 ? data : FALLBACK_TESTIMONIALS;
      setTestimonials(items);
      setPositions(items.map((_, i) => i));
    }
    fetchTestimonials();
  }, []);

  const handleShuffle = () => {
    setPositions((prev) => {
      const newPos = [...prev];
      newPos.push(newPos.shift()!);
      return newPos;
    });
  };

  if (testimonials.length === 0) return null;

  return (
    <div className="flex flex-col items-center px-4 py-12">
      <div className="relative h-[440px] w-[min(340px,85vw)] md:h-[470px] md:w-[400px]">
        {testimonials.map((t, index) => (
          <TestimonialCard
            key={t.id}
            testimonial={t.quote}
            author={`${t.name} - ${t.location}`}
            imageUrl={t.image_url}
            handleShuffle={handleShuffle}
            position={positions[index]}
            total={testimonials.length}
          />
        ))}
      </div>
      <p
        className="text-center text-sm text-[#b0aea5] mt-4"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        Swipe card to see more
      </p>
    </div>
  );
}
