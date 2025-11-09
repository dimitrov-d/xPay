"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Endpoint, getProxyUrl, getMcpUrl } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EndpointDetailsModalProps {
  endpoint: Endpoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function JsonDisplay({ data, title }: { data: any; title: string }) {
  if (!data) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No {title.toLowerCase()} provided
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      <ScrollArea className="h-[200px] w-full rounded-md border">
        <pre className="p-4 text-xs">
          <code className="language-json">
            {JSON.stringify(data, null, 2)}
          </code>
        </pre>
      </ScrollArea>
    </div>
  );
}

export function EndpointDetailsModal({
  endpoint,
  open,
  onOpenChange,
}: EndpointDetailsModalProps) {
  if (!endpoint) return null;

  const proxyUrl = getProxyUrl(endpoint.username || "", endpoint.name);
  const mcpUrl = getMcpUrl(endpoint.username || "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-2xl">{endpoint.name}</DialogTitle>
            <Badge variant="outline">{endpoint.httpMethod}</Badge>
          </div>
          <DialogDescription>{endpoint.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Payment Amount
              </p>
              <p className="text-lg font-bold">
                {endpoint.paymentAmount} {endpoint.tokenType}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Created By
              </p>
              <p className="text-lg font-bold">{endpoint.username || "Unknown"}</p>
            </div>
          </div>

          <Tabs defaultValue="urls" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="urls">URLs</TabsTrigger>
              <TabsTrigger value="sample-body">Sample Body</TabsTrigger>
              <TabsTrigger value="sample-response">Sample Response</TabsTrigger>
              <TabsTrigger value="auth">Auth Headers</TabsTrigger>
            </TabsList>

            <TabsContent value="urls" className="space-y-4 mt-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Proxy URL</p>
                <div className="p-3 rounded-md bg-muted/50 border">
                  <code className="text-sm break-all">{proxyUrl}</code>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this URL to make requests with x402 payment protection
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">MCP Server URL</p>
                <div className="p-3 rounded-md bg-muted/50 border">
                  <code className="text-sm break-all">{mcpUrl}</code>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add this URL to your MCP client configuration to access all endpoints
                  via the Model Context Protocol
                </p>
              </div>
            </TabsContent>

            <TabsContent value="sample-body" className="mt-4">
              <JsonDisplay data={endpoint.sampleBody} title="Sample Request Body" />
            </TabsContent>

            <TabsContent value="sample-response" className="mt-4">
              <JsonDisplay
                data={endpoint.sampleResponse}
                title="Sample Response"
              />
            </TabsContent>

            <TabsContent value="auth" className="mt-4">
              <JsonDisplay
                data={endpoint.customAuthHeaders}
                title="Custom Auth Headers"
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

