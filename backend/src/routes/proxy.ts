import { and, eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { db } from '../config/database';
import { endpoints, requestLogs, users } from '../db/schema';
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

    const startTime = Date.now();
    let responseTime: number | null = null;
    let statusCode = 500;
    let isSuccess = false;

    try {
      const response = await forwardRequest(req, {
        originalUrl: endpoint.originalUrl,
        httpMethod: endpoint.httpMethod,
        customAuthHeaders: endpoint.customAuthHeaders as Record<string, string> | null,
      });

      responseTime = Date.now() - startTime;
      statusCode = response.status;
      isSuccess = response.status >= 200 && response.status < 300;

      let responseData = response.data;
      if (Buffer.isBuffer(responseData)) {
        responseData = responseData.toString('utf-8');
        try {
          responseData = JSON.parse(responseData);
        } catch {} // Not JSON, keep as string
      }

      // Track earnings for successful responses (2xx status codes)
      if (isSuccess) {
        try {
          const [fullEndpoint] = await db
            .select()
            .from(endpoints)
            .where(eq(endpoints.id, endpoint.id))
            .limit(1);

          if (fullEndpoint) {
            const currentEarnings = parseFloat(fullEndpoint.totalEarnings || '0');
            const paymentAmount = parseFloat(fullEndpoint.paymentAmount || '0');
            const newEarnings = (currentEarnings + paymentAmount).toString();
            const currentCalls = fullEndpoint.totalCalls || 0;

            await db
              .update(endpoints)
              .set({
                totalEarnings: newEarnings,
                totalCalls: currentCalls + 1,
              })
              .where(eq(endpoints.id, endpoint.id));
          }
        } catch (trackingError) {
          console.error('Error updating earnings and calls:', trackingError);
        }
      }

      // Log the request (async, don't block response)
      db.insert(requestLogs)
        .values({
          endpointId: endpoint.id,
          statusCode,
          isSuccess,
          responseTime,
        })
        .catch((logError) => {
          console.error('Error logging request:', logError);
        });

      res.status(response.status);

      const headersToExclude = [
        'content-encoding',
        'transfer-encoding',
        'connection',
        'content-length',
      ];
      Object.keys(response.headers).forEach((key) => {
        if (!headersToExclude.includes(key.toLowerCase())) {
          res.setHeader(key, response.headers[key] as string);
        }
      });

      return res.send(responseData);
    } catch (error: any) {
      responseTime = Date.now() - startTime;
      statusCode = error.status || 502;

      db.insert(requestLogs)
        .values({
          endpointId: endpoint.id,
          statusCode,
          isSuccess: false,
          responseTime,
        })
        .catch((logError) => {
          console.error('Error logging request:', logError);
        });

      console.error('Error in proxy route:', error);
      const message = error.message || 'Proxy error';
      const data = error.data || { error: 'Failed to forward request' };

      return res.status(statusCode).json({
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
