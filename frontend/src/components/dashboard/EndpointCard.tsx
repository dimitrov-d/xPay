"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Endpoint, getMcpUrl, getProxyUrl } from "@/lib/api";
import { Code, ExternalLink } from "lucide-react";

interface EndpointCardProps {
  endpoint: Endpoint;
  onViewDetails: (endpoint: Endpoint) => void;
}

const getMethodColor = (method: string) => {
  switch (method?.toUpperCase()) {
    case "GET":
      return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400";
    case "POST":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400";
    case "PUT":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
    case "DELETE":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
    case "PATCH":
      return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400";
  }
};

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
          <Badge className={`ml-2 ${getMethodColor(endpoint.httpMethod)}`}>
            {endpoint.httpMethod}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
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

          <div className="space-y-1 mb-4">
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

          <div className="pt-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Price:</span>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#2775CA" />
                    <path d="M20.5 17.5C20.5 19.433 18.933 21 17 21H13.5V14H17C18.933 14 20.5 15.567 20.5 17.5Z" fill="white" />
                    <path d="M15 10C15 9.44772 15.4477 9 16 9C16.5523 9 17 9.44772 17 10V11H18.5C19.0523 11 19.5 11.4477 19.5 12C19.5 12.5523 19.0523 13 18.5 13H13.5C12.1193 13 11 14.1193 11 15.5C11 16.8807 12.1193 18 13.5 18H15V22H13.5C12.9477 22 12.5 21.5523 12.5 21C12.5 20.4477 12.9477 20 13.5 20H15V18H13.5C11.0147 18 9 15.9853 9 13.5C9 11.0147 11.0147 9 13.5 9H15V10Z" fill="white" />
                  </svg>
                  <span className="font-bold text-green-600 dark:text-green-500">
                    {endpoint.paymentAmount}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Provider:</span>
                <span className="text-sm font-medium">@{endpoint.username || "unknown"}</span>
              </div>
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

