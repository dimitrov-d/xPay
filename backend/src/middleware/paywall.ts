import { solana } from '@faremeter/info';
import { express as faremeter } from '@faremeter/middleware';
import { and, eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import { db } from '../config/database';
import { endpoints, users } from '../db/schema';
/**
 * Creates a Faremeter middleware for a specific endpoint configuration
 * @param paymentAmount - Payment amount as a string
 * @param asset - SPL token address (Solana public key)
 * @param userWallet - User wallet address to receive payments
 * @param resource - Resource URL for the payment
 * @param description - Description of the payment
 */
async function createPaywallMiddleware(
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

  if (+paymentAmount <= 0) {
    throw new Error(`Invalid payment amount: ${paymentAmount}.`);
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
 * Middleware factory that creates a paywall middleware based on endpoint configuration
 * This middleware looks up the endpoint and applies Faremeter payment verification
 */
export function createPaywallMiddlewareFactory() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, endpointName } = req.params;
      const httpMethod = req.method.toUpperCase();

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
        .where(
          and(
            eq(users.username, username),
            eq(endpoints.name, endpointName),
            eq(endpoints.httpMethod, httpMethod),
          ),
        )
        .limit(1);

      if (!endpoint) {
        return res.status(404).json({
          error: 'Endpoint not found',
          message: `No endpoint found for ${username}/${endpointName} with method ${httpMethod}`,
        });
      }

      const resource = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

      const paywallMiddleware = await createPaywallMiddleware(
        endpoint.paymentAmount,
        endpoint.tokenType,
        endpoint.userWallet,
        resource,
        endpoint.description,
      );

      return paywallMiddleware(req, res, next);
    } catch (error: any) {
      console.error('Error in paywall middleware:', error);

      return res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Failed to verify payment',
      });
    }
  };
}

/**
 * Default paywall middleware instance
 */
export const paywallMiddleware = createPaywallMiddlewareFactory();
