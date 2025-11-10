import { solana } from '@faremeter/info';
import { express as faremeter } from '@faremeter/middleware';
import { and, eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import { db } from '../config/database';
import { endpoints, users } from '../db/schema';

/**
 * Creates a Faremeter middleware for MCP server endpoints
 * @param paymentAmount - Payment amount as a string
 * @param asset - SPL token address (Solana public key)
 * @param userWallet - User wallet address to receive payments
 * @param resource - Resource URL for the payment
 * @param description - Description of the payment
 */
async function createMcpPaywallMiddleware(
  paymentAmount: string,
  asset: string,
  userWallet: string,
  resource: string,
  description: string,
) {
  const amount = parseFloat(paymentAmount);

  if (isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid payment amount: ${paymentAmount}. Amount must be a positive number.`);
  }

  return await faremeter.createMiddleware({
    facilitatorURL: 'https://facilitator.corbits.dev',
    accepts: solana
      .x402Exact({
        network: 'mainnet-beta',
        asset: asset as any,
        amount: `${+paymentAmount * 10 ** 6}`,
        payTo: userWallet,
      })
      .map((req) => ({
        ...req,
        resource,
        description,
      })),
  });
}

/**
 * MCP-specific paywall middleware that bypasses payment for protocol methods
 * and applies payment verification only for tool calls
 */
export function createMcpPaywallMiddlewareFactory() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params;

      const bypassMethods = [
        'initialize',
        'initialized',
        'notifications/initialized',
        'tools/list',
        'prompts/list',
        'resources/list',
        'resources/read',
        'prompts/get',
      ];

      if (req.body?.method && bypassMethods.includes(req.body.method)) {
        return next();
      }

      const toolName = req.body?.params?.name;

      if (!toolName) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Tool name is required for tool calls',
        });
      }

      const [endpoint] = await db
        .select({
          id: endpoints.id,
          paymentAmount: endpoints.paymentAmount,
          tokenType: endpoints.tokenType,
          userWallet: endpoints.userWallet,
          description: endpoints.description,
        })
        .from(endpoints)
        .innerJoin(users, eq(endpoints.userWallet, users.walletAddress))
        .where(and(eq(users.username, username), eq(endpoints.name, toolName)))
        .limit(1);

      if (!endpoint) {
        return res.status(404).json({
          error: 'Tool not found',
          message: `No tool found with name: ${toolName} for user: ${username}`,
        });
      }

      const resource = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

      const paywallMiddleware = await createMcpPaywallMiddleware(
        endpoint.paymentAmount,
        endpoint.tokenType,
        endpoint.userWallet,
        resource,
        endpoint.description,
      );

      return paywallMiddleware(req, res, next);
    } catch (error: any) {
      console.error('Error in MCP paywall middleware:', error);

      return res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Failed to verify payment',
      });
    }
  };
}

/**
 * Default MCP paywall middleware instance
 */
export const mcpPaywallMiddleware = createMcpPaywallMiddlewareFactory();
