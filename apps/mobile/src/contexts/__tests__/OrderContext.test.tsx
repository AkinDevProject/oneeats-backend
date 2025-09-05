import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderProvider, useOrder } from '../OrderContext';
import { AuthProvider } from '../AuthContext';
import { mockUser, mockRestaurants } from '../../data/mockData';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <OrderProvider>{children}</OrderProvider>
  </AuthProvider>
);

describe('OrderContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.clear();
  });

  const mockOrder = {
    id: 'order-1',
    restaurant: mockRestaurants[0],
    items: [
      {
        id: 'item-1',
        name: 'Pizza Margherita',
        price: 12.50,
        quantity: 2,
        restaurantId: mockRestaurants[0].id,
        selectedOptions: {},
        specialInstructions: '',
      },
    ],
    totalAmount: 25.00,
    status: 'pending' as const,
    orderTime: new Date(),
    pickupTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes later
    specialInstructions: 'Extra cheese',
  };

  describe('Initial state', () => {
    it('should have empty orders initially', () => {
      const { result } = renderHook(() => useOrder(), { wrapper: TestWrapper });

      expect(result.current.orders).toEqual([]);
      expect(result.current.currentOrder).toBeNull();
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Add order functionality', () => {
    it('should add new order', async () => {
      const { result } = renderHook(() => useOrder(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.addOrder(mockOrder);
      });

      expect(result.current.orders).toHaveLength(1);
      expect(result.current.orders[0]).toEqual(mockOrder);
      expect(result.current.currentOrder).toEqual(mockOrder);
    });

    it('should add multiple orders in chronological order', async () => {
      const { result } = renderHook(() => useOrder(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const secondOrder = { ...mockOrder, id: 'order-2' };

      await act(async () => {
        result.current.addOrder(mockOrder);
        result.current.addOrder(secondOrder);
      });

      expect(result.current.orders).toHaveLength(2);
      expect(result.current.orders[0]).toEqual(secondOrder); // Most recent first
      expect(result.current.orders[1]).toEqual(mockOrder);
    });
  });

  describe('Update order status functionality', () => {
    it('should update order status', async () => {
      const { result } = renderHook(() => useOrder(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Add order first
      await act(async () => {
        result.current.addOrder(mockOrder);
      });

      // Update status
      await act(async () => {
        result.current.updateOrderStatus(mockOrder.id, 'confirmed');
      });

      expect(result.current.orders[0].status).toBe('confirmed');
      expect(result.current.currentOrder?.status).toBe('confirmed');
    });

    it('should not update non-existent order', async () => {
      const { result } = renderHook(() => useOrder(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Try to update non-existent order
      await act(async () => {
        result.current.updateOrderStatus('non-existent-id', 'confirmed');
      });

      expect(result.current.orders).toHaveLength(0);
    });
  });

  describe('Get order by ID functionality', () => {
    it('should return order when it exists', async () => {
      const { result } = renderHook(() => useOrder(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Add order first
      await act(async () => {
        result.current.addOrder(mockOrder);
      });

      const foundOrder = result.current.getOrderById(mockOrder.id);
      expect(foundOrder).toEqual(mockOrder);
    });

    it('should return undefined when order does not exist', async () => {
      const { result } = renderHook(() => useOrder(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const foundOrder = result.current.getOrderById('non-existent-id');
      expect(foundOrder).toBeUndefined();
    });
  });

  describe('Clear orders functionality', () => {
    it('should clear all orders', async () => {
      const { result } = renderHook(() => useOrder(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Add orders first
      await act(async () => {
        result.current.addOrder(mockOrder);
        result.current.addOrder({ ...mockOrder, id: 'order-2' });
      });

      expect(result.current.orders).toHaveLength(2);

      // Clear orders
      await act(async () => {
        result.current.clearOrders();
      });

      expect(result.current.orders).toHaveLength(0);
      expect(result.current.currentOrder).toBeNull();
    });
  });

  describe('Current order functionality', () => {
    it('should return most recent active order as current', async () => {
      const { result } = renderHook(() => useOrder(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const activeOrder = { ...mockOrder, status: 'preparing' as const };
      const completedOrder = { ...mockOrder, id: 'order-2', status: 'completed' as const };

      await act(async () => {
        result.current.addOrder(completedOrder);
        result.current.addOrder(activeOrder);
      });

      expect(result.current.currentOrder).toEqual(activeOrder);
    });

    it('should return null if no active orders', async () => {
      const { result } = renderHook(() => useOrder(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const completedOrder = { ...mockOrder, status: 'completed' as const };

      await act(async () => {
        result.current.addOrder(completedOrder);
      });

      expect(result.current.currentOrder).toBeNull();
    });
  });

  describe('Persistence functionality', () => {
    it('should save orders to AsyncStorage when user is available', async () => {
      // Mock user being logged in
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'user') {
          return Promise.resolve(JSON.stringify(mockUser));
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useOrder(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Add order
      await act(async () => {
        result.current.addOrder(mockOrder);
      });

      // Verify AsyncStorage was called
      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          `orders_${mockUser.id}`,
          expect.stringContaining(mockOrder.id)
        );
      });
    });

    it('should load orders from AsyncStorage on mount', async () => {
      const savedOrders = [mockOrder];
      const savedOrdersJson = JSON.stringify(savedOrders.map(order => ({
        ...order,
        orderTime: order.orderTime.toISOString(),
        pickupTime: order.pickupTime.toISOString(),
      })));

      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'user') {
          return Promise.resolve(JSON.stringify(mockUser));
        }
        if (key === `orders_${mockUser.id}`) {
          return Promise.resolve(savedOrdersJson);
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useOrder(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.orders).toHaveLength(1);
        expect(result.current.orders[0].id).toBe(mockOrder.id);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Auto-update order statuses', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should auto-update order status from pending to confirmed', async () => {
      const { result } = renderHook(() => useOrder(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Create order with old timestamp (more than 2 minutes ago)
      const oldOrder = {
        ...mockOrder,
        orderTime: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
        status: 'pending' as const,
      };

      await act(async () => {
        result.current.addOrder(oldOrder);
      });

      expect(result.current.orders[0].status).toBe('pending');

      // Fast-forward timer to trigger auto-update
      act(() => {
        jest.advanceTimersByTime(30000); // 30 seconds
      });

      await waitFor(() => {
        expect(result.current.orders[0].status).toBe('confirmed');
      });
    });
  });
});