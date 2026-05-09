import type { Metadata } from "next";
import { Playfair_Display, Lora, Poppins, Cormorant_Garamond, Caveat, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import BackToHomeButton from "@/components/layout/BackToHomeButton";
import FloatingAgents from "@/components/agents/FloatingAgents";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Public-site accent display (editorial)
const cormorant = Cormorant_Garamond({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Customer dashboard handwritten greeting
const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Provider + Admin technical mono numerals
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Admin display grotesk
const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SeniorLiving PH | Find the Perfect Home for Your Loved One",
  description:
    "Find trusted assisted living facilities across the Philippines. Browse by region, manage patient profiles, and track daily health monitoring — all in one place.",
  keywords: [
    "assisted living Philippines",
    "elderly care Philippines",
    "senior care facility",
    "health monitoring",
    "caregiver Philippines",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${lora.variable} ${poppins.variable} ${cormorant.variable} ${caveat.variable} ${plexMono.variable} ${spaceGrotesk.variable} antialiased`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <BackToHomeButton />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <FloatingAgents />
      </body>
    </html>
  );
}
