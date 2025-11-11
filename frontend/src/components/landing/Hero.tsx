"use client";

import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/auth";
import { useCurrentUser } from "@coinbase/cdp-hooks";
import { SignInModal, SignInModalContent } from "@coinbase/cdp-react";
import { ArrowRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Hero = () => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const handleSignInSuccess = () => {
    setIsSignInOpen(false);
  };

  const handleGetStartedClick = () => {
    if (currentUser && isAuthenticated()) {
      router.push("/dashboard");
    } else {
      setIsSignInOpen(true);
    }
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card shadow-elegant">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Powered by x402 Protocol</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Monetize Your APIs
              <br />
              <span className="text-muted-foreground">Without Writing Code</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform any API, AI agent, or MCP server into a revenue stream instantly.
              xPay creates x402-protected endpoints with zero integration effort.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                variant="hero"
                size="lg"
                className="group"
                onClick={handleGetStartedClick}
              >
                Get Started Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.open("https://docs.usexpay.xyz/", "_blank")}>
                View Documentation
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
              <div className="space-y-1">
                <div className="text-3xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Lines of Code</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">Instant</div>
                <div className="text-sm text-muted-foreground">Setup Time</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm text-muted-foreground">Revenue Control</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {isSignInOpen && (
        <SignInModal
          open={isSignInOpen}
          setIsOpen={setIsSignInOpen}
          onSuccess={handleSignInSuccess}
        >
          <SignInModalContent />
        </SignInModal>
      )}
    </>
  );
};
