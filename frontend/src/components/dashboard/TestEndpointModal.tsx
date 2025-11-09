"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Endpoint, getProxyUrl } from "@/lib/api";
import { useSignSolanaTransaction, useSolanaAddress } from "@coinbase/cdp-hooks";
import { wrap as wrapFetch } from "@faremeter/fetch";
import { lookupKnownSPLToken } from "@faremeter/info/solana";
import { createPaymentHandler } from "@faremeter/payment-solana/exact";
import {
  Connection,
  PublicKey,
  VersionedTransaction
} from "@solana/web3.js";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2, Play, Wallet, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { JsonViewer } from "./JsonViewer";

interface TestEndpointModalProps {
  endpoint: Endpoint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PaymentDetails {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  payTo: string;
  asset: string;
  maxTimeoutSeconds: number;
  description: string;
  mimeType: string;
  resource: string;
  extra?: {
    feePayer?: string;
    decimals?: number;
    recentBlockhash?: string;
  };
}

interface X402Response {
  x402Version: number;
  accepts: PaymentDetails[];
}

export function TestEndpointModal({ endpoint, open, onOpenChange }: TestEndpointModalProps) {
  const { solanaAddress } = useSolanaAddress();
  const { signSolanaTransaction } = useSignSolanaTransaction();
  const [step, setStep] = useState<"idle" | "requesting" | "signing" | "executing" | "success" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  const [queryParams, setQueryParams] = useState<string>("");
  const [headers, setHeaders] = useState<string>("");
  const [body, setBody] = useState<string>("");

  const [isEndpointDetailsOpen, setIsEndpointDetailsOpen] = useState<boolean>(true);
  const [isQueryBodyOpen, setIsQueryBodyOpen] = useState<boolean>(false);
  const [isHeadersOpen, setIsHeadersOpen] = useState<boolean>(false);
  const [isSampleResponseOpen, setIsSampleResponseOpen] = useState<boolean>(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (open && endpoint.sampleBody) {
      setBody(JSON.stringify(endpoint.sampleBody, null, 2));
    } else if (open) {
      setBody("");
    }
  }, [open, endpoint.sampleBody]);

  const handleTest = async () => {
    if (!solanaAddress) {
      toast.error("No wallet connected", {
        description: "Please connect your Coinbase wallet first",
      });
      return;
    }

    setStep("requesting");
    setError(null);
    setResult(null);
    setPaymentDetails(null);

    try {
      const proxyUrl = getProxyUrl(endpoint.username || "", endpoint.name);
      const fullUrl = proxyUrl.startsWith("http") ? proxyUrl : `${API_BASE_URL}${proxyUrl}`;

      setStep("signing");

      const network = "mainnet-beta";
      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

      const usdcMint = new PublicKey(lookupKnownSPLToken(network, "USDC")!.address);
      const payerPublicKey = new PublicKey(solanaAddress);

      const wallet = {
        network,
        publicKey: payerPublicKey,
        updateTransaction: async (tx: VersionedTransaction) => {
          const txBase64 = Buffer.from(tx.serialize()).toString("base64");

          const signResult = await signSolanaTransaction({
            transaction: txBase64,
            solanaAccount: solanaAddress,
          });

          if (!signResult?.signedTransaction) {
            throw new Error("Failed to sign transaction");
          }

          const signedTxBytes = Buffer.from(signResult.signedTransaction, "base64");
          return VersionedTransaction.deserialize(signedTxBytes);
        },
      };

      const handler = createPaymentHandler(wallet, usdcMint, connection);
      const fetchWithPayment = wrapFetch(fetch, {
        handlers: [handler],
      });

      setStep("executing");

      let urlWithParams = fullUrl;
      if (queryParams.trim()) {
        try {
          const paramsObj = JSON.parse(queryParams);
          const params = new URLSearchParams();
          Object.entries(paramsObj).forEach(([key, value]) => {
            if (key && value !== null && value !== undefined) {
              params.append(key, String(value));
            }
          });
          const queryString = params.toString();
          if (queryString) {
            urlWithParams = `${fullUrl}${fullUrl.includes("?") ? "&" : "?"}${queryString}`;
          }
        } catch (err) {
          throw new Error("Invalid JSON in query parameters");
        }
      }

      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (headers.trim()) {
        try {
          const headersObj = JSON.parse(headers);
          Object.assign(requestHeaders, headersObj);
        } catch (err) {
          throw new Error("Invalid JSON in headers");
        }
      }

      let requestBody: string | undefined;
      if (body.trim() && endpoint.httpMethod !== "GET") {
        try {
          JSON.parse(body);
          requestBody = body;
        } catch (err) {
          throw new Error("Invalid JSON in request body");
        }
      } else if (endpoint.sampleBody && endpoint.httpMethod !== "GET") {
        requestBody = JSON.stringify(endpoint.sampleBody);
      }

      const response = await fetchWithPayment(urlWithParams, {
        method: endpoint.httpMethod,
        headers: requestHeaders,
        ...(requestBody ? { body: requestBody } : {}),
      });

      if (response.status === 402) {
        const x402Data: X402Response = await response.json();
        if (x402Data.accepts && x402Data.accepts.length > 0) {
          const paymentOption = x402Data.accepts.find((a) => a.network === "solana-mainnet-beta") || x402Data.accepts[0];
          setPaymentDetails(paymentOption);
        }
        throw new Error("Payment required but FareMeter handler did not process it");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      setResult(responseData);
      setStep("success");
      toast.success("Endpoint executed successfully!", {
        description: "Payment processed and endpoint called",
      });
    } catch (err: any) {
      console.error("Test endpoint error:", err);
      setError(err.message || "Failed to test endpoint");
      setStep("error");
      toast.error("Failed to test endpoint", {
        description: err.message || "An error occurred",
      });
    }
  };

  const handleClose = () => {
    if (step === "requesting" || step === "signing" || step === "executing") {
      toast.info("Please wait for the current operation to complete");
      return;
    }
    setStep("idle");
    setResult(null);
    setError(null);
    setPaymentDetails(null);
    setQueryParams("");
    setHeaders("");
    setBody(endpoint.sampleBody ? JSON.stringify(endpoint.sampleBody, null, 2) : "");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test Endpoint</DialogTitle>
          <DialogDescription>
            Test this endpoint by making an x402 payment. You'll need to sign a transaction with
            your wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border">
            <button
              type="button"
              onClick={() => setIsEndpointDetailsOpen(!isEndpointDetailsOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <Label className="text-sm font-semibold">Endpoint Details & Wallet</Label>
              {isEndpointDetailsOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {isEndpointDetailsOpen && (
              <div className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-3 gap-4 p-3 rounded-lg border bg-muted/50">
                  <div>
                    <Label className="text-xs text-muted-foreground">Endpoint URL</Label>
                    <p className="text-xs font-mono mt-1 break-all">{getProxyUrl(endpoint.username || "", endpoint.name)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Provider</Label>
                    <p className="text-sm mt-1">@{endpoint.username || "unknown"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm mt-1 line-clamp-2">{endpoint.description}</p>
                  </div>
                </div>
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Wallet</p>
                      {solanaAddress ? (
                        <p className="text-xs text-muted-foreground font-mono">
                          {solanaAddress.slice(0, 8)}...{solanaAddress.slice(-8)}
                        </p>
                      ) : (
                        <p className="text-xs text-red-500">No wallet connected</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border">
            <button
              type="button"
              onClick={() => setIsQueryBodyOpen(!isQueryBodyOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <Label className="text-sm font-semibold">
                {endpoint.httpMethod === "GET" ? "Query Parameters" : "Query Parameters & Body"}
              </Label>
              {isQueryBodyOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {isQueryBodyOpen && (
              <div className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="query-params">Query Parameters (JSON)</Label>
                  <Textarea
                    id="query-params"
                    placeholder='{"page": 1, "limit": 10}'
                    value={queryParams}
                    onChange={(e) => setQueryParams(e.target.value)}
                    className="font-mono text-xs"
                    rows={4}
                  />
                </div>

                {endpoint.httpMethod !== "GET" && (
                  <div className="space-y-2">
                    <Label htmlFor="body">Request Body (JSON)</Label>
                    <Textarea
                      id="body"
                      placeholder='{"key": "value"}'
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="font-mono text-xs"
                      rows={6}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border">
            <button
              type="button"
              onClick={() => setIsHeadersOpen(!isHeadersOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <Label className="text-sm font-semibold">Custom Headers</Label>
              {isHeadersOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {isHeadersOpen && (
              <div className="px-4 pb-4 space-y-2">
                <Textarea
                  id="headers"
                  placeholder='{"Authorization": "Bearer token", "X-Custom-Header": "value"}'
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  className="font-mono text-xs"
                  rows={4}
                />
              </div>
            )}
          </div>

          {endpoint.sampleResponse && (
            <div className="rounded-lg border">
              <button
                type="button"
                onClick={() => setIsSampleResponseOpen(!isSampleResponseOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <Label className="text-sm font-semibold">Sample Response (Expected)</Label>
                {isSampleResponseOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {isSampleResponseOpen && (
                <div className="px-4 pb-4">
                  <div className="rounded-md border">
                    <JsonViewer data={endpoint.sampleResponse} />
                  </div>
                </div>
              )}
            </div>
          )}

          {paymentDetails && (
            <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Payment Required
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {paymentDetails.description}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Amount: {Number(paymentDetails.maxAmountRequired) / 10 ** 6} USDC
                  </p>
                </div>
              </div>
            </div>
          )}

          {step !== "idle" && (
            <div className="flex items-center gap-2 p-4 rounded-lg border">
              {step === "requesting" && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="text-sm">Requesting payment details...</span>
                </>
              )}
              {step === "signing" && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
                  <span className="text-sm">Please sign the transaction in your wallet...</span>
                </>
              )}
              {step === "executing" && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                  <span className="text-sm">Executing endpoint...</span>
                </>
              )}
              {step === "success" && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Success! Endpoint executed.
                  </span>
                </>
              )}
              {step === "error" && (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Error: {error}
                  </span>
                </>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Response:</h3>
              <JsonViewer data={result} />
            </div>
          )}

          {error && step === "error" && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">Error</p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={step === "requesting" || step === "signing" || step === "executing"}>
              {step === "idle" ? "Cancel" : "Close"}
            </Button>
            {step === "idle" && (
              <Button variant="hero" onClick={handleTest} disabled={!solanaAddress}>
                <Play className="w-4 h-4 mr-2" />
                Execute
              </Button>
            )}
            {(step === "error" || step === "success") && (
              <Button variant="hero" onClick={handleTest} disabled={!solanaAddress}>
                <Play className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

