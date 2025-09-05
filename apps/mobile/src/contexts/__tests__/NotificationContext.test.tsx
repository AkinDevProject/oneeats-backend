import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { NotificationProvider, useNotification } from '../NotificationContext';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: {
    MAX: 'max',
  },
}));

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    
    // Reset Platform.OS to iOS
    const { Platform } = require('react-native');
    (Platform as any).OS = 'ios';
    
    // Setup default mocks
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <NotificationProvider>{children}</NotificationProvider>
  );

  describe('Initial state', () => {
    it('should have empty notifications initially', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
    });

    it('should add welcome notification after timeout', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      // Fast forward the welcome notification timer
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.notifications[0].title).toBe('Bienvenue sur DelishGo ! 👋');
        expect(result.current.notifications[0].type).toBe('system');
        expect(result.current.unreadCount).toBe(1);
      });
    });
  });

  describe('Platform-specific behavior', () => {
    it('should request permissions on mobile platforms', async () => {
      renderHook(() => useNotification(), { wrapper });

      await waitFor(() => {
        expect(mockNotifications.getPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('should setup Android notification channel on Android', async () => {
      const { Platform } = require('react-native');
      (Platform as any).OS = 'android';
      
      renderHook(() => useNotification(), { wrapper });

      await waitFor(() => {
        expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', {
          name: 'default',
          importance: 'max',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      });
    });

    it('should skip notification setup on web platform', async () => {
      const { Platform } = require('react-native');
      (Platform as any).OS = 'web';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      renderHook(() => useNotification(), { wrapper });

      // Should not call permission APIs on web
      expect(mockNotifications.getPermissionsAsync).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Notifications not supported on web');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Permission handling', () => {
    it('should request permissions when not granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
      mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

      renderHook(() => useNotification(), { wrapper });

      await waitFor(() => {
        expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('should handle denied permissions gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
      mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

      renderHook(() => useNotification(), { wrapper });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Permission for notifications was denied');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Order notifications', () => {
    it('should send order confirmation notification', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      await act(async () => {
        await result.current.sendOrderNotification('order-123', 'confirmed', 'Pizza Palace');
      });

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1);
        const notification = result.current.notifications[0];
        expect(notification.title).toBe('Commande confirmée ! 🎉');
        expect(notification.message).toBe('Pizza Palace a confirmé votre commande.');
        expect(notification.type).toBe('order');
        expect(notification.data).toEqual({
          orderId: 'order-123',
          status: 'confirmed',
          restaurantName: 'Pizza Palace',
        });
      });

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Commande confirmée ! 🎉',
          body: 'Pizza Palace a confirmé votre commande.',
          data: { orderId: 'order-123', status: 'confirmed' },
          sound: 'default',
        },
        trigger: null,
      });
    });

    it('should send preparing notification', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      await act(async () => {
        await result.current.sendOrderNotification('order-123', 'preparing', 'Burger Spot');
      });

      await waitFor(() => {
        const notification = result.current.notifications[0];
        expect(notification.title).toBe('Préparation en cours 👨‍🍳');
        expect(notification.message).toBe('Burger Spot prépare votre commande.');
      });
    });

    it('should send ready notification', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      await act(async () => {
        await result.current.sendOrderNotification('order-123', 'ready', 'Sushi Bar');
      });

      await waitFor(() => {
        const notification = result.current.notifications[0];
        expect(notification.title).toBe('Commande prête ! 🍽️');
        expect(notification.message).toBe('Votre commande chez Sushi Bar est prête à être récupérée.');
      });
    });

    it('should send completed notification', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      await act(async () => {
        await result.current.sendOrderNotification('order-123', 'completed', 'Taco Place');
      });

      await waitFor(() => {
        const notification = result.current.notifications[0];
        expect(notification.title).toBe('Commande terminée ✅');
        expect(notification.message).toBe('Merci d\'avoir choisi Taco Place !');
      });
    });

    it('should ignore unknown order status', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      await act(async () => {
        await result.current.sendOrderNotification('order-123', 'unknown-status', 'Restaurant');
      });

      // Should not add any notification for unknown status
      expect(result.current.notifications).toHaveLength(0);
      expect(mockNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('Notification management', () => {
    it('should mark notification as read', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      // Add a notification first
      await act(async () => {
        await result.current.sendOrderNotification('order-123', 'confirmed', 'Restaurant');
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(1);
      });

      const notificationId = result.current.notifications[0].id;

      act(() => {
        result.current.markAsRead(notificationId);
      });

      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });

    it('should mark all notifications as read', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      // Add multiple notifications
      await act(async () => {
        await result.current.sendOrderNotification('order-1', 'confirmed', 'Restaurant 1');
        await result.current.sendOrderNotification('order-2', 'preparing', 'Restaurant 2');
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(2);
      });

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.notifications.every(n => n.read)).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });

    it('should clear all notifications', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      // Add notifications first
      await act(async () => {
        await result.current.sendOrderNotification('order-1', 'confirmed', 'Restaurant');
      });

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1);
      });

      act(() => {
        result.current.clearNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should handle notification scheduling errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = new Error('Scheduling failed');
      mockNotifications.scheduleNotificationAsync.mockRejectedValue(mockError);

      const { result } = renderHook(() => useNotification(), { wrapper });

      await act(async () => {
        await result.current.sendOrderNotification('order-123', 'confirmed', 'Restaurant');
      });

      // Should still add to local notifications despite scheduling error
      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error sending local notification:', mockError);
      consoleSpy.mockRestore();
    });

    it('should handle permission request errors', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockNotifications.getPermissionsAsync.mockRejectedValue(new Error('Permission error'));

      renderHook(() => useNotification(), { wrapper });

      // Should not crash the app
      await waitFor(() => {
        expect(consoleSpy).not.toHaveBeenCalledWith('Permission for notifications was denied');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Hook usage validation', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => {
        renderHook(() => useNotification());
      }).toThrow('useNotification must be used within a NotificationProvider');

      consoleSpy.mockRestore();
    });
  });
});