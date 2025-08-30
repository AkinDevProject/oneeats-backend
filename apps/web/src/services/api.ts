import { Restaurant, MenuItem, Order, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
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
    
    toggleAvailability: (id: string): Promise<MenuItem> => 
      this.request(`/api/menu-items/${id}/availability`, {
        method: 'PUT',
      }),
    
    delete: (id: string): Promise<void> => 
      this.request(`/api/menu-items/${id}`, {
        method: 'DELETE',
      }),
  };

  // Orders API
  orders = {
    getAll: (): Promise<Order[]> => 
      this.request('/api/orders'),
    
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
    
    getTodayStats: (restaurantId: string): Promise<any> => 
      this.request(`/api/orders/restaurant/${restaurantId}/stats/today`),
  };

  // Users API (for admin)
  users = {
    getAll: (): Promise<User[]> => 
      this.request('/api/users'),
    
    getById: (id: string): Promise<User> => 
      this.request(`/api/users/${id}`),
    
    getByRole: (role: string): Promise<User[]> => 
      this.request(`/api/users/role/${role}`),
    
    create: (data: Partial<User>): Promise<User> => 
      this.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: Partial<User>): Promise<User> => 
      this.request(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string): Promise<void> => 
      this.request(`/api/users/${id}`, {
        method: 'DELETE',
      }),
  };

  // Analytics API (simplified for demo)
  analytics = {
    getRestaurantStats: (restaurantId: string, period: string = 'week'): Promise<Record<string, unknown>> => 
      this.request(`/api/analytics/restaurant/${restaurantId}?period=${period}`),
    
    getPlatformStats: (): Promise<Record<string, unknown>> => 
      this.request('/api/analytics/platform'),
  };
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export types for convenience
export type { Restaurant, MenuItem, Order, User };