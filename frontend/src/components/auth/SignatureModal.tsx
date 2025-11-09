"use client";

import { useSignSolanaMessage, useSolanaAddress } from "@coinbase/cdp-hooks";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Zap, Wallet, Loader2, AlertCircle } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface SignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SignatureModal({ open, onOpenChange, onSuccess }: SignatureModalProps) {
  const { signSolanaMessage } = useSignSolanaMessage();
  const { solanaAddress } = useSolanaAddress();
  const [isLoading, setIsLoading] = useState(false);

  const handleSign = async () => {
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

      toast.success("Authentication successful!", {
        description: `Welcome, ${loginResponse.user.username}`,
      });

      // Close modal and notify parent
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Signature error:", error);
      
      // Provide more specific error messages
      let errorMessage = error.message || "Failed to authenticate. Please try again.";
      
      if (error.message?.includes("User rejected")) {
        errorMessage = "You rejected the signature request. Please try again.";
      } else if (error.message?.includes("signature")) {
        errorMessage = "Invalid signature. Please try signing again.";
      }

      toast.error("Authentication failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogPrimitive.Portal>
        {/* Custom lighter overlay to show homepage in background */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-[101] grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Sign Message to Continue
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Sign a message with your wallet to authenticate and access xPay features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Wallet Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-accent" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Connected Wallet</p>
                {solanaAddress ? (
                  <p className="text-xs text-accent font-mono truncate">
                    {solanaAddress}
                  </p>
                ) : (
                  <p className="text-xs text-red-600">
                    No wallet connected
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="flex items-start gap-2 rounded-md bg-blue-50 border border-blue-200 p-3">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900">
              This signature proves you own this wallet address. It creates a secure session token and does not cost any gas fees.
            </p>
          </div>

          {/* Sign Button - Using hero variant (green accent color) */}
          <Button
            onClick={handleSign}
            disabled={!solanaAddress || isLoading}
            size="lg"
            variant="hero"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Waiting for signature...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Sign Message
              </>
            )}
          </Button>

          {/* Features */}
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-900">Secure Authentication</p>
                <p className="text-xs text-gray-600">
                  Your signature proves ownership without exposing private keys
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-900">No Gas Fees</p>
                <p className="text-xs text-gray-600">
                  Signing is free - no blockchain transaction required
                </p>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-center text-xs text-gray-500">
            You only need to sign once per session (7 days)
          </p>
        </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}

