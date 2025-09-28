import { useState, useEffect, useMemo } from 'react';
import apiService from '../../services/api';
import { Order, OrderStatus } from '../../types';

interface UseOrdersFilters {
  status?: OrderStatus;
  restaurantId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface UseOrdersResult {
  orders: Order[];
  filteredOrders: Order[];
  loading: boolean;
  error: string | null;
  filters: UseOrdersFilters;
  setFilters: (filters: UseOrdersFilters) => void;
  refetch: () => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrderStats: () => {
    total: number;
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    completed: number;
    cancelled: number;
  };
}

export const useOrders = (): UseOrdersResult => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UseOrdersFilters>({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.orders.getAll();

      // Convert dates from strings to Date objects
      const ordersWithDates = data.map(order => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
        estimatedPickupTime: order.estimatedPickupTime ? new Date(order.estimatedPickupTime) : undefined,
        actualPickupTime: order.actualPickupTime ? new Date(order.actualPickupTime) : undefined,
      }));

      setOrders(ordersWithDates);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const updatedOrder = await apiService.orders.updateStatus(id, status);

      setOrders(prev =>
        prev.map(order =>
          order.id === id
            ? {
                ...order,
                status: updatedOrder.status,
                updatedAt: new Date(updatedOrder.updatedAt)
              }
            : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  // Filtered orders based on current filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filter by status
      if (filters.status && order.status !== filters.status) {
        return false;
      }

      // Filter by restaurant
      if (filters.restaurantId && order.restaurantId !== filters.restaurantId) {
        return false;
      }

      // Filter by search (order number, client name, email)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesOrderNumber = order.orderNumber.toLowerCase().includes(searchLower);
        const matchesClientName = order.clientFirstName?.toLowerCase().includes(searchLower) ||
                                 order.clientLastName?.toLowerCase().includes(searchLower);
        const matchesEmail = order.clientEmail?.toLowerCase().includes(searchLower);

        if (!matchesOrderNumber && !matchesClientName && !matchesEmail) {
          return false;
        }
      }

      // Filter by date range
      if (filters.dateFrom && order.createdAt < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && order.createdAt > filters.dateTo) {
        return false;
      }

      return true;
    });
  }, [orders, filters]);

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter(order => order.status === status);
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      cancelled: 0,
    };

    orders.forEach(order => {
      switch (order.status) {
        case 'PENDING':
          stats.pending++;
          break;
        case 'CONFIRMED':
          stats.confirmed++;
          break;
        case 'PREPARING':
          stats.preparing++;
          break;
        case 'READY':
          stats.ready++;
          break;
        case 'COMPLETED':
          stats.completed++;
          break;
        case 'CANCELLED':
          stats.cancelled++;
          break;
      }
    });

    return stats;
  };

  useEffect(() => {
    fetchOrders();

    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    orders,
    filteredOrders,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchOrders,
    updateOrderStatus,
    getOrdersByStatus,
    getOrderStats,
  };
};