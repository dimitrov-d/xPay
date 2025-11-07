import { and, count, eq } from "drizzle-orm";
import { Response, Router } from "express";
import { db } from "../../config/database";
import { endpoints, users } from "../../db/schema";
import {
  createEndpointSchema,
  getEndpointParamsSchema,
  getUserEndpointsParamsSchema,
  listEndpointsQuerySchema,
  type CreateEndpointDto,
  type ListEndpointsQueryDto,
} from "../../dto/endpoints.dto";
import {
  AuthenticatedRequest,
  verifyWalletSignature,
} from "../../middleware/auth";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middleware/validation";

const router = Router();

/**
 * POST /api/endpoints
 * Register a new endpoint (requires authentication)
 */
router.post(
  "/",
  verifyWalletSignature,
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

      if (
        existingUser.length > 0 &&
        existingUser[0].walletAddress !== walletAddress
      ) {
        return res.status(409).json({
          error: "Username already taken",
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
            eq(endpoints.httpMethod, data.httpMethod.toUpperCase())
          )
        )
        .limit(1);

      if (existingEndpoint.length > 0) {
        return res.status(409).json({
          error:
            "Endpoint with this name and method already exists for this user",
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
          receiverAddress: data.receiverAddress,
          customAuthHeaders: data.customAuthHeaders || null,
          sampleBody: data.sampleBody || null,
          sampleResponse: data.sampleResponse || null,
          updatedAt: new Date(),
        })
        .returning();

      return res.status(201).json({
        message: "Endpoint registered successfully",
        endpoint: newEndpoint,
      });
    } catch (error) {
      console.error("Error registering endpoint:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

/**
 * GET /api/endpoints
 * List all endpoints (public, for marketplace)
 */
router.get(
  "/",
  validateQuery(listEndpointsQuerySchema),
  async (req, res: Response) => {
    try {
      const { page, limit } = req.query as ListEndpointsQueryDto;
      const offset = (page - 1) * limit;

      const allEndpoints = await db
        .select({
          id: endpoints.id,
          username: users.username,
          name: endpoints.name,
          description: endpoints.description,
          httpMethod: endpoints.httpMethod,
          paymentAmount: endpoints.paymentAmount,
          tokenType: endpoints.tokenType,
          createdAt: endpoints.createdAt,
        })
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
      console.error("Error fetching endpoints:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

/**
 * GET /api/endpoints/:id
 * Get specific endpoint details
 */
router.get(
  "/:id",
  validateParams(getEndpointParamsSchema),
  async (req, res: Response) => {
    try {
      const { id } = req.params;

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
          receiverAddress: endpoints.receiverAddress,
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
          error: "Endpoint not found",
        });
      }

      return res.json(endpoint);
    } catch (error) {
      console.error("Error fetching endpoint:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

/**
 * GET /api/endpoints/user/:wallet
 * Get all endpoints for a specific user
 */
router.get(
  "/user/:wallet",
  validateParams(getUserEndpointsParamsSchema),
  async (req, res: Response) => {
    try {
      const { wallet } = req.params;

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
      console.error("Error fetching user endpoints:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

export default router;
