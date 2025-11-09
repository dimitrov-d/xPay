"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Endpoint, getMcpUrl, getProxyUrl } from "@/lib/api";
import { Copy } from "lucide-react";
import { useState } from "react";
import { JsonViewer } from "./JsonViewer";

interface EndpointDetailModalProps {
  endpoint: Endpoint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EndpointDetailModal({
  endpoint,
  open,
  onOpenChange,
}: EndpointDetailModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const proxyUrl = getProxyUrl(endpoint.username, endpoint.name);
  const mcpUrl = getMcpUrl(endpoint.username);

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{endpoint.name}</DialogTitle>
            <Badge variant="secondary">{endpoint.httpMethod}</Badge>
          </div>
          <DialogDescription>{endpoint.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Proxy URL</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleCopy(proxyUrl, "proxy")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <code className="block text-xs bg-muted p-2 rounded break-all">
              {proxyUrl}
            </code>
            <p className="text-xs text-muted-foreground">
              Use this URL to access the endpoint. Payment will be required via
              x402 protocol.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">MCP Server URL</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleCopy(mcpUrl, "mcp")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <code className="block text-xs bg-muted p-2 rounded break-all">
              {mcpUrl}
            </code>
            <p className="text-xs text-muted-foreground">
              Connect to this MCP server to access all endpoints from{" "}
              {endpoint.username} as tools. Use an MCP client to connect.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Payment</h3>
              <p className="text-sm">
                <span className="font-semibold">{endpoint.paymentAmount}</span>{" "}
                {endpoint.tokenType} per call
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Provider</h3>
              <p className="text-sm">@{endpoint.username}</p>
            </div>
          </div>

          {endpoint.sampleBody && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Sample Request Body</h3>
              <JsonViewer data={endpoint.sampleBody} />
            </div>
          )}

          {endpoint.sampleResponse && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Sample Response</h3>
              <JsonViewer data={endpoint.sampleResponse} />
            </div>
          )}

          {endpoint.customAuthHeaders && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Custom Auth Headers</h3>
              <JsonViewer data={endpoint.customAuthHeaders} />
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-4 border-t">
            Created: {new Date(endpoint.createdAt).toLocaleString()}
            {endpoint.updatedAt !== endpoint.createdAt && (
              <> • Updated: {new Date(endpoint.updatedAt).toLocaleString()}</>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

