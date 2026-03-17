"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface TestimonialCardProps {
  handleShuffle: () => void;
  testimonial: string;
  position: number; // 0 = front, 1, 2, ... = further back
  imageUrl: string | null;
  author: string;
  total: number;
}

export function TestimonialCard({
  handleShuffle,
  testimonial,
  position,
  imageUrl,
  author,
  total,
}: TestimonialCardProps) {
  const dragRef = React.useRef(0);
  const isFront = position === 0;
  const isVisible = position < 3;

  // Stagger: back cards offset right and rotated, scaling down slightly
  const rotate = position === 0 ? -3 : position === 1 ? 2 : 7;
  const xPx = position === 0 ? 0 : position === 1 ? 20 : 40;
  const yPx = position === 0 ? 0 : position === 1 ? -8 : -16;
  const scale = position === 0 ? 1 : position === 1 ? 0.97 : 0.94;
  const zIndex = total - position;

  return (
    <motion.div
      style={{ zIndex }}
      animate={{
        rotate: isVisible ? rotate : 7,
        x: isVisible ? xPx : 40,
        y: isVisible ? yPx : -16,
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? scale : 0.9,
      }}
      drag={true}
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onDragStart={(e) => {
        dragRef.current = (e as unknown as MouseEvent).clientX;
      }}
      onDragEnd={(e) => {
        if (dragRef.current - (e as unknown as MouseEvent).clientX > 100) {
          handleShuffle();
        }
        dragRef.current = 0;
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 grid h-[420px] w-[min(300px,80vw)] select-none place-content-center space-y-5 rounded-2xl border-2 border-[#e8e6dc] bg-white/90 p-5 shadow-xl backdrop-blur-md md:h-[450px] md:w-[350px] md:space-y-6 md:p-6 ${
        isFront ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <img
        src={imageUrl || `https://i.pravatar.cc/128?img=${Math.abs(author.charCodeAt(0) % 70)}`}
        alt={`Avatar of ${author}`}
        className="pointer-events-none mx-auto h-24 w-24 rounded-full border-2 border-[#e8e6dc] bg-[#faf9f5] object-cover md:h-32 md:w-32"
      />
      <span
        className="text-center text-base italic text-[#2D3748] md:text-lg"
        style={{ fontFamily: "var(--font-body)" }}
      >
        &ldquo;{testimonial}&rdquo;
      </span>
      <span
        className="text-center text-sm font-medium text-[#2DD1AC]"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        {author}
      </span>
    </motion.div>
  );
}
