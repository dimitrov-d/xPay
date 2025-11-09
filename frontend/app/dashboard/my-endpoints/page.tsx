"use client";

import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Endpoint, UpdateEndpointData, endpointsApi, getProxyUrl } from "@/lib/api";
import { useCurrentUser, useSolanaAddress } from "@coinbase/cdp-hooks";
import { Edit, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function MyEndpointsPage() {
  const { currentUser } = useCurrentUser();
  const { solanaAddress } = useSolanaAddress();

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingEndpoint, setDeletingEndpoint] = useState<Endpoint | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<UpdateEndpointData>({});

  useEffect(() => {
    const fetchMyEndpoints = async () => {
      if (!solanaAddress) return;

      setLoading(true);
      try {
        const data = await endpointsApi.getUserEndpoints(solanaAddress);
        setEndpoints(data.endpoints);
      } catch (error) {
        console.error("Failed to fetch endpoints:", error);
        toast.error("Failed to load your endpoints");
      } finally {
        setLoading(false);
      }
    };

    fetchMyEndpoints();
  }, [solanaAddress]);

  const handleEdit = (endpoint: Endpoint) => {
    setEditingEndpoint(endpoint);
    setFormData({
      name: endpoint.name,
      description: endpoint.description,
      originalUrl: endpoint.originalUrl,
      httpMethod: endpoint.httpMethod,
      paymentAmount: parseFloat(endpoint.paymentAmount),
      tokenType: endpoint.tokenType,
      customAuthHeaders: endpoint.customAuthHeaders,
      sampleBody: endpoint.sampleBody,
      sampleResponse: endpoint.sampleResponse,
    });
    setEditModalOpen(true);
  };

  const handleDelete = (endpoint: Endpoint) => {
    setDeletingEndpoint(endpoint);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingEndpoint || !solanaAddress) return;

    setSubmitting(true);
    try {
      const signMessage = async (message: string) => {
        return "signature";
      };

      await endpointsApi.deleteEndpoint(
        deletingEndpoint.id,
        solanaAddress,
        signMessage
      );

      toast.success("Endpoint deleted successfully!");
      setEndpoints(endpoints.filter((e) => e.id !== deletingEndpoint.id));
      setDeleteModalOpen(false);
      setDeletingEndpoint(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete endpoint");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEndpoint || !solanaAddress) return;

    setSubmitting(true);
    try {
      const signMessage = async (message: string) => {
        return "signature";
      };

      const result = await endpointsApi.updateEndpoint(
        editingEndpoint.id,
        formData,
        solanaAddress,
        signMessage
      );

      toast.success("Endpoint updated successfully!");

      setEndpoints(
        endpoints.map((e) =>
          e.id === editingEndpoint.id ? result.endpoint : e
        )
      );

      setEditModalOpen(false);
      setEditingEndpoint(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update endpoint");
    } finally {
      setSubmitting(false);
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
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">My Endpoints</h1>
          <p className="text-muted-foreground mt-2">
            Manage your x402-protected API endpoints
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : endpoints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              You haven't created any endpoints yet
            </p>
            <Button
              className="mt-4"
              onClick={() => window.location.href = "/dashboard"}
            >
              Create Your First Endpoint
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endpoints.map((endpoint) => (
              <Card key={endpoint.id} className="shadow-elegant">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {endpoint.name}
                      </CardTitle>
                      <CardDescription>
                        {endpoint.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{endpoint.httpMethod}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {endpoint.paymentAmount} {endpoint.tokenType}
                    </p>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Proxy URL:</p>
                      <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border">
                        <code className="flex-1 text-xs break-all">
                          {getProxyUrl(endpoint.username || "", endpoint.name)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 w-6 h-6"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              getProxyUrl(endpoint.username || "", endpoint.name)
                            )
                          }
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(endpoint)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleDelete(endpoint)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Endpoint</DialogTitle>
            <DialogDescription>
              Update your endpoint configuration
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Endpoint Name</Label>
              <Input
                id="edit-name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-url">Original API URL</Label>
              <Input
                id="edit-url"
                type="url"
                value={formData.originalUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, originalUrl: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-method">HTTP Method</Label>
                <Select
                  value={formData.httpMethod || "GET"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, httpMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].map(
                      (method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-amount">Payment Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.001"
                  value={formData.paymentAmount || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentAmount: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-token">Token Type</Label>
                <Input
                  id="edit-token"
                  value={formData.tokenType || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tokenType: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Endpoint</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingEndpoint?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={submitting}
            >
              {submitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

