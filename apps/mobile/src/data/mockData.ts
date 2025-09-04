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

// Mock Restaurants Data
export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Bella Italia',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    cuisine: 'Pizza',
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
    cuisine: 'Sushi',
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
    cuisine: 'Burger',
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
    name: 'Istanbul Kebab',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    cuisine: 'Kebab',
    rating: 4.6,
    deliveryTime: '30-40 min',
    deliveryFee: 3.99,
    distance: '1.5 km',
    featured: true,
    isOpen: true,
    description: 'Kebabs authentiques grillés au feu de bois avec sauces maison.',
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

  // Istanbul Kebab (restaurantId: '4') 
  {
    id: '8',
    restaurantId: '4',
    name: 'Kebab Poulet',
    description: 'Émincé de poulet grillé, salade, tomates, oignons',
    price: 8.50,
    image: 'https://images.pexels.com/photos/4952343/pexels-photo-4952343.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
    category: 'Sandwich',
    popular: true,
    available: true,
    options: [
      {
        id: 'kebab-sauces',
        name: 'Choix de sauces',
        type: 'choice',
        isRequired: false,
        maxChoices: 2,
        choices: [
          { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
          { id: 'harissa', name: 'Harissa', price: 0 },
          { id: 'ketchup', name: 'Ketchup', price: 0 },
          { id: 'mayo', name: 'Mayonnaise', price: 0 },
          { id: 'algerienne', name: 'Sauce algérienne', price: 0 }
        ]
      },
      {
        id: 'kebab-sauces-extra',
        name: 'Sauces supplémentaires',
        type: 'extra',
        isRequired: false,
        choices: [
          { id: 'extra-blanche', name: 'Sauce blanche extra', price: 0.50 },
          { id: 'extra-harissa', name: 'Harissa extra', price: 0.50 },
          { id: 'sauce-barbecue', name: 'Sauce barbecue', price: 0.50 },
          { id: 'sauce-curry', name: 'Sauce curry', price: 0.50 }
        ]
      },
      {
        id: 'kebab-remove',
        name: 'Retirer des ingrédients',
        type: 'remove',
        isRequired: false,
        choices: [
          { id: 'sans-salade', name: 'Sans salade', price: 0 },
          { id: 'sans-tomates', name: 'Sans tomates', price: 0 },
          { id: 'sans-oignons', name: 'Sans oignons', price: 0 }
        ]
      },
      {
        id: 'kebab-extras',
        name: 'Suppléments',
        type: 'extra',
        isRequired: false,
        choices: [
          { id: 'double-viande', name: 'Double viande', price: 3.00 },
          { id: 'fromage', name: 'Fromage', price: 1.50 },
          { id: 'frites-kebab', name: 'Frites dans le kebab', price: 2.00 }
        ]
      }
    ]
  },
  {
    id: '9',
    restaurantId: '4',
    name: 'Kebab Agneau',
    description: 'Émincé d\'agneau grillé, salade, tomates, oignons',
    price: 9.50,
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
    category: 'Sandwich',
    popular: true,
    available: true,
    options: [
      {
        id: 'agneau-sauces',
        name: 'Choix de sauces',
        type: 'choice',
        isRequired: false,
        maxChoices: 2,
        choices: [
          { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
          { id: 'harissa', name: 'Harissa', price: 0 },
          { id: 'ketchup', name: 'Ketchup', price: 0 },
          { id: 'mayo', name: 'Mayonnaise', price: 0 },
          { id: 'algerienne', name: 'Sauce algérienne', price: 0 }
        ]
      },
      {
        id: 'agneau-sauces-extra',
        name: 'Sauces supplémentaires',
        type: 'extra',
        isRequired: false,
        choices: [
          { id: 'extra-blanche', name: 'Sauce blanche extra', price: 0.50 },
          { id: 'extra-harissa', name: 'Harissa extra', price: 0.50 },
          { id: 'sauce-barbecue', name: 'Sauce barbecue', price: 0.50 }
        ]
      },
      {
        id: 'agneau-remove',
        name: 'Retirer des ingrédients',
        type: 'remove',
        isRequired: false,
        choices: [
          { id: 'sans-salade', name: 'Sans salade', price: 0 },
          { id: 'sans-tomates', name: 'Sans tomates', price: 0 },
          { id: 'sans-oignons', name: 'Sans oignons', price: 0 }
        ]
      },
      {
        id: 'agneau-extras',
        name: 'Suppléments',
        type: 'extra',
        isRequired: false,
        choices: [
          { id: 'double-viande', name: 'Double viande', price: 4.00 },
          { id: 'fromage', name: 'Fromage', price: 1.50 },
          { id: 'frites-kebab', name: 'Frites dans le kebab', price: 2.00 }
        ]
      }
    ]
  },
  {
    id: '10',
    restaurantId: '4',
    name: 'Durum Poulet',
    description: 'Kebab roulé dans une galette, poulet, crudités',
    price: 9.00,
    image: 'https://images.pexels.com/photos/7627416/pexels-photo-7627416.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
    category: 'Sandwich',
    popular: false,
    available: true,
    options: [
      {
        id: 'durum-sauces',
        name: 'Choix de sauces',
        type: 'choice',
        isRequired: true,
        maxChoices: 1,
        choices: [
          { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
          { id: 'harissa', name: 'Harissa', price: 0 },
          { id: 'ketchup', name: 'Ketchup', price: 0 },
          { id: 'mayo', name: 'Mayonnaise', price: 0 }
        ]
      },
      {
        id: 'durum-extras',
        name: 'Suppléments',
        type: 'extra',
        isRequired: false,
        choices: [
          { id: 'double-viande', name: 'Double viande', price: 3.50 },
          { id: 'fromage', name: 'Fromage', price: 1.50 }
        ]
      }
    ]
  },
  {
    id: '11',
    restaurantId: '4',
    name: 'Assiette Kebab',
    description: 'Émincé de poulet, riz, salade, frites',
    price: 12.50,
    image: 'https://images.pexels.com/photos/10966186/pexels-photo-10966186.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
    category: 'Plat',
    popular: false,
    available: true,
    options: [
      {
        id: 'assiette-viande',
        name: 'Choix de viande',
        type: 'choice',
        isRequired: true,
        maxChoices: 1,
        choices: [
          { id: 'poulet', name: 'Poulet', price: 0 },
          { id: 'agneau', name: 'Agneau', price: 2.00 },
          { id: 'mixte', name: 'Mixte (Poulet + Agneau)', price: 1.50 }
        ]
      },
      {
        id: 'assiette-accompagnement',
        name: 'Accompagnement',
        type: 'choice',
        isRequired: true,
        maxChoices: 1,
        choices: [
          { id: 'riz-frites', name: 'Riz + Frites', price: 0 },
          { id: 'double-riz', name: 'Double riz', price: 0 },
          { id: 'double-frites', name: 'Double frites', price: 1.00 }
        ]
      },
      {
        id: 'assiette-sauces',
        name: 'Sauces',
        type: 'extra',
        isRequired: false,
        choices: [
          { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.50 },
          { id: 'harissa', name: 'Harissa', price: 0.50 },
          { id: 'ketchup', name: 'Ketchup', price: 0 }
        ]
      }
    ]
  },
  {
    id: '12',
    restaurantId: '4',
    name: 'Frites Kebab',
    description: 'Frites maison avec émincé de viande et sauce',
    price: 7.50,
    image: 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
    category: 'Plat',
    popular: false,
    available: true,
    options: [
      {
        id: 'frites-viande',
        name: 'Choix de viande',
        type: 'choice',
        isRequired: false,
        maxChoices: 1,
        choices: [
          { id: 'poulet', name: 'Poulet', price: 0 },
          { id: 'agneau', name: 'Agneau', price: 1.50 },
          { id: 'sans-viande', name: 'Sans viande', price: -2.00 }
        ]
      },
      {
        id: 'frites-sauce',
        name: 'Sauce incluse',
        type: 'choice',
        isRequired: true,
        maxChoices: 1,
        choices: [
          { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
          { id: 'ketchup', name: 'Ketchup', price: 0 },
          { id: 'mayo', name: 'Mayonnaise', price: 0 }
        ]
      }
    ]
  },
  {
    id: '13',
    restaurantId: '4',
    name: 'Boisson',
    description: 'Coca, Fanta, Sprite, Eau',
    price: 2.50,
    image: 'https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
    category: 'Boisson',
    popular: false,
    available: true,
    options: [
      {
        id: 'boisson-choix',
        name: 'Choix de boisson',
        type: 'choice',
        isRequired: true,
        maxChoices: 1,
        choices: [
          { id: 'coca', name: 'Coca-Cola', price: 0 },
          { id: 'fanta', name: 'Fanta Orange', price: 0 },
          { id: 'sprite', name: 'Sprite', price: 0 },
          { id: 'eau', name: 'Eau minérale', price: -0.50 }
        ]
      }
    ]
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
  { id: 'all', name: 'Toutes', icon: '🍽️' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'kebab', name: 'Kebab', icon: '🥙' },
  { id: 'burger', name: 'Burger', icon: '🍔' },
  { id: 'brochette', name: 'Brochettes', icon: '🍢' },
  { id: 'tacos', name: 'Tacos', icon: '🌮' },
  { id: 'sushi', name: 'Sushi', icon: '🍣' },
  { id: 'healthy', name: 'Healthy', icon: '🥗' },
  { id: 'dessert', name: 'Desserts', icon: '🍰' },
];

// Mock Orders
export const generateMockOrder = (
  restaurantId: string, 
  items: CartItem[], 
  customerData?: { 
    customerName?: string; 
    customerPhone?: string; 
    pickupTime?: string;
  }
): Order => {
  const restaurant = mockRestaurants.find(r => r.id === restaurantId)!;
  const total = items.reduce((sum, item) => sum + (item.totalPrice || item.menuItem.price * item.quantity), 0);
  
  // Parse pickup time or default to 30 minutes from now
  let pickupTime: Date;
  if (customerData?.pickupTime) {
    const [hours, minutes] = customerData.pickupTime.split(':');
    pickupTime = new Date();
    pickupTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    // If pickup time is in the past, add a day
    if (pickupTime < new Date()) {
      pickupTime.setDate(pickupTime.getDate() + 1);
    }
  } else {
    pickupTime = new Date(Date.now() + 30 * 60 * 1000);
  }
  
  return {
    id: Math.random().toString(36).substring(7),
    restaurantId,
    restaurant,
    items,
    status: 'pending',
    total,
    orderTime: new Date(),
    pickupTime,
    customerName: customerData?.customerName,
    customerPhone: customerData?.customerPhone,
  };
};