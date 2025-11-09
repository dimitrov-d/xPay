"use client";

import { CTA } from "@/components/landing/CTA";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Marketplace } from "@/components/landing/Marketplace";
import { WhyX402 } from "@/components/landing/WhyX402";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function Home() {
  const { SignatureModal } = useRequireAuth();

  return (
    <>
      {SignatureModal}
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
    </>
  );
}

