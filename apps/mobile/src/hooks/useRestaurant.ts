import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { Restaurant } from '../data/mockData';

interface UseRestaurantResult {
  restaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRestaurant = (restaurantId?: string): UseRestaurantResult => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurant = useCallback(async () => {
    if (!restaurantId) {
      setRestaurant(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.restaurants.getById(restaurantId);
      
      // Mapper les données de l'API au format attendu par l'app mobile
      const mappedRestaurant: Restaurant = {
        id: data.id,
        name: data.name,
        image: data.logo || 'https://via.placeholder.com/400x300',
        cuisine: data.category,
        rating: 4.5, // Mock rating - sera ajouté à l'API plus tard
        deliveryTime: '20-30 min', // Mock - sera ajouté plus tard
        deliveryFee: 2.99, // Mock - sera ajouté plus tard
        distance: '1.2 km', // Mock - sera calculé plus tard
        featured: Math.random() > 0.5, // Mock
        isOpen: data.isOpen,
        description: `Délicieuse cuisine ${data.category}`,
      };
      
      setRestaurant(mappedRestaurant);
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement du restaurant');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  return {
    restaurant,
    loading,
    error,
    refetch: fetchRestaurant,
  };
};