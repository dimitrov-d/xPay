"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Endpoint, getProxyUrl, getMcpUrl } from "@/lib/api";
import { ExternalLink, Code, DollarSign } from "lucide-react";

interface EndpointCardProps {
  endpoint: Endpoint;
  onViewDetails: (endpoint: Endpoint) => void;
}

export function EndpointCard({ endpoint, onViewDetails }: EndpointCardProps) {
  const proxyUrl = getProxyUrl(endpoint.username || "", endpoint.name);
  const mcpUrl = getMcpUrl(endpoint.username || "");

  return (
    <Card className="shadow-elegant hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{endpoint.name}</CardTitle>
            <CardDescription>{endpoint.description}</CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            {endpoint.httpMethod}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-accent" />
            <span className="font-medium">{endpoint.paymentAmount} {endpoint.tokenType}</span>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Proxy URL:</p>
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border">
              <code className="flex-1 text-xs break-all">{proxyUrl}</code>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 w-6 h-6"
                onClick={() => navigator.clipboard.writeText(proxyUrl)}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">MCP Server URL:</p>
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border">
              <code className="flex-1 text-xs break-all">{mcpUrl}</code>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 w-6 h-6"
                onClick={() => navigator.clipboard.writeText(mcpUrl)}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => onViewDetails(endpoint)}
        >
          <Code className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

