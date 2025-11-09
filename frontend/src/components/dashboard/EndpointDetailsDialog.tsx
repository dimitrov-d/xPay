"use client";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EndpointDetail, buildMcpUrl, buildProxyUrl, fetchJson } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
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

function JsonBlock({ value }: { value: unknown }) {
  if (value == null) return <div className="text-sm text-muted-foreground italic">No data provided</div>;
  const text = JSON.stringify(value, null, 2);
  return (
    <pre className="text-xs md:text-sm p-3 rounded bg-slate-950 text-green-400 overflow-auto max-h-64">
      {text}
    </pre>
  );
}

export function EndpointDetailsDialog({
  open,
  onOpenChange,
  endpointId,
  username,
  name,
  httpMethod,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  endpointId: string;
  username: string;
  name: string;
  httpMethod: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["endpoint", endpointId],
    queryFn: () => fetchJson<EndpointDetail>(`/endpoints/${endpointId}`),
    enabled: open,
  });

  const proxyUrl = buildProxyUrl(username, name);
  const mcpUrl = buildMcpUrl(username);

  return (
    // @ts-expect-error - React 18/19 type compatibility issue with Next.js 15
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* @ts-expect-error - React 18/19 type compatibility issue */}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          {/* @ts-expect-error - React 18/19 type compatibility issue */}
          <DialogTitle className="flex items-center justify-between gap-3">
            <span>{name}</span>
            <Badge className={getMethodColor(httpMethod)}>{httpMethod}</Badge>
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading details...
          </div>
        )}
        {!isLoading && error && (
          <div className="text-sm text-red-500">Failed to load endpoint details.</div>
        )}
        {!isLoading && data && (
          <div className="space-y-4">
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-1">Proxy URL</div>
              <code className="block p-2 rounded bg-muted break-all">{proxyUrl}</code>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-1">MCP Server URL</div>
              <code className="block p-2 rounded bg-muted break-all">{mcpUrl}</code>
              <p className="text-xs text-muted-foreground mt-2">
                Use this with any MCP-compatible client. The server exposes your endpoints as MCP tools.
              </p>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <div className="flex items-center gap-1">
                    <img
                      src="/usdc.svg"
                      alt="USDC"
                      className="w-4 h-4"
                      style={{ display: "inline-block", verticalAlign: "middle" }}
                    />
                    <span className="text-xl font-bold text-green-600 dark:text-green-500">
                      {data.paymentAmount}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Provider:</span>
                  <span className="text-lg font-bold">@{username || "unknown"}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-1">Custom Auth Headers</div>
              <JsonBlock value={data.customAuthHeaders} />
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-1">Sample Request Body</div>
              <JsonBlock value={data.sampleBody} />
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-1">Sample Response</div>
              <JsonBlock value={data.sampleResponse} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

