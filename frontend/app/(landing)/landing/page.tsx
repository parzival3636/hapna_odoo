import type { Metadata } from "next";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { LogoCloud } from "./components/LogoCloud";
import { Channels } from "./components/Channels";
import { HowItWorks } from "./components/HowItWorks";
import { AIShowcase } from "./components/AIShowcase";
import { RealtimeDemo } from "./components/RealtimeDemo";
import { Testimonials } from "./components/Testimonials";
import { CTABanner } from "./components/CTABanner";
import { Footer } from "./components/Footer";

export const metadata: Metadata = {
  title: "Hapna | AI-Powered Omnichannel Booking",
  description:
    "Book appointments through chat, WhatsApp, or a phone call. One unified booking engine with AI-powered no-show predictions and real-time availability.",
};

export default function LandingPage() {
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
