"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { EndpointCard } from "@/components/dashboard/EndpointCard";
import { EndpointFormModal } from "@/components/dashboard/EndpointFormModal";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useSolanaAddress } from "@coinbase/cdp-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getMyEndpoints,
  updateEndpoint,
  deleteEndpoint,
  type Endpoint,
  type UpdateEndpointData,
} from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { toast } from "sonner";
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

export default function MyEndpointsPage() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { solanaAddress } = useSolanaAddress();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | undefined>();
  const [deletingEndpoint, setDeletingEndpoint] = useState<Endpoint | null>(null);
  const [username, setUsername] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
      return;
    }

    loadEndpoints();
  }, [currentUser, router, solanaAddress]);

  const loadEndpoints = async () => {
    if (!solanaAddress) return;
    try {
      setLoading(true);
      const data = await getMyEndpoints(solanaAddress);
      setEndpoints(data.endpoints);
      if (data.endpoints.length > 0) {
        setUsername(data.endpoints[0].username);
      }
    } catch (error) {
      console.error("Error loading endpoints:", error);
      toast.error("Failed to load your endpoints");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (endpoint: Endpoint) => {
    setEditingEndpoint(endpoint);
    setShowAddModal(true);
  };

  const handleDelete = (endpoint: Endpoint) => {
    setDeletingEndpoint(endpoint);
  };

  const confirmDelete = async () => {
    if (!deletingEndpoint || !solanaAddress) return;

    try {
      await deleteEndpoint(deletingEndpoint.id, solanaAddress);
      toast.success("Endpoint deleted successfully");
      await loadEndpoints();
      setDeletingEndpoint(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete endpoint");
    }
  };

  const handleUpdateEndpoint = async (data: UpdateEndpointData) => {
    if (!solanaAddress) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      await updateEndpoint(data, solanaAddress);
      toast.success("Endpoint updated successfully");
      await loadEndpoints();
      setShowAddModal(false);
      setEditingEndpoint(undefined);
    } catch (error: any) {
      toast.error(error.message || "Failed to update endpoint");
      throw error;
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader onToggleSidebar={toggleSidebar} />
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className="flex-1 pt-24 pb-12 px-4 ml-64 transition-all duration-300">
        <div className="container mx-auto max-w-7xl">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  My Endpoints
                </h1>
                <p className="text-xl text-muted-foreground">
                  Manage your monetized API endpoints
                </p>
              </div>
              <Button onClick={() => {
                setEditingEndpoint(undefined);
                setShowAddModal(true);
              }} variant="hero">
                Add New Endpoint
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : endpoints.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven't created any endpoints yet
                </p>
                <Button onClick={() => setShowAddModal(true)} variant="hero">
                  Create Your First Endpoint
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endpoints.map((endpoint, index) => (
                  <EndpointCard
                    key={endpoint.id || `endpoint-${index}`}
                    endpoint={endpoint}
                    showActions={true}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {showAddModal && (
        <EndpointFormModal
          open={showAddModal}
          onOpenChange={(open) => {
            setShowAddModal(open);
            if (!open) setEditingEndpoint(undefined);
          }}
          onSubmit={editingEndpoint ? handleUpdateEndpoint : async (data) => {
            if (!solanaAddress) {
              toast.error("Wallet not connected");
              return;
            }
            try {
              const { createEndpoint } = await import("@/lib/api");
              await createEndpoint(data, solanaAddress);
              toast.success("Endpoint created successfully");
              await loadEndpoints();
              setShowAddModal(false);
            } catch (error: any) {
              toast.error(error.message || "Failed to create endpoint");
              throw error;
            }
          }}
          endpoint={editingEndpoint}
          username={username || ""}
        />
      )}

      <AlertDialog
        open={!!deletingEndpoint}
        onOpenChange={(open) => !open && setDeletingEndpoint(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Endpoint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingEndpoint?.name}"? This
              action cannot be undone and will break all existing integrations
              using this endpoint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

