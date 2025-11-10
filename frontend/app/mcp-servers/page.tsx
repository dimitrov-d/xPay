"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MCPServersPanel } from "@/components/dashboard/MCPServersPanel";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Input } from "@/components/ui/input";
import { Endpoint, endpointsApi } from "@/lib/api";
import { useCurrentUser } from "@coinbase/cdp-hooks";
import { Loader2, Search, Server } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function MCPServersPage() {
  const { currentUser } = useCurrentUser();
  const router = useRouter();

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [filteredEndpoints, setFilteredEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
      return;
    }
  }, [currentUser, router]);

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

  useEffect(() => {
    const fetchEndpoints = async () => {
      setLoading(true);
      try {
        const data = await endpointsApi.getAllEndpoints(1, 100);
        setEndpoints(data.endpoints);
        setFilteredEndpoints(data.endpoints);
      } catch (error) {
        console.error("Failed to fetch endpoints:", error);
        toast.error("Failed to load endpoints");
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoints();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = endpoints.filter(
        (endpoint) =>
          endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          endpoint.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEndpoints(filtered);
    } else {
      setFilteredEndpoints(endpoints);
    }
  }, [endpoints, searchQuery]);

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
      <main
        className={`flex-1 pt-20 pb-12 transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-primary/10 flex-shrink-0">
                  <Server className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    MCP Servers
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Browse and connect to MCP-compatible servers
                  </p>
                </div>
              </div>

              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by server or tool name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : (
              <MCPServersPanel endpoints={filteredEndpoints} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

