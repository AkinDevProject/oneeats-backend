import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, Restaurant } from '../types';
import { useAuth } from './AuthContext';
import apiService from '../services/api';
import { ENV } from '../config/env';
import { usePushNotifications } from './PushNotificationContext';

// Fonction pour mapper les statuts API vers les statuts mobile
const mapApiStatusToMobileStatus = (apiStatus: string): Order['status'] => {
  switch (apiStatus) {
    case 'PENDING': return 'pending';
    case 'CONFIRMED': return 'confirmed';
    case 'PREPARING': return 'preparing';
    case 'READY': return 'ready';
    case 'COMPLETED': return 'completed';
    case 'CANCELLED': return 'cancelled';
    // Support des anciens formats si nécessaire
    case 'EN_ATTENTE': return 'pending';
    case 'EN_PREPARATION': return 'preparing';
    case 'PRETE': return 'ready';
    case 'RECUPEREE': return 'completed';
    case 'ANNULEE': return 'cancelled';
    default: return 'pending';
  }
};

// Cache global des restaurants pour éviter les requêtes répétées
const restaurantCache = new Map<string, Restaurant>();

// Fonction pour créer un objet Restaurant par défaut
const createDefaultRestaurant = (restaurantId: string, name?: string): Restaurant => ({
  id: restaurantId,
  name: name || 'Restaurant',
  image: 'https://via.placeholder.com/400x300',
  cuisine: 'Restaurant',
  rating: 4.5,
  deliveryTime: '20-30 min',
  deliveryFee: 2.99,
  distance: '1.2 km',
  featured: false,
  isOpen: true,
  description: 'Restaurant',
});

// Fonction async pour récupérer les infos d'un restaurant (avec cache)
const fetchRestaurantDetails = async (restaurantId: string): Promise<Restaurant> => {
  // Vérifier le cache d'abord
  if (restaurantCache.has(restaurantId)) {
    return restaurantCache.get(restaurantId)!;
  }

  try {
    const data = await apiService.restaurants.getById(restaurantId);
    const restaurant: Restaurant = {
      id: data.id,
      name: data.name,
      image: data.imageUrl || data.logo || 'https://via.placeholder.com/400x300',
      cuisine: data.cuisineType || data.category || 'Restaurant',
      rating: data.rating || 4.5,
      deliveryTime: '20-30 min',
      deliveryFee: 2.99,
      distance: '1.2 km',
      featured: false,
      isOpen: data.isOpen ?? true,
      description: data.description || 'Restaurant',
    };

    // Mettre en cache
    restaurantCache.set(restaurantId, restaurant);
    return restaurant;
  } catch (error) {
    console.warn(`Failed to fetch restaurant ${restaurantId}:`, error);
    // Retourner un restaurant par défaut en cas d'erreur
    return createDefaultRestaurant(restaurantId);
  }
};

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  addOrder: (order: Order) => Promise<Order>;
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
  const { sendOrderStatusNotification } = usePushNotifications();

  // Auto-refresh orders from API to get real-time updates
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Only start polling if user is authenticated and has orders
    if (user && orders.length > 0) {
      intervalId = setInterval(async () => {
        // Only refresh if there are active orders
        const hasActiveOrders = orders.some(order =>
          ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
        );

        if (hasActiveOrders) {
          console.log('🔄 Polling for order status updates...');
          try {
            // Refresh orders silently (without loading state)
            const userId = user.id || ENV.DEV_USER_ID;
            const apiOrders = await apiService.orders.getByUserId(userId);

            // Pré-charger les restaurants en parallèle
            const restaurantIds = [...new Set(apiOrders.map((o: any) => o.restaurantId))];
            await Promise.all(restaurantIds.map(id => fetchRestaurantDetails(id)));

            const processedOrders = apiOrders.map((order: any) => ({
              ...order,
              orderTime: new Date(order.createdAt || order.orderTime),
              pickupTime: new Date(order.estimatedPickupTime || order.pickupTime),
              total: order.totalAmount || order.total,
              status: mapApiStatusToMobileStatus(order.status),
              items: order.items?.map((item: any) => ({
                ...item,
                menuItem: {
                  id: item.menuItemId,
                  name: item.menuItemName,
                  price: item.unitPrice,
                  restaurantId: order.restaurantId,
                },
                totalPrice: item.subtotal || item.totalPrice,
                specialInstructions: item.specialNotes || item.specialInstructions,
              })) || [],
              // Utiliser le cache de restaurants
              restaurant: restaurantCache.get(order.restaurantId) || createDefaultRestaurant(order.restaurantId),
            }));

            // Check for status changes to trigger notifications
            const oldOrders = orders;
            processedOrders.forEach(newOrder => {
              const oldOrder = oldOrders.find(o => o.id === newOrder.id);
              if (oldOrder && oldOrder.status !== newOrder.status) {
                console.log(`📱 Order ${newOrder.id} status changed: ${oldOrder.status} → ${newOrder.status}`);

                // Trigger push notification for status change
                sendOrderStatusNotification(newOrder.id, newOrder.status, newOrder.restaurant.name);
              }
            });

            setOrders(processedOrders);

          } catch (error) {
            console.error('Error polling order updates:', error);
          }
        }
      }, 15000); // Poll every 15 seconds for active orders
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user, orders.length, orders]);

  const getOrdersKey = useCallback(() => {
    return user ? `orders_${user.id}` : 'orders_guest';
  }, [user]);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // FORCE RESET CACHE - Vider AsyncStorage pour forcer le rechargement
      await AsyncStorage.removeItem(getOrdersKey());
      console.log('🧹 Cache cleared, forcing fresh data load');

      if (user) {
        // Charger depuis l'API
        console.log('🔄 Loading orders for user:', user.id);
        const userId = user.id || ENV.DEV_USER_ID;
        console.log('🎯 Using userId for orders request:', userId);
        const apiOrders = await apiService.orders.getByUserId(userId);
        console.log('🎯 API returned orders:', apiOrders);

        // Pré-charger les restaurants en parallèle pour remplir le cache
        const restaurantIds = [...new Set(apiOrders.map((o: any) => o.restaurantId))];
        console.log('🏪 Pre-loading restaurants:', restaurantIds);
        await Promise.all(restaurantIds.map(id => fetchRestaurantDetails(id)));

        const processedOrders = apiOrders.map((order: any) => ({
          ...order,
          orderTime: new Date(order.createdAt || order.orderTime),
          pickupTime: new Date(order.estimatedPickupTime || order.pickupTime),
          total: order.totalAmount || order.total,
          status: mapApiStatusToMobileStatus(order.status),
          // Adapter les items de l'API au format mobile
          items: order.items?.map((item: any) => ({
            ...item,
            menuItem: {
              id: item.menuItemId,
              name: item.menuItemName,
              price: item.unitPrice,
              restaurantId: order.restaurantId,
            },
            totalPrice: item.subtotal || item.totalPrice,
            specialInstructions: item.specialNotes || item.specialInstructions,
          })) || [],
          // Utiliser le cache de restaurants (pré-chargé ci-dessus)
          restaurant: restaurantCache.get(order.restaurantId) || createDefaultRestaurant(order.restaurantId),
        }));
        console.log('✅ Processed orders:', processedOrders);
        console.log('🔍 Orders count:', processedOrders.length);
        processedOrders.forEach((order, index) => {
          console.log(`📦 Order ${index + 1}:`, {
            id: order.id,
            status: order.status,
            total: order.total,
            restaurant: order.restaurant?.name
          });
        });
        setOrders(processedOrders);
        
        // Sauvegarder en cache local
        await AsyncStorage.setItem(getOrdersKey(), JSON.stringify(processedOrders));
      } else {
        // Utilisateur non connecte - vider les commandes
        // (le cache a ete efface au logout, donc on ne devrait rien trouver)
        setOrders([]);
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

      // La commande a deja ete creee par CartContext.createOrder()
      // Ici on l'ajoute simplement a la liste locale des commandes

      // Charger les details du restaurant si pas deja present
      let restaurant = order.restaurant;
      if (!restaurant && order.restaurantId) {
        restaurant = await fetchRestaurantDetails(order.restaurantId);
      }

      // Preparer la commande avec les donnees restaurant
      const processedOrder: Order = {
        ...order,
        orderTime: order.orderTime instanceof Date ? order.orderTime : new Date(order.orderTime || order.createdAt),
        status: order.status,
        restaurant: restaurant || {
          id: order.restaurantId,
          name: order.restaurantName || 'Restaurant',
          image: '',
          cuisine: '',
          rating: 0,
          deliveryTime: '',
          deliveryFee: 0,
          distance: '',
          featured: false,
          isOpen: true,
        },
      };

      console.log('✅ Adding order to local list:', processedOrder.id);
      setOrders(currentOrders => [processedOrder, ...currentOrders]);

      return processedOrder;
    } catch (error) {
      console.error('Error adding order to list:', error);
      setError('Erreur lors de l\'ajout de la commande');

      // Ajouter quand meme a la liste locale
      setOrders(currentOrders => [order, ...currentOrders]);
      return order;
    }
  }, [fetchRestaurantDetails]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    try {
      // Mapper le statut mobile vers le statut API (uppercase)
      const apiStatus = status.toUpperCase();

      // Appeler l'API pour mettre à jour le statut
      console.log('📦 Updating order status via API:', { orderId, status: apiStatus });
      await apiService.orders.updateStatus(orderId, apiStatus);

      // Mettre à jour l'état local après succès API
      setOrders(currentOrders =>
        currentOrders.map(order => {
          if (order.id === orderId) {
            const updatedOrder = { ...order, status };
            console.log('✅ Order status updated locally:', { orderId, status, restaurantName: order.restaurant?.name });
            return updatedOrder;
          }
          return order;
        })
      );
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      // Optionnel: afficher une alerte à l'utilisateur
      throw error;
    }
  }, []);

  const getOrderById = useCallback((orderId: string): Order | undefined => {
    const order = orders.find(order => order.id === orderId);
    if (!order) return undefined;

    // S'assurer que l'order a une propriété restaurant (utiliser le cache)
    if (!order.restaurant) {
      const restaurantId = order.restaurantId || 'unknown';
      return {
        ...order,
        restaurant: restaurantCache.get(restaurantId) || createDefaultRestaurant(restaurantId),
      };
    }

    return order;
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