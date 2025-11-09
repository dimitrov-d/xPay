import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
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

const getRpcUrl = () =>
  process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta");

const router = Router();

/**
 * GET /user/profile
 * Get current user's profile with SOL and USDC balances (requires authentication)
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
        // .where(eq(users.walletAddress, walletAddress))
        .limit(1);

      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "User profile not found. Please create an endpoint first.",
        });
      }

      // Fetch SOL and USDC balances
      let solBalance = 0;
      let usdcBalance = 0;

      try {
        const connection = new Connection(getRpcUrl());
        const publicKey = new PublicKey(walletAddress);

        // Get SOL balance
        const balance = await connection.getBalance(publicKey);
        solBalance = balance / LAMPORTS_PER_SOL;

        // Get USDC balance
        const usdcMint = new PublicKey(
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        );
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          {
            mint: usdcMint,
          }
        );

        if (tokenAccounts.value.length > 0) {
          usdcBalance =
            tokenAccounts.value[0].account.data.parsed.info.tokenAmount
              .uiAmount || 0;
        }
      } catch (balanceError: any) {
        console.error("Error fetching balances:", balanceError);
        // Continue without balances if there's an error
      }

      return res.json({
        ...user,
        balances: {
          sol: solBalance,
          usdc: usdcBalance,
        },
      });
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
        message: "Username updated successfully",
        user: updatedUser,
        warning:
          "Changing your username will cause all existing proxy URLs to change. Old endpoints will stop working.",
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
