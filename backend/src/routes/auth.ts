import { eq } from "drizzle-orm";
import { Response, Router } from "express";
import { db } from "../config/database";
import { users } from "../db/schema";
import { verifySolanaSignature } from "../utils/solana";
import { generateToken } from "../utils/jwt";

const router = Router();

/**
 * POST /auth/login
 * Authenticate user by verifying wallet signature and return JWT token
 * 
 * Request body:
 * - walletAddress: string - User's Solana wallet address
 * - message: string - Message that was signed
 * - signature: string - Signature from wallet
 * 
 * Response:
 * - token: string - JWT token for subsequent requests
 * - user: object - User profile data
 */
router.post("/login", async (req, res: Response) => {
  try {
    const { walletAddress, message, signature } = req.body;

    // Validate required fields
    if (!walletAddress || !message || !signature) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["walletAddress", "message", "signature"],
      });
    }

    // Verify the signature
    const isValid = verifySolanaSignature(walletAddress, message, signature);

    if (!isValid) {
      return res.status(401).json({
        error: "Invalid signature",
      });
    }

    // Find or create user
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, walletAddress))
      .limit(1);

    // If user doesn't exist, create a default profile
    if (!user) {
      // Generate a default username from wallet address
      const defaultUsername = `user_${walletAddress.slice(0, 8)}`;
      
      [user] = await db
        .insert(users)
        .values({
          walletAddress,
          username: defaultUsername,
        })
        .returning();
    }

    // Generate JWT token
    const token = generateToken(user.walletAddress, user.username);

    return res.json({
      message: "Authentication successful",
      token,
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * POST /auth/logout
 * Logout endpoint (client should remove token)
 * Note: Since JWT is stateless, actual invalidation happens on client side
 * 
 * Response:
 * - message: string - Success message
 */
router.post("/logout", (req, res: Response) => {
  // JWT is stateless, so we just return success
  // The client should remove the token from storage
  return res.json({
    message: "Logout successful",
  });
});

/**
 * GET /auth/verify
 * Verify if a JWT token is still valid
 * Requires Authorization header with Bearer token
 * 
 * Response:
 * - valid: boolean
 * - user: object (if valid)
 */
router.get("/verify", async (req, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        valid: false,
        error: "No token provided",
      });
    }

    const token = authHeader.substring(7);
    const { verifyToken } = require("../utils/jwt");
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        valid: false,
        error: "Invalid or expired token",
      });
    }

    // Optionally, verify user still exists in database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, decoded.walletAddress))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        valid: false,
        error: "User not found",
      });
    }

    return res.json({
      valid: true,
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({
      valid: false,
      error: "Internal server error",
    });
  }
});

export default router;

