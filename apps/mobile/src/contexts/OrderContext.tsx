import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order } from '../data/mockData';
import { useAuth } from './AuthContext';
import apiService from '../services/api';
import { ENV } from '../config/env';

// Fonction pour mapper les statuts API vers les statuts mobile
const mapApiStatusToMobileStatus = (apiStatus: string): Order['status'] => {
  switch (apiStatus) {
    case 'EN_ATTENTE': return 'pending';
    case 'EN_PREPARATION': return 'preparing';
    case 'PRETE': return 'ready';
    case 'RECUPEREE': return 'completed';
    case 'ANNULEE': return 'cancelled';
    default: return 'pending';
  }
};

// Fonction pour obtenir le nom du restaurant par ID
const getRestaurantName = (restaurantId: string): string => {
  switch (restaurantId) {
    case '11111111-1111-1111-1111-111111111111': return 'Pizza Palace';
    case '22222222-2222-2222-2222-222222222222': return 'Burger House';
    case '33333333-3333-3333-3333-333333333333': return 'Sushi Express';
    default: return 'Restaurant';
  }
};

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrderById: (orderId: string) => Order | undefined;
  clearOrders: () => void;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      
      if (user) {
        // Charger depuis l'API
        console.log('🔄 Loading orders for user:', user.id);
        const apiOrders = await apiService.orders.getByUserId(user.id);
        console.log('🎯 API returned orders:', apiOrders);
        
        // Créer une map des restaurants pour éviter de multiples requêtes
        const restaurantMap = new Map();
        
        const processedOrders = apiOrders.map((order: any) => ({
          ...order,
          orderTime: new Date(order.createdAt || order.orderTime),
          pickupTime: new Date(order.estimatedPickupTime || order.pickupTime),
          total: order.totalAmount || order.total,
          status: mapApiStatusToMobileStatus(order.status),
          // Créer un objet restaurant minimal pour la compatibilité
          restaurant: {
            id: order.restaurantId,
            name: getRestaurantName(order.restaurantId),
            image: 'https://via.placeholder.com/400x300',
            cuisine: 'Restaurant',
            rating: 4.5,
            deliveryTime: '20-30 min',
            deliveryFee: 2.99,
            distance: '1.2 km',
            featured: false,
            isOpen: true,
            description: 'Restaurant',
          }
        }));
        console.log('✅ Processed orders:', processedOrders);
        setOrders(processedOrders);
        
        // Sauvegarder en cache local
        await AsyncStorage.setItem(getOrdersKey(), JSON.stringify(processedOrders));
      } else {
        // Mode fallback - charger depuis AsyncStorage
        const ordersData = await AsyncStorage.getItem(getOrdersKey());
        if (ordersData) {
          const parsedOrders = JSON.parse(ordersData).map((order: any) => ({
            ...order,
            orderTime: new Date(order.orderTime),
            pickupTime: new Date(order.pickupTime),
          }));
          setOrders(parsedOrders);
        }
      }
    } catch (apiError) {
      console.error('Error loading orders from API:', apiError);
      setError('Erreur de chargement des commandes');
      
      // Fallback vers le cache local
      try {
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
        console.error('Error loading orders from cache:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getOrdersKey, user]);

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

  const addOrder = useCallback(async (order: Order) => {
    try {
      setError(null);
      
      // Créer la commande via l'API
      const createdOrder = await apiService.orders.create({
        restaurantId: order.restaurantId,
        items: order.items,
        total: order.total,
        pickupTime: order.pickupTime,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerNotes: order.customerNotes,
      });
      
      // Ajouter la commande créée à la liste locale
      const processedOrder = {
        ...createdOrder,
        orderTime: new Date(createdOrder.createdAt || createdOrder.orderTime),
        pickupTime: new Date(createdOrder.pickupTime),
      };
      
      setOrders(currentOrders => [processedOrder, ...currentOrders]);
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Erreur lors de la création de la commande');
      
      // Fallback - ajouter localement seulement
      setOrders(currentOrders => [order, ...currentOrders]);
      throw error;
    }
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

  const refreshOrders = useCallback(async () => {
    await loadOrders();
  }, [loadOrders]);

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
    error,
    addOrder,
    updateOrderStatus,
    getOrderById,
    clearOrders,
    refreshOrders,
  }), [orders, currentOrder, isLoading, error, addOrder, updateOrderStatus, getOrderById, clearOrders, refreshOrders]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};