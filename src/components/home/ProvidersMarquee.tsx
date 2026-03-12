import fs from 'fs';
import path from 'path';

export default function ProvidersMarquee() {
    const logosDir = path.join(process.cwd(), 'public', 'logos');
    let logos: string[] = [];
    try {
        logos = fs.readdirSync(logosDir).filter(file => file.match(/\.(png|jpe?g|svg)$/i));
    } catch (e) {
        console.error("Error reading logos directory", e);
    }

    if (!logos.length) return null;

    return (
        <section className="py-[3.6rem] bg-white overflow-hidden border-b border-[#e8e6dc]/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <h2
                    className="text-xl md:text-2xl font-bold text-center text-[#141413] tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-ui)" }}
                >
                    Our Providers
                </h2>
            </div>

            <div className="relative w-full overflow-hidden flex group">
                <div className="animate-marquee flex gap-12 md:gap-20 px-6 items-center">
                    {logos.concat(logos).map((logo, idx) => (
                        <div
                            key={`${logo}-${idx}`}
                            className="flex-none h-[70px] md:h-[88px] w-auto flex items-center justify-center transition-all duration-300"
                        >
                            {/* Using standard img to avoid Next.js tracking issues with dynamic fs imports */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`/logos/${logo}`}
                                alt="Provider Logo"
                                className="max-h-full max-w-[198px] md:max-w-[242px] object-contain"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
