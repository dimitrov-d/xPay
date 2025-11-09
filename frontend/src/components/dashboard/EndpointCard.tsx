"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Endpoint, getProxyUrl } from "@/lib/api";
import { Copy, Edit, Play, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TestEndpointModal } from "./TestEndpointModal";

interface EndpointCardProps {
  endpoint: Endpoint;
  onViewDetails: (endpoint: Endpoint) => void;
  showEarnings?: boolean;
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

export function EndpointCard({ endpoint, onViewDetails, showEarnings = false }: EndpointCardProps) {
  const proxyUrl = endpoint.username
    ? getProxyUrl(endpoint.username, endpoint.name)
    : "Username not available";
  const [testModalOpen, setTestModalOpen] = useState(false);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 fill-green-500 text-green-500"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-green-500 absolute" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-green-500 text-green-500" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <>
      <Card className="shadow-elegant hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{endpoint.name}</CardTitle>
              <CardDescription>{endpoint.description}</CardDescription>
              {endpoint.averageRating !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  {renderStars(endpoint.averageRating)}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({endpoint.averageRating.toFixed(1)} • {endpoint.totalReviews} {endpoint.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
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
                {endpoint.username && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 w-6 h-6"
                    onClick={() => {
                      navigator.clipboard.writeText(proxyUrl);
                      toast.success("Proxy URL copied to clipboard");
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Price:</span>
                  <div className="flex items-center gap-1">
                    <img
                      src="/usdc.svg"
                      alt="USDC"
                      className="w-4 h-4"
                      style={{ display: "inline-block", verticalAlign: "middle" }}
                    />
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
              {showEarnings && endpoint.totalEarnings !== undefined && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">Total Earnings:</span>
                  <div className="flex items-center gap-1">
                    <img
                      src="/usdc.svg"
                      alt="USDC"
                      className="w-5 h-5"
                      style={{ display: "inline-block", verticalAlign: "middle" }}
                    />
                    <span className="font-bold text-xl text-green-600 dark:text-green-500">
                      {parseFloat(endpoint.totalEarnings).toFixed(4)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onViewDetails(endpoint)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="hero"
              className="flex-1"
              onClick={() => setTestModalOpen(true)}
            >
              <Play className="w-4 h-4 mr-2" />
              Test
              <span className="ml-2 text-xs opacity-90">
                ({endpoint.paymentAmount} USDC)
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <TestEndpointModal
        endpoint={endpoint}
        open={testModalOpen}
        onOpenChange={setTestModalOpen}
      />
    </>
  );
}

