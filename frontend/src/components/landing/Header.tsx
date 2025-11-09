"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@coinbase/cdp-hooks";
import { SignInModal, SignInModalContent } from "@coinbase/cdp-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useCurrentUser();
  const isHomePage = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");

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

            {!currentUser && (
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

            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors">
                      <User className="w-5 h-5 text-accent" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/my-endpoints")}>
                    My Endpoints
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/wallet")}>
                    Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              isHomePage && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={handleGetStartedClick}
                  >
                    Get Started
                  </Button>
                </div>
              )
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
