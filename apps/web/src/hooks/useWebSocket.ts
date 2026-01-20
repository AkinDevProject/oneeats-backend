import { useEffect, useRef, useState, useCallback } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
const RECONNECT_DELAY = 3000;
const HEARTBEAT_INTERVAL = 30000;

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
}

/**
 * Hook pour la connexion WebSocket restaurant
 * Se connecte a /ws/restaurant/{restaurantId}
 */
export const useRestaurantWebSocket = (
  restaurantId: string | undefined,
  options: UseWebSocketOptions = {}
) => {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
  } = options;

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatRef.current = window.setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, HEARTBEAT_INTERVAL);
  }, [stopHeartbeat]);

  const disconnect = useCallback(() => {
    stopHeartbeat();
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, [stopHeartbeat]);

  const connect = useCallback(() => {
    if (!restaurantId) {
      console.warn('No restaurantId provided for WebSocket connection');
      return;
    }

    // Fermer toute connexion existante
    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus('connecting');
    const wsUrl = `${WS_BASE_URL}/ws/restaurant/${restaurantId}`;
    console.log('🔌 Connecting to WebSocket:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected for restaurant:', restaurantId);
        setStatus('connected');
        startHeartbeat();
        onConnect?.();
      };

      ws.onclose = (event) => {
        console.log('❌ WebSocket disconnected:', event.reason || 'Connection closed');
        setStatus('disconnected');
        stopHeartbeat();
        onDisconnect?.();

        // Auto-reconnect si active
        if (autoReconnect && !event.wasClean) {
          console.log(`🔄 Reconnecting in ${RECONNECT_DELAY}ms...`);
          reconnectRef.current = window.setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        }
      };

      ws.onerror = (error) => {
        console.error('💥 WebSocket error:', error);
        setStatus('error');
        onError?.(error);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          console.log('📨 WebSocket message received:', message);
          setLastMessage(message);
          onMessage?.(message);
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setStatus('error');
    }
  }, [restaurantId, onConnect, onDisconnect, onError, onMessage, autoReconnect, startHeartbeat, stopHeartbeat]);

  // Se connecter au montage et se deconnecter au demontage
  useEffect(() => {
    if (restaurantId) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]); // On ne met pas connect/disconnect dans les deps pour eviter les reconnexions infinies

  // Fonction pour envoyer un message
  const sendMessage = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  return {
    status,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    isConnected: status === 'connected',
  };
};

/**
 * Hook pour la connexion WebSocket utilisateur (client mobile)
 * Se connecte a /ws/notifications/{userId}
 */
export const useUserWebSocket = (
  userId: string | undefined,
  options: UseWebSocketOptions = {}
) => {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
  } = options;

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatRef.current = window.setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, HEARTBEAT_INTERVAL);
  }, [stopHeartbeat]);

  const disconnect = useCallback(() => {
    stopHeartbeat();
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, [stopHeartbeat]);

  const connect = useCallback(() => {
    if (!userId) {
      console.warn('No userId provided for WebSocket connection');
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus('connecting');
    const wsUrl = `${WS_BASE_URL}/ws/notifications/${userId}`;
    console.log('🔌 Connecting to WebSocket:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected for user:', userId);
        setStatus('connected');
        startHeartbeat();
        onConnect?.();
      };

      ws.onclose = (event) => {
        console.log('❌ WebSocket disconnected');
        setStatus('disconnected');
        stopHeartbeat();
        onDisconnect?.();

        if (autoReconnect && !event.wasClean) {
          reconnectRef.current = window.setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        }
      };

      ws.onerror = (error) => {
        console.error('💥 WebSocket error:', error);
        setStatus('error');
        onError?.(error);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          console.log('📨 WebSocket message received:', message);
          setLastMessage(message);
          onMessage?.(message);
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setStatus('error');
    }
  }, [userId, onConnect, onDisconnect, onError, onMessage, autoReconnect, startHeartbeat, stopHeartbeat]);

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // On ne met pas connect/disconnect dans les deps pour eviter les reconnexions infinies

  const sendMessage = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    status,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    isConnected: status === 'connected',
  };
};
