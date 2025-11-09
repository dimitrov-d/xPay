"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Endpoint, getMcpUrl, getProxyUrl } from "@/lib/api";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface EndpointDetailsModalProps {
  endpoint: Endpoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

function JsonDisplay({ data, title }: { data: any; title: string }) {
  if (!data) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No {title.toLowerCase()} provided
      </div>
    );
  }

  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      <ScrollArea className="h-[200px] w-full rounded-md overflow-hidden border">
        <SyntaxHighlighter
          language="json"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.75rem",
            borderRadius: "0.375rem",
          }}
          showLineNumbers={false}
        >
          {jsonString}
        </SyntaxHighlighter>
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
            <Badge className={getMethodColor(endpoint.httpMethod)}>{endpoint.httpMethod}</Badge>
          </div>
          <DialogDescription>{endpoint.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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
                    {endpoint.paymentAmount}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Provider:</span>
                <span className="text-lg font-bold">@{endpoint.username || "unknown"}</span>
              </div>
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

