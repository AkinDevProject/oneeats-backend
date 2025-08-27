import { useState, useCallback } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  restaurantId: string;
  quantity: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  restaurantId: string;
  category: string;
  description: string;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((menuItem: MenuItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === menuItem.id);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        restaurantId: menuItem.restaurantId,
        quantity: 1,
      }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === itemId);
      
      if (!existingItem) return currentItems;

      if (existingItem.quantity > 1) {
        return currentItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }

      return currentItems.filter(item => item.id !== itemId);
    });
  }, []);

  const getItemQuantity = useCallback((itemId: string) => {
    const item = items.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  }, [items]);

  const getCartItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    items,
    addItem,
    removeItem,
    getItemQuantity,
    getCartItemCount,
    clearCart,
    total,
  };
}