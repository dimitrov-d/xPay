import { NextFunction, Request, Response } from "express";
import { verifySolanaSignature } from "../utils/solana";

export interface AuthenticatedRequest extends Request {
  walletAddress?: string;
}

/**
 * Middleware to verify Solana wallet signature
 * Can be bypassed with BYPASS_AUTH environment variable for local testing
 */
export function verifyWalletSignature(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (process.env.BYPASS_AUTH === "true") {
    req.walletAddress =
      (req.headers["x-wallet-address"] as string) ||
      (req.body?.walletAddress as string) ||
      "test-wallet-address";
    return next();
  }

  const walletAddress = req.headers["x-wallet-address"] as string;
  const message = req.headers["x-message"] as string;
  const signature = req.headers["x-signature"] as string;

  if (!walletAddress || !message || !signature) {
    return res.status(401).json({
      error: "Missing authentication headers",
      required: ["x-wallet-address", "x-message", "x-signature"],
    });
  }

  const isValid = verifySolanaSignature(walletAddress, message, signature);

  if (!isValid) {
    return res.status(401).json({
      error: "Invalid signature",
    });
  }

  req.walletAddress = walletAddress;
  next();
}
