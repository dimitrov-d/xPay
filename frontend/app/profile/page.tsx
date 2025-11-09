"use client";

import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCurrentUser, useSolanaAddress } from "@coinbase/cdp-hooks";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MeResponse = {
  walletAddress: string;
  username: string;
  endpointCount: number;
  createdAt: string;
  updatedAt: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { solanaAddress } = useSolanaAddress();
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!currentUser) router.push("/");
  }, [currentUser, router]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["me", solanaAddress],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/users/me`, {
        headers: {
          "content-type": "application/json",
          ...(solanaAddress ? { "x-wallet-address": solanaAddress } : {}),
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to load profile");
      }
      return res.json() as Promise<MeResponse>;
    },
    enabled: !!currentUser && !!solanaAddress,
    onSuccess: (me) => {
      setUsername(me.username);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newUsername: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/users/username`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          ...(solanaAddress ? { "x-wallet-address": solanaAddress } : {}),
        },
        body: JSON.stringify({ username: newUsername }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to update username");
      }
      return res.json();
    },
    onSuccess: () => {
      refetch();
      alert("Username updated. Warning: your old proxy URLs will no longer work.");
    },
  });

  if (!currentUser) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your profile settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-3 rounded-md border border-yellow-500/30 bg-yellow-500/10 text-yellow-900 dark:text-yellow-200 text-sm">
                Changing your username is not backwards-compatible. All existing proxy URLs using the old username will stop working because the proxy path includes the username.
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => updateMutation.mutate(username)}
                  disabled={updateMutation.isPending || isLoading || !username}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                {error && <div className="text-sm text-red-500">Failed to load profile.</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

