/**
 * Donnees de test pour les menu items
 */
import { MenuItem } from '../../../src/types';

export const mockMenuItems: MenuItem[] = [
  {
    id: 'item-1',
    restaurantId: 'resto-1',
    name: 'Pizza Margherita',
    description: 'Tomate, mozzarella, basilic frais',
    price: 12.99,
    image: 'https://example.com/margherita.jpg',
    category: 'Pizzas',
    popular: true,
    available: true,
    options: [
      {
        id: 'opt-1',
        name: 'Taille',
        type: 'choice',
        isRequired: true,
        maxChoices: 1,
        choices: [
          { id: 'choice-1', name: 'Medium', price: 0 },
          { id: 'choice-2', name: 'Large', price: 3 }
        ]
      },
      {
        id: 'opt-2',
        name: 'Supplements',
        type: 'extra',
        isRequired: false,
        maxChoices: 3,
        choices: [
          { id: 'choice-3', name: 'Champignons', price: 1.5 },
          { id: 'choice-4', name: 'Olives', price: 1 }
        ]
      }
    ]
  },
  {
    id: 'item-2',
    restaurantId: 'resto-1',
    name: 'Pizza 4 Fromages',
    description: 'Gorgonzola, mozzarella, parmesan, chevre',
    price: 14.99,
    image: 'https://example.com/4fromages.jpg',
    category: 'Pizzas',
    popular: true,
    available: true
  },
  {
    id: 'item-3',
    restaurantId: 'resto-1',
    name: 'Tiramisu',
    description: 'Mascarpone, cafe, cacao',
    price: 6.99,
    image: 'https://example.com/tiramisu.jpg',
    category: 'Desserts',
    popular: false,
    available: true
  },
  {
    id: 'item-4',
    restaurantId: 'resto-2',
    name: 'Sushi Mix',
    description: 'Assortiment de 12 sushis',
    price: 18.99,
    image: 'https://example.com/sushi-mix.jpg',
    category: 'Sushis',
    popular: true,
    available: true
  },
  {
    id: 'item-5',
    restaurantId: 'resto-1',
    name: 'Pizza Indisponible',
    description: 'Pizza temporairement indisponible',
    price: 15.99,
    image: 'https://example.com/unavailable.jpg',
    category: 'Pizzas',
    popular: false,
    available: false
  }
];

export const getMenuItemById = (id: string): MenuItem | undefined => {
  return mockMenuItems.find(item => item.id === id);
};

export const getMenuItemsByRestaurant = (restaurantId: string): MenuItem[] => {
  return mockMenuItems.filter(item => item.restaurantId === restaurantId);
};
