import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyX402 } from "@/components/landing/WhyX402";
import { Marketplace } from "@/components/landing/Marketplace";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <div id="features">
          <Features />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <WhyX402 />
        <div id="marketplace">
          <Marketplace />
        </div>
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

