"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@coinbase/cdp-hooks";
import { SignInModal, SignInModalContent } from "@coinbase/cdp-react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const CTA = () => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const handleSignInSuccess = () => {
    router.push("/wallet");
  };

  const handleGetStartedClick = () => {
    if (currentUser) router.push("/wallet");
    else setIsSignInOpen(true);
  };

  return (
    <>
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-8 bg-gradient-primary rounded-2xl p-12 md:p-16 shadow-bold">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground">
              Ready to Monetize Without Code?
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Turn your APIs, agents, and infrastructure into revenue streams today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                variant="hero"
                size="lg"
                className="group"
                onClick={handleGetStartedClick}
              >
                Start Building on xPay
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
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
