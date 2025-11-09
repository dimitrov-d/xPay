"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@coinbase/cdp-hooks";
import { SignInModal, SignInModalContent } from "@coinbase/cdp-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export const Header = () => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useCurrentUser();
  const isHomePage = pathname === "/";

  const handleSignInSuccess = () => {
    router.push("/dashboard");
  };

  const handleGetStartedClick = () => {
    if (currentUser) router.push("/dashboard");
    else setIsSignInOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              href={currentUser ? "/dashboard" : "/"}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Image src="/logo.png" alt="xPay" width={64} height={64} className="w-16 h-16" />
              <span className="text-2xl font-bold">xPAY</span>
            </Link>

            {isHomePage && (
              <nav className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm font-medium hover:text-accent transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-sm font-medium hover:text-accent transition-colors">
                  How It Works
                </a>
                <a href="#marketplace" className="text-sm font-medium hover:text-accent transition-colors">
                  Marketplace
                </a>
                <a href="#docs" className="text-sm font-medium hover:text-accent transition-colors">
                  Docs
                </a>
              </nav>
            )}

            {isHomePage && (
              <div className="flex items-center gap-3">
                <Button
                  variant="hero"
                  size="sm"
                  onClick={handleGetStartedClick}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
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
