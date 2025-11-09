"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser, useSolanaAddress } from "@coinbase/cdp-hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function AddEndpointDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const { currentUser } = useCurrentUser();
  const { solanaAddress } = useSolanaAddress();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [paymentAmount, setPaymentAmount] = useState("0");
  const [tokenType, setTokenType] = useState("USDC");
  const [customAuthHeaders, setCustomAuthHeaders] = useState("");
  const [sampleBody, setSampleBody] = useState("");
  const [sampleResponse, setSampleResponse] = useState("");
  const [error, setError] = useState<string | null>(null);

  const meQuery = useQuery({
    queryKey: ["me", solanaAddress],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/users/me`, {
        headers: {
          "content-type": "application/json",
          ...(solanaAddress ? { "x-wallet-address": solanaAddress } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json() as Promise<{ username: string }>;
    },
    enabled: open && !!currentUser && !!solanaAddress,
    onSuccess: (me) => setUsername((prev) => prev || me.username || ""),
  });

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setOriginalUrl("");
      setHttpMethod("GET");
      setPaymentAmount("0");
      setTokenType("USDC");
      setCustomAuthHeaders("");
      setSampleBody("");
      setSampleResponse("");
      setError(null);
    }
  }, [open]);

  const createMutation = useMutation({
    mutationFn: async () => {
      setError(null);
      let headersObj: Record<string, string> | null = null;
      let bodyObj: any = null;
      let responseObj: any = null;
      try {
        headersObj = customAuthHeaders ? JSON.parse(customAuthHeaders) : null;
      } catch {
        throw new Error("Custom Auth Headers must be valid JSON");
      }
      try {
        bodyObj = sampleBody ? JSON.parse(sampleBody) : null;
      } catch {
        throw new Error("Sample Body must be valid JSON");
      }
      try {
        responseObj = sampleResponse ? JSON.parse(sampleResponse) : null;
      } catch {
        throw new Error("Sample Response must be valid JSON");
      }
      const payload = {
        username,
        name,
        description,
        originalUrl,
        httpMethod,
        paymentAmount: Number(paymentAmount),
        tokenType,
        customAuthHeaders: headersObj,
        sampleBody: bodyObj,
        sampleResponse: responseObj,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/endpoints`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(solanaAddress ? { "x-wallet-address": solanaAddress } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to create endpoint");
      }
      return res.json();
    },
    onSuccess: () => {
      setOpen(false);
      onCreated?.();
    },
    onError: (e: any) => {
      setError(e?.message || "Failed to create endpoint");
    },
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add New Endpoint</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Endpoint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your-username" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Endpoint Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-endpoint" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Original URL (kept private)</label>
              <Input value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} placeholder="https://api.example.com/v1/resource" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">HTTP Method</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={httpMethod}
                  onChange={(e) => setHttpMethod(e.target.value)}
                >
                  {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Amount</label>
                <Input
                  type="number"
                  min="0"
                  step="0.000001"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Token Type</label>
                <Input value={tokenType} onChange={(e) => setTokenType(e.target.value)} placeholder="USDC" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Auth Headers (JSON)</label>
              <textarea
                className="w-full min-h-20 rounded-md border border-input bg-background p-2 font-mono text-xs"
                value={customAuthHeaders}
                onChange={(e) => setCustomAuthHeaders(e.target.value)}
                placeholder='{"Authorization": "Bearer ..."}'
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sample Body (JSON)</label>
                <textarea
                  className="w-full min-h-24 rounded-md border border-input bg-background p-2 font-mono text-xs"
                  value={sampleBody}
                  onChange={(e) => setSampleBody(e.target.value)}
                  placeholder='{"query":"test"}'
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sample Response (JSON)</label>
                <textarea
                  className="w-full min-h-24 rounded-md border border-input bg-background p-2 font-mono text-xs"
                  value={sampleResponse}
                  onChange={(e) => setSampleResponse(e.target.value)}
                  placeholder='{"status":"ok"}'
                />
              </div>
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Endpoint"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

