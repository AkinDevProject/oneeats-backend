export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
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

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  restaurantId: string;
  status: OrderStatus;
  totalAmount: number;
  specialInstructions?: string;
  estimatedPickupTime?: Date;
  actualPickupTime?: Date;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
  // Enriched client data
  clientFirstName?: string;
  clientLastName?: string;
  clientEmail?: string;
  clientPhone?: string;
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
  menuItemName: string;
  unitPrice: number;
  quantity: number;
  specialNotes?: string;
  subtotal: number;
}

export interface UpdateOrderStatusRequest {
  newStatus: OrderStatus;
}

export interface CreateOrderRequest {
  userId: string;
  restaurantId: string;
  items: CreateOrderItemRequest[];
  specialInstructions?: string;
}

export interface CreateOrderItemRequest {
  menuItemId: string;
  quantity: number;
  specialNotes?: string;
}

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  activeRestaurants: number;
  weeklyData: { date: string; orders: number; revenue: number }[];
}

export interface DailyStats {
  date: string;
  orders: number;
  revenue: number;
  newUsers: number;
  activeRestaurants: number;
}

export interface TopRestaurant {
  id: string;
  name: string;
  cuisineType: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  rating: number;
  imageUrl?: string;
}

export interface PopularItem {
  id: string;
  name: string;
  category: string;
  restaurantName: string;
  totalQuantity: number;
  totalOrders: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface PlatformStats {
  totalRestaurants: number;
  activeRestaurants: number;
  pendingRestaurants: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  monthOrders: number;
  monthRevenue: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
  topRestaurants: TopRestaurant[];
  popularItems: PopularItem[];
  dailyStats: DailyStats[];
}

export interface RevenueData {
  revenue: number;
  orders: number;
}

export interface TrendsData {
  dailyStats: DailyStats[];
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
}