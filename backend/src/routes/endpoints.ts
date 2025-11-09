import { and, count, eq } from 'drizzle-orm';
import { Response, Router } from 'express';
import { db } from '../config/database';
import { endpoints, users } from '../db/schema';
import {
  createEndpointSchema,
  deleteEndpointParamsSchema,
  getEndpointParamsSchema,
  getUserEndpointsParamsSchema,
  listEndpointsQuerySchema,
  updateEndpointSchema,
  type CreateEndpointDto,
  type ListEndpointsQueryDto,
  type UpdateEndpointDto,
} from '../dto/endpoints.dto';
import { AuthenticatedRequest, verifyAuth } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';

const router = Router();

/**
 * GET /endpoints
 * List all endpoints (public, for marketplace)
 */
router.get('/', validateQuery(listEndpointsQuerySchema), async (req, res: Response) => {
  try {
    const { page, limit } = req.validatedQuery as ListEndpointsQueryDto;
    const offset = (page - 1) * limit;

    const allEndpoints = await db
      .select()
      .from(endpoints)
      .innerJoin(users, eq(endpoints.userWallet, users.walletAddress))
      .limit(limit)
      .offset(offset)
      .orderBy(endpoints.createdAt);

    const [{ total }] = await db.select({ total: count() }).from(endpoints);

    return res.json({
      endpoints: allEndpoints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/**
 * POST /endpoints
 * Register a new endpoint (requires authentication)
 */
router.post(
  '/',
  verifyAuth,
  validateBody(createEndpointSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = req.body as CreateEndpointDto;
      const walletAddress = req.walletAddress!;

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, data.username))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].walletAddress !== walletAddress) {
        return res.status(409).json({
          error: 'Username already taken',
        });
      }

      await db
        .insert(users)
        .values({
          walletAddress,
          username: data.username,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.walletAddress,
          set: {
            username: data.username,
            updatedAt: new Date(),
          },
        });

      const existingEndpoint = await db
        .select()
        .from(endpoints)
        .where(
          and(
            eq(endpoints.userWallet, walletAddress),
            eq(endpoints.name, data.name),
            eq(endpoints.httpMethod, data.httpMethod.toUpperCase()),
          ),
        )
        .limit(1);

      if (existingEndpoint.length > 0) {
        return res.status(409).json({
          error: 'Endpoint with this name and method already exists for this user',
        });
      }

      const [newEndpoint] = await db
        .insert(endpoints)
        .values({
          userWallet: walletAddress,
          name: data.name,
          description: data.description,
          originalUrl: data.originalUrl,
          httpMethod: data.httpMethod.toUpperCase(),
          paymentAmount: data.paymentAmount.toString(),
          tokenType: data.tokenType,
          customAuthHeaders: data.customAuthHeaders || null,
          sampleBody: data.sampleBody || null,
          sampleResponse: data.sampleResponse || null,
          updatedAt: new Date(),
        })
        .returning();

      return res.status(201).json({
        message: 'Endpoint registered successfully',
        endpoint: newEndpoint,
      });
    } catch (error) {
      console.error('Error registering endpoint:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
);

/**
 * GET /endpoints/:id
 * Get specific endpoint details
 */
router.get('/:id', validateParams(getEndpointParamsSchema), async (req, res: Response) => {
  try {
    const { id } = req.validatedParams;

    const [endpoint] = await db
      .select({
        id: endpoints.id,
        username: users.username,
        name: endpoints.name,
        description: endpoints.description,
        originalUrl: endpoints.originalUrl,
        httpMethod: endpoints.httpMethod,
        paymentAmount: endpoints.paymentAmount,
        tokenType: endpoints.tokenType,
        customAuthHeaders: endpoints.customAuthHeaders,
        sampleBody: endpoints.sampleBody,
        sampleResponse: endpoints.sampleResponse,
        createdAt: endpoints.createdAt,
        updatedAt: endpoints.updatedAt,
      })
      .from(endpoints)
      .innerJoin(users, eq(endpoints.userWallet, users.walletAddress))
      .where(eq(endpoints.id, id))
      .limit(1);

    if (!endpoint) {
      return res.status(404).json({
        error: 'Endpoint not found',
      });
    }

    return res.json(endpoint);
  } catch (error) {
    console.error('Error fetching endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/**
 * GET /endpoints/user/:wallet
 * Get all endpoints for a specific user
 */
router.get(
  '/user/:wallet',
  validateParams(getUserEndpointsParamsSchema),
  async (req, res: Response) => {
    try {
      const { wallet } = req.validatedParams;

      const userEndpoints = await db
        .select()
        .from(endpoints)
        .where(eq(endpoints.userWallet, wallet))
        .orderBy(endpoints.createdAt);

      return res.json({
        wallet,
        endpoints: userEndpoints,
        count: userEndpoints.length,
      });
    } catch (error) {
      console.error('Error fetching user endpoints:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
);

/**
 * PUT /endpoints/:id
 * Update an endpoint (requires authentication)
 */
router.put(
  '/:id',
  verifyAuth,
  validateParams(getEndpointParamsSchema),
  validateBody(updateEndpointSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.validatedParams;
      const walletAddress = req.walletAddress!;
      const data = req.body as UpdateEndpointDto;

      const [existingEndpoint] = await db
        .select()
        .from(endpoints)
        .where(eq(endpoints.id, id))
        .limit(1);

      if (!existingEndpoint) {
        return res.status(404).json({
          error: 'Endpoint not found',
        });
      }

      if (existingEndpoint.userWallet !== walletAddress) {
        return res.status(403).json({
          error: 'You do not have permission to update this endpoint',
        });
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.originalUrl !== undefined) updateData.originalUrl = data.originalUrl;
      if (data.httpMethod !== undefined) updateData.httpMethod = data.httpMethod.toUpperCase();
      if (data.paymentAmount !== undefined)
        updateData.paymentAmount = data.paymentAmount.toString();
      if (data.tokenType !== undefined) updateData.tokenType = data.tokenType;
      if (data.customAuthHeaders !== undefined)
        updateData.customAuthHeaders = data.customAuthHeaders;
      if (data.sampleBody !== undefined) updateData.sampleBody = data.sampleBody;
      if (data.sampleResponse !== undefined) updateData.sampleResponse = data.sampleResponse;

      const [updatedEndpoint] = await db
        .update(endpoints)
        .set(updateData)
        .where(eq(endpoints.id, id))
        .returning();

      return res.json({
        message: 'Endpoint updated successfully',
        endpoint: updatedEndpoint,
      });
    } catch (error) {
      console.error('Error updating endpoint:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
);

/**
 * DELETE /endpoints/:id
 * Delete an endpoint (requires authentication)
 */
router.delete(
  '/:id',
  verifyAuth,
  validateParams(deleteEndpointParamsSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.validatedParams;
      const walletAddress = req.walletAddress!;

      const [existingEndpoint] = await db
        .select()
        .from(endpoints)
        .where(eq(endpoints.id, id))
        .limit(1);

      if (!existingEndpoint) {
        return res.status(404).json({
          error: 'Endpoint not found',
        });
      }

      if (existingEndpoint.userWallet !== walletAddress) {
        return res.status(403).json({
          error: 'You do not have permission to delete this endpoint',
        });
      }

      await db.delete(endpoints).where(eq(endpoints.id, id));

      return res.json({
        message: 'Endpoint deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
);

export default router;
