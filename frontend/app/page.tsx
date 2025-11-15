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
      <div className="bg-green-600 text-white py-2 px-4 text-center text-sm fixed top-0 left-0 right-0 z-[60]">
        <span>xPay is now live on x402scan! Check it out here: </span>
        <a
          href="https://x402scan.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold hover:text-green-100 transition-colors"
        >
          x402scan.com
        </a>
      </div>
      <div className="min-h-screen pt-[104px]">
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

