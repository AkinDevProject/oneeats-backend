import { Platform } from 'react-native';
import { ENV } from '../config/env';
import authService from './authService';

const API_BASE_URL = ENV.API_URL;
const API_TIMEOUT = ENV.API_TIMEOUT;

// Types de base
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Configuration par defaut pour les requetes
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// User ID fixe pour les tests sans auth (fallback)
const DEV_USER_ID = ENV.DEV_USER_ID;

class ApiService {
  /**
   * Recupere l'ID utilisateur (depuis le token ou fallback vers DEV_USER_ID)
   */
  private async getUserId(): Promise<string> {
    if (ENV.AUTH_ENABLED && !ENV.MOCK_AUTH) {
      try {
        const userInfo = await authService.getCachedUserInfo();
        if (userInfo?.sub) {
          return userInfo.sub;
        }
        // Tenter de recuperer depuis Keycloak
        const freshUserInfo = await authService.getUserInfo();
        if (freshUserInfo?.sub) {
          return freshUserInfo.sub;
        }
      } catch (error) {
        console.warn('⚠️ Could not get user ID from token:', error);
      }
    }
    return DEV_USER_ID;
  }
  /**
   * Recupere le header d'autorisation si disponible
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    // Mode mock - pas d'auth header
    if (!ENV.AUTH_ENABLED || ENV.MOCK_AUTH) {
      return {};
    }

    // Mode Keycloak - ajouter le Bearer token
    try {
      const token = await authService.getAccessToken();
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    } catch (error) {
      console.warn('⚠️ Could not get access token:', error);
    }

    return {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Debug logging (reduit en prod)
    if (ENV.DEBUG_MODE) {
      console.log(`🌐 API Request: ${url}`);
    }

    // Recuperer les headers d'auth
    const authHeaders = await this.getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...authHeaders,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (ENV.DEBUG_MODE) {
        console.log(`✅ Response status: ${response.status}`);
      }

      // Gerer les erreurs d'authentification
      if (response.status === 401) {
        console.warn('⚠️ Unauthorized - token may be expired');
        // Tenter un refresh du token
        if (ENV.AUTH_ENABLED && !ENV.MOCK_AUTH) {
          const refreshed = await authService.refreshTokens();
          if (refreshed) {
            // Retenter la requete avec le nouveau token
            const newAuthHeaders = await this.getAuthHeaders();
            const retryConfig: RequestInit = {
              ...options,
              headers: {
                ...defaultHeaders,
                ...newAuthHeaders,
                ...options.headers,
              },
            };
            const retryResponse = await fetch(url, retryConfig);
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }
        }
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        console.error(`❌ API Error: ${response.status} ${response.statusText}`);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`💥 Request failed:`, error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Restaurants
  restaurants = {
    getAll: () => this.request<any[]>('/restaurants'),
    
    getById: (id: string) => this.request<any>(`/restaurants/${id}`),
    
    getMenuItems: (restaurantId: string) => 
      this.request<any[]>(`/menu-items/restaurant/${restaurantId}`),
  };

  // Orders
  orders = {
    create: async (orderData: any) => {
      const userId = await this.getUserId();
      return this.request<any>('/orders', {
        method: 'POST',
        headers: {
          'User-Id': userId,
        },
        body: JSON.stringify(orderData),
      });
    },

    getByUserId: async (userId?: string) => {
      const finalUserId = userId || await this.getUserId();
      console.log('🔍 getByUserId called with:', { userId, finalUserId });
      return this.request<any[]>(`/orders?userId=${finalUserId}`);
    },
    
    getById: (id: string) => 
      this.request<any>(`/orders/${id}`),
    
    updateStatus: (id: string, status: string) =>
      this.request<any>(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  };

  // Menu items
  menuItems = {
    getAll: () => this.request<any[]>('/menu-items'),
    
    getById: (id: string) => this.request<any>(`/menu-items/${id}`),
    
    getByRestaurant: (restaurantId: string) => 
      this.request<any[]>(`/menu-items/restaurant/${restaurantId}`),
  };

  // Users
  users = {
    getById: (id: string) => this.request<any>(`/users/${id}`),
  };

  // Favorites
  favorites = {
    getByUserId: (userId: string) =>
      this.request<any[]>(`/users/${userId}/favorites`),

    add: (userId: string, restaurantId: string) =>
      this.request<any>(`/users/${userId}/favorites/${restaurantId}`, {
        method: 'POST',
      }),

    remove: (userId: string, restaurantId: string) =>
      this.request<any>(`/users/${userId}/favorites/${restaurantId}`, {
        method: 'DELETE',
      }),

    check: (userId: string, restaurantId: string) =>
      this.request<{ isFavorite: boolean }>(`/users/${userId}/favorites/${restaurantId}`),

    toggle: (userId: string, restaurantId: string) =>
      this.request<any>(`/users/${userId}/favorites/${restaurantId}/toggle`, {
        method: 'PUT',
      }),
  };

  // Health check
  health = {
    check: () => this.request<{ status: string }>('/q/health'),
  };
}

export const apiService = new ApiService();
export default apiService;