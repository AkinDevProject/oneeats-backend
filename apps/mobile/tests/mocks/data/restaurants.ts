/**
 * Donnees de test pour les restaurants
 */
import { Restaurant } from '../../../src/types';

export const mockRestaurants: Restaurant[] = [
  {
    id: 'resto-1',
    name: 'Pizza Palace',
    image: 'https://example.com/pizza.jpg',
    cuisine: 'Italien',
    rating: 4.5,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    distance: '1.2 km',
    featured: true,
    isOpen: true,
    description: 'Les meilleures pizzas de la ville'
  },
  {
    id: 'resto-2',
    name: 'Sushi Master',
    image: 'https://example.com/sushi.jpg',
    cuisine: 'Japonais',
    rating: 4.8,
    deliveryTime: '30-40 min',
    deliveryFee: 3.99,
    distance: '2.5 km',
    featured: true,
    isOpen: true,
    description: 'Sushis frais et authentiques'
  },
  {
    id: 'resto-3',
    name: 'Burger Factory',
    image: 'https://example.com/burger.jpg',
    cuisine: 'Americain',
    rating: 4.2,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    distance: '0.8 km',
    featured: false,
    isOpen: false,
    description: 'Burgers gourmet fait maison'
  }
];

export const getRestaurantById = (id: string): Restaurant | undefined => {
  return mockRestaurants.find(r => r.id === id);
};
