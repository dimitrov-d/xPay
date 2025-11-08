import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Bot, Code, Lock, Wallet, Zap } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "No-Code Integration",
    description: "Simply provide your API endpoint. We handle all the x402 wrapper logic automatically - no middleware, no code changes required.",
  },
  {
    icon: Lock,
    title: "Instant Paywall Protection",
    description: "Every wrapped endpoint returns 402 Payment Required until payment is verified. Secure, standard, and protocol-native.",
  },
  {
    icon: Wallet,
    title: "Direct Revenue Stream",
    description: "Set your price, token type, and wallet address. Payments flow directly to you - no middleman, no delays.",
  },
  {
    icon: Zap,
    title: "MCP Server Auto-Generation",
    description: "Your APIs automatically become discoverable MCP servers. AI agents can find and consume your services instantly.",
  },
  {
    icon: Bot,
    title: "Agent Marketplace",
    description: "Publish to our marketplace where AI agents discover, evaluate, and consume monetized APIs - building the agent economy.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track API calls, earnings, reputation scores, and usage patterns through your comprehensive developer dashboard.",
  },
];

export const Features = () => {
  return (
    <section className="py-24 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            The Complete x402 Monetization Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to turn your infrastructure into a revenue-generating asset
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
