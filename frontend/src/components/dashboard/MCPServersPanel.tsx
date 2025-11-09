"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Endpoint, getMcpUrl } from "@/lib/api";
import { Copy, Server } from "lucide-react";
import { toast } from "sonner";

interface MCPServersPanelProps {
  endpoints: Endpoint[];
}

interface MCPServer {
  username: string;
  mcpUrl: string;
  endpoints: Endpoint[];
}

export function MCPServersPanel({ endpoints }: MCPServersPanelProps) {
  // Group endpoints by username (which represents unique MCP servers)
  const mcpServers: MCPServer[] = endpoints.reduce((acc, endpoint) => {
    const username = endpoint.username || "unknown";
    const existingServer = acc.find((s) => s.username === username);

    if (existingServer) {
      existingServer.endpoints.push(endpoint);
    } else {
      acc.push({
        username,
        mcpUrl: getMcpUrl(username),
        endpoints: [endpoint],
      });
    }

    return acc;
  }, [] as MCPServer[]);

  // Sort by number of endpoints (most popular first)
  mcpServers.sort((a, b) => b.endpoints.length - a.endpoints.length);

  return (
    <div className="space-y-4">
      {mcpServers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No MCP servers available yet</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {mcpServers.map((server) => (
            // @ts-expect-error - AccordionItem is not typed
            <AccordionItem
              key={server.username}
              value={server.username}
              className="border rounded-lg bg-card shadow-elegant"
            >
              {/* @ts-expect-error - AccordionTrigger is not typed */}
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors rounded-t-lg">
                <div className="flex flex-col gap-3 w-full pr-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Server className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-lg">@{server.username}</div>
                        <div className="text-sm text-muted-foreground font-normal">
                          {server.endpoints.length} {server.endpoints.length === 1 ? "tool" : "tools"} available
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="mr-2">
                      {server.endpoints.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border">
                    <code className="flex-1 text-xs break-all font-mono text-left">{server.mcpUrl}</code>
                    <div
                      role="button"
                      tabIndex={0}
                      className="shrink-0 h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(server.mcpUrl);
                        toast.success("MCP Server URL copied to clipboard");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          navigator.clipboard.writeText(server.mcpUrl);
                          toast.success("MCP Server URL copied to clipboard");
                        }
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              {/* @ts-expect-error - AccordionContent is not typed */}
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="space-y-4">
                  {/* Available Tools */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Available Tools
                    </p>
                    <div className="space-y-2">
                      {server.endpoints.map((endpoint) => (
                        <Card
                          key={endpoint.id}
                          className="hover:shadow-md transition-shadow bg-card/50"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-base">{endpoint.name}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {endpoint.description}
                                </p>
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
                                      {endpoint.paymentAmount} USDC
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

