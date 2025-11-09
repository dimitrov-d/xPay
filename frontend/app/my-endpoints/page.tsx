"use client";

import { AddEndpointModal } from "@/components/dashboard/AddEndpointModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EndpointCard } from "@/components/dashboard/EndpointCard";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  deleteEndpoint,
  getMyEndpoints,
  updateEndpoint,
  type CreateEndpointData,
  type Endpoint,
  type UpdateEndpointData,
} from "@/lib/api";
import { useCurrentUser, useSolanaAddress } from "@coinbase/cdp-hooks";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function MyEndpointsPage() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { solanaAddress } = useSolanaAddress();
  const { isReady, SignatureModal } = useRequireAuth();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | undefined>();
  const [username, setUsername] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
      return;
    }

    if (isReady && solanaAddress) {
      loadEndpoints();
    }
  }, [currentUser, router, solanaAddress, isReady]);

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


  const handleUpdateEndpoint = async (data: UpdateEndpointData & { id: string }) => {
    try {
      await updateEndpoint(data);
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

  // Don't render page content until authenticated
  if (!isReady) {
    return (
      <>
        {SignatureModal}
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </>
    );
  }

  return (
    <>
      {SignatureModal}
      <div className="min-h-screen flex flex-col">
        <DashboardHeader onToggleSidebar={toggleSidebar} />
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main className="flex-1 pt-24 pb-12 transition-all duration-300">
          <div className="container mx-auto max-w-7xl">
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-1.5">
                    My Endpoints
                  </h1>
                  <p className="text-base text-muted-foreground">
                    Manage your monetized API endpoints
                  </p>
                </div>
                <Button onClick={() => {
                  setEditingEndpoint(undefined);
                  setShowAddModal(true);
                }} size="lg" variant="hero">
                  <Plus className="w-5 h-5 mr-2" />
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-2">
                  {endpoints.map((endpoint, index) => (
                    <EndpointCard
                      key={endpoint.id || `endpoint-${index}`}
                      endpoint={endpoint}
                      onViewDetails={(endpoint) => {
                        setEditingEndpoint(endpoint);
                        setShowAddModal(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {showAddModal && (
          <AddEndpointModal
            open={showAddModal}
            onOpenChange={(open) => {
              setShowAddModal(open);
              if (!open) setEditingEndpoint(undefined);
            }}
            onSubmit={editingEndpoint ? handleUpdateEndpoint : async (data) => {
              try {
                const { createEndpoint } = await import("@/lib/api");
                await createEndpoint(data as CreateEndpointData);
                toast.success("Endpoint created successfully");
                await loadEndpoints();
                setShowAddModal(false);
              } catch (error: any) {
                toast.error(error.message || "Failed to create endpoint");
                throw error;
              }
            }}
            onDelete={editingEndpoint ? async (id) => {
              try {
                await deleteEndpoint(id);
                toast.success("Endpoint deleted successfully");
                await loadEndpoints();
                setShowAddModal(false);
                setEditingEndpoint(undefined);
              } catch (error: any) {
                toast.error(error.message || "Failed to delete endpoint");
                throw error;
              }
            } : undefined}
            endpoint={editingEndpoint}
            defaultUsername={username || ""}
          />
        )}
      </div>
    </>
  );
}

