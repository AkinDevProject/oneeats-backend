import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ENV } from '../config/env';

const API_BASE_URL = ENV.API_URL;

export interface FavoriteToggleResponse {
  isFavorite: boolean;
  message: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantCuisine: string;
  restaurantRating: number;
  restaurantReviewCount: number;
  restaurantDeliveryTime: string;
  restaurantDeliveryFee: number;
  restaurantIsOpen: boolean;
  restaurantImageUrl: string;
  createdAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  toggleFavorite: (restaurantId: string) => Promise<boolean>;
  checkFavoriteStatus: (restaurantId: string) => boolean;
  getFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const getFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${user.id}/favorites`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FavoriteItem[] = await response.json();
      setFavorites(data);
      setFavoriteIds(new Set(data.map(fav => fav.restaurantId)));
    } catch (error) {
      console.error('Error getting favorites:', error);
      setFavorites([]);
      setFavoriteIds(new Set());
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const toggleFavorite = useCallback(async (restaurantId: string): Promise<boolean> => {
    if (!user?.id) {
      console.warn('User not authenticated');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${user.id}/favorites/${restaurantId}/toggle`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FavoriteToggleResponse = await response.json();
      console.log('Toggle favorite response:', data);

      // Actualiser la liste des favoris après le toggle
      await getFavorites();

      return data.isFavorite;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getFavorites]);

  const checkFavoriteStatus = useCallback((restaurantId: string): boolean => {
    return favoriteIds.has(restaurantId);
  }, [favoriteIds]);

  const refreshFavorites = useCallback(async () => {
    await getFavorites();
  }, [getFavorites]);

  // Charger les favoris quand l'utilisateur change
  useEffect(() => {
    if (user?.id) {
      getFavorites();
    } else {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, [user?.id, getFavorites]);

  const value: FavoritesContextType = {
    favorites,
    favoriteIds,
    isLoading,
    toggleFavorite,
    checkFavoriteStatus,
    getFavorites,
    refreshFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavoritesContext = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
};