import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-subtle opacity-50" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card shadow-elegant">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Powered by x402 Protocol</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Monetize Your APIs
            <br />
            <span className="text-muted-foreground">Without Writing Code</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transform any API, AI agent, or MCP server into a revenue stream instantly.
            xPay creates x402-protected endpoints with zero integration effort.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button variant="hero" size="lg" className="group">
              Get Started Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              View Documentation
            </Button>
          </div>

          {/* Stats */}
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
  );
};
