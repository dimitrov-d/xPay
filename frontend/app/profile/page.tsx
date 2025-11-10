"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";
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
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getCurrentUser, updateUsername } from "@/lib/api";
import { useCurrentUser, useExportSolanaAccount, useSolanaAddress } from "@coinbase/cdp-hooks";
import { AlertTriangle, Check, Copy, Loader2, Save, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { solanaAddress } = useSolanaAddress();
  const { exportSolanaAccount } = useExportSolanaAccount();
  const { isReady, SignatureModal } = useRequireAuth();
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showExportConfirmation, setShowExportConfirmation] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false; // Default to open on server-side
  });
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [loadingBalances, setLoadingBalances] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
      return;
    }

    if (isReady) {
      loadUser();
    }
  }, [currentUser, router, solanaAddress, isReady]);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      setLoadingBalances(true);

      const user = await getCurrentUser();

      setUsername(user.username);
      setNewUsername(user.username);

      if (user.balances) {
        setSolBalance(user.balances.sol || 0);
        setUsdcBalance(user.balances.usdc || 0);
      } else {
        setSolBalance(0);
        setUsdcBalance(0);
      }
    } catch (error: any) {
      console.error("Failed to load user:", error);
      toast.error(`Failed to load user: ${error.message || "Unknown error"}`);
      setSolBalance(0);
      setUsdcBalance(0);
    } finally {
      setLoading(false);
      setLoadingBalances(false);
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
    if (!newUsername) return;
    try {
      setSaving(true);
      await updateUsername(newUsername);
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleExportRequest = () => {
    setShowExportConfirmation(true);
  };

  const handleConfirmedExport = async () => {
    if (!solanaAddress) {
      toast.error("No wallet address found.");
      return;
    }

    setIsExporting(true);
    try {
      const { privateKey } = await exportSolanaAccount({
        solanaAccount: solanaAddress,
      });

      await navigator.clipboard.writeText(privateKey);

      toast.warning("Private key copied to clipboard. Please store it securely and clear your clipboard immediately.");

      setShowExportConfirmation(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to export private key. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (!isReady) {
    return (
      <>
        {SignatureModal}
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </>
    );
  }

  return (
    <>
      {SignatureModal}
      <div className="min-h-screen flex flex-col">
        <DashboardHeader onToggleSidebar={toggleSidebar} />
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main
          className={`flex-1 pt-20 pb-12 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
            }`}
        >
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6 sm:space-y-8">
              <div className="text-center space-y-2 sm:space-y-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                  Wallet & Profile
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                  Manage your wallet and profile settings
                </p>
              </div>

              {/* Wallet Balances */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="p-2 sm:p-3 rounded-full bg-accent/10 flex-shrink-0">
                      <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base sm:text-lg">
                        Solana Wallet Address
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Your SVM (Solana Virtual Machine) wallet address
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {solanaAddress ? (
                    <>
                      <div className="flex items-center gap-2 p-3 sm:p-4 rounded-lg bg-muted border border-border">
                        <code className="flex-1 text-xs sm:text-sm font-mono break-all">
                          {solanaAddress}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopy}
                          className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                        </Button>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        <p>
                          This is your embedded Solana wallet address. You can
                          use this address to receive SOL and other SPL tokens.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-accent" />
                      <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
                        Loading wallet address...
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-2 sm:p-3 rounded-full bg-accent/10 flex-shrink-0">
                        <img
                          src="/solana.svg"
                          alt="Solana"
                          className="w-5 h-5 sm:w-6 sm:h-6"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg">
                          SOL Balance
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Your Solana balance
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingBalances ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-accent" />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Loading...
                        </span>
                      </div>
                    ) : (
                      <p className="text-lg sm:text-xl font-bold break-all">
                        {solBalance?.toFixed(4) || "0.0000"} SOL
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-elegant">
                  <CardHeader>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-950 flex-shrink-0">
                        <img
                          src="/usdc.svg"
                          alt="USDC"
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg">
                          USDC Balance
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Your USDC balance
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingBalances ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-accent" />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Loading...
                        </span>
                      </div>
                    ) : (
                      <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-500 break-all">
                        {usdcBalance?.toFixed(2) || "0.00"} USDC
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Username</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Your username is used in proxy URLs. Changing it will break
                    existing endpoints.
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
                        <Label htmlFor="username" className="text-sm">
                          Username
                        </Label>
                        <Input
                          id="username"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          pattern="^[a-zA-Z0-9_-]+$"
                          placeholder="your-username"
                          className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Only letters, numbers, hyphens, and underscores
                        </p>
                      </div>
                      {newUsername !== username && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mt-0.5 shrink-0" />
                          <div className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">
                            <p className="font-semibold mb-1">
                              Warning: Not Backwards Compatible
                            </p>
                            <p>
                              Changing your username will cause all existing
                              proxy URLs to change. Old endpoints will stop
                              working and you'll need to update all
                              integrations.
                            </p>
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={handleUsernameChange}
                        disabled={
                          newUsername === username || !newUsername || saving
                        }
                        variant="hero"
                        className="w-full sm:w-auto"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Wallet Export */}
              <Card className="shadow-elegant border-red-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400 text-base sm:text-lg">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                    Wallet Export
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Export your wallet private key (high-risk operation)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="destructive"
                    onClick={handleExportRequest}
                    disabled={!solanaAddress}
                    className="w-full sm:w-auto mx-auto"
                  >
                    Export Private Key
                  </Button>
                  {!solanaAddress && (
                    <p className="text-xs sm:text-sm text-muted-foreground text-center">
                      Connect your wallet to export your private key.
                    </p>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </main>

        <AlertDialog open={showExportConfirmation} onOpenChange={setShowExportConfirmation}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-6 w-6" />
                Final Security Confirmation
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-md border border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200 space-y-3">
                    <p className="font-semibold text-base">⚠️ You are about to export your private key</p>
                    <p className="text-sm">
                      This action will copy your private key to your clipboard. Once exported:
                    </p>
                    <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                      <li>Anyone with access to your private key can control your wallet</li>
                      <li>All funds in this wallet are at risk if the key is compromised</li>
                      <li>You are responsible for keeping this key secure</li>
                      <li>We cannot recover your funds if the key is lost or stolen</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-900 dark:text-yellow-200 text-sm">
                    <p className="font-semibold mb-1">Before proceeding, ensure you:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Are in a private location where no one can see your screen</li>
                      <li>Will immediately clear your clipboard after copying</li>
                      <li>Will never share this key with anyone</li>
                    </ul>
                  </div>
                  <p className="text-sm font-semibold text-center pt-2">
                    Do you understand these risks and want to proceed with exporting your private key?
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel disabled={isExporting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmedExport}
                disabled={isExporting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isExporting ? "Exporting..." : "Yes, Export Private Key"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    <strong>⚠️ Important Notice:</strong>
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-400 mt-2 space-y-1">
                    <li>All proxy URLs will change from <code>/{username}/endpoint</code> to <code>/{newUsername}/endpoint</code></li>
                    <li>Old URLs will stop working immediately and cannot be recovered</li>
                    <li>You will need to update all integrations using your endpoints</li>
                    <li>MCP server URLs will also change</li>
                  </ul>
                </div>
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
    </>
  );
}
