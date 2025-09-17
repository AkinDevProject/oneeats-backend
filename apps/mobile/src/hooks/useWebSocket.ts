import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import { useNotification } from '../contexts/NotificationContext';
import { ENV } from '../config/env';

export interface WebSocketMessage {
  type: string;
  orderId?: string;
  orderStatus?: string;
  title?: string;
  message?: string;
  timestamp?: number;
}

export const useWebSocket = (userId: string | null, onOrderUpdate?: () => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatRef = useRef<number>(Date.now());
  const shouldReconnectRef = useRef<boolean>(true);

  const { sendOrderNotification } = useNotification();

  // Configuration de reconnexion
  const MAX_RECONNECT_ATTEMPTS = 10;
  const RECONNECT_INTERVALS = [1000, 2000, 5000, 10000, 15000, 30000]; // Backoff exponentiel
  const HEARTBEAT_INTERVAL = 30000; // 30 secondes
  const HEARTBEAT_TIMEOUT = 10000; // 10 secondes

  // Fonction de nettoyage des timers
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Fonction de démarrage du heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        console.log('📡 Sending heartbeat...');
        websocketRef.current.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
        lastHeartbeatRef.current = Date.now();
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  // Fonction de reconnexion avec backoff exponentiel
  const scheduleReconnect = useCallback(() => {
    if (!shouldReconnectRef.current || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log('🚫 Max reconnection attempts reached or reconnection disabled');
      setConnectionError('Unable to reconnect to server');
      return;
    }

    const attemptIndex = Math.min(reconnectAttempts, RECONNECT_INTERVALS.length - 1);
    const delay = RECONNECT_INTERVALS[attemptIndex];

    console.log(`⏳ Scheduling reconnection attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);
    setIsReconnecting(true);

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`🔄 Reconnection attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}`);
      setReconnectAttempts(prev => prev + 1);
      connect();
    }, delay);
  }, [reconnectAttempts]);

  const connect = useCallback(() => {
    if (!userId || !shouldReconnectRef.current) {
      console.log('❌ No userId provided or reconnection disabled, skipping WebSocket connection');
      return;
    }

    // Si déjà connecté, ne pas reconnecter
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected');
      return;
    }

    // Nettoyer les connexions existantes
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    clearTimers();

    try {
      const wsUrl = `ws://${ENV.API_HOST}:${ENV.API_PORT}/ws/notifications/${userId}`;
      console.log(`🔌 Connecting to WebSocket (attempt ${reconnectAttempts + 1}):`, wsUrl);

      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0); // Reset tentatives de reconnexion
        setIsReconnecting(false);
        startHeartbeat(); // Démarrer le heartbeat
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 Received WebSocket message:', message);

          switch (message.type) {
            case 'connected':
              console.log('🔗 WebSocket connection confirmed');
              break;

            case 'order_status_update':
              if (message.title && message.message && message.orderStatus) {
                console.log('🍽️ Order status update received:', message);
                // Send notification through the notification context
                sendOrderNotification(
                  message.orderId || '',
                  message.orderStatus,
                  'Restaurant' // We don't have restaurant name in the message, using default
                );

                // Trigger immediate order list refresh
                if (onOrderUpdate) {
                  console.log('🔄 Triggering immediate order list refresh from WebSocket');
                  onOrderUpdate();
                }
              }
              break;

            case 'echo':
            case 'heartbeat':
              console.log('💓 Heartbeat response received');
              lastHeartbeatRef.current = Date.now();
              break;

            default:
              console.log('❓ Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.log('⚠️ WebSocket connection failed (normal in Expo Go development)');
        setConnectionError('Connection error occurred');
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket connection closed: ${event.code} - ${event.reason}`);
        setIsConnected(false);
        setIsReconnecting(false);
        websocketRef.current = null;
        clearTimers();

        // Reconnecter sauf si c'est une fermeture propre ou si on a désactivé la reconnexion
        if (shouldReconnectRef.current && event.code !== 1000) {
          scheduleReconnect();
        } else {
          console.log('🚫 Clean close or reconnection disabled, not reconnecting');
        }
      };

    } catch (error) {
      console.log('⚠️ Cannot create WebSocket connection (normal in Expo Go development)');
      setConnectionError('Failed to create connection');
      setIsReconnecting(false);
      if (shouldReconnectRef.current) {
        scheduleReconnect();
      }
    }
  }, [userId, sendOrderNotification, onOrderUpdate, reconnectAttempts, clearTimers, startHeartbeat, scheduleReconnect]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...');
    shouldReconnectRef.current = false; // Désactiver la reconnexion automatique
    clearTimers();

    if (websocketRef.current) {
      websocketRef.current.close(1000, 'User disconnected');
      websocketRef.current = null;
    }
    setIsConnected(false);
    setConnectionError(null);
    setReconnectAttempts(0);
    setIsReconnecting(false);
  }, [clearTimers]);

  const sendMessage = useCallback((message: string) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(message);
    } else {
      console.warn('⚠️ WebSocket is not connected, cannot send message');
      // Essayer de reconnecter si pas déjà en cours
      if (!isReconnecting && shouldReconnectRef.current) {
        console.log('🔄 Attempting to reconnect due to message send failure...');
        connect();
      }
    }
  }, [isReconnecting, connect]);

  // Fonction de reconnexion manuelle
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection requested');
    shouldReconnectRef.current = true;
    setReconnectAttempts(0);
    setConnectionError(null);
    connect();
  }, [connect]);

  // Gestion du cycle de vie de l'app (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      console.log('📱 App state changed to:', nextAppState);

      if (nextAppState === 'active') {
        // App revient au premier plan, reconnecter si nécessaire
        if (!isConnected && shouldReconnectRef.current && userId) {
          console.log('🔄 App became active, attempting to reconnect...');
          connect();
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App passe en arrière-plan, maintenir la connexion mais réduire l'activité
        console.log('💤 App went to background, maintaining connection...');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isConnected, userId, connect]);

  // Connexion initiale et nettoyage
  useEffect(() => {
    if (userId) {
      shouldReconnectRef.current = true;
      connect();
    }

    return () => {
      shouldReconnectRef.current = false;
      disconnect();
    };
  }, [userId, connect, disconnect]);

  // Vérification périodique de la santé de la connexion
  useEffect(() => {
    if (!isConnected) return;

    const healthCheckInterval = setInterval(() => {
      const timeSinceLastHeartbeat = Date.now() - lastHeartbeatRef.current;

      if (timeSinceLastHeartbeat > HEARTBEAT_INTERVAL + HEARTBEAT_TIMEOUT) {
        console.log('💔 Heartbeat timeout detected, connection may be stale');
        // Force une reconnexion si le heartbeat est en retard
        if (websocketRef.current) {
          websocketRef.current.close(1006, 'Heartbeat timeout');
        }
      }
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(healthCheckInterval);
  }, [isConnected]);

  return {
    isConnected,
    connectionError,
    reconnectAttempts,
    isReconnecting,
    connect,
    disconnect,
    reconnect,
    sendMessage
  };
};