import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Star } from "lucide-react";

const mockAPIs = [
  {
    name: "Premium RPC Node",
    category: "Infrastructure",
    price: "0.001 USDC",
    rating: 4.8,
    calls: "1.2M",
  },
  {
    name: "AI Image Generation",
    category: "AI Services",
    price: "0.05 USDC",
    rating: 4.9,
    calls: "850K",
  },
  {
    name: "Market Data Feed",
    category: "Data",
    price: "0.002 USDC",
    rating: 4.7,
    calls: "2.5M",
  },
];

export const Marketplace = () => {
  return (
    <section className="py-24 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            The Agent Discovery Layer
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A marketplace where AI agents find, evaluate, and consume services - all powered by x402
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {mockAPIs.map((api, index) => (
            <Card key={index} className="border-border hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{api.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {api.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="font-medium">{api.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <div className="text-2xl font-bold text-accent">{api.price}</div>
                    <div className="text-xs text-muted-foreground">per call</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{api.calls}</div>
                    <div className="text-xs text-muted-foreground">total calls</div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" size="sm">
                  <ExternalLink className="w-4 h-4" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="border-border bg-muted/30 inline-block">
            <CardContent className="p-6 space-y-2">
              <p className="font-semibold text-lg">MCP-Native Discovery</p>
              <p className="text-muted-foreground max-w-lg">
                Every listed API is automatically exposed as an MCP server, enabling seamless agent-to-agent communication and discovery.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
