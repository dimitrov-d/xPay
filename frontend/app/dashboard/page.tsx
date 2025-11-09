"use client";

import { AddEndpointModal } from "@/components/dashboard/AddEndpointModal";
import { EndpointCard } from "@/components/dashboard/EndpointCard";
import { EndpointDetailsModal } from "@/components/dashboard/EndpointDetailsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateEndpointData, Endpoint, endpointsApi, userApi } from "@/lib/api";
import { useCurrentUser, useSolanaAddress } from "@coinbase/cdp-hooks";
import { Loader2, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { currentUser } = useCurrentUser();
  const { solanaAddress } = useSolanaAddress();

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [filteredEndpoints, setFilteredEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "price">("date");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!solanaAddress || !currentUser) return;

      try {
        const signMessage = async (message: string) => {
          return "signature";
        };

        const profile = await userApi.getProfile(solanaAddress, signMessage);
        setUsername(profile.username);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, [solanaAddress, currentUser]);

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
    let filtered = [...endpoints];

    if (searchQuery) {
      filtered = filtered.filter(
        (endpoint) =>
          endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          endpoint.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterMethod !== "all") {
      filtered = filtered.filter(
        (endpoint) => endpoint.httpMethod === filterMethod
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "price":
          return parseFloat(b.paymentAmount) - parseFloat(a.paymentAmount);
        default:
          return 0;
      }
    });

    setFilteredEndpoints(filtered);
  }, [endpoints, searchQuery, filterMethod, sortBy]);

  const handleViewDetails = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setDetailsModalOpen(true);
  };

  const handleCreateEndpoint = async (data: CreateEndpointData) => {
    if (!solanaAddress) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      const signMessage = async (message: string) => {
        return "signature";
      };

      const result = await endpointsApi.createEndpoint(data, solanaAddress, signMessage);
      toast.success("Endpoint created successfully!");

      const updatedData = await endpointsApi.getAllEndpoints(1, 100);
      setEndpoints(updatedData.endpoints);
    } catch (error: any) {
      toast.error(error.message || "Failed to create endpoint");
      throw error;
    }
  };

  const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Endpoint Marketplace</h1>
            <p className="text-muted-foreground mt-2">
              Browse and discover x402-protected API endpoints
            </p>
          </div>
          <Button onClick={() => setAddModalOpen(true)} size="lg" variant="hero">
            <Plus className="w-5 h-5 mr-2" />
            Add New Endpoint
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {httpMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Newest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price">Price (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredEndpoints.length} of {endpoints.length} endpoints
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredEndpoints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery || filterMethod !== "all"
                ? "No endpoints match your filters"
                : "No endpoints available yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEndpoints.map((endpoint, index) => (
              <EndpointCard
                key={endpoint.id || `endpoint-${index}`}
                endpoint={endpoint}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      <EndpointDetailsModal
        endpoint={selectedEndpoint}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />

      <AddEndpointModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={handleCreateEndpoint}
        defaultUsername={username}
      />
    </div>
  );
}

