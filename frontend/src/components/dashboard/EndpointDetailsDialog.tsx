"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { EndpointDetail, buildMcpUrl, buildProxyUrl, fetchJson } from "@/lib/api";
import { Loader2 } from "lucide-react";

function JsonBlock({ value }: { value: unknown }) {
  if (value == null) return <div className="text-sm text-muted-foreground italic">No data provided</div>;
  const text = JSON.stringify(value, null, 2);
  return (
    <pre className="text-xs md:text-sm p-3 rounded bg-muted overflow-auto max-h-64">
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span>{name}</span>
            <Badge variant="secondary">{httpMethod}</Badge>
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

