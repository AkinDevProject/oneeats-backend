import { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { Restaurant } from '../../types';

interface UseRestaurantsResult {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateRestaurantStatus: (id: string, status: 'PENDING' | 'APPROVED' | 'BLOCKED') => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;
}

export const useRestaurants = (): UseRestaurantsResult => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.restaurants.getAll();
      setRestaurants(data);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurantStatus = async (id: string, status: 'PENDING' | 'APPROVED' | 'BLOCKED') => {
    try {
      const updatedRestaurant = await apiService.restaurants.updateStatus(id, status);

      setRestaurants(prev =>
        prev.map(restaurant =>
          restaurant.id === id
            ? { ...restaurant, status: updatedRestaurant.status }
            : restaurant
        )
      );
    } catch (err) {
      console.error('Error updating restaurant status:', err);
      throw err;
    }
  };

  const deleteRestaurant = async (id: string) => {
    try {
      await apiService.restaurants.delete(id);

      setRestaurants(prev => prev.filter(restaurant => restaurant.id !== id));
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants,
    updateRestaurantStatus,
    deleteRestaurant,
  };
};