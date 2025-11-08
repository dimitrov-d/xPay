"use client";

import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser, useSolanaAddress } from "@coinbase/cdp-hooks";
import { Check, Copy, Loader2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WalletPage() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { solanaAddress } = useSolanaAddress();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  const handleCopy = async () => {
    if (solanaAddress) {
      await navigator.clipboard.writeText(solanaAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                Your Solana Wallet
              </h1>
              <p className="text-xl text-muted-foreground">
                Your embedded Solana wallet is ready to use
              </p>
            </div>

            <Card className="shadow-elegant">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Wallet className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle>Solana Wallet Address</CardTitle>
                    <CardDescription>
                      Your SVM (Solana Virtual Machine) wallet address
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {solanaAddress ? (
                  <>
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-muted border border-border">
                      <code className="flex-1 text-sm font-mono break-all">
                        {solanaAddress}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopy}
                        className="shrink-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        This is your embedded Solana wallet address. You can use this address to receive SOL and other SPL tokens.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    <span className="ml-2 text-muted-foreground">
                      Loading wallet address...
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">Solana</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Solana Virtual Machine (SVM)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Wallet Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">Embedded</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Coinbase CDP Embedded Wallet
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

