import type { Metadata } from "next";
import { Playfair_Display, Lora, Poppins } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";

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
        className={`${playfair.variable} ${lora.variable} ${poppins.variable} antialiased`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
