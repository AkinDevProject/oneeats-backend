import { Restaurant, User, Order, MenuItem, DashboardStats } from '../types';

export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Chez Luigi',
    email: 'luigi@restaurant.com',
    address: '123 Rue de la Paix, Paris',
    phone: '01 23 45 67 89',
    category: 'Italien',
    registrationDate: new Date('2024-01-15'),
    status: 'approved',
    isOpen: true,
    schedule: {
      monday: { open: '11:00', close: '23:00' },
      tuesday: { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday: { open: '11:00', close: '23:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '11:00', close: '23:00' },
      sunday: null
    }
  },
  {
    id: '2',
    name: 'Sakura Sushi',
    email: 'contact@sakura.fr',
    address: '456 Avenue des Champs, Lyon',
    phone: '04 12 34 56 78',
    category: 'Japonais',
    registrationDate: new Date('2024-02-10'),
    status: 'pending',
    isOpen: false,
    schedule: {
      monday: { open: '18:00', close: '22:00' },
      tuesday: { open: '18:00', close: '22:00' },
      wednesday: { open: '18:00', close: '22:00' },
      thursday: { open: '18:00', close: '22:00' },
      friday: { open: '18:00', close: '23:00' },
      saturday: { open: '18:00', close: '23:00' },
      sunday: { open: '18:00', close: '22:00' }
    }
  },
  {
    id: '3',
    name: 'Burger Street',
    email: 'info@burgerstreet.com',
    address: '789 Bd Saint-Germain, Paris',
    phone: '01 98 76 54 32',
    category: 'Fast Food',
    registrationDate: new Date('2024-03-05'),
    status: 'blocked',
    isOpen: false,
    schedule: {
      monday: { open: '10:00', close: '24:00' },
      tuesday: { open: '10:00', close: '24:00' },
      wednesday: { open: '10:00', close: '24:00' },
      thursday: { open: '10:00', close: '24:00' },
      friday: { open: '10:00', close: '02:00' },
      saturday: { open: '10:00', close: '02:00' },
      sunday: { open: '12:00', close: '24:00' }
    }
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'jean.dupont@email.com',
    name: 'Jean Dupont',
    role: 'admin',
    createdAt: new Date('2024-01-10'),
    ordersCount: 45,
    status: 'active'
  },
  {
    id: '2',
    email: 'marie.martin@email.com',
    name: 'Marie Martin',
    role: 'restaurant',
    createdAt: new Date('2024-02-15'),
    ordersCount: 23,
    status: 'active'
  },
  {
    id: '3',
    email: 'pierre.bernard@email.com',
    name: 'Pierre Bernard',
    role: 'restaurant',
    createdAt: new Date('2024-03-01'),
    ordersCount: 12,
    status: 'inactive'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    restaurantId: '1',
    restaurantName: 'Chez Luigi',
    clientName: 'Sophie Dubois',
    clientEmail: 'sophie@email.com',
    items: [
      { id: '1', menuItemId: '1', name: 'Pizza Margherita', quantity: 1, price: 12.50 },
      { id: '2', menuItemId: '2', name: 'Tiramisu', quantity: 1, price: 6.00 }
    ],
    total: 18.50,
    status: 'pending',
    createdAt: new Date(),
    estimatedTime: 25
  },
  {
    id: 'ORD-002',
    restaurantId: '2',
    restaurantName: 'Sakura Sushi',
    clientName: 'Thomas Moreau',
    clientEmail: 'thomas@email.com',
    items: [
      { id: '3', menuItemId: '3', name: 'Sashimi Saumon', quantity: 2, price: 15.00 }
    ],
    total: 30.00,
    status: 'preparing',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    estimatedTime: 15
  },
  {
    id: 'ORD-003',
    restaurantId: '1',
    restaurantName: 'Chez Luigi',
    clientName: 'Emma Rousseau',
    clientEmail: 'emma@email.com',
    items: [
      { id: '4', menuItemId: '4', name: 'Pasta Carbonara', quantity: 1, price: 14.00 }
    ],
    total: 14.00,
    status: 'ready',
    createdAt: new Date(Date.now() - 60 * 60 * 1000)
  }
];

export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Pizza Margherita',
    description: 'Tomate, mozzarella, basilic frais',
    price: 12.50,
    category: 'Pizzas',
    available: true,
    restaurantId: '1',
    options: [
      {
        id: 'remove-ingredients',
        name: 'Retirer des ingrédients',
        type: 'remove',
        isRequired: false,
        choices: [
          { id: 'no-tomato', name: 'Sans tomate', price: 0 },
          { id: 'no-mozzarella', name: 'Sans mozzarella', price: 0 },
          { id: 'no-basil', name: 'Sans basilic', price: 0 }
        ]
      },
      {
        id: 'extra-ingredients',
        name: 'Ingrédients supplémentaires',
        type: 'extra',
        isRequired: false,
        choices: [
          { id: 'extra-cheese', name: 'Supplément fromage', price: 2.00 },
          { id: 'pepperoni', name: 'Pepperoni', price: 3.00 },
          { id: 'mushrooms', name: 'Champignons', price: 2.50 },
          { id: 'olives', name: 'Olives', price: 2.00 }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Tiramisu',
    description: 'Dessert italien traditionnel',
    price: 6.00,
    category: 'Desserts',
    available: true,
    restaurantId: '1'
  },
  {
    id: '3',
    name: 'Sashimi Saumon',
    description: 'Saumon frais, 6 pièces',
    price: 15.00,
    category: 'Sashimis',
    available: true,
    restaurantId: '2'
  },
  {
    id: '4',
    name: 'Kebab',
    description: 'Viande grillée, crudités, sauce au choix',
    price: 8.50,
    category: 'Fast Food',
    available: true,
    restaurantId: '3',
    options: [
      {
        id: 'sauce-choice',
        name: 'Choix de sauce',
        type: 'choice',
        isRequired: true,
        maxChoices: 1,
        choices: [
          { id: 'blanche', name: 'Sauce blanche', price: 0 },
          { id: 'harissa', name: 'Sauce harissa', price: 0 },
          { id: 'ketchup', name: 'Ketchup', price: 0 },
          { id: 'mayo', name: 'Mayonnaise', price: 0 }
        ]
      },
      {
        id: 'remove-vegetables',
        name: 'Retirer des légumes',
        type: 'remove',
        isRequired: false,
        choices: [
          { id: 'no-onions', name: 'Sans oignons', price: 0 },
          { id: 'no-tomatoes', name: 'Sans tomates', price: 0 },
          { id: 'no-lettuce', name: 'Sans salade', price: 0 },
          { id: 'no-pickles', name: 'Sans cornichons', price: 0 }
        ]
      },
      {
        id: 'extra-meat',
        name: 'Supplément viande',
        type: 'extra',
        isRequired: false,
        choices: [
          { id: 'extra-meat', name: 'Supplément viande', price: 3.00 }
        ]
      }
    ]
  }
];

export const mockDashboardStats: DashboardStats = {
  todayOrders: 45,
  todayRevenue: 1250.50,
  activeRestaurants: 12,
  weeklyData: [
    { date: '2024-01-01', orders: 32, revenue: 850 },
    { date: '2024-01-02', orders: 28, revenue: 750 },
    { date: '2024-01-03', orders: 35, revenue: 920 },
    { date: '2024-01-04', orders: 42, revenue: 1100 },
    { date: '2024-01-05', orders: 38, revenue: 980 },
    { date: '2024-01-06', orders: 45, revenue: 1250 },
    { date: '2024-01-07', orders: 40, revenue: 1050 }
  ]
};