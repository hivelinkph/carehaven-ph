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

/** Decorative SVG: a small heart */
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

/** Decorative SVG: a leaf / care symbol */
function LeafIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17 8C8 10 5.9 16.17 3.82 21L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-13 7" />
    </svg>
  );
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
      className={`absolute left-0 top-0 h-[420px] w-[min(300px,80vw)] select-none rounded-2xl border-2 border-[#2DD1AC] bg-white/95 shadow-xl shadow-teal-100/60 backdrop-blur-md md:h-[450px] md:w-[350px] overflow-hidden ${
        isFront ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      {/* Top teal gradient accent strip */}
      <div
        className="w-full h-2"
        style={{
          background:
            "linear-gradient(90deg, #2DD1AC 0%, #14b8a6 50%, #5eead4 100%)",
        }}
      />

      {/* Decorative background watermark hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <HeartIcon className="absolute -bottom-6 -right-6 w-36 h-36 text-[#2DD1AC]/8" />
        <HeartIcon className="absolute -top-4 -left-4 w-20 h-20 text-[#2DD1AC]/6" />
        <LeafIcon className="absolute bottom-10 left-2 w-10 h-10 text-[#2DD1AC]/10 rotate-45" />
      </div>

      {/* Card content */}
      <div className="flex flex-col items-center justify-center h-[calc(100%-8px)] space-y-4 p-5 md:space-y-5 md:p-6">
        {/* Avatar with teal ring + heart badge */}
        <div className="relative">
          <div
            className="rounded-full p-[3px]"
            style={{
              background:
                "linear-gradient(135deg, #2DD1AC 0%, #14b8a6 60%, #5eead4 100%)",
            }}
          >
            <img
              src={
                imageUrl ||
                `https://i.pravatar.cc/128?img=${Math.abs(author.charCodeAt(0) % 70)}`
              }
              alt={`Avatar of ${author}`}
              className="h-24 w-24 rounded-full bg-[#faf9f5] object-cover md:h-28 md:w-28 block"
            />
          </div>
          {/* Small heart badge */}
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-[#2DD1AC] shadow-sm">
            <HeartIcon className="w-3.5 h-3.5 text-[#2DD1AC]" />
          </span>
        </div>

        {/* Teal decorative quote mark */}
        <div
          className="text-5xl leading-none font-serif text-[#2DD1AC]/30 self-start ml-1 -mb-3"
          aria-hidden="true"
        >
          &#8220;
        </div>

        {/* Testimonial text */}
        <span
          className="text-center text-sm italic text-[#2D3748] leading-relaxed md:text-base"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {testimonial}
        </span>

        {/* Divider with tiny hearts */}
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 h-px bg-[#2DD1AC]/20" />
          <HeartIcon className="w-3 h-3 text-[#2DD1AC]/50" />
          <div className="flex-1 h-px bg-[#2DD1AC]/20" />
        </div>

        {/* Author name */}
        <span
          className="text-center text-sm font-semibold text-[#2DD1AC]"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          {author}
        </span>
      </div>
    </motion.div>
  );
}
