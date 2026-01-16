/**
 * Donnees de test pour les commandes
 */
import { Order } from '../../../src/types';
import { mockRestaurants } from './restaurants';
import { mockMenuItems } from './menuItems';

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    restaurantId: 'resto-1',
    restaurant: mockRestaurants[0],
    items: [
      {
        id: 'cart-item-1',
        menuItem: mockMenuItems[0],
        quantity: 2,
        totalPrice: 25.98,
        specialInstructions: 'Bien cuite'
      },
      {
        id: 'cart-item-2',
        menuItem: mockMenuItems[2],
        quantity: 1,
        totalPrice: 6.99
      }
    ],
    status: 'preparing',
    total: 32.97,
    orderTime: new Date('2025-01-15T12:00:00'),
    pickupTime: new Date('2025-01-15T12:30:00'),
    customerName: 'Jean Dupont',
    customerPhone: '+33 6 12 34 56 78',
    customerNotes: 'Sonner a la porte'
  },
  {
    id: 'order-2',
    restaurantId: 'resto-2',
    restaurant: mockRestaurants[1],
    items: [
      {
        id: 'cart-item-3',
        menuItem: mockMenuItems[3],
        quantity: 1,
        totalPrice: 18.99
      }
    ],
    status: 'completed',
    total: 18.99,
    orderTime: new Date('2025-01-14T19:00:00'),
    pickupTime: new Date('2025-01-14T19:30:00'),
    customerName: 'Jean Dupont'
  },
  {
    id: 'order-3',
    restaurantId: 'resto-1',
    restaurant: mockRestaurants[0],
    items: [
      {
        id: 'cart-item-4',
        menuItem: mockMenuItems[1],
        quantity: 1,
        totalPrice: 14.99
      }
    ],
    status: 'pending',
    total: 14.99,
    orderTime: new Date('2025-01-15T14:00:00'),
    pickupTime: new Date('2025-01-15T14:25:00')
  }
];

export const getOrderById = (id: string): Order | undefined => {
  return mockOrders.find(o => o.id === id);
};

export const getOrdersByUserId = (userId: string): Order[] => {
  // Retourne toutes les commandes mock pour les tests
  return mockOrders;
};
