import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { Restaurant } from '../types';
import { buildRestaurantImageUrl } from '../utils/imageUtils';

interface UseRestaurantsResult {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRestaurants = (): UseRestaurantsResult => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching restaurants from API...');
      const data = await apiService.restaurants.getAll();
      console.log('🎯 API returned restaurants:', data);
      
      // Mapper les données de l'API au format attendu par l'app mobile
      const mappedData = data.map((restaurant: any) => ({
        id: restaurant.id,
        name: restaurant.name,
        image: buildRestaurantImageUrl(restaurant.imageUrl),
        cuisine: restaurant.cuisineType || 'Restaurant',
        rating: restaurant.rating || 4.5,
        deliveryTime: '20-30 min', // Mock - sera ajouté plus tard
        deliveryFee: 2.99, // Mock - sera ajouté plus tard
        distance: '1.2 km', // Mock - sera calculé plus tard
        featured: Math.random() > 0.5, // Mock
        isOpen: restaurant.isOpen,
        description: restaurant.description || `Délicieuse cuisine ${restaurant.cuisineType}`,
      }));
      
      console.log('✅ Mapped restaurants:', mappedData);
      setRestaurants(mappedData);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement des restaurants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants,
  };
};