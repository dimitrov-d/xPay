import { count, eq, sql } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { db } from '../config/database';
import { endpoints, users } from '../db/schema';
import { mcpPaywallMiddleware } from '../middleware/mcp-paywall';
import { handleMcpRequest, handleSessionRequest } from '../services/mcp';

const router = Router();

/**
 * GET /mcp
 * Discovery endpoint - Lists all available MCP servers
 * AI agents use this to find MCP servers by use case
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const mcpServers = await db
      .select({
        username: users.username,
        walletAddress: users.walletAddress,
        endpointCount: count(endpoints.id),
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(endpoints, eq(users.walletAddress, endpoints.userWallet))
      .groupBy(users.username, users.walletAddress, users.createdAt)
      .having(sql`count(${endpoints.id}) > 0`);

    const protocol = req.protocol;
    const host = req.get('host');

    const servers = mcpServers.map((server) => ({
      username: server.username,
      mcpUrl: `${protocol}://${host}/mcp/${server.username}`,
      toolCount: server.endpointCount,
      createdAt: server.createdAt,
      description: `MCP server for ${server.username} with ${server.endpointCount} tool(s)`,
    }));

    return res.json({
      servers,
      total: servers.length,
      message: 'Available MCP servers. Use the mcpUrl to connect with an MCP client.',
    });
  } catch (error) {
    console.error('Error fetching MCP servers:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch available MCP servers',
    });
  }
});

/**
 * POST /mcp/:username
 * Main MCP endpoint with conditional paywall
 * Handles MCP protocol messages (initialize, tools/list, tools/call, etc.)
 */
router.post('/:username', mcpPaywallMiddleware, async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const [user] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: `No MCP server found for username: ${username}`,
      });
    }

    await handleMcpRequest(req, res, username);
  } catch (error: any) {
    console.error('Error in MCP route:', error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Failed to process MCP request',
      });
    }
  }
});

/**
 * GET /mcp/:username
 * Session management - handles GET requests for active sessions
 */
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const [user] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: `No MCP server found for username: ${username}`,
      });
    }

    await handleSessionRequest(req, res, username);
  } catch (error: any) {
    console.error('Error in MCP session GET:', error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Failed to handle session request',
      });
    }
  }
});

/**
 * DELETE /mcp/:username
 * Session cleanup - handles DELETE requests to close sessions
 */
router.delete('/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const [user] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: `No MCP server found for username: ${username}`,
      });
    }

    await handleSessionRequest(req, res, username);
  } catch (error: any) {
    console.error('Error in MCP session DELETE:', error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Failed to handle session cleanup',
      });
    }
  }
});

export default router;
