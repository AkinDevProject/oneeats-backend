import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';
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

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATIONS_KEY = '@OneEats:Notifications';
const PUSH_TOKEN_KEY = '@OneEats:PushToken';

interface PushNotificationProviderProps {
  children: ReactNode;
}

export const PushNotificationProvider: React.FC<PushNotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<PushNotificationData[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      initializePushNotifications();
      loadStoredNotifications();
    }
  }, []);

  // Sauvegarder les notifications quand elles changent
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

  const initializePushNotifications = async () => {
    try {
      console.log('Initializing push notifications...');

      // Configurer le canal Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'OneEats Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Demander les permissions
      await requestPermissions();

      // Obtenir le token
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data;
        setExpoPushToken(token);
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
        console.log('🔔 Push notification token:', token.substring(0, 20) + '...');
      } catch (tokenError) {
        console.log('Token generation skipped (development mode)');
      }

    } catch (error) {
      console.error('Erreur lors de l\'initialisation des push notifications:', error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus === 'granted' ? 'granted' : 'denied');

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notifications désactivées',
          'Activez les notifications dans les paramètres pour recevoir les mises à jour de vos commandes.',
          [
            { text: 'Plus tard', style: 'cancel' },
            { text: 'Paramètres', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la demande de permissions:', error);
      setPermissionStatus('denied');
      return false;
    }
  };

  const createNotification = (title: string, body: string, type: PushNotificationData['data']['type'], additionalData: Record<string, any> = {}): PushNotificationData => {
    return {
      id: Math.random().toString(36).substring(7),
      title,
      body,
      data: {
        type,
        ...additionalData,
      },
      timestamp: new Date(),
      read: false,
    };
  };

  const sendLocalNotification = async (notification: PushNotificationData) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: 'default',
          badge: notifications.filter(n => !n.read).length + 1,
        },
        trigger: null, // Immédiate
      });

      // Ajouter à la liste
      setNotifications(prev => [notification, ...prev]);
    } catch (error) {
      console.error('Erreur envoi notification locale:', error);
    }
  };

  const sendOrderStatusNotification = async (orderId: string, status: string, restaurantName: string) => {
    const statusMessages = {
      'confirmed': { title: 'Commande confirmée ! 🎉', body: `${restaurantName} a confirmé votre commande.` },
      'preparing': { title: 'Préparation en cours 👨‍🍳', body: `${restaurantName} prépare votre commande.` },
      'ready': { title: 'Commande prête ! 🍽️', body: `Votre commande chez ${restaurantName} est prête à récupérer.` },
      'completed': { title: 'Bon appétit ! ✅', body: `Merci d'avoir choisi ${restaurantName} !` },
      'cancelled': { title: 'Commande annulée ❌', body: `Votre commande chez ${restaurantName} a été annulée.` },
    };

    const message = statusMessages[status as keyof typeof statusMessages];
    if (!message) return;

    const notification = createNotification(message.title, message.body, 'order_status', { orderId, status, restaurantName });
    await sendLocalNotification(notification);
  };

  const sendPromotionNotification = async (title: string, message: string, restaurantId?: string) => {
    const notification = createNotification(title, message, 'promotion', { restaurantId });
    await sendLocalNotification(notification);
  };

  const sendRecommendationNotification = async (title: string, message: string, data?: any) => {
    const notification = createNotification(title, message, 'recommendation', data);
    await sendLocalNotification(notification);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getNotificationHistory = (): PushNotificationData[] => {
    return notifications.slice(0, 50); // Limiter à 50 notifications récentes
  };

  const enableTestNotifications = () => {
    console.log('🧪 Mode test notifications activé');
    
    // Envoyer des notifications de test
    setTimeout(() => sendOrderStatusNotification('test-001', 'confirmed', 'Pizza Palace'), 1000);
    setTimeout(() => sendOrderStatusNotification('test-001', 'preparing', 'Pizza Palace'), 3000);
    setTimeout(() => sendOrderStatusNotification('test-001', 'ready', 'Pizza Palace'), 5000);
    setTimeout(() => sendPromotionNotification('🎉 -20% sur votre prochaine commande !', 'Code promo: SAVE20', 'rest-001'), 7000);
    setTimeout(() => sendRecommendationNotification('Nouveau restaurant près de vous', 'Sushi Master vient d\'ouvrir dans votre quartier !'), 9000);
  };

  const disableNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setPermissionStatus('denied');
      Alert.alert('Notifications désactivées', 'Vous pouvez les réactiver dans les paramètres.');
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
    }
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

// Hook utilitaire pour tester les notifications
export const useNotificationTester = () => {
  const { sendOrderStatusNotification, sendPromotionNotification, sendRecommendationNotification } = usePushNotifications();

  return {
    testOrderFlow: () => {
      console.log('🧪 Test du flux de commande...');
      setTimeout(() => sendOrderStatusNotification('test-flow', 'confirmed', 'Restaurant Test'), 1000);
      setTimeout(() => sendOrderStatusNotification('test-flow', 'preparing', 'Restaurant Test'), 3000);
      setTimeout(() => sendOrderStatusNotification('test-flow', 'ready', 'Restaurant Test'), 6000);
      setTimeout(() => sendOrderStatusNotification('test-flow', 'completed', 'Restaurant Test'), 9000);
    },
    testPromotion: () => {
      sendPromotionNotification('🔥 Offre spéciale !', 'Livraison gratuite sur votre prochaine commande');
    },
    testRecommendation: () => {
      sendRecommendationNotification('Essayez quelque chose de nouveau', 'Que pensez-vous de la cuisine japonaise ?');
    },
  };
};