import { useFavoritesContext } from '../contexts/FavoritesContext';

export const useFavorites = () => {
  return useFavoritesContext();
};