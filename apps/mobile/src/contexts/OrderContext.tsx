import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order } from '../data/mockData';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrderById: (orderId: string) => Order | undefined;
  clearOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Auto-update order statuses (mock simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(currentOrders => 
        currentOrders.map(order => {
          if (order.status === 'pending') {
            // After 2 minutes, move to confirmed
            if (Date.now() - order.orderTime.getTime() > 2 * 60 * 1000) {
              return { ...order, status: 'confirmed' as const };
            }
          } else if (order.status === 'confirmed') {
            // After 5 minutes total, move to preparing
            if (Date.now() - order.orderTime.getTime() > 5 * 60 * 1000) {
              return { ...order, status: 'preparing' as const };
            }
          } else if (order.status === 'preparing') {
            // After 15 minutes total, move to ready
            if (Date.now() - order.orderTime.getTime() > 15 * 60 * 1000) {
              return { ...order, status: 'ready' as const };
            }
          }
          return order;
        })
      );
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getOrdersKey = useCallback(() => {
    return user ? `orders_${user.id}` : 'orders_guest';
  }, [user]);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const ordersData = await AsyncStorage.getItem(getOrdersKey());
      if (ordersData) {
        const parsedOrders = JSON.parse(ordersData).map((order: any) => ({
          ...order,
          orderTime: new Date(order.orderTime),
          pickupTime: new Date(order.pickupTime),
        }));
        setOrders(parsedOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getOrdersKey]);

  const saveOrders = useCallback(async () => {
    try {
      if (user && !isLoading) {
        await AsyncStorage.setItem(getOrdersKey(), JSON.stringify(orders));
      }
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }, [user, isLoading, orders, getOrdersKey]);

  // useEffect hooks that depend on the functions above
  useEffect(() => {
    loadOrders();
  }, [user, loadOrders]);

  useEffect(() => {
    saveOrders();
  }, [orders, user, saveOrders]);

  const addOrder = useCallback((order: Order) => {
    setOrders(currentOrders => [order, ...currentOrders]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(currentOrders =>
      currentOrders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status };
          
          // Émettre un événement pour déclencher les notifications push
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('orderStatusUpdated', {
              detail: { orderId, status, restaurantName: order.restaurant.name }
            });
            window.dispatchEvent(event);
          } else {
            // Pour React Native - On peut utiliser console.log pour le moment
            console.log('Order status updated:', { orderId, status, restaurantName: order.restaurant.name });
          }
          
          return updatedOrder;
        }
        return order;
      })
    );
  }, []);

  const getOrderById = useCallback((orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  const clearOrders = useCallback(() => {
    setOrders([]);
  }, []);

  // Get current active order (most recent non-completed order)
  const currentOrder = useMemo(() => {
    return orders.find(order => 
      ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
    ) || null;
  }, [orders]);

  const value = useMemo<OrderContextType>(() => ({
    orders,
    currentOrder,
    isLoading,
    addOrder,
    updateOrderStatus,
    getOrderById,
    clearOrders,
  }), [orders, currentOrder, isLoading, addOrder, updateOrderStatus, getOrderById, clearOrders]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};