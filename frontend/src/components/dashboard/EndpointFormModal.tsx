"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateEndpointData, Endpoint, UpdateEndpointData } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface EndpointFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEndpointData | UpdateEndpointData) => Promise<void>;
  endpoint?: Endpoint;
  username: string;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export function EndpointFormModal({
  open,
  onOpenChange,
  onSubmit,
  endpoint,
  username,
}: EndpointFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEndpointData>({
    username,
    name: "",
    description: "",
    originalUrl: "",
    httpMethod: "GET",
    paymentAmount: 0,
    tokenType: "USDC",
    customAuthHeaders: null,
    sampleBody: null,
    sampleResponse: null,
  });

  useEffect(() => {
    if (endpoint) {
      setFormData({
        username: endpoint.username,
        name: endpoint.name,
        description: endpoint.description,
        originalUrl: endpoint.originalUrl,
        httpMethod: endpoint.httpMethod as any,
        paymentAmount: parseFloat(endpoint.paymentAmount),
        tokenType: endpoint.tokenType,
        customAuthHeaders: endpoint.customAuthHeaders || null,
        sampleBody: endpoint.sampleBody || null,
        sampleResponse: endpoint.sampleResponse || null,
      });
    } else {
      setFormData({
        username,
        name: "",
        description: "",
        originalUrl: "",
        httpMethod: "GET",
        paymentAmount: 0,
        tokenType: "USDC",
        customAuthHeaders: null,
        sampleBody: null,
        sampleResponse: null,
      });
    }
  }, [endpoint, username, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (endpoint) {
        await onSubmit({ ...formData });
      } else {
        await onSubmit(formData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting endpoint:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJsonChange = (
    field: "customAuthHeaders" | "sampleBody" | "sampleResponse",
    value: string
  ) => {
    try {
      const parsed = value ? JSON.parse(value) : null;
      setFormData({ ...formData, [field]: parsed });
    } catch {
      // Invalid JSON, ignore
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {endpoint ? "Edit Endpoint" : "Add New Endpoint"}
          </DialogTitle>
          <DialogDescription>
            {endpoint
              ? "Update your endpoint details"
              : "Create a new monetized API endpoint"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              pattern="^[a-zA-Z0-9_-]+$"
              placeholder="your-username"
            />
            <p className="text-xs text-muted-foreground">
              Only letters, numbers, hyphens, and underscores
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Endpoint Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              pattern="^[a-zA-Z0-9_-]+$"
              placeholder="my-endpoint"
            />
            <p className="text-xs text-muted-foreground">
              Only letters, numbers, hyphens, and underscores
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              placeholder="Describe what this endpoint does"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="httpMethod">HTTP Method</Label>
              <Select
                value={formData.httpMethod}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, httpMethod: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTTP_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tokenType">Token Type</Label>
              <Input
                id="tokenType"
                value={formData.tokenType}
                onChange={(e) =>
                  setFormData({ ...formData, tokenType: e.target.value })
                }
                required
                placeholder="USDC"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="originalUrl">Original URL</Label>
            <Input
              id="originalUrl"
              type="url"
              value={formData.originalUrl}
              onChange={(e) =>
                setFormData({ ...formData, originalUrl: e.target.value })
              }
              required
              placeholder="https://api.example.com/endpoint"
            />
            <p className="text-xs text-muted-foreground">
              The original API endpoint URL (this will be proxied)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentAmount">Payment Amount</Label>
            <Input
              id="paymentAmount"
              type="number"
              step="0.000001"
              min="0"
              value={formData.paymentAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentAmount: parseFloat(e.target.value) || 0,
                })
              }
              required
              placeholder="0.001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customAuthHeaders">Custom Auth Headers (JSON)</Label>
            <textarea
              id="customAuthHeaders"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              value={
                formData.customAuthHeaders
                  ? JSON.stringify(formData.customAuthHeaders, null, 2)
                  : ""
              }
              onChange={(e) =>
                handleJsonChange("customAuthHeaders", e.target.value)
              }
              placeholder='{"Authorization": "Bearer token"}'
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sampleBody">Sample Request Body (JSON)</Label>
            <textarea
              id="sampleBody"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              value={
                formData.sampleBody
                  ? JSON.stringify(formData.sampleBody, null, 2)
                  : ""
              }
              onChange={(e) => handleJsonChange("sampleBody", e.target.value)}
              placeholder='{"key": "value"}'
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sampleResponse">Sample Response (JSON)</Label>
            <textarea
              id="sampleResponse"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              value={
                formData.sampleResponse
                  ? JSON.stringify(formData.sampleResponse, null, 2)
                  : ""
              }
              onChange={(e) =>
                handleJsonChange("sampleResponse", e.target.value)
              }
              placeholder='{"result": "success"}'
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {endpoint ? "Update" : "Create"} Endpoint
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

