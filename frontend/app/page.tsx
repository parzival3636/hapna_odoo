import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/admin",
  organiser: "/dashboard/services",
  customer: "/services",
};

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const role = cookieStore.get("user_role")?.value || "customer";

  // If token exists, we can still show the landing page OR redirect.
  // The user might want to see the landing page even if logged in.
  // But usually, the Home page for logged-in users is the dashboard.
  // However, the request says "copy the hero page as it is".
  // I'll make it so if you are logged in and visit /, you get redirected to your dashboard.
  // If you want to see the landing page, you'd have to logout or we could add a "Home" link.
  
  if (token) {
    redirect(ROLE_DASHBOARDS[role] || "/services");
  }

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
