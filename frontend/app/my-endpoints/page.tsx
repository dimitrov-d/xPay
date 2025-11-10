"use client";

import { AddEndpointModal } from "@/components/dashboard/AddEndpointModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EndpointCard } from "@/components/dashboard/EndpointCard";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  createEndpoint,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
      return;
    }

    if (isReady && solanaAddress) {
      loadEndpoints();
    }
  }, [currentUser, router, solanaAddress, isReady]);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      // On mobile (< 1024px), always start collapsed
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        <main
          className={`flex-1 pt-20 pb-12 transition-all duration-300 ${
            sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
          }`}
        >
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 sm:space-y-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1.5">
                    My Endpoints
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Manage your monetized API endpoints
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    onClick={() => {
                      setEditingEndpoint(undefined);
                      setShowAddModal(true);
                    }}
                    size="lg"
                    variant="hero"
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Add New Endpoint</span>
                    <span className="sm:hidden">Add Endpoint</span>
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : endpoints.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                    You haven't created any endpoints yet
                  </p>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    variant="hero"
                    className="w-full sm:w-auto"
                  >
                    Create Your First Endpoint
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 py-2">
                  {endpoints.map((endpoint, index) => (
                    <EndpointCard
                      key={endpoint.id || `endpoint-${index}`}
                      endpoint={endpoint}
                      showEarnings={true}
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
            onSubmit={
              editingEndpoint
                ? handleUpdateEndpoint
                : async (data) => {
                    try {
                      await createEndpoint(data as CreateEndpointData);
                      toast.success("Endpoint created successfully");
                      await loadEndpoints();
                      setShowAddModal(false);
                    } catch (error: any) {
                      toast.error(
                        error.message || "Failed to create endpoint"
                      );
                      throw error;
                    }
                  }
            }
            onDelete={
              editingEndpoint
                ? async (id) => {
                    try {
                      await deleteEndpoint(id);
                      toast.success("Endpoint deleted successfully");
                      await loadEndpoints();
                      setShowAddModal(false);
                      setEditingEndpoint(undefined);
                    } catch (error: any) {
                      toast.error(
                        error.message || "Failed to delete endpoint"
                      );
                      throw error;
                    }
                  }
                : undefined
            }
            endpoint={editingEndpoint}
            defaultUsername={username || ""}
          />
        )}
      </div>
    </>
  );
}

