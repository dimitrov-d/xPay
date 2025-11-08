import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { db } from "../config/database";
import { endpoints, users } from "../db/schema";
import { generateToolInputSchema } from "../utils/schema";
import { forwardRequest } from "./proxy";

// Store active MCP sessions
const sessions = new Map<
  string,
  {
    transport: StreamableHTTPServerTransport;
    server: McpServer;
    username: string;
  }
>();

/**
 * Creates and initializes an MCP server for a specific user
 * Dynamically registers all user's endpoints as MCP tools
 */
async function createMcpServerForUser(
  username: string
): Promise<{ server: McpServer; transport: StreamableHTTPServerTransport }> {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId) => {
      sessions.set(sessionId, { transport, server, username });
    },
    enableDnsRebindingProtection: true,
    allowedHosts: ["127.0.0.1", "localhost", "localhost:3000"],
  });

  transport.onclose = () => {
    if (transport.sessionId) {
      sessions.delete(transport.sessionId);
    }
  };

  const server = new McpServer({
    name: `${username}-api-server`,
    version: "1.0.0",
  });

  const userEndpoints = await db
    .select({
      id: endpoints.id,
      name: endpoints.name,
      description: endpoints.description,
      originalUrl: endpoints.originalUrl,
      httpMethod: endpoints.httpMethod,
      paymentAmount: endpoints.paymentAmount,
      tokenType: endpoints.tokenType,
      customAuthHeaders: endpoints.customAuthHeaders,
      sampleBody: endpoints.sampleBody,
      sampleResponse: endpoints.sampleResponse,
    })
    .from(endpoints)
    .innerJoin(users, eq(endpoints.userWallet, users.walletAddress))
    .where(eq(users.username, username));

  // Register each endpoint as an MCP tool
  for (const endpoint of userEndpoints) {
    const toolName = `${endpoint.name}`;
    const inputSchema = generateToolInputSchema(
      endpoint.sampleBody,
      endpoint.httpMethod
    );

    server.registerTool(
      toolName,
      {
        title: endpoint.name,
        description: `${endpoint.description}\n\nMethod: ${endpoint.httpMethod}\nCost: ${endpoint.paymentAmount} ${endpoint.tokenType}`,
        inputSchema,
      },
      async (args: any) => {
        try {
          const req = { body: args, method: endpoint.httpMethod } as any;

          if (endpoint.httpMethod.toUpperCase() === "GET" && args.query) {
            req.query = args.query;
            req.body = {};
          }

          const response = await forwardRequest(req, {
            originalUrl: endpoint.originalUrl,
            httpMethod: endpoint.httpMethod,
            customAuthHeaders: endpoint.customAuthHeaders as Record<
              string,
              string
            > | null,
          });

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error calling API: ${error.message || "Unknown error"}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  await server.connect(transport);

  return { server, transport };
}

/**
 * Handles MCP requests for a specific user
 * Creates session on initialize, reuses existing session for subsequent requests
 */
export async function handleMcpRequest(
  req: Request,
  res: Response,
  username: string
): Promise<void> {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let session = sessionId ? sessions.get(sessionId) : undefined;

  // Create new session on initialize
  if (!session && req.body?.method === "initialize") {
    try {
      const { server, transport } = await createMcpServerForUser(username);
      session = { transport, server, username };
      // Session will be added to map in onsessioninitialized callback
    } catch (error: any) {
      res.status(500).json({
        error: "Failed to initialize MCP server",
        message: error.message,
      });
      return;
    }
  } else if (!session) {
    res.status(400).json({
      error: "Invalid session",
      message: "No active session found. Please initialize first.",
    });
    return;
  }

  // Verify session belongs to the correct user
  if (session.username !== username) {
    res.status(403).json({
      error: "Session mismatch",
      message: "Session does not belong to this user",
    });
    return;
  }

  // Handle the request through the transport
  await session.transport.handleRequest(req, res, req.body);
}

/**
 * Handles session management requests (GET/DELETE)
 */
export async function handleSessionRequest(
  req: Request,
  res: Response,
  username: string
): Promise<void> {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  const session = sessionId ? sessions.get(sessionId) : undefined;

  if (!session) {
    res.status(400).json({
      error: "Invalid session",
      message: "No active session found",
    });
    return;
  }

  if (session.username !== username) {
    res.status(403).json({
      error: "Session mismatch",
      message: "Session does not belong to this user",
    });
    return;
  }

  await session.transport.handleRequest(req, res);
}

/**
 * Get active sessions count (for debugging/monitoring)
 */
export function getActiveSessionsCount(): number {
  return sessions.size;
}

/**
 * Clear all sessions (for testing/cleanup)
 */
export function clearAllSessions(): void {
  sessions.clear();
}
