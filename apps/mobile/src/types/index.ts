// Types pour l'application mobile OneEats

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  distance: string;
  featured: boolean;
  isOpen: boolean;
  description: string;
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
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular: boolean;
  available: boolean;
  options?: MenuItemOption[];
}

export interface CartItemOption {
  optionId: string;
  optionName: string;
  choices: {
    choiceId: string;
    choiceName: string;
    price: number;
  }[];
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  options?: CartItemOption[];
  totalPrice: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurant: Restaurant;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: number;
  orderTime: Date;
  pickupTime: Date;
  customerName?: string;
  customerPhone?: string;
  customerNotes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  favoriteRestaurants: string[];
  orders: Order[];
  isGuest: boolean;
}

// Type pour les catégories de cuisine
export interface CuisineCategory {
  id: string;
  name: string;
  icon: string;
}
