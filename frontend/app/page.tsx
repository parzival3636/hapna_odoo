import type { Metadata } from "next";
import { Navbar } from "./components/landing/Navbar";
import { Hero } from "./components/landing/Hero";
import { LogoCloud } from "./components/landing/LogoCloud";
import { Channels } from "./components/landing/Channels";
import { HowItWorks } from "./components/landing/HowItWorks";
import { AIShowcase } from "./components/landing/AIShowcase";
import { RealtimeDemo } from "./components/landing/RealtimeDemo";
import { Testimonials } from "./components/landing/Testimonials";
import { CTABanner } from "./components/landing/CTABanner";
import { Footer } from "./components/landing/Footer";

export const metadata: Metadata = {
  title: "Hapna | AI-Powered Omnichannel Booking",
  description:
    "Book appointments through chat or a phone call. One unified booking engine with AI-powered no-show predictions and real-time availability.",
};

export default function HomePage() {
  return (
    <main className="scroll-smooth bg-[#f8f9ff] text-[#0b1c30] selection:bg-[#4F46E5] selection:text-white">
      <Navbar />
      <Hero />
      <LogoCloud />
      <Channels />
      <HowItWorks />
      <AIShowcase />
      <RealtimeDemo />
      <Testimonials />
      <CTABanner />
      <Footer />
    </main>
  );
}
