"use client";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreateEndpointData, Endpoint, UpdateEndpointData, getCurrentUser } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { Info, Loader2, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AddEndpointModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEndpointData | UpdateEndpointData) => Promise<void>;
  onDelete?: (endpointId: string) => Promise<void>;
  endpoint?: Endpoint;
  defaultUsername?: string;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
const TOKEN_TYPES = ["USDC", "USDT", "SOL", "CASH"];

export function AddEndpointModal({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  endpoint,
  defaultUsername = "",
}: AddEndpointModalProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [username, setUsername] = useState(defaultUsername);
  const [formData, setFormData] = useState<CreateEndpointData>({
    username: defaultUsername,
    name: "",
    description: "",
    originalUrl: "",
    httpMethod: "GET",
    paymentAmount: 0.001,
    tokenType: "USDC",
    customAuthHeaders: null,
    sampleBody: null,
    sampleResponse: null,
  });
  // Store raw string values for JSON fields to allow editing invalid JSON
  const [customAuthHeadersRaw, setCustomAuthHeadersRaw] = useState<string>("");
  const [sampleBodyRaw, setSampleBodyRaw] = useState<string>("");
  const [sampleResponseRaw, setSampleResponseRaw] = useState<string>("");

  useEffect(() => {
    const user = getAuthUser();
    const currentUsername = user?.username || defaultUsername;

    if (currentUsername) {
      setUsername(currentUsername);
    }

    if (endpoint) {
      setFormData({
        username: endpoint.username || currentUsername,
        name: endpoint.name,
        description: endpoint.description,
        originalUrl: endpoint.originalUrl || "",
        httpMethod: endpoint.httpMethod as any,
        paymentAmount: parseFloat(endpoint.paymentAmount) || 0.001,
        tokenType: endpoint.tokenType || "USDC",
        customAuthHeaders: endpoint.customAuthHeaders || null,
        sampleBody: endpoint.sampleBody || null,
        sampleResponse: endpoint.sampleResponse || null,
      });
      // Initialize raw string values
      setCustomAuthHeadersRaw(formatJSON(endpoint.customAuthHeaders));
      setSampleBodyRaw(formatJSON(endpoint.sampleBody));
      setSampleResponseRaw(formatJSON(endpoint.sampleResponse));
      return;
    }
    setFormData({
      username: currentUsername,
      name: "",
      description: "",
      originalUrl: "",
      httpMethod: "GET",
      paymentAmount: 0.001,
      tokenType: "USDC",
      customAuthHeaders: null,
      sampleBody: null,
      sampleResponse: null,
    });
    // Reset raw string values
    setCustomAuthHeadersRaw("");
    setSampleBodyRaw("");
    setSampleResponseRaw("");
  }, [endpoint, defaultUsername, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!endpoint) {
      const user = await getCurrentUser().catch(() => null);

      if (!user?.balances?.sol) {
        toast.error("Insufficient SOL balance", {
          description: "You need a non-zero SOL balance to add an endpoint.",
        });
        return;
      }
    }

    setLoading(true);
    try {
      // Parse raw JSON strings before submitting
      const parsedCustomAuthHeaders = parseJSON(customAuthHeadersRaw);
      const parsedSampleBody = parseJSON(sampleBodyRaw);
      const parsedSampleResponse = parseJSON(sampleResponseRaw);

      if (endpoint) {
        const updateData: UpdateEndpointData & { id: string } = {
          id: endpoint.id,
          name: formData.name,
          description: formData.description,
          originalUrl: formData.originalUrl,
          httpMethod: formData.httpMethod,
          paymentAmount: formData.paymentAmount,
          tokenType: formData.tokenType,
          customAuthHeaders: parsedCustomAuthHeaders as Record<string, string> | null,
          sampleBody: parsedSampleBody,
          sampleResponse: parsedSampleResponse,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateEndpointData = {
          ...formData,
          customAuthHeaders: parsedCustomAuthHeaders as Record<string, string> | null,
          sampleBody: parsedSampleBody,
          sampleResponse: parsedSampleResponse,
        };
        await onSubmit(createData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit endpoint:", error);
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

  const formatJSON = (value: any): string => {
    if (!value) return "";
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "";
    }
  };

  const handleDelete = async () => {
    if (!endpoint || !onDelete) return;

    setDeleting(true);
    try {
      await onDelete(endpoint.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete endpoint:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    // @ts-expect-error - React 18/19 type compatibility issue
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {endpoint ? "Edit Endpoint" : "Add New Endpoint"}
            </DialogTitle>
            <DialogDescription>
              {endpoint
                ? "Update your endpoint details"
                : "Create a new x402-protected endpoint for your API"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center gap-2">
                <Label htmlFor="originalUrl">Original API URL</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The private URL of your API endpoint that will be paywalled</p>
                  </TooltipContent>
                </Tooltip>
              </div>
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
                <div className="flex items-center gap-2">
                  <Label htmlFor="httpMethod">HTTP Method</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The HTTP method used to call this endpoint</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                <div className="flex items-center gap-2">
                  <Label htmlFor="paymentAmount">Payment Amount</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The amount users must pay to access this endpoint</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                <div className="flex items-center gap-2">
                  <Label htmlFor="tokenType">Token Type</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The cryptocurrency token used for payment</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={formData.tokenType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tokenType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOKEN_TYPES.map((token) => (
                      <SelectItem key={token} value={token}>
                        {token}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="customAuthHeaders">
                  Custom Auth Headers (JSON)
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Optional authentication headers to include in requests to your API</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                id="customAuthHeaders"
                placeholder='{"Authorization": "Bearer token"}'
                rows={3}
                value={customAuthHeadersRaw}
                onChange={(e) => setCustomAuthHeadersRaw(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="sampleBody">Sample Request Body (JSON)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Example request body to help users understand the expected format</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                id="sampleBody"
                placeholder='{"key": "value"}'
                rows={3}
                value={sampleBodyRaw}
                onChange={(e) => setSampleBodyRaw(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="sampleResponse">Sample Response (JSON)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Example response to help users understand what to expect</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                id="sampleResponse"
                placeholder='{"result": "success"}'
                rows={3}
                value={sampleResponseRaw}
                onChange={(e) => setSampleResponseRaw(e.target.value)}
              />
            </div>

            <div className="flex gap-3 justify-between items-center">
              {endpoint && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
              <div className="flex gap-3 justify-end ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  {endpoint ? "Update" : "Create"} Endpoint
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Endpoint</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                Are you sure you want to delete "{endpoint?.name}"? This action cannot be undone and will break all existing integrations using this endpoint.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}

