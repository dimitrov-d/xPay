"use client";

import { useSignSolanaMessage, useSolanaAddress } from "@coinbase/cdp-hooks";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export function LoginButton() {
  const { signSolanaMessage } = useSignSolanaMessage();
  const { solanaAddress } = useSolanaAddress();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated() && solanaAddress) {
      router.push("/dashboard");
    }
  }, [solanaAddress, router]);

  const handleLogin = async () => {
    if (!solanaAddress) {
      toast.error("No wallet connected", {
        description: "Please connect your Coinbase wallet first",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create message to sign with clear formatting
      const timestamp = Date.now();
      const message = `Sign this message to authenticate with xPay.

Wallet: ${solanaAddress}
Timestamp: ${timestamp}

This will not cost any gas fees.`;

      console.log("Requesting signature for message:", message);

      // Sign the message using Coinbase CDP
      // The message needs to be in the format expected by the wallet
      const result = await signSolanaMessage({
        solanaAccount: solanaAddress,
        message: Buffer.from(message, "utf8").toString("base64"),
      });

      console.log("Signature result:", result);

      if (!result?.signature) {
        throw new Error("Failed to get signature from wallet");
      }

      console.log("Sending login request to backend...");

      // Login with the signature
      const loginResponse = await authApi.login(
        solanaAddress,
        message,
        result.signature
      );

      console.log("Login successful:", loginResponse);

      toast.success("Login successful!", {
        description: `Welcome back, ${loginResponse.user.username}`,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Provide more specific error messages
      let errorMessage = error.message || "Failed to authenticate. Please try again.";
      
      if (error.message?.includes("User rejected")) {
        errorMessage = "You rejected the signature request. Please try again.";
      } else if (error.message?.includes("signature")) {
        errorMessage = "Invalid signature. Please try signing again.";
      }

      toast.error("Login failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={!solanaAddress || isLoading}
      size="lg"
      className="w-full"
    >
      {isLoading ? "Signing in..." : "Sign in with Wallet"}
    </Button>
  );
}

