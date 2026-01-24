import { Restaurant, MenuItem, Order, User, CreateUserRequest, UpdateUserRequest, SuspendUserRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Don't set Content-Type for FormData
    const isFormData = options.body instanceof FormData;

    const config: RequestInit = {
      // Quarkus gère l'auth avec des cookies HttpOnly de session
      credentials: 'include',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Handle empty responses (like 204 No Content)
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      // Log error silently in production, detailed in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`API request failed: ${url}`, error);
      }
      throw error;
    }
  }

  // Restaurant API
  restaurants = {
    getAll: (): Promise<Restaurant[]> => 
      this.request('/api/restaurants'),
    
    getById: (id: string): Promise<Restaurant> => 
      this.request(`/api/restaurants/${id}`),
    
    getByOwner: (ownerId: string): Promise<Restaurant> => 
      this.request(`/api/restaurants/owner/${ownerId}`),
    
    getActive: (): Promise<Restaurant[]> => 
      this.request('/api/restaurants/active'),
    
    create: (data: Partial<Restaurant>): Promise<Restaurant> => 
      this.request('/api/restaurants', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: Partial<Restaurant>): Promise<Restaurant> => 
      this.request(`/api/restaurants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    updateStatus: (id: string, status: string): Promise<Restaurant> => 
      this.request(`/api/restaurants/${id}/status?status=${status}`, {
        method: 'PUT',
      }),
    
    toggleStatus: (id: string, isOpen: boolean): Promise<Restaurant> => 
      this.request(`/api/restaurants/${id}/toggle-status`, {
        method: 'PATCH',
        body: JSON.stringify({ isOpen }),
      }),

    uploadImage: (id: string, file: File): Promise<Restaurant> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);

      return this.request(`/api/restaurants/${id}/image`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser handle it
        },
      });
    },

    deleteImage: (id: string): Promise<Restaurant> =>
      this.request(`/api/restaurants/${id}/image`, {
        method: 'DELETE',
      }),

    delete: (id: string): Promise<void> =>
      this.request(`/api/restaurants/${id}`, {
        method: 'DELETE',
      }),
  };

  // Menu API
  menuItems = {
    getAll: (): Promise<MenuItem[]> => 
      this.request('/api/menu-items'),
    
    getById: (id: string): Promise<MenuItem> => 
      this.request(`/api/menu-items/${id}`),
    
    getByRestaurant: (restaurantId: string): Promise<MenuItem[]> => 
      this.request(`/api/menu-items/restaurant/${restaurantId}`),
    
    getAvailableByRestaurant: (restaurantId: string): Promise<MenuItem[]> => 
      this.request(`/api/menu-items/restaurant/${restaurantId}/available`),
    
    getByCategory: (restaurantId: string, category: string): Promise<MenuItem[]> => 
      this.request(`/api/menu-items/restaurant/${restaurantId}/category/${category}`),
    
    getCategories: (restaurantId: string): Promise<string[]> => 
      this.request(`/api/menu-items/restaurant/${restaurantId}/categories`),
    
    create: (data: Partial<MenuItem>): Promise<MenuItem> => 
      this.request('/api/menu-items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: Partial<MenuItem>): Promise<MenuItem> => 
      this.request(`/api/menu-items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    toggleAvailability: (id: string, available: boolean): Promise<MenuItem> => 
      this.request(`/api/menu-items/${id}/availability`, {
        method: 'PUT',
        body: JSON.stringify({ available }),
      }),
    
    delete: (id: string): Promise<void> =>
      this.request(`/api/menu-items/${id}`, {
        method: 'DELETE',
      }),

    uploadImage: (id: string, file: File): Promise<MenuItem> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      return this.request(`/api/menu-items/${id}/image`, {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set Content-Type for FormData
      });
    },

    deleteImage: (id: string): Promise<void> =>
      this.request(`/api/menu-items/${id}/image`, {
        method: 'DELETE',
      }),
  };

  // Orders API
  orders = {
    getAll: (): Promise<Order[]> =>
      this.request('/api/orders?all=true'),
    
    getById: (id: string): Promise<Order> => 
      this.request(`/api/orders/${id}`),
    
    getByRestaurant: (restaurantId: string): Promise<Order[]> => 
      this.request(`/api/orders?restaurantId=${restaurantId}`),
    
    getPendingByRestaurant: (restaurantId: string): Promise<Order[]> => 
      this.request(`/api/orders/restaurant/${restaurantId}/pending`),
    
    getByStatus: (restaurantId: string, status: string): Promise<Order[]> => 
      this.request(`/api/orders/restaurant/${restaurantId}/status/${status}`),
    
    create: (data: Partial<Order>): Promise<Order> => 
      this.request('/api/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    updateStatus: (id: string, status: string): Promise<Order> => 
      this.request(`/api/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ newStatus: status, reason: null }),
      }),
    
    // Actions spécialisées plus simples
    confirm: (id: string): Promise<Order> => 
      this.request(`/api/orders/${id}/confirm`, {
        method: 'PUT',
      }),
    
    markReady: (id: string): Promise<Order> => 
      this.request(`/api/orders/${id}/ready`, {
        method: 'PUT',
      }),
    
    cancel: (id: string, reason?: string): Promise<Order> => 
      this.request(`/api/orders/${id}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`, {
        method: 'PUT',
      }),
    
    update: (id: string, data: Partial<Order>): Promise<Order> => 
      this.request(`/api/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
  };

  // Users API (for admin)
  users = {
    getAll: (): Promise<User[]> =>
      this.request('/api/users'),

    getById: (id: string): Promise<User> =>
      this.request(`/api/users/${id}`),

    create: (data: CreateUserRequest): Promise<User> =>
      this.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateUserRequest): Promise<User> =>
      this.request(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: UserStatus): Promise<User> =>
      this.request(`/api/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ id, status }),
      }),

    delete: (id: string): Promise<void> =>
      this.request(`/api/users/${id}`, {
        method: 'DELETE',
      }),

    suspend: (id: string, data: SuspendUserRequest): Promise<User> =>
      this.request(`/api/admin/users/${id}/suspend`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    reactivate: (id: string): Promise<User> =>
      this.request(`/api/admin/users/${id}/reactivate`, {
        method: 'POST',
      }),
  };

  // Analytics API
  analytics = {
    getRestaurantStats: (restaurantId: string, period: string = 'week'): Promise<Record<string, unknown>> =>
      this.request(`/api/analytics/restaurant/${restaurantId}?period=${period}`),

    getPlatformStats: (): Promise<import('../types').PlatformStats> =>
      this.request('/api/analytics/platform'),

    getDashboardStats: (): Promise<import('../types').PlatformStats> =>
      this.request('/api/analytics/dashboard'),

    getRevenueStats: (period: 'day' | 'week' | 'month' = 'week'): Promise<import('../types').RevenueData> =>
      this.request(`/api/analytics/revenue?period=${period}`),

    getTrendsStats: (): Promise<import('../types').TrendsData> =>
      this.request('/api/analytics/trends'),
  };

  // Admin API for dashboard stats
  admin = {
    getDashboardStats: (): Promise<Record<string, unknown>> => 
      this.request('/api/admin/dashboard/stats'),
  };
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export types for convenience
export type { Restaurant, MenuItem, Order, User };