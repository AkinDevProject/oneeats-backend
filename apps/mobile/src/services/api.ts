import { Platform } from 'react-native';
import { ENV } from '../config/env';

const API_BASE_URL = ENV.API_URL;
const API_TIMEOUT = ENV.API_TIMEOUT;

// Types de base
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Configuration par défaut pour les requêtes
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// User ID fixe pour les tests sans auth
const DEV_USER_ID = ENV.DEV_USER_ID;

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Debug logging
    console.log(`🌐 API Request: ${url}`);
    console.log(`📱 Platform: ${Platform.OS}`);
    console.log(`🔧 API Base URL: ${API_BASE_URL}`);
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
        // Pour l'instant, pas d'auth header
        // Authorization sera ajouté plus tard
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      console.log(`⏳ Making request to: ${url}`);
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`✅ Response status: ${response.status}`);

      if (!response.ok) {
        console.error(`❌ API Error: ${response.status} ${response.statusText}`);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📦 Response data:`, data);
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
    create: (orderData: any) => 
      this.request<any>('/orders', {
        method: 'POST',
        headers: {
          'User-Id': DEV_USER_ID, // Header requis par le backend
        },
        body: JSON.stringify(orderData),
      }),
    
    getByUserId: (userId?: string) => {
      const finalUserId = userId || DEV_USER_ID;
      console.log('🔍 getByUserId called with:', { userId, finalUserId, DEV_USER_ID });
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

  // Health check
  health = {
    check: () => this.request<{ status: string }>('/q/health'),
  };
}

export const apiService = new ApiService();
export default apiService;