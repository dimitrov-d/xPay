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
import { Textarea } from "@/components/ui/textarea";
import { CreateEndpointData } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface AddEndpointModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEndpointData) => Promise<void>;
  defaultUsername?: string;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

export function AddEndpointModal({
  open,
  onOpenChange,
  onSubmit,
  defaultUsername = "",
}: AddEndpointModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEndpointData>({
    username: defaultUsername,
    name: "",
    description: "",
    originalUrl: "",
    httpMethod: "GET",
    paymentAmount: 0.001,
    tokenType: "SOL",
    customAuthHeaders: null,
    sampleBody: null,
    sampleResponse: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        username: defaultUsername,
        name: "",
        description: "",
        originalUrl: "",
        httpMethod: "GET",
        paymentAmount: 0.001,
        tokenType: "SOL",
        customAuthHeaders: null,
        sampleBody: null,
        sampleResponse: null,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create endpoint:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseJSON = (value: string) => {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Endpoint</DialogTitle>
          <DialogDescription>
            Create a new x402-protected endpoint for your API
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                placeholder="your-username"
              />
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
                placeholder="my-endpoint"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              placeholder="Describe what this endpoint does..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="originalUrl">Original API URL</Label>
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="httpMethod">HTTP Method</Label>
              <Select
                value={formData.httpMethod}
                onValueChange={(value) =>
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
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.001"
                min="0"
                value={formData.paymentAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentAmount: parseFloat(e.target.value),
                  })
                }
                required
              />
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
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customAuthHeaders">
              Custom Auth Headers (JSON)
            </Label>
            <Textarea
              id="customAuthHeaders"
              placeholder='{"Authorization": "Bearer token"}'
              rows={3}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customAuthHeaders: parseJSON(e.target.value) as Record<string, string>,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sampleBody">Sample Request Body (JSON)</Label>
            <Textarea
              id="sampleBody"
              placeholder='{"key": "value"}'
              rows={3}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sampleBody: parseJSON(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sampleResponse">Sample Response (JSON)</Label>
            <Textarea
              id="sampleResponse"
              placeholder='{"result": "success"}'
              rows={3}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sampleResponse: parseJSON(e.target.value),
                })
              }
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Endpoint
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

