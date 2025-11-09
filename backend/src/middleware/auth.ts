import { NextFunction, Request, Response } from "express";
import { JWTPayload, verifyToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  walletAddress?: string;
  username?: string;
  user?: JWTPayload;
}

/**
 * Middleware to verify JWT token from Authorization header
 * Extracts user information from token and attaches to request
 */
export function verifyAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing authentication token",
      message: "Please provide a valid JWT token in Authorization header",
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      error: "Invalid or expired token",
      message: "Please login again to get a new token",
    });
  }

  // Attach user information to request
  req.walletAddress = decoded.walletAddress;
  req.username = decoded.username;
  req.user = decoded;

  next();
}
