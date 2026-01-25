import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import authService from '../services/authService';

// Check if running in Expo Go (no native modules available)
// In Expo Go, Constants.appOwnership === 'expo'
// In standalone builds, Constants.appOwnership === 'standalone' or undefined
const isExpoGo = Constants.appOwnership === 'expo';

// Conditionally import expo-notifications only if NOT in Expo Go
// This avoids the SDK 53 error about notifications not being supported in Expo Go
let Notifications: typeof import('expo-notifications') | null = null;
if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Notifications = require('expo-notifications');
  } catch (error) {
    console.log('expo-notifications not available');
  }
}

// Configure notification handler only if Notifications is available
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Types pour les notifications push
export interface PushNotificationData {
  id: string;
  title: string;
  body: string;
  data: {
    type: 'order_status' | 'promotion' | 'recommendation' | 'system' | 'restaurant_open';
    orderId?: string;
    restaurantId?: string;
    screen?: string;
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
  isRegistered: boolean;
  isExpoGo: boolean;
  isTokenSynced: boolean;
  // Actions
  requestPermissions: () => Promise<boolean>;
  registerForPushNotifications: () => Promise<string | null>;
  syncTokenWithBackend: () => Promise<boolean>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  sendOrderStatusNotification: (orderId: string, status: string, restaurantName: string) => Promise<void>;
  sendPromotionNotification: (title: string, message: string, restaurantId?: string) => Promise<void>;
  sendRecommendationNotification: (title: string, message: string, data?: any) => Promise<void>;
  scheduleNotification: (title: string, body: string, triggerSeconds: number, data?: any) => Promise<string>;
  cancelScheduledNotification: (notificationId: string) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  clearTokenSync: () => void;
  // Utilitaires
  getNotificationHistory: () => PushNotificationData[];
  getBadgeCount: () => Promise<number>;
  setBadgeCount: (count: number) => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

const NOTIFICATIONS_KEY = '@OneEats:Notifications';
const PUSH_TOKEN_KEY = '@OneEats:PushToken';
const TOKEN_SYNCED_KEY = '@OneEats:PushTokenSynced';

interface PushNotificationProviderProps {
  children: ReactNode;
}

export const PushNotificationProvider: React.FC<PushNotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<PushNotificationData[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isTokenSynced, setIsTokenSynced] = useState(false);

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const appState = useRef(AppState.currentState);

  // Initialisation
  useEffect(() => {
    loadStoredNotifications();
    loadStoredToken();
    loadSyncStatus();

    // Skip notification setup in Expo Go
    if (isExpoGo) {
      console.log('📱 Mode Expo Go: notifications désactivées (non supportées depuis SDK 53)');
      // Set a mock token for development
      if (__DEV__) {
        setExpoPushToken('ExponentPushToken[EXPO_GO_DEV_MODE]');
        setIsRegistered(true);
      }
      return;
    }

    if (!Notifications) {
      console.log('📱 expo-notifications non disponible');
      return;
    }

    checkPermissions();
    registerForPushNotifications();

    // Listener pour les notifications reçues en foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification reçue:', notification);
      handleIncomingNotification(notification);
    });

    // Listener pour les interactions avec les notifications (tap)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapée:', response);
      handleNotificationResponse(response);
    });

    // Écouter les changements d'état de l'app pour les badges
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (notificationListener.current && Notifications) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current && Notifications) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      subscription.remove();
    };
  }, []);

  // Sauvegarder les notifications quand elles changent
  useEffect(() => {
    saveNotifications();
    if (!isExpoGo) {
      updateBadgeCount();
    }
  }, [notifications]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // L'app revient au premier plan - mettre à jour le badge
      await updateBadgeCount();
    }
    appState.current = nextAppState;
  };

  const updateBadgeCount = async () => {
    if (!Notifications || isExpoGo) return;
    const unread = notifications.filter(n => !n.read).length;
    await Notifications.setBadgeCountAsync(unread);
  };

  const checkPermissions = async () => {
    if (!Notifications || isExpoGo) return;
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined');
  };

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

  const loadStoredToken = async () => {
    try {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (token) {
        setExpoPushToken(token);
        setIsRegistered(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du token:', error);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const synced = await AsyncStorage.getItem(TOKEN_SYNCED_KEY);
      setIsTokenSynced(synced === 'true');
    } catch (error) {
      console.error('Erreur lors du chargement du statut de sync:', error);
    }
  };

  const saveToken = async (token: string) => {
    try {
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  };

  /**
   * Synchronise le token push avec le backend
   * Doit etre appele apres authentification reussie
   */
  const syncTokenWithBackend = useCallback(async (): Promise<boolean> => {
    if (!expoPushToken) {
      console.log('⚠️ Pas de token push a synchroniser');
      return false;
    }

    // Ne pas resynchroniser si deja fait (sauf si le token change)
    if (isTokenSynced) {
      console.log('✅ Token deja synchronise avec le backend');
      return true;
    }

    try {
      console.log('🔄 Synchronisation du token push avec le backend...');
      const success = await authService.syncPushToken(expoPushToken);

      if (success) {
        setIsTokenSynced(true);
        await AsyncStorage.setItem(TOKEN_SYNCED_KEY, 'true');
        console.log('✅ Token push synchronise avec le backend');
      }

      return success;
    } catch (error) {
      console.error('❌ Erreur de synchronisation du token:', error);
      return false;
    }
  }, [expoPushToken, isTokenSynced]);

  /**
   * Reset le statut de synchronisation (a appeler lors de la deconnexion)
   */
  const clearTokenSync = useCallback(async () => {
    try {
      // Supprimer le token du backend
      await authService.deletePushToken();
      // Reset le statut local
      setIsTokenSynced(false);
      await AsyncStorage.removeItem(TOKEN_SYNCED_KEY);
      console.log('🗑️ Statut de synchronisation reinitialise');
    } catch (error) {
      console.error('Erreur lors de la reinitialisation du sync:', error);
    }
  }, []);

  /**
   * Enregistrement pour les notifications push
   */
  const registerForPushNotifications = async (): Promise<string | null> => {
    // Skip in Expo Go
    if (isExpoGo) {
      console.log('⚠️ Mode Expo Go: notifications push non disponibles');
      if (__DEV__) {
        const token = 'ExponentPushToken[EXPO_GO_DEV_MODE]';
        setExpoPushToken(token);
        setIsRegistered(true);
        return token;
      }
      return null;
    }

    if (!Notifications) {
      console.log('⚠️ expo-notifications non disponible');
      return null;
    }

    let token: string | null = null;

    // Demander les permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Permission pour les notifications refusée');
      setPermissionStatus('denied');
      return null;
    }

    setPermissionStatus('granted');

    // Obtenir le token Expo Push
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

      if (!projectId) {
        console.log('⚠️ Project ID non trouvé, utilisation du mode développement');
        token = 'ExponentPushToken[DEV_MODE_NO_PROJECT_ID]';
      } else {
        const pushTokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        token = pushTokenData.data;
      }

      console.log('✅ Push token obtenu:', token);
      setExpoPushToken(token);
      setIsRegistered(true);
      await saveToken(token);

      // Configuration spécifique Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Notifications OneEats',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#7C3AED',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('orders', {
          name: 'Commandes',
          description: 'Notifications de suivi de commande',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#22C55E',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('promotions', {
          name: 'Promotions',
          description: 'Offres spéciales et promotions',
          importance: Notifications.AndroidImportance.DEFAULT,
          lightColor: '#F59E0B',
        });
      }

      return token;
    } catch (error) {
      console.error('❌ Erreur lors de l\'obtention du token:', error);
      return null;
    }
  };

  /**
   * Demander les permissions
   */
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'web' || isExpoGo || !Notifications) {
      console.log('Notifications non supportées dans cet environnement');
      return false;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    setPermissionStatus(granted ? 'granted' : 'denied');

    if (granted) {
      await registerForPushNotifications();
    }

    return granted;
  };

  /**
   * Gérer une notification entrante
   */
  const handleIncomingNotification = (notification: any) => {
    const { title, body, data } = notification.request.content;

    addNotification({
      title: title || 'Notification',
      body: body || '',
      data: {
        type: (data?.type as any) || 'system',
        ...data,
      },
    });
  };

  /**
   * Gérer le tap sur une notification
   */
  const handleNotificationResponse = (response: any) => {
    const data = response.notification.request.content.data;

    // Navigation basée sur le type de notification
    if (data?.screen) {
      router.push(data.screen as any);
      return;
    }

    switch (data?.type) {
      case 'order_status':
        if (data.orderId) {
          router.push(`/order/${data.orderId}` as any);
        } else {
          router.push('/(tabs)/orders' as any);
        }
        break;
      case 'promotion':
      case 'recommendation':
        if (data.restaurantId) {
          router.push(`/restaurant/${data.restaurantId}` as any);
        }
        break;
      case 'restaurant_open':
        if (data.restaurantId) {
          router.push(`/restaurant/${data.restaurantId}` as any);
        }
        break;
      default:
        // Par défaut, ouvrir les notifications
        router.push('/(tabs)/profile' as any);
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

  /**
   * Envoyer une notification locale
   */
  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    if (isExpoGo || !Notifications) {
      console.log('📱 [Mock] Notification locale:', title, body);
      addNotification({ title, body, data: { type: 'system', ...data } });
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null, // Immédiat
    });
  };

  /**
   * Programmer une notification
   */
  const scheduleNotification = async (
    title: string,
    body: string,
    triggerSeconds: number,
    data?: any
  ): Promise<string> => {
    if (isExpoGo || !Notifications) {
      console.log('📱 [Mock] Notification programmée:', title, 'dans', triggerSeconds, 's');
      return 'mock-notification-id';
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: {
        seconds: triggerSeconds,
      },
    });
    return id;
  };

  /**
   * Annuler une notification programmée
   */
  const cancelScheduledNotification = async (notificationId: string) => {
    if (isExpoGo || !Notifications) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  /**
   * Notification de statut de commande
   */
  const sendOrderStatusNotification = async (orderId: string, status: string, restaurantName: string) => {
    let title = '';
    let body = '';
    let emoji = '';

    switch (status) {
      case 'confirmed':
        title = 'Commande confirmée !';
        body = `${restaurantName} a confirmé votre commande.`;
        emoji = '🎉';
        break;
      case 'preparing':
        title = 'Préparation en cours';
        body = `${restaurantName} prépare votre commande.`;
        emoji = '👨‍🍳';
        break;
      case 'ready':
        title = 'Commande prête !';
        body = `Votre commande chez ${restaurantName} est prête à être récupérée.`;
        emoji = '🍽️';
        break;
      case 'completed':
        title = 'Commande terminée';
        body = `Merci d'avoir choisi ${restaurantName} !`;
        emoji = '✅';
        break;
      case 'cancelled':
        title = 'Commande annulée';
        body = `Votre commande chez ${restaurantName} a été annulée.`;
        emoji = '❌';
        break;
      default:
        return;
    }

    const fullTitle = `${emoji} ${title}`;

    // Add to local notification history
    addNotification({
      title: fullTitle,
      body,
      data: {
        type: 'order_status',
        orderId,
      },
    });

    // Send actual notification if available
    if (!isExpoGo && Notifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: fullTitle,
          body,
          data: {
            type: 'order_status',
            orderId,
            screen: `/order/${orderId}`,
          },
          sound: 'default',
          ...(Platform.OS === 'android' && { channelId: 'orders' }),
        },
        trigger: null,
      });
    }

    console.log(`📱 Notification envoyée: ${title}`);
  };

  /**
   * Notification de promotion
   */
  const sendPromotionNotification = async (title: string, message: string, restaurantId?: string) => {
    const fullTitle = `🎁 ${title}`;

    addNotification({
      title: fullTitle,
      body: message,
      data: {
        type: 'promotion',
        restaurantId,
      },
    });

    if (!isExpoGo && Notifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: fullTitle,
          body: message,
          data: {
            type: 'promotion',
            restaurantId,
          },
          sound: 'default',
          ...(Platform.OS === 'android' && { channelId: 'promotions' }),
        },
        trigger: null,
      });
    }

    console.log(`📢 Promotion notification: ${title}`);
  };

  /**
   * Notification de recommandation
   */
  const sendRecommendationNotification = async (title: string, message: string, data?: any) => {
    const fullTitle = `💡 ${title}`;

    addNotification({
      title: fullTitle,
      body: message,
      data: {
        type: 'recommendation',
        ...data,
      },
    });

    if (!isExpoGo && Notifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: fullTitle,
          body: message,
          data: {
            type: 'recommendation',
            ...data,
          },
          sound: 'default',
        },
        trigger: null,
      });
    }

    console.log(`💡 Recommendation notification: ${title}`);
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
    if (!isExpoGo && Notifications) {
      Notifications.setBadgeCountAsync(0);
    }
  };

  const getNotificationHistory = () => {
    return notifications;
  };

  const getBadgeCount = async (): Promise<number> => {
    if (isExpoGo || !Notifications) {
      return notifications.filter(n => !n.read).length;
    }
    return await Notifications.getBadgeCountAsync();
  };

  const setBadgeCount = async (count: number) => {
    if (isExpoGo || !Notifications) return;
    await Notifications.setBadgeCountAsync(count);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: PushNotificationContextType = {
    expoPushToken,
    notifications,
    unreadCount,
    permissionStatus,
    isRegistered,
    isExpoGo,
    isTokenSynced,
    requestPermissions,
    registerForPushNotifications,
    syncTokenWithBackend,
    sendLocalNotification,
    sendOrderStatusNotification,
    sendPromotionNotification,
    sendRecommendationNotification,
    scheduleNotification,
    cancelScheduledNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    clearTokenSync,
    getNotificationHistory,
    getBadgeCount,
    setBadgeCount,
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

export default PushNotificationContext;
