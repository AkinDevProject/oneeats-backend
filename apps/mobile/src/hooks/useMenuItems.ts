import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { MenuItem } from '../data/mockData';

interface UseMenuItemsResult {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMenuItems = (restaurantId?: string): UseMenuItemsResult => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async () => {
    if (!restaurantId) {
      setMenuItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.restaurants.getMenuItems(restaurantId);
      
      // Mapper les données de l'API au format attendu par l'app mobile
      const mappedData = data.map((item: any) => ({
        id: item.id,
        restaurantId: item.restaurantId,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || 'https://via.placeholder.com/300x300',
        category: item.category,
        popular: Math.random() > 0.7, // Mock - sera ajouté à l'API plus tard
        available: item.available,
        options: item.options || [], // Options déjà au bon format
      }));
      
      setMenuItems(mappedData);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement du menu');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  return {
    menuItems,
    loading,
    error,
    refetch: fetchMenuItems,
  };
};