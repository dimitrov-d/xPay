import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Register Your Endpoint",
    description: "Provide your API URL, payment details (amount, token, wallet), and optional authentication headers. No code deployment needed.",
  },
  {
    number: "02",
    title: "Get Your xPay Wrapper",
    description: "Instantly receive a new endpoint like api.marketplace.com/yourapi that enforces x402 payment verification automatically.",
  },
  {
    number: "03",
    title: "Start Earning",
    description: "Share your wrapped endpoint or list it in our marketplace. Every valid request pays you directly - tracked in real-time on your dashboard.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            Three Steps to Monetization
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From endpoint to revenue stream in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-0.5 bg-border -z-10" />

          {steps.map((step, index) => (
            <Card key={index} className="relative border-border bg-card hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto md:mx-0 shadow-elegant">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
