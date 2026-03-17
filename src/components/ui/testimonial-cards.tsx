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
  // Only show top 3 cards visually
  const isVisible = position < 3;

  const rotate = position === 0 ? -6 : position === 1 ? 0 : 6;
  const xOffset = position === 0 ? 0 : position === 1 ? 33 : 66;
  const zIndex = total - position;

  return (
    <motion.div
      style={{ zIndex }}
      animate={{
        rotate: isVisible ? `${rotate}deg` : "6deg",
        x: isVisible ? `${xOffset}%` : "66%",
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.95,
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
        if (dragRef.current - (e as unknown as MouseEvent).clientX > 150) {
          handleShuffle();
        }
        dragRef.current = 0;
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 grid h-[450px] w-[350px] select-none place-content-center space-y-6 rounded-2xl border-2 border-[#e8e6dc] bg-white/80 p-6 shadow-xl backdrop-blur-md ${
        isFront ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <img
        src={imageUrl || `https://i.pravatar.cc/128?img=${Math.abs(author.charCodeAt(0) % 70)}`}
        alt={`Avatar of ${author}`}
        className="pointer-events-none mx-auto h-32 w-32 rounded-full border-2 border-[#e8e6dc] bg-[#faf9f5] object-cover"
      />
      <span
        className="text-center text-lg italic text-[#2D3748]"
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
