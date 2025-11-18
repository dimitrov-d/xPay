import { and, count, eq, gte, sql } from 'drizzle-orm';
import { Response, Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database';
import { endpoints, requestLogs } from '../db/schema';
import { getAnalyticsQuerySchema, type GetAnalyticsQueryDto } from '../dto/analytics.dto';
import { AuthenticatedRequest, verifyAuth } from '../middleware/auth';
import { validateParams, validateQuery } from '../middleware/validation';

const router = Router();

const getEndpointParamsSchema = z.object({
  endpointId: z.string().uuid('Invalid endpoint ID format'),
});

/**
 * GET /analytics/endpoint/:endpointId
 * Get analytics for a specific endpoint (requires authentication and ownership)
 */
router.get(
  '/endpoint/:endpointId',
  verifyAuth,
  validateParams(getEndpointParamsSchema),
  validateQuery(getAnalyticsQuerySchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { endpointId } = req.validatedParams;
      const { period } = req.validatedQuery as GetAnalyticsQueryDto;
      const walletAddress = req.walletAddress!;

      const [endpoint] = await db
        .select()
        .from(endpoints)
        .where(eq(endpoints.id, endpointId))
        .limit(1);

      if (!endpoint) {
        return res.status(404).json({
          error: 'Endpoint not found',
        });
      }

      if (endpoint.userWallet !== walletAddress) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to view analytics for this endpoint',
        });
      }

      let startDate: Date;
      const now = new Date();

      switch (period) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
        default:
          startDate = new Date(0);
          break;
      }

      const isHourly = period === '24h';
      const timeGroupFormat = isHourly
        ? sql`DATE_TRUNC('hour', ${requestLogs.createdAt})`
        : sql`DATE_TRUNC('day', ${requestLogs.createdAt})`;

      const timeSeriesData = await db
        .select({
          timestamp: timeGroupFormat.as('timestamp'),
          successful: sql<number>`SUM(CASE WHEN ${requestLogs.isSuccess} = 1 THEN 1 ELSE 0 END)::int`,
          errored: sql<number>`SUM(CASE WHEN ${requestLogs.isSuccess} = 0 THEN 1 ELSE 0 END)::int`,
        })
        .from(requestLogs)
        .where(and(eq(requestLogs.endpointId, endpointId), gte(requestLogs.createdAt, startDate)))
        .groupBy(timeGroupFormat)
        .orderBy(requestLogs.createdAt);

      const [summary] = await db
        .select({
          totalRequests: count(),
          successfulRequests: sql<number>`SUM(CASE WHEN ${requestLogs.isSuccess} = 1 THEN 1 ELSE 0 END)::int`,
          erroredRequests: sql<number>`SUM(CASE WHEN ${requestLogs.isSuccess} = 0 THEN 1 ELSE 0 END)::int`,
          averageResponseTime: sql<number>`AVG(${requestLogs.responseTime})::float`,
        })
        .from(requestLogs)
        .where(and(eq(requestLogs.endpointId, endpointId), gte(requestLogs.createdAt, startDate)));

      return res.json({
        endpointId,
        period,
        summary: {
          totalRequests: summary?.totalRequests || 0,
          successfulRequests: summary?.successfulRequests || 0,
          erroredRequests: summary?.erroredRequests || 0,
          successRate:
            (summary?.totalRequests || 0) > 0
              ? ((summary?.successfulRequests || 0) / (summary?.totalRequests || 1)) * 100
              : 0,
          averageResponseTime: summary?.averageResponseTime || 0,
        },
        timeSeries: timeSeriesData.map((item) => ({
          timestamp: item.timestamp,
          successful: item.successful || 0,
          errored: item.errored || 0,
        })),
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
);

export default router;
