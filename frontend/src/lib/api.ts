import {
  AuthUser,
  clearAuthToken,
  getAuthHeaders,
  getAuthToken,
  LoginResponse,
  setAuthToken,
  setAuthUser,
} from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Endpoint {
  id: string;
  userWallet: string;
  username?: string;
  name: string;
  description: string;
  // Sensitive fields - only present in authenticated responses (create/update)
  originalUrl?: string;
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
  balances?: {
    sol: number;
    usdc: number;
  };
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

/**
 * Auth API
 */
export const authApi = {
  /**
   * Login with wallet signature
   */
  async login(walletAddress: string, message: string, signature: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        message,
        signature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to login');
    }

    const data: LoginResponse = await response.json();

    // Store token and user data
    setAuthToken(data.token);
    setAuthUser(data.user);

    return data;
  },

  /**
   * Logout and clear local storage
   */
  async logout(): Promise<void> {
    // Always clear local storage
    clearAuthToken();
  },

  /**
   * Verify if current token is valid
   */
  async verifyToken(): Promise<{ valid: boolean; user?: AuthUser }> {
    const token = getAuthToken();

    if (!token) {
      return { valid: false };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        clearAuthToken();
        return { valid: false };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearAuthToken();
      return { valid: false };
    }
  },
};

export const endpointsApi = {
  async getAllEndpoints(page = 1, limit = 20): Promise<PaginatedEndpoints> {
    const response = await fetch(`${API_BASE_URL}/endpoints?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch endpoints');
    const data = await response.json();

    // Transform nested structure to flat structure
    const transformedEndpoints: Endpoint[] = data.endpoints.map((item: any) => ({
      ...item.endpoints,
      username: item.users?.username || undefined,
    }));

    return {
      endpoints: transformedEndpoints,
      pagination: data.pagination,
    };
  },

  async getEndpoint(id: string): Promise<Endpoint> {
    const response = await fetch(`${API_BASE_URL}/endpoints/${id}`);
    if (!response.ok) throw new Error('Failed to fetch endpoint');
    return response.json();
  },

  async getUserEndpoints(walletAddress: string): Promise<{
    wallet: string;
    endpoints: Endpoint[];
    count: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/endpoints/user/${walletAddress}`);
    if (!response.ok) throw new Error('Failed to fetch user endpoints');
    const data = await response.json();

    // If endpoints don't have username, fetch it from user profile
    if (data.endpoints && data.endpoints.length > 0 && !data.endpoints[0].username) {
      try {
        const userResponse = await fetch(`${API_BASE_URL}/user/profile`, {
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': walletAddress,
          },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          data.endpoints = data.endpoints.map((endpoint: Endpoint) => ({
            ...endpoint,
            username: userData.username,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch username for endpoints:', error);
      }
    }

    return data;
  },

  async createEndpoint(data: CreateEndpointData): Promise<{ message: string; endpoint: Endpoint }> {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/endpoints`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create endpoint');
    }
    return response.json();
  },

  async updateEndpoint(
    id: string,
    data: UpdateEndpointData,
  ): Promise<{ message: string; endpoint: Endpoint }> {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/endpoints/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update endpoint');
    }
    return response.json();
  },

  async deleteEndpoint(id: string): Promise<{ message: string }> {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/endpoints/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete endpoint');
    }
    return response.json();
  },
};

export const userApi = {
  async getProfile(): Promise<User> {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  async updateProfile(username: string): Promise<{ message: string; user: User }> {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ username }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
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

// Alternative function names for consistency
export function buildProxyUrl(username: string, endpointName: string): string {
  return getProxyUrl(username, endpointName);
}

export function buildMcpUrl(username: string): string {
  return getMcpUrl(username);
}

// Helper function for fetching JSON
export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

// Extended endpoint detail type
export type EndpointDetail = Endpoint;

// Helper functions for my-endpoints page
export async function getMyEndpoints(walletAddress: string): Promise<{
  endpoints: Endpoint[];
}> {
  const data = await endpointsApi.getUserEndpoints(walletAddress);
  return { endpoints: data.endpoints };
}

export async function createEndpoint(
  data: CreateEndpointData,
): Promise<{ message: string; endpoint: Endpoint }> {
  return endpointsApi.createEndpoint(data);
}

export async function updateEndpoint(
  data: UpdateEndpointData & { id: string },
): Promise<{ message: string; endpoint: Endpoint }> {
  const { id, ...updateData } = data;
  return endpointsApi.updateEndpoint(id, updateData);
}

export async function deleteEndpoint(id: string): Promise<{ message: string }> {
  return endpointsApi.deleteEndpoint(id);
}

// Helper functions for wallet page
export async function getCurrentUser(): Promise<User> {
  return userApi.getProfile();
}

export async function updateUsername(username: string): Promise<{ message: string; user: User }> {
  return userApi.updateProfile(username);
}
