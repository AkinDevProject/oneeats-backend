import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types pour les notifications push
export interface PushNotificationData {
  id: string;
  title: string;
  body: string;
  data: {
    type: 'order_status' | 'promotion' | 'recommendation' | 'system';
    orderId?: string;
    restaurantId?: string;
    [key: string]: any;
  };
  timestamp: Date;
  read: boolean;
}

interface PushNotificationContextType {
  expoPushToken: string | null;
  notifications: PushNotificationData[];
  unreadCount: number;
  permissionStatus: 'undetermined' | 'granted' | 'denied';
  // Actions
  requestPermissions: () => Promise<boolean>;
  sendOrderStatusNotification: (orderId: string, status: string, restaurantName: string) => Promise<void>;
  sendPromotionNotification: (title: string, message: string, restaurantId?: string) => Promise<void>;
  sendRecommendationNotification: (title: string, message: string, data?: any) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  // Utilitaires
  getNotificationHistory: () => PushNotificationData[];
  enableTestNotifications: () => void;
  disableNotifications: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

const NOTIFICATIONS_KEY = '@OneEats:Notifications';

interface PushNotificationProviderProps {
  children: ReactNode;
}

export const PushNotificationProvider: React.FC<PushNotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<PushNotificationData[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('granted');

  useEffect(() => {
    loadStoredNotifications();
  }, []);

  useEffect(() => {
    saveNotifications();
  }, [notifications]);

  const saveNotifications = async () => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications:', error);
    }
  };

  const loadStoredNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsedNotifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(parsedNotifications);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const addNotification = (notification: Omit<PushNotificationData, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: PushNotificationData = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Garder les 50 dernières
    return newNotification;
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return false;
    }

    console.log('Push notifications simulation enabled for Expo Go');
    setPermissionStatus('granted');
    return true;
  };

  const sendOrderStatusNotification = async (orderId: string, status: string, restaurantName: string) => {
    let title = '';
    let message = '';

    switch (status) {
      case 'confirmed':
        title = 'Commande confirmée ! 🎉';
        message = `${restaurantName} a confirmé votre commande.`;
        break;
      case 'preparing':
        title = 'Préparation en cours 👨‍🍳';
        message = `${restaurantName} prépare votre commande.`;
        break;
      case 'ready':
        title = 'Commande prête ! 🍽️';
        message = `Votre commande chez ${restaurantName} est prête à être récupérée.`;
        break;
      case 'completed':
        title = 'Commande terminée ✅';
        message = `Merci d'avoir choisi ${restaurantName} !`;
        break;
      default:
        return;
    }

    addNotification({
      title,
      body: message,
      data: {
        type: 'order_status',
        orderId,
        restaurantId: 'unknown',
      },
    });

    console.log(`📱 Notification simulée: ${title} - ${message}`);
  };

  const sendPromotionNotification = async (title: string, message: string, restaurantId?: string) => {
    addNotification({
      title,
      body: message,
      data: {
        type: 'promotion',
        restaurantId,
      },
    });

    console.log(`📢 Promotion notification simulée: ${title}`);
  };

  const sendRecommendationNotification = async (title: string, message: string, data?: any) => {
    addNotification({
      title,
      body: message,
      data: {
        type: 'recommendation',
        ...data,
      },
    });

    console.log(`💡 Recommendation notification simulée: ${title}`);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getNotificationHistory = () => {
    return notifications;
  };

  const enableTestNotifications = () => {
    console.log('Test notifications enabled');
  };

  const disableNotifications = async () => {
    console.log('Notifications disabled');
    setPermissionStatus('denied');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: PushNotificationContextType = {
    expoPushToken,
    notifications,
    unreadCount,
    permissionStatus,
    requestPermissions,
    sendOrderStatusNotification,
    sendPromotionNotification,
    sendRecommendationNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    getNotificationHistory,
    enableTestNotifications,
    disableNotifications,
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
};

export const usePushNotifications = (): PushNotificationContextType => {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error('usePushNotifications must be used within a PushNotificationProvider');
  }
  return context;
};