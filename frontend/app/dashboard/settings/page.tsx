"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userApi } from "@/lib/api";
import { useCurrentUser, useSolanaAddress } from "@coinbase/cdp-hooks";
import { AlertTriangle, Loader2, User, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { currentUser } = useCurrentUser();
  const { solanaAddress } = useSolanaAddress();

  const [currentUsername, setCurrentUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!solanaAddress || !currentUser) return;

      setLoading(true);
      try {
        const signMessage = async (message: string) => {
          return "signature";
        };

        const profile = await userApi.getProfile(solanaAddress, signMessage);
        setCurrentUsername(profile.username);
        setNewUsername(profile.username);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [solanaAddress, currentUser]);

  const handleSaveClick = () => {
    if (newUsername === currentUsername) {
      toast.info("No changes to save");
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!solanaAddress) return;

    setSaving(true);
    try {
      const signMessage = async (message: string) => {
        return "signature";
      };

      await userApi.updateProfile(newUsername, solanaAddress, signMessage);
      setCurrentUsername(newUsername);
      toast.success("Username updated successfully!");
      setConfirmModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update username");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-accent/10">
                <User className="w-6 h-6 text-accent" />
              </div>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your username and account details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet Address</Label>
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <code className="flex-1 text-sm break-all">{solanaAddress}</code>
              </div>
              <p className="text-xs text-muted-foreground">
                Your wallet address cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="your-username"
              />
              <p className="text-xs text-muted-foreground">
                This will be used in your endpoint URLs
              </p>
            </div>

            <Button
              onClick={handleSaveClick}
              disabled={saving || newUsername === currentUsername || !newUsername}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <div>
                <CardTitle className="text-yellow-500">Important Notice</CardTitle>
                <CardDescription>
                  About changing your username
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                Changing your username will affect all your existing endpoints:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>
                  All proxy URLs will change from{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    /{currentUsername}/endpoint
                  </code>{" "}
                  to{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    /{newUsername || "new-username"}/endpoint
                  </code>
                </li>
                <li>
                  Old URLs will stop working immediately and cannot be recovered
                </li>
                <li>
                  You will need to update all integrations using your endpoints
                </li>
                <li>
                  MCP server URLs will also change
                </li>
              </ul>
              <p className="font-medium text-yellow-500 mt-4">
                This change is NOT backwards-compatible. Proceed with caution.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Confirm Username Change
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                Are you sure you want to change your username from{" "}
                <strong>{currentUsername}</strong> to{" "}
                <strong>{newUsername}</strong>?
              </p>
              <p className="text-yellow-600 dark:text-yellow-500 font-medium">
                Warning: This will break all existing endpoint URLs and cannot be
                undone!
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmSave}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Yes, Change Username
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

