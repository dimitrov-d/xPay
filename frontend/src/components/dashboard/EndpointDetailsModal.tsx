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

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      <ScrollArea className="h-[200px] w-full rounded-md border bg-slate-950">
        <pre className="p-4 text-xs">
          <code className="language-json text-green-400">
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
                  <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#2775CA"/>
                    <path d="M20.5 17.5C20.5 19.433 18.933 21 17 21H13.5V14H17C18.933 14 20.5 15.567 20.5 17.5Z" fill="white"/>
                    <path d="M15 10C15 9.44772 15.4477 9 16 9C16.5523 9 17 9.44772 17 10V11H18.5C19.0523 11 19.5 11.4477 19.5 12C19.5 12.5523 19.0523 13 18.5 13H13.5C12.1193 13 11 14.1193 11 15.5C11 16.8807 12.1193 18 13.5 18H15V22H13.5C12.9477 22 12.5 21.5523 12.5 21C12.5 20.4477 12.9477 20 13.5 20H15V18H13.5C11.0147 18 9 15.9853 9 13.5C9 11.0147 11.0147 9 13.5 9H15V10Z" fill="white"/>
                  </svg>
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

