import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import cacheService from '../services/cacheService';
import { Restaurant } from '../types';
import { buildRestaurantImageUrl } from '../utils/imageUtils';

interface UseRestaurantsResult {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  isFromCache: boolean;
  refetch: () => Promise<void>;
}

export const useRestaurants = (): UseRestaurantsResult => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  /**
   * Mapper les données de l'API au format attendu par l'app mobile
   */
  const mapRestaurantData = useCallback((data: any[]): Restaurant[] => {
    return data.map((restaurant: any) => ({
      id: restaurant.id,
      name: restaurant.name,
      image: buildRestaurantImageUrl(restaurant.imageUrl || restaurant.image),
      cuisine: restaurant.cuisineType || restaurant.cuisine || 'Restaurant',
      rating: restaurant.rating || 4.5,
      deliveryTime: restaurant.deliveryTime || '20-30 min',
      deliveryFee: restaurant.deliveryFee || 2.99,
      distance: restaurant.distance || '1.2 km',
      featured: restaurant.featured ?? Math.random() > 0.5,
      isOpen: restaurant.isOpen,
      description: restaurant.description || `Délicieuse cuisine ${restaurant.cuisineType || restaurant.cuisine}`,
    }));
  }, []);

  /**
   * Charger les données depuis le cache
   */
  const loadFromCache = useCallback(async (): Promise<boolean> => {
    try {
      const cachedData = await cacheService.getRestaurants();
      if (cachedData && cachedData.length > 0) {
        console.log('📦 Loading restaurants from cache');
        setRestaurants(cachedData);
        setIsFromCache(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error loading from cache:', err);
      return false;
    }
  }, []);

  /**
   * Récupérer les restaurants depuis l'API
   */
  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching restaurants from API...');

      const data = await apiService.restaurants.getAll();
      console.log('🎯 API returned restaurants:', data);

      const mappedData = mapRestaurantData(data);
      console.log('✅ Mapped restaurants:', mappedData);

      setRestaurants(mappedData);
      setIsFromCache(false);

      // Sauvegarder dans le cache
      await cacheService.saveRestaurants(mappedData);
      await cacheService.updateLastSync();

    } catch (err) {
      console.error('Error fetching restaurants:', err);

      // Tenter de charger depuis le cache en cas d'erreur
      const loadedFromCache = await loadFromCache();

      if (loadedFromCache) {
        // Données chargées depuis le cache, afficher un avertissement léger
        setError('Mode hors connexion - données en cache');
      } else {
        // Aucune donnée en cache, afficher l'erreur complète
        setError(err instanceof Error ? err.message : 'Erreur de chargement des restaurants');
      }
    } finally {
      setLoading(false);
    }
  }, [mapRestaurantData, loadFromCache]);

  /**
   * Initialisation: essayer l'API, puis le cache si échec
   */
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);

      // D'abord, essayer de charger depuis le cache pour un affichage rapide
      const hasCachedData = await loadFromCache();

      if (hasCachedData) {
        // Afficher les données en cache immédiatement
        setLoading(false);

        // Puis tenter une mise à jour en arrière-plan
        try {
          const data = await apiService.restaurants.getAll();
          const mappedData = mapRestaurantData(data);
          setRestaurants(mappedData);
          setIsFromCache(false);
          setError(null);
          await cacheService.saveRestaurants(mappedData);
          await cacheService.updateLastSync();
          console.log('🔄 Background refresh completed');
        } catch (err) {
          // Ignorer l'erreur en arrière-plan, on a déjà les données en cache
          console.log('⚠️ Background refresh failed, using cached data');
        }
      } else {
        // Pas de cache, faire un fetch normal
        await fetchRestaurants();
      }
    };

    initialize();
  }, [fetchRestaurants, loadFromCache, mapRestaurantData]);

  return {
    restaurants,
    loading,
    error,
    isFromCache,
    refetch: fetchRestaurants,
  };
};
