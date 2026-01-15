import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { Restaurant, MenuItem, Order } from '../types';

// Generic hook for API calls
export function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Restaurants hooks
export function useRestaurants() {
  return useApiCall(() => apiService.restaurants.getAll());
}

export function useRestaurant(id: string) {
  return useApiCall(() => apiService.restaurants.getById(id), [id]);
}

export function useActiveRestaurants() {
  return useApiCall(() => apiService.restaurants.getActive());
}

export function useRestaurantByOwner(ownerId: string) {
  return useApiCall(() => apiService.restaurants.getByOwner(ownerId), [ownerId]);
}

// Menu hooks
export function useMenuItems(restaurantId?: string) {
  const apiCall = restaurantId 
    ? () => apiService.menuItems.getByRestaurant(restaurantId)
    : () => apiService.menuItems.getAll();
  
  return useApiCall(apiCall, [restaurantId]);
}

export function useAvailableMenuItems(restaurantId: string) {
  return useApiCall(() => apiService.menuItems.getAvailableByRestaurant(restaurantId), [restaurantId]);
}

export function useMenuCategories(restaurantId: string) {
  return useApiCall(() => apiService.menuItems.getCategories(restaurantId), [restaurantId]);
}

// Orders hooks
export function useOrders(restaurantId?: string) {
  const apiCall = restaurantId 
    ? () => apiService.orders.getByRestaurant(restaurantId)
    : () => apiService.orders.getAll();
  
  return useApiCall(apiCall, [restaurantId]);
}

export function usePendingOrders(restaurantId: string) {
  return useApiCall(() => apiService.orders.getPendingByRestaurant(restaurantId), [restaurantId]);
}

export function useOrdersByStatus(restaurantId: string, status: string) {
  return useApiCall(() => apiService.orders.getByStatus(restaurantId, status), [restaurantId, status]);
}

// Users hooks (for admin)
export function useUsers() {
  return useApiCall(() => apiService.users.getAll());
}

// Mutation hooks for CRUD operations
export function useRestaurantMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRestaurant = useCallback(async (data: Partial<Restaurant>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.restaurants.create(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRestaurant = useCallback(async (id: string, data: Partial<Restaurant>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.restaurants.update(id, data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRestaurantStatus = useCallback(async (id: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.restaurants.updateStatus(id, status);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createRestaurant,
    updateRestaurant,
    updateRestaurantStatus,
    loading,
    error
  };
}

export function useMenuItemMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMenuItem = useCallback(async (data: Partial<MenuItem>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.menuItems.create(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMenuItem = useCallback(async (id: string, data: Partial<MenuItem>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.menuItems.update(id, data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleAvailability = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.menuItems.toggleAvailability(id);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMenuItem = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.menuItems.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createMenuItem,
    updateMenuItem,
    toggleAvailability,
    deleteMenuItem,
    loading,
    error
  };
}

export function useOrderMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(async (data: Partial<Order>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.orders.create(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.orders.updateStatus(id, status);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createOrder,
    updateOrderStatus,
    loading,
    error
  };
}