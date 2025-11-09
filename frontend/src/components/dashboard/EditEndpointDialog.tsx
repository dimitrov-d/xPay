"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EndpointDetail, fetchJson } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCurrentUser, useSolanaAddress } from "@coinbase/cdp-hooks";
import { useEffect, useState } from "react";

export function EditEndpointDialog({
  endpointId,
  open,
  onOpenChange,
  onUpdated,
}: {
  endpointId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdated?: () => void;
}) {
  const { currentUser } = useCurrentUser();
  const { solanaAddress } = useSolanaAddress();

  const { data, isLoading } = useQuery({
    queryKey: ["endpoint", "edit", endpointId],
    queryFn: () => fetchJson<EndpointDetail>(`/endpoints/${endpointId}`),
    enabled: open && !!endpointId,
  });

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

  useEffect(() => {
    if (data) {
      setName(data.name);
      setDescription(data.description);
      setOriginalUrl(data.originalUrl);
      setHttpMethod(data.httpMethod);
      setPaymentAmount(data.paymentAmount);
      setTokenType(data.tokenType);
      setCustomAuthHeaders(data.customAuthHeaders ? JSON.stringify(data.customAuthHeaders, null, 2) : "");
      setSampleBody(data.sampleBody ? JSON.stringify(data.sampleBody, null, 2) : "");
      setSampleResponse(data.sampleResponse ? JSON.stringify(data.sampleResponse, null, 2) : "");
    }
  }, [data]);

  const updateMutation = useMutation({
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
      const payload: any = {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/endpoints/${endpointId}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          ...(solanaAddress ? { "x-wallet-address": solanaAddress } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to update endpoint");
      }
      return res.json();
    },
    onSuccess: () => {
      onOpenChange(false);
      onUpdated?.();
    },
    onError: (e: any) => setError(e?.message || "Failed to update endpoint"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Endpoint</DialogTitle>
        </DialogHeader>
        {isLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
        {!isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Endpoint Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-endpoint" />
              </div>
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Original URL</label>
              <Input value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} placeholder="https://api.example.com/v1/resource" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sample Body (JSON)</label>
                <textarea
                  className="w-full min-h-24 rounded-md border border-input bg-background p-2 font-mono text-xs"
                  value={sampleBody}
                  onChange={(e) => setSampleBody(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sample Response (JSON)</label>
                <textarea
                  className="w-full min-h-24 rounded-md border border-input bg-background p-2 font-mono text-xs"
                  value={sampleResponse}
                  onChange={(e) => setSampleResponse(e.target.value)}
                />
              </div>
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

