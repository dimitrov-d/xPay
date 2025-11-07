import { and, count, eq } from "drizzle-orm";
import { Response, Router } from "express";
import { db } from "../../config/database";
import { endpoints, users } from "../../db/schema";
import {
  AuthenticatedRequest,
  verifyWalletSignature,
} from "../../middleware/auth";

const router = Router();

/**
 * POST /api/endpoints
 * Register a new endpoint (requires authentication)
 */
router.post(
  "/",
  verifyWalletSignature,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        username,
        name,
        description,
        originalUrl,
        httpMethod,
        paymentAmount,
        tokenType,
        receiverAddress,
        customAuthHeaders,
        sampleBody,
        sampleResponse,
      } = req.body;

      const walletAddress = req.walletAddress!;

      if (
        !username ||
        !name ||
        !description ||
        !originalUrl ||
        !httpMethod ||
        paymentAmount === undefined ||
        !tokenType ||
        !receiverAddress
      ) {
        return res.status(400).json({
          error: "Missing required fields",
          required: [
            "username",
            "name",
            "description",
            "originalUrl",
            "httpMethod",
            "paymentAmount",
            "tokenType",
            "receiverAddress",
          ],
        });
      }

      const validMethods = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "HEAD",
        "OPTIONS",
      ];
      if (!validMethods.includes(httpMethod.toUpperCase())) {
        return res.status(400).json({
          error: "Invalid HTTP method",
          validMethods,
        });
      }

      try {
        const url = new URL(originalUrl);
        if (!["http:", "https:"].includes(url.protocol)) {
          return res.status(400).json({
            error: "URL must use http or https protocol",
          });
        }
      } catch {
        return res.status(400).json({
          error: "Invalid URL format",
        });
      }

      if (typeof paymentAmount !== "number" || paymentAmount < 0) {
        return res.status(400).json({
          error: "Payment amount must be a non-negative number",
        });
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return res.status(400).json({
          error:
            "Username can only contain letters, numbers, hyphens, and underscores",
        });
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        return res.status(400).json({
          error:
            "Endpoint name can only contain letters, numbers, hyphens, and underscores",
        });
      }

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
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
          username,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.walletAddress,
          set: {
            username,
            updatedAt: new Date(),
          },
        });

      const existingEndpoint = await db
        .select()
        .from(endpoints)
        .where(
          and(eq(endpoints.userWallet, walletAddress), eq(endpoints.name, name))
        )
        .limit(1);

      if (existingEndpoint.length > 0) {
        return res.status(409).json({
          error: "Endpoint name already exists for this user",
        });
      }

      const [newEndpoint] = await db
        .insert(endpoints)
        .values({
          userWallet: walletAddress,
          name,
          description,
          originalUrl,
          httpMethod: httpMethod.toUpperCase(),
          paymentAmount: paymentAmount.toString(),
          tokenType,
          receiverAddress,
          customAuthHeaders: customAuthHeaders || null,
          sampleBody: sampleBody || null,
          sampleResponse: sampleResponse || null,
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
router.get("/", async (req, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
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
});

/**
 * GET /api/endpoints/:id
 * Get specific endpoint details
 */
router.get("/:id", async (req, res: Response) => {
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
});

/**
 * GET /api/endpoints/user/:wallet
 * Get all endpoints for a specific user
 */
router.get("/user/:wallet", async (req, res: Response) => {
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
});

export default router;
