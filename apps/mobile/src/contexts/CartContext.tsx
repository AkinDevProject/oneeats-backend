import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, MenuItem, Order, generateMockOrder, CartItemOption } from '../data/mockData';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (menuItem: MenuItem | (MenuItem & { options?: CartItemOption[], totalPrice?: number, quantity?: number }), quantity?: number, specialInstructions?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (restaurantId: string, customerNotes?: string) => Promise<Order | null>;
  getItemQuantity: (menuItemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    loadCart();
  }, [user]);

  useEffect(() => {
    saveCart();
  }, [items, user]);

  const getCartKey = () => {
    return user ? `cart_${user.id}` : 'cart_guest';
  };

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(getCartKey());
      if (cartData) {
        setItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      if (user) {
        await AsyncStorage.setItem(getCartKey(), JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addItem = (menuItem: MenuItem | (MenuItem & { options?: CartItemOption[], totalPrice?: number, quantity?: number }), quantity?: number, specialInstructions?: string) => {
    setItems(currentItems => {
      // Extract options and totalPrice from menuItem if they exist
      const itemOptions = 'options' in menuItem ? menuItem.options : undefined;
      const itemTotalPrice = 'totalPrice' in menuItem ? menuItem.totalPrice : undefined;
      const itemQuantity = quantity || ('quantity' in menuItem ? menuItem.quantity : undefined) || 1;
      
      // Create a clean MenuItem object
      const cleanMenuItem: MenuItem = {
        id: menuItem.id,
        restaurantId: menuItem.restaurantId,
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        image: menuItem.image,
        category: menuItem.category,
        popular: menuItem.popular,
        available: menuItem.available,
        options: menuItem.options,
      };

      // For items with options, each combination of options should be a separate cart item
      const optionsKey = itemOptions ? JSON.stringify(itemOptions) : '';
      const existingItemIndex = currentItems.findIndex(
        item => item.menuItem.id === menuItem.id && 
                item.specialInstructions === specialInstructions &&
                JSON.stringify(item.options || []) === optionsKey
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += itemQuantity;
        return updatedItems;
      } else {
        // Calculate total price
        let calculatedTotalPrice = cleanMenuItem.price;
        if (itemOptions) {
          itemOptions.forEach(option => {
            option.choices.forEach(choice => {
              calculatedTotalPrice += choice.price;
            });
          });
        }
        calculatedTotalPrice *= itemQuantity;

        // Add new item
        const newItem: CartItem = {
          id: Math.random().toString(36).substring(7),
          menuItem: cleanMenuItem,
          quantity: itemQuantity,
          specialInstructions,
          options: itemOptions,
          totalPrice: itemTotalPrice || calculatedTotalPrice,
        };
        return [...currentItems, newItem];
      }
    });
  };

  const removeItem = (itemId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const createOrder = async (restaurantId: string, customerNotes?: string): Promise<Order | null> => {
    if (items.length === 0) return null;

    try {
      const order = generateMockOrder(restaurantId, items);
      if (customerNotes) {
        order.customerNotes = customerNotes;
      }

      // In a real app, you would send this to your API
      clearCart();
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  };

  const getItemQuantity = (menuItemId: string) => {
    const item = items.find(i => i.menuItem.id === menuItemId);
    return item ? item.quantity : 0;
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => {
    if (item.totalPrice) {
      return total + item.totalPrice;
    }
    // Fallback calculation if totalPrice is not set
    let itemPrice = item.menuItem.price;
    if (item.options) {
      item.options.forEach(option => {
        option.choices.forEach(choice => {
          itemPrice += choice.price;
        });
      });
    }
    return total + (itemPrice * item.quantity);
  }, 0);

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    createOrder,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
