import { eq } from "drizzle-orm";
import { Response, Router } from "express";
import { db } from "../config/database";
import { users } from "../db/schema";
import { updateUserSchema, type UpdateUserDto } from "../dto/user.dto";
import {
  AuthenticatedRequest,
  verifyWalletSignature,
} from "../middleware/auth";
import { validateBody } from "../middleware/validation";

const router = Router();

/**
 * GET /user/profile
 * Get current user's profile (requires authentication)
 */
router.get(
  "/profile",
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
        });
      }

      return res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

/**
 * PUT /user/profile
 * Update current user's profile (requires authentication)
 */
router.put(
  "/profile",
  verifyWalletSignature,
  validateBody(updateUserSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const walletAddress = req.walletAddress!;
      const data = req.body as UpdateUserDto;

      if (data.username) {
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.username, data.username))
          .limit(1);

        if (existingUser && existingUser.walletAddress !== walletAddress) {
          return res.status(409).json({
            error: "Username already taken",
          });
        }
      }

      const [updatedUser] = await db
        .update(users)
        .set({
          username: data.username,
          updatedAt: new Date(),
        })
        .where(eq(users.walletAddress, walletAddress))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      return res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

export default router;
