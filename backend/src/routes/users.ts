import { eq } from "drizzle-orm";
import { Response, Router } from "express";
import { db } from "../config/database";
import { users } from "../db/schema";
import {
  updateUsernameSchema,
  type UpdateUsernameDto,
} from "../dto/endpoints.dto";
import {
  AuthenticatedRequest,
  verifyWalletSignature,
} from "../middleware/auth";
import { validateBody } from "../middleware/validation";

const router = Router();

/**
 * GET /users/me
 * Get current authenticated user info
 */
router.get(
  "/me",
  verifyWalletSignature,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const walletAddress = req.walletAddress!;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.walletAddress, walletAddress))
        .limit(1);

      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "User profile not found. Please create an endpoint first.",
        });
      }

      return res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

/**
 * PUT /users/me
 * Update username for authenticated user
 */
router.put(
  "/me",
  verifyWalletSignature,
  validateBody(updateUsernameSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = req.body as UpdateUsernameDto;
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

      const [updatedUser] = await db
        .update(users)
        .set({
          username: data.username,
          updatedAt: new Date(),
        })
        .where(eq(users.walletAddress, walletAddress))
        .returning();

      return res.json({
        message: "Username updated successfully",
        user: updatedUser,
        warning:
          "Changing your username will cause all existing proxy URLs to change. Old endpoints will stop working.",
      });
    } catch (error) {
      console.error("Error updating username:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

export default router;
