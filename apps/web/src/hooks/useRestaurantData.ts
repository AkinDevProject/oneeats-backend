import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Order, Restaurant, MenuItem } from '../types';

const RESTAURANT_ID = '11111111-1111-1111-1111-111111111111'; // Pizza Palace ID from backend

// Helper function to convert backend order status to frontend status
const mapOrderStatus = (backendStatus: string): Order['status'] => {
  switch (backendStatus) {
    case 'PENDING':
      return 'PENDING';
    case 'CONFIRMED':
      return 'PENDING';
    case 'PREPARING':
      return 'PREPARING';
    case 'READY':
      return 'READY';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
};

// Helper function to convert backend data to frontend format
interface BackendOrderItem {
  id: string;
  menuItemId: string;
  menuItemName?: string;
  name?: string;
  quantity: number;
  unitPrice?: number;
  price?: number;
  totalPrice?: number;
}

interface BackendOrder {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName?: string;
  clientFirstName?: string;
  clientLastName?: string;
  clientEmail?: string;
  items?: BackendOrderItem[];
  totalAmount?: number;
  total?: number;
  status: string;
  createdAt: string;
  estimatedPreparationTime?: number;
}

interface BackendChoice {
  id: string;
  name: string;
  additionalPrice?: number;
  displayOrder?: number;
  isAvailable?: boolean;
}

interface BackendOption {
  id: string;
  name: string;
  type: string;
  isRequired?: boolean;
  maxChoices?: number;
  displayOrder?: number;
  choices?: BackendChoice[];
}

interface BackendMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  isAvailable?: boolean;
  options?: BackendOption[];
  [key: string]: unknown;
}

const transformBackendOrder = (backendOrder: BackendOrder): Order => {
  // Construire le nom client à partir des données enrichies du backend
  let clientName = 'Client';
  if (backendOrder.clientFirstName || backendOrder.clientLastName) {
    const firstName = backendOrder.clientFirstName || '';
    const lastName = backendOrder.clientLastName || '';
    clientName = `${firstName} ${lastName}`.trim() || 'Client';
  }

  return {
    id: backendOrder.id,
    orderNumber: backendOrder.orderNumber,
    restaurantId: backendOrder.restaurantId,
    restaurantName: backendOrder.restaurantName || 'Pizza Palace',
    clientName: clientName,
    clientEmail: backendOrder.clientEmail || '',
    items: (backendOrder.items || []).map((item: BackendOrderItem) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.menuItemName || item.name,
      quantity: item.quantity,
      price: item.unitPrice || item.price,
      totalPrice: item.totalPrice || (item.quantity * (item.unitPrice || item.price))
    })),
    total: backendOrder.totalAmount || backendOrder.total,
    status: mapOrderStatus(backendOrder.status),
    createdAt: new Date(backendOrder.createdAt),
    estimatedTime: backendOrder.estimatedPreparationTime
  };
};

export const useRestaurantData = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all restaurant data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch restaurant info
      const restaurantData = await apiService.restaurants.getById(RESTAURANT_ID);
      setRestaurant(restaurantData);

      // Fetch menu items
      const menuData = await apiService.menuItems.getByRestaurant(RESTAURANT_ID);
      console.log('Raw menu data from API:', menuData);
      
      // Transform backend data to frontend format
      const transformedMenuItems = menuData.map((item: BackendMenuItem) => ({
        ...item,
        available: item.isAvailable, // Map backend isAvailable to frontend available
        options: (item.options || []).map((option: BackendOption) => ({
          id: option.id,
          name: option.name,
          type: option.type, // Backend already sends the enum value (CHOICE, EXTRA, etc.)
          isRequired: option.isRequired,
          maxChoices: option.maxChoices,
          displayOrder: option.displayOrder,
          choices: (option.choices || []).map((choice: BackendChoice) => ({
            id: choice.id,
            name: choice.name,
            price: choice.additionalPrice || 0, // Map backend additionalPrice to frontend price
            additionalPrice: choice.additionalPrice,
            displayOrder: choice.displayOrder,
            isAvailable: choice.isAvailable
          }))
        }))
      }));
      console.log('Transformed menu items:', transformedMenuItems);
      setMenuItems(transformedMenuItems);

      // Fetch all orders for the restaurant (not just pending)
      const ordersData = await apiService.orders.getByRestaurant(RESTAURANT_ID);
      const transformedOrders = ordersData.map(transformBackendOrder);
      setOrders(transformedOrders);

      // Stats removed - endpoint doesn't exist

    } catch (err) {
      console.error('Error fetching restaurant data:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      console.log('useRestaurantData: Updating order status', { orderId, status });
      const updatedOrder = await apiService.orders.updateStatus(orderId, status);
      console.log('useRestaurantData: Order status updated', updatedOrder);
      
      // Refresh orders after update
      console.log('useRestaurantData: Refreshing orders...');
      const updatedOrders = await apiService.orders.getByRestaurant(RESTAURANT_ID);
      const transformedOrders = updatedOrders.map(transformBackendOrder);
      setOrders(transformedOrders);
      
      // Refresh stats
      const statsData = await apiService.orders.getTodayStats(RESTAURANT_ID);
      setStats(statsData);
      
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    orders,
    restaurant,
    menuItems,
    stats,
    loading,
    error,
    refetch: fetchData,
    updateOrderStatus
  };
};