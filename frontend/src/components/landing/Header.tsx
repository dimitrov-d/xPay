import { Button } from "@/components/ui/button";
import Image from "next/image";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="xPay" width={64} height={64} className="w-16 h-16" />
            <span
              className="text-2xl font-bold"
            >
              xPAY
            </span>
          </div>

          {/* Navigation */}
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

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
