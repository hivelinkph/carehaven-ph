"use client";

import { useState } from "react";
import { TestimonialCard } from "@/components/ui/testimonial-cards";

const testimonials = [
  {
    id: 1,
    testimonial:
      "SeniorLiving PH helped us find the perfect facility for our Lola. The daily health updates give us peace of mind even though we live abroad.",
    author: "Maria Santos - Quezon City",
  },
  {
    id: 2,
    testimonial:
      "The health monitoring dashboard is incredible. I can check my father's blood pressure and sugar levels every day from my phone.",
    author: "Roberto Cruz - Cebu City",
  },
  {
    id: 3,
    testimonial:
      "Finding a compassionate care home for my mother was so stressful until we found SeniorLiving PH. The Philippine map feature made it so easy.",
    author: "Elena Reyes - Davao City",
  },
];

export default function ShuffleCards() {
  const [positions, setPositions] = useState(["front", "middle", "back"]);

  const handleShuffle = () => {
    const newPositions = [...positions];
    newPositions.unshift(newPositions.pop()!);
    setPositions(newPositions);
  };

  return (
    <div className="grid place-content-center px-8 py-12">
      <div className="relative -ml-[100px] h-[450px] w-[350px] md:-ml-[175px]">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={testimonial.id}
            {...testimonial}
            handleShuffle={handleShuffle}
            position={positions[index]}
          />
        ))}
      </div>
    </div>
  );
}
