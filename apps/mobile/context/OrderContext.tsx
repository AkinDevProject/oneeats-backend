import React, { createContext, useContext, useState } from 'react';
import { CartItem } from './CartContext';

export interface Order {
  id: string;
  items: CartItem[];
  restaurantName: string;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  orderTime: Date;
  estimatedTime?: Date;
  type: 'takeaway' | 'dine-in';
}

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (items: CartItem[], type: 'takeaway' | 'dine-in') => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const createOrder = (items: CartItem[], type: 'takeaway' | 'dine-in'): string => {
    const orderId = Date.now().toString();
    const restaurantName = items[0]?.restaurantName || 'Unknown Restaurant';
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const newOrder: Order = {
      id: orderId,
      items,
      restaurantName,
      total,
      status: 'pending',
      orderTime: new Date(),
      estimatedTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      type
    };

    setOrders(currentOrders => [...currentOrders, newOrder]);
    setCurrentOrder(newOrder);
    
    // Simulate order progression
    setTimeout(() => updateOrderStatus(orderId, 'preparing'), 2000);
    setTimeout(() => updateOrderStatus(orderId, 'ready'), 15000);
    
    return orderId;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
    
    if (currentOrder?.id === orderId) {
      setCurrentOrder(current => current ? { ...current, status } : null);
    }
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  return (
    <OrderContext.Provider value={{
      orders,
      currentOrder,
      createOrder,
      updateOrderStatus,
      getOrderById
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};