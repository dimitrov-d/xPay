"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginButton } from "@/components/auth/LoginButton";
import { isAuthenticated } from "@/lib/auth";
import { useSolanaAddress, useCurrentUser } from "@coinbase/cdp-hooks";
import { Wallet, Shield, Zap, AlertCircle, Info } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { solanaAddress } = useSolanaAddress();
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    // Redirect to dashboard if already authenticated with JWT
    if (isAuthenticated() && solanaAddress) {
      router.push("/profile");
    }
  }, [router, solanaAddress]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">xPay</h1>
          <p className="mt-2 text-gray-400">No-code API monetization platform</p>
        </div>

        {/* Login Card */}
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">Sign in to your account</CardTitle>
            <CardDescription className="text-gray-400">
              {!currentUser 
                ? "Connect your Coinbase wallet to get started"
                : "Sign a message with your wallet to complete authentication"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Wallet Status */}
            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Wallet Status</p>
                  {currentUser && solanaAddress ? (
                    <p className="text-xs text-green-400">
                      Connected: {solanaAddress.slice(0, 4)}...{solanaAddress.slice(-4)}
                    </p>
                  ) : (
                    <p className="text-xs text-yellow-400">
                      {!currentUser 
                        ? "Click the wallet button in the top-right corner to connect"
                        : "Loading wallet..."
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions or Login Button */}
            {!currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-md bg-blue-500/10 border border-blue-500/20 p-3">
                  <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <p className="text-xs text-blue-300">
                    Please use the Coinbase wallet button in the top-right corner to connect your wallet first.
                  </p>
                </div>
              </div>
            ) : solanaAddress ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-md bg-blue-500/10 border border-blue-500/20 p-3">
                  <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <p className="text-xs text-blue-300">
                    Click below to sign a message with your wallet. This proves you own this wallet address and generates your session token.
                  </p>
                </div>
                <LoginButton />
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-gray-400">Loading wallet...</p>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="space-y-3 pt-4 border-t border-gray-700">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Secure Authentication</p>
                  <p className="text-xs text-gray-400">
                    Your wallet signature proves ownership without exposing private keys
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">No Gas Fees</p>
                  <p className="text-xs text-gray-400">
                    Signing messages is completely free - no transaction required
                  </p>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="pt-4 text-center text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

