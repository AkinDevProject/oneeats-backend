import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

// Conditional import pour éviter les erreurs avec Expo Go
let Notifications: any = null;
if (!__DEV__) {
  try {
    Notifications = require('expo-notifications');
  } catch (error) {
    console.warn('expo-notifications not available in Expo Go');
  }
}

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system';
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  sendOrderNotification: (orderId: string, status: string, restaurantName: string) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Configure notifications (seulement si disponible)
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    // Ne configurer les notifications que sur mobile
    if (Platform.OS !== 'web') {
      requestPermissions();
    }
  }, []);

  const requestPermissions = async () => {
    // Vérifier si on est sur web ou si Notifications n'est pas disponible
    if (Platform.OS === 'web' || !Notifications) {
      console.log('Notifications not supported on web or in Expo Go');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission for notifications was denied');
    }
  };

  const addNotification = (notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationData = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  };

  const sendLocalNotification = async (title: string, message: string, data?: any) => {
    if (!Notifications) {
      console.log('Notifications not available, skipping notification:', title);
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: data || {},
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  };

  const sendOrderNotification = async (orderId: string, status: string, restaurantName: string) => {
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

    // Add to local notifications list
    addNotification({
      title,
      message,
      type: 'order',
      data: { orderId, status, restaurantName },
    });

    // Send system notification
    await sendLocalNotification(title, message, { orderId, status });
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

  const unreadCount = notifications.filter(n => !n.read).length;

  // Send welcome notification on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        title: 'Bienvenue sur DelishGo ! 👋',
        message: 'Découvrez les meilleurs restaurants près de chez vous.',
        type: 'system',
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    sendOrderNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};