import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const benefits = [
  {
    title: "Built for the Agent Economy",
    description: "x402 is the native protocol for machine-to-machine payments. AI agents don't need accounts or subscriptions - they pay per request, instantly.",
  },
  {
    title: "No Integration Friction",
    description: "Traditional API monetization requires OAuth, API keys, billing systems, and complex middleware. x402 reduces this to a single HTTP header.",
  },
  {
    title: "Composable Infrastructure",
    description: "Your x402-wrapped endpoints become building blocks for other agents. Enable programmatic discovery, consumption, and payment without human intervention.",
  },
  {
    title: "Future-Proof Standard",
    description: "As autonomous agents proliferate, x402 provides the standard payment rail. Early adoption positions you at the center of the emerging agent marketplace.",
  },
];

export const WhyX402 = () => {
  return (
    <section className="py-24 px-4 bg-gradient-primary text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Why x402 Changes Everything
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto text-white">
            The protocol designed for the autonomous economy
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">{benefit.title}</h3>
                    <p className="opacity-80 leading-relaxed text-white">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm inline-block">
            <CardContent className="p-8">
              <p className="text-2xl font-semibold mb-2 text-white">
                The Stripe Moment for API Payments
              </p>
              <p className="opacity-90 max-w-xl text-white">
                Just as Stripe abstracted credit card complexity, xPay makes x402 paywall implementation instant and universal.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
