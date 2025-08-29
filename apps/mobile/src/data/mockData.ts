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

// Mock Restaurants Data
export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Bella Italia',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    cuisine: 'Italien',
    rating: 4.5,
    deliveryTime: '20-30 min',
    deliveryFee: 2.99,
    distance: '1.2 km',
    featured: true,
    isOpen: true,
    description: 'Authentique cuisine italienne avec des pâtes fraîches et des pizzas au feu de bois.',
  },
  {
    id: '2',
    name: 'Sushi Master',
    image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    cuisine: 'Japonais',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: 3.49,
    distance: '0.8 km',
    featured: true,
    isOpen: true,
    description: 'Sushi frais et authentique préparé par nos chefs japonais.',
  },
  {
    id: '3',
    name: 'Burger Palace',
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    cuisine: 'Américain',
    rating: 4.3,
    deliveryTime: '15-25 min',
    deliveryFee: 2.49,
    distance: '2.1 km',
    featured: false,
    isOpen: true,
    description: 'Des burgers gourmets avec des ingrédients frais et locaux.',
  },
  {
    id: '4',
    name: 'Le Petit Bistro',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    cuisine: 'Français',
    rating: 4.6,
    deliveryTime: '30-40 min',
    deliveryFee: 3.99,
    distance: '1.5 km',
    featured: true,
    isOpen: true,
    description: 'Cuisine française traditionnelle dans une ambiance chaleureuse.',
  },
  {
    id: '5',
    name: 'Dragon Wok',
    image: 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    cuisine: 'Chinois',
    rating: 4.2,
    deliveryTime: '20-30 min',
    deliveryFee: 2.99,
    distance: '1.8 km',
    featured: false,
    isOpen: true,
    description: 'Authentique cuisine chinoise avec des plats wok savoureux.',
  },
  {
    id: '6',
    name: 'Taco Loco',
    image: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    cuisine: 'Mexicain',
    rating: 4.4,
    deliveryTime: '15-25 min',
    deliveryFee: 2.49,
    distance: '1.0 km',
    featured: false,
    isOpen: false,
    description: 'Tacos authentiques et burritos préparés avec des épices mexicaines.',
  },
];

// Mock Menu Items
export const mockMenuItems: MenuItem[] = [
  // Bella Italia
  {
    id: '1',
    restaurantId: '1',
    name: 'Pizza Margherita',
    description: 'Tomate, mozzarella di bufala, basilic frais',
    price: 14.90,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
    category: 'Pizza',
    popular: true,
    available: true,
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
    restaurantId: '1',
    name: 'Spaghetti Carbonara',
    description: 'Pâtes fraîches, bacon, œuf, parmesan, poivre noir',
    price: 16.50,
    image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
    category: 'Pâtes',
    popular: true,
    available: true,
  },
  {
    id: '3',
    restaurantId: '1',
    name: 'Tiramisu',
    description: 'Dessert italien traditionnel au café et mascarpone',
    price: 6.90,
    image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
    category: 'Dessert',
    popular: false,
    available: true,
  },
  // Sushi Master
  {
    id: '4',
    restaurantId: '2',
    name: 'Sushi Saumon',
    description: 'Saumon frais, riz vinaigré, wasabi',
    price: 18.50,
    image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
    category: 'Sushi',
    popular: true,
    available: true,
  },
  {
    id: '5',
    restaurantId: '2',
    name: 'Ramen Tonkotsu',
    description: 'Bouillon de porc, nouilles, œuf mollet, oignon vert',
    price: 15.90,
    image: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
    category: 'Ramen',
    popular: true,
    available: true,
  },
  // Burger Palace
  {
    id: '6',
    restaurantId: '3',
    name: 'Classic Burger',
    description: 'Bœuf fermier, cheddar, salade, tomate, oignon',
    price: 12.90,
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
    category: 'Burger',
    popular: true,
    available: true,
    options: [
      {
        id: 'cuisson',
        name: 'Cuisson de la viande',
        type: 'choice',
        isRequired: true,
        maxChoices: 1,
        choices: [
          { id: 'saignant', name: 'Saignant', price: 0 },
          { id: 'a-point', name: 'À point', price: 0 },
          { id: 'bien-cuit', name: 'Bien cuit', price: 0 }
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
          { id: 'no-lettuce', name: 'Sans salade', price: 0 }
        ]
      },
      {
        id: 'extra-toppings',
        name: 'Suppléments',
        type: 'extra',
        isRequired: false,
        choices: [
          { id: 'bacon', name: 'Bacon', price: 2.50 },
          { id: 'avocado', name: 'Avocat', price: 2.00 },
          { id: 'extra-cheese', name: 'Fromage supplémentaire', price: 1.50 }
        ]
      }
    ]
  },
  {
    id: '7',
    restaurantId: '3',
    name: 'Frites Maison',
    description: 'Pommes de terre fraîches, sel de mer',
    price: 4.50,
    image: 'https://images.pexels.com/photos/115740/pexels-photo-115740.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
    category: 'Accompagnement',
    popular: false,
    available: true,
  },
];

// Mock User
export const mockUser: User = {
  id: '1',
  name: 'Marie Dubois',
  email: 'marie.dubois@gmail.com',
  phone: '+33 6 12 34 56 78',
  avatar: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  favoriteRestaurants: ['1', '2', '4'],
  orders: [],
  isGuest: false,
};

// Cuisine Categories
export const cuisineCategories = [
  { id: 'italian', name: 'Italien', icon: '🍝' },
  { id: 'japanese', name: 'Japonais', icon: '🍣' },
  { id: 'american', name: 'Américain', icon: '🍔' },
  { id: 'french', name: 'Français', icon: '🥖' },
  { id: 'chinese', name: 'Chinois', icon: '🥢' },
  { id: 'mexican', name: 'Mexicain', icon: '🌮' },
  { id: 'indian', name: 'Indien', icon: '🍛' },
  { id: 'thai', name: 'Thaï', icon: '🍜' },
];

// Mock Orders
export const generateMockOrder = (restaurantId: string, items: CartItem[]): Order => {
  const restaurant = mockRestaurants.find(r => r.id === restaurantId)!;
  const total = items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  
  return {
    id: Math.random().toString(36).substring(7),
    restaurantId,
    restaurant,
    items,
    status: 'pending',
    total,
    orderTime: new Date(),
    pickupTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
  };
};