"use client";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CDPReactProvider } from "@coinbase/cdp-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;

  if (!projectId) {
    console.warn(
      "NEXT_PUBLIC_CDP_PROJECT_ID is not set. Please add it to your .env.local file. " +
      "Get your Project ID from https://portal.cdp.coinbase.com"
    );
  }

  return (
    <CDPReactProvider
      config={{
        projectId: projectId || "",
        appName: "xPay",
        appLogoUrl: "/logo.png",
        solana: {
          createOnLogin: true,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        {/* @ts-expect-error - React 18/19 type compatibility issue */}
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </CDPReactProvider>
  );
}

