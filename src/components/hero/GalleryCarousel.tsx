"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const IMAGES = [
    { id: 1, src: "/assets/images/pics1.jpg", alt: "Assisted Living Facility 1" },
    { id: 2, src: "/assets/images/pics2.jpg", alt: "Assisted Living Facility 2" },
    { id: 3, src: "/assets/images/pics3.jpg", alt: "Assisted Living Facility 3" },
    { id: 4, src: "/assets/images/pics4.jpg", alt: "Assisted Living Facility 4" },
];

export default function GalleryCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);

    const nextCard = () => {
        setActiveIndex((prev) => (prev + 1) % IMAGES.length);
    };

    const prevCard = () => {
        setActiveIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
    };

    const setCard = (index: number) => {
        setActiveIndex(index);
    };

    return (
        <section className="py-20 lg:py-28 bg-[#2D3748] overflow-hidden relative">
            {/* Background decorations */}
            <div className="absolute inset-0">
                <div className="absolute top-0 right-10 w-96 h-96 bg-[#2DD1AC]/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#d97757]/10 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
                <h2
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
                    style={{ fontFamily: "var(--font-heading)" }}
                >
                    <span className="text-[#2DD1AC]">A Glimpse Into Our Facilities</span>
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                    Experience the comfort, warmth, and state-of-the-art care environments that make our assisted living homes truly special.
                </p>
            </div>

            {/* Deck of Cards Container */}
            <div
                className="relative z-10 w-full max-w-[1400px] mx-auto h-[400px] sm:h-[550px] lg:h-[750px] flex items-center justify-center pointer-events-none"
                style={{ perspective: "1500px" }}
            >
                {/* Previous Button inside carousel */}
                <button
                    onClick={prevCard}
                    aria-label="Previous Slide"
                    className="absolute left-2 sm:left-4 lg:left-8 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/40 hover:scale-110 transition-all focus:outline-none pointer-events-auto shadow-2xl"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>

                {IMAGES.map((img, index) => {
                    // Calculate offset relative to active card
                    let offset = index - activeIndex;

                    let absOffset = Math.abs(offset);
                    let isActive = offset === 0;

                    // Horizontal slide
                    let translateX = offset * 55;

                    // The active picture should be 100% bigger: 1 vs 0.45
                    let scale = isActive ? 1 : 0.45;

                    // Rotate like cards fanned out
                    let rotateY = offset * -25; // cards face toward center
                    let rotateZ = offset * 2; // slight fan tilt

                    let zIndex = 20 - absOffset;

                    // Fade heavily offset cards
                    let opacity = isActive ? 1 : (absOffset === 1 ? 0.7 : 0);

                    return (
                        <div
                            key={img.id}
                            onClick={() => setCard(index)}
                            className="absolute w-[95%] sm:w-[85%] lg:w-[75%] aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-auto cursor-pointer"
                            style={{
                                transform: `translateX(${translateX}%) scale(${scale}) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
                                zIndex: zIndex,
                                opacity: opacity,
                                boxShadow: isActive
                                    ? '0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 -5px 30px -5px rgba(45, 209, 172, 0.5)'
                                    : '0 15px 35px -5px rgba(0, 0, 0, 0.7)',
                            }}
                        >
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
                                style={{ backgroundImage: `url(${img.src})` }}
                                aria-label={img.alt}
                            />
                            {/* Overlay shadow for depth */}
                            {!isActive && (
                                <div className="absolute inset-0 bg-black/60 transition-colors duration-700 hover:bg-black/40" />
                            )}
                        </div>
                    );
                })}

                {/* Next Button inside carousel */}
                <button
                    onClick={nextCard}
                    aria-label="Next Slide"
                    className="absolute right-2 sm:right-4 lg:right-8 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/40 hover:scale-110 transition-all focus:outline-none pointer-events-auto shadow-2xl"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            </div>

            {/* Controls (Dots only) */}
            <div className="relative z-10 flex justify-center items-center gap-3 mt-8">
                {IMAGES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCard(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-2.5 rounded-full transition-all duration-500 ${idx === activeIndex ? "bg-[#2DD1AC] w-10 shadow-[0_0_10px_#2DD1AC]" : "bg-white/30 w-2.5 hover:bg-white/50"
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}
