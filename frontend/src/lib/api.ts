const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface Endpoint {
  id: string;
  userWallet: string;
  username?: string;
  name: string;
  description: string;
  originalUrl: string;
  httpMethod: string;
  paymentAmount: string;
  tokenType: string;
  customAuthHeaders?: Record<string, string> | null;
  sampleBody?: any;
  sampleResponse?: any;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  walletAddress: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedEndpoints {
  endpoints: Endpoint[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateEndpointData {
  username: string;
  name: string;
  description: string;
  originalUrl: string;
  httpMethod: string;
  paymentAmount: number;
  tokenType: string;
  customAuthHeaders?: Record<string, string> | null;
  sampleBody?: any;
  sampleResponse?: any;
}

export interface UpdateEndpointData {
  name?: string;
  description?: string;
  originalUrl?: string;
  httpMethod?: string;
  paymentAmount?: number;
  tokenType?: string;
  customAuthHeaders?: Record<string, string> | null;
  sampleBody?: any;
  sampleResponse?: any;
}

async function getAuthHeaders(
  walletAddress: string,
  signMessage: (message: string) => Promise<string>
): Promise<Record<string, string>> {
  const message = `Authenticate with xPay - ${Date.now()}`;
  const signature = await signMessage(message);

  return {
    "Content-Type": "application/json",
    "x-wallet-address": walletAddress,
    "x-message": message,
    "x-signature": signature,
  };
}

export const endpointsApi = {
  async getAllEndpoints(page = 1, limit = 20): Promise<PaginatedEndpoints> {
    const response = await fetch(
      `${API_BASE_URL}/endpoints?page=${page}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch endpoints");
    return response.json();
  },

  async getEndpoint(id: string): Promise<Endpoint> {
    const response = await fetch(`${API_BASE_URL}/endpoints/${id}`);
    if (!response.ok) throw new Error("Failed to fetch endpoint");
    return response.json();
  },

  async getUserEndpoints(walletAddress: string): Promise<{
    wallet: string;
    endpoints: Endpoint[];
    count: number;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/endpoints/user/${walletAddress}`
    );
    if (!response.ok) throw new Error("Failed to fetch user endpoints");
    return response.json();
  },

  async createEndpoint(
    data: CreateEndpointData,
    walletAddress: string,
    signMessage: (message: string) => Promise<string>
  ): Promise<{ message: string; endpoint: Endpoint }> {
    const headers = await getAuthHeaders(walletAddress, signMessage);
    const response = await fetch(`${API_BASE_URL}/endpoints`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create endpoint");
    }
    return response.json();
  },

  async updateEndpoint(
    id: string,
    data: UpdateEndpointData,
    walletAddress: string,
    signMessage: (message: string) => Promise<string>
  ): Promise<{ message: string; endpoint: Endpoint }> {
    const headers = await getAuthHeaders(walletAddress, signMessage);
    const response = await fetch(`${API_BASE_URL}/endpoints/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update endpoint");
    }
    return response.json();
  },

  async deleteEndpoint(
    id: string,
    walletAddress: string,
    signMessage: (message: string) => Promise<string>
  ): Promise<{ message: string }> {
    const headers = await getAuthHeaders(walletAddress, signMessage);
    const response = await fetch(`${API_BASE_URL}/endpoints/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete endpoint");
    }
    return response.json();
  },
};

export const userApi = {
  async getProfile(
    walletAddress: string,
    signMessage: (message: string) => Promise<string>
  ): Promise<User> {
    const headers = await getAuthHeaders(walletAddress, signMessage);
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "GET",
      headers,
    });
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },

  async updateProfile(
    username: string,
    walletAddress: string,
    signMessage: (message: string) => Promise<string>
  ): Promise<{ message: string; user: User }> {
    const headers = await getAuthHeaders(walletAddress, signMessage);
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ username }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update profile");
    }
    return response.json();
  },
};

export function getProxyUrl(username: string, endpointName: string): string {
  return `${API_BASE_URL}/${username}/${endpointName}`;
}

export function getMcpUrl(username: string): string {
  return `${API_BASE_URL}/mcp/${username}`;
}
