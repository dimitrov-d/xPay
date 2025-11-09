"use client";

import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { useSignSolanaMessage, useSolanaAddress } from "@coinbase/cdp-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function LoginButton() {
  const { signSolanaMessage } = useSignSolanaMessage();
  const { solanaAddress } = useSolanaAddress();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      const timestamp = Date.now();
      const message = `Sign this message to authenticate with xPay.

Wallet: ${solanaAddress}
Timestamp: ${timestamp}

This will not cost any gas fees.`;

      console.log("Requesting signature for message:", message);

      const result = await signSolanaMessage({
        solanaAccount: solanaAddress,
        message: Buffer.from(message, "utf8").toString("base64"),
      });

      console.log("Signature result:", result);

      if (!result?.signature) {
        throw new Error("Failed to get signature from wallet");
      }

      console.log("Sending login request to backend...");

      const loginResponse = await authApi.login(
        solanaAddress,
        message,
        result.signature
      );

      console.log("Login successful:", loginResponse);

      toast.success("Login successful!", {
        description: `Welcome back, ${loginResponse.user.username}`,
      });

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

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

