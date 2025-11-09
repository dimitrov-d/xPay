"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Footer } from "@/components/landing/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser, updateUsername } from "@/lib/api";
import { useCurrentUser, useSolanaAddress } from "@coinbase/cdp-hooks";
import { AlertTriangle, Check, Copy, Loader2, Save, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function WalletPage() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { solanaAddress } = useSolanaAddress();
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
      return;
    }
    loadUser();
  }, [currentUser, router, solanaAddress]);

  const loadUser = async () => {
    if (!solanaAddress) return;
    try {
      setLoading(true);
      const user = await getCurrentUser(solanaAddress);
      setUsername(user.username);
      setNewUsername(user.username);
    } catch (error) {
      console.log("User not found");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (solanaAddress) {
      await navigator.clipboard.writeText(solanaAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUsernameChange = () => {
    if (newUsername !== username) {
      setShowWarning(true);
    }
  };

  const confirmUsernameChange = async () => {
    if (!solanaAddress || !newUsername) return;
    try {
      setSaving(true);
      await updateUsername(newUsername, solanaAddress);
      setUsername(newUsername);
      toast.success("Username updated successfully");
      toast.warning("Note: All existing proxy URLs have changed. Old endpoints will stop working.");
      setShowWarning(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update username");
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <Sidebar />
      <main className="flex-1 pt-24 pb-12 px-4 ml-64 transition-all duration-300">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                Wallet & Profile
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage your wallet and profile settings
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

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Username</CardTitle>
                <CardDescription>
                  Your username is used in proxy URLs. Changing it will break existing endpoints.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        pattern="^[a-zA-Z0-9_-]+$"
                        placeholder="your-username"
                      />
                      <p className="text-xs text-muted-foreground">
                        Only letters, numbers, hyphens, and underscores
                      </p>
                    </div>
                    {newUsername !== username && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">
                          <p className="font-semibold mb-1">Warning: Not Backwards Compatible</p>
                          <p>
                            Changing your username will cause all existing proxy URLs to change.
                            Old endpoints will stop working and you'll need to update all integrations.
                          </p>
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={handleUsernameChange}
                      disabled={newUsername === username || !newUsername || saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Username
                        </>
                      )}
                    </Button>
                  </>
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
          </div>
        </div>
      </main>
      <Footer />

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Username Change Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Changing your username is <strong>not backwards compatible</strong>.
              </p>
              <p>
                This will cause all existing proxy URLs to change from:
              </p>
              <code className="block p-2 bg-muted rounded text-xs">
                /{username}/endpoint-name
              </code>
              <p>to:</p>
              <code className="block p-2 bg-muted rounded text-xs">
                /{newUsername}/endpoint-name
              </code>
              <p className="pt-2">
                <strong>All existing integrations using your old URLs will break.</strong> You'll need to update all clients and integrations.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUsernameChange} className="bg-yellow-500 hover:bg-yellow-600">
              I Understand, Change Username
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

