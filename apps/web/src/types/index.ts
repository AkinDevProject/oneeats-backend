export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'restaurant';
  createdAt: Date;
  ordersCount?: number;
  status?: 'active' | 'inactive';
}

export interface Restaurant {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  logo?: string;
  category: string;
  registrationDate: Date;
  status: 'pending' | 'approved' | 'blocked';
  isOpen: boolean;
  schedule: {
    [key: string]: { open: string; close: string } | null;
  };
}

export interface MenuItemOption {
  id: string;
  name: string;
  type: 'remove' | 'choice' | 'extra';
  isRequired?: boolean;
  maxChoices?: number;
  choices: MenuItemChoice[];
}

export interface MenuItemChoice {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  restaurantId: string;
  options?: MenuItemOption[];
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  clientName: string;
  clientEmail: string;
  items: OrderItem[];
  total: number;
  status: 'en_attente' | 'en_preparation' | 'prete' | 'recuperee' | 'annulee';
  createdAt: Date;
  estimatedTime?: number;
}

export interface OrderItemOption {
  optionId: string;
  optionName: string;
  choices: {
    choiceId: string;
    choiceName: string;
    price: number;
  }[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  options?: OrderItemOption[];
  totalPrice: number;
}

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  activeRestaurants: number;
  weeklyData: { date: string; orders: number; revenue: number }[];
}