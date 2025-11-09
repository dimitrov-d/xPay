import { and, eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { db } from '../config/database';
import { endpoints, users } from '../db/schema';
import { paywallMiddleware } from '../middleware/paywall';
import { forwardRequest } from '../services/proxy';

const router = Router();

/**
 * Dynamic proxy route: /:username/:endpointName
 * Applies paywall middleware first, then forwards requests to the original API endpoint
 */
router.all('/:username/:endpointName', paywallMiddleware, async (req: Request, res: Response) => {
  try {
    const { username, endpointName } = req.params;
    const httpMethod = req.method.toUpperCase();

    const [endpoint] = await db
      .select({
        id: endpoints.id,
        originalUrl: endpoints.originalUrl,
        httpMethod: endpoints.httpMethod,
        customAuthHeaders: endpoints.customAuthHeaders,
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

    try {
      const response = await forwardRequest(req, {
        originalUrl: endpoint.originalUrl,
        httpMethod: endpoint.httpMethod,
        customAuthHeaders: endpoint.customAuthHeaders as Record<string, string> | null,
      });

      res.status(response.status);

      const headersToExclude = ['content-encoding', 'transfer-encoding', 'connection'];
      Object.keys(response.headers).forEach((key) => {
        if (!headersToExclude.includes(key.toLowerCase())) {
          res.setHeader(key, response.headers[key] as string);
        }
      });

      return res.send(response.data);
    } catch (error: any) {
      const status = error.status || 502;
      const message = error.message || 'Proxy error';
      const data = error.data || { error: 'Failed to forward request' };

      return res.status(status).json({
        error: message,
        ...data,
      });
    }
  } catch (error) {
    console.error('Error in proxy route:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export default router;
