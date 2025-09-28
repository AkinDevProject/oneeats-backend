export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'restaurant';
  createdAt: Date;
  ordersCount?: number;
  status?: 'active' | 'inactive';
  restaurantId?: string; // Pour les users de type restaurant
}

export interface DaySchedule {
  openTime: string;
  closeTime: string;
}

export interface Schedule {
  monday: DaySchedule | null;
  tuesday: DaySchedule | null;
  wednesday: DaySchedule | null;
  thursday: DaySchedule | null;
  friday: DaySchedule | null;
  saturday: DaySchedule | null;
  sunday: DaySchedule | null;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisineType: string;
  category: string;                    // Mapping depuis cuisineType
  rating: number;
  imageUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'BLOCKED';
  isOpen: boolean;
  isActive: boolean;
  schedule: Schedule;
  registrationDate: Date;              // Mapping depuis createdAt
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItemOption {
  id: string;
  name: string;
  type: 'CHOICE' | 'EXTRA' | 'MODIFICATION' | 'COOKING' | 'SAUCE';
  isRequired?: boolean;
  maxChoices?: number;
  displayOrder?: number;
  choices: MenuItemChoice[];
}

export interface MenuItemChoice {
  id: string;
  name: string;
  price: number;
  additionalPrice?: number;
  displayOrder?: number;
  isAvailable?: boolean;
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
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
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