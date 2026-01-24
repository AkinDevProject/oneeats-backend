import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import cacheService from '../services/cacheService';
import { MenuItem } from '../types';

interface UseMenuItemsResult {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  isFromCache: boolean;
  refetch: () => Promise<void>;
}

export const useMenuItems = (restaurantId?: string): UseMenuItemsResult => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  /**
   * Mapper les données de l'API au format attendu par l'app mobile
   */
  const mapMenuItemData = useCallback((data: any[]): MenuItem[] => {
    return data.map((item: any) => ({
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image || 'https://via.placeholder.com/300x300',
      category: item.category,
      popular: item.popular ?? Math.random() > 0.7,
      available: item.available,
      options: item.options || [],
    }));
  }, []);

  /**
   * Charger les données depuis le cache
   */
  const loadFromCache = useCallback(async (): Promise<boolean> => {
    if (!restaurantId) return false;

    try {
      const cachedData = await cacheService.getMenuItems(restaurantId);
      if (cachedData && cachedData.length > 0) {
        console.log(`📦 Loading menu items for ${restaurantId} from cache`);
        setMenuItems(cachedData);
        setIsFromCache(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error loading menu items from cache:', err);
      return false;
    }
  }, [restaurantId]);

  /**
   * Récupérer les menu items depuis l'API
   */
  const fetchMenuItems = useCallback(async () => {
    if (!restaurantId) {
      setMenuItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 Fetching menu items for ${restaurantId}...`);

      const data = await apiService.restaurants.getMenuItems(restaurantId);
      const mappedData = mapMenuItemData(data);

      setMenuItems(mappedData);
      setIsFromCache(false);

      // Sauvegarder dans le cache
      await cacheService.saveMenuItems(restaurantId, mappedData);

    } catch (err) {
      console.error('Error fetching menu items:', err);

      // Tenter de charger depuis le cache en cas d'erreur
      const loadedFromCache = await loadFromCache();

      if (loadedFromCache) {
        setError('Mode hors connexion - menu en cache');
      } else {
        setError(err instanceof Error ? err.message : 'Erreur de chargement du menu');
      }
    } finally {
      setLoading(false);
    }
  }, [restaurantId, mapMenuItemData, loadFromCache]);

  /**
   * Initialisation: essayer le cache d'abord pour un affichage rapide
   */
  useEffect(() => {
    if (!restaurantId) {
      setMenuItems([]);
      setLoading(false);
      return;
    }

    const initialize = async () => {
      setLoading(true);

      // D'abord, essayer de charger depuis le cache
      const hasCachedData = await loadFromCache();

      if (hasCachedData) {
        setLoading(false);

        // Puis tenter une mise à jour en arrière-plan
        try {
          const data = await apiService.restaurants.getMenuItems(restaurantId);
          const mappedData = mapMenuItemData(data);
          setMenuItems(mappedData);
          setIsFromCache(false);
          setError(null);
          await cacheService.saveMenuItems(restaurantId, mappedData);
          console.log('🔄 Menu items background refresh completed');
        } catch (err) {
          console.log('⚠️ Menu items background refresh failed, using cached data');
        }
      } else {
        await fetchMenuItems();
      }
    };

    initialize();
  }, [restaurantId, fetchMenuItems, loadFromCache, mapMenuItemData]);

  return {
    menuItems,
    loading,
    error,
    isFromCache,
    refetch: fetchMenuItems,
  };
};
