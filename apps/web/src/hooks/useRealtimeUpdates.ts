import { useState, useEffect, useCallback, useRef } from 'react';

export interface RealtimeEvent {
  id: string;
  type: 'order' | 'restaurant' | 'user' | 'alert' | 'metric';
  action: 'created' | 'updated' | 'deleted';
  data: unknown;
  timestamp: Date;
}

export interface RealtimeMetrics {
  activeUsers: number;
  ordersPerMinute: number;
  averageResponseTime: number;
  systemLoad: number;
}

interface UseRealtimeUpdatesOptions {
  enabled?: boolean;
  pollingInterval?: number; // in ms, for fallback polling
  onEvent?: (event: RealtimeEvent) => void;
  onMetricsUpdate?: (metrics: RealtimeMetrics) => void;
  onConnectionChange?: (connected: boolean) => void;
}

interface RealtimeState {
  isConnected: boolean;
  lastUpdate: Date | null;
  events: RealtimeEvent[];
  metrics: RealtimeMetrics;
}

/**
 * Hook pour gérer les mises à jour en temps réel
 * Simule WebSocket avec polling pour le MVP
 */
export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
  const {
    enabled = true,
    pollingInterval = 30000, // 30 seconds default
    onEvent,
    onMetricsUpdate,
    onConnectionChange,
  } = options;

  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    lastUpdate: null,
    events: [],
    metrics: {
      activeUsers: 0,
      ordersPerMinute: 0,
      averageResponseTime: 0,
      systemLoad: 0,
    },
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const eventIdCounter = useRef(0);

  // Simulate fetching real-time metrics
  const fetchMetrics = useCallback(async (): Promise<RealtimeMetrics> => {
    // In production, this would be an API call
    // For now, simulate random fluctuations
    return {
      activeUsers: Math.floor(Math.random() * 500) + 100,
      ordersPerMinute: Math.floor(Math.random() * 20) + 5,
      averageResponseTime: Math.floor(Math.random() * 100) + 50,
      systemLoad: Math.random() * 100,
    };
  }, []);

  // Simulate receiving events
  const generateRandomEvent = useCallback((): RealtimeEvent | null => {
    // 20% chance of generating an event each poll
    if (Math.random() > 0.2) return null;

    const types: RealtimeEvent['type'][] = ['order', 'restaurant', 'user', 'alert', 'metric'];
    const actions: RealtimeEvent['action'][] = ['created', 'updated'];

    const type = types[Math.floor(Math.random() * types.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    eventIdCounter.current += 1;

    const eventData: Record<string, unknown> = {
      order: { orderId: `ORD-${Date.now()}`, restaurantId: 'rest-1', total: Math.floor(Math.random() * 50) + 10 },
      restaurant: { restaurantId: 'rest-1', name: 'Restaurant Test', status: Math.random() > 0.5 ? 'online' : 'busy' },
      user: { userId: `user-${Date.now()}`, action: 'login' },
      alert: { level: Math.random() > 0.5 ? 'warning' : 'info', message: 'System notification' },
      metric: { metric: 'orders', value: Math.floor(Math.random() * 100) },
    };

    return {
      id: `evt-${eventIdCounter.current}`,
      type,
      action,
      data: eventData[type],
      timestamp: new Date(),
    };
  }, []);

  // Poll for updates
  const poll = useCallback(async () => {
    if (!enabled) return;

    try {
      const metrics = await fetchMetrics();
      const event = generateRandomEvent();

      setState((prev) => ({
        ...prev,
        isConnected: true,
        lastUpdate: new Date(),
        metrics,
        events: event
          ? [event, ...prev.events].slice(0, 50) // Keep last 50 events
          : prev.events,
      }));

      onMetricsUpdate?.(metrics);
      if (event) {
        onEvent?.(event);
      }
    } catch (error) {
      console.error('Realtime update failed:', error);
      setState((prev) => ({ ...prev, isConnected: false }));
    }
  }, [enabled, fetchMetrics, generateRandomEvent, onMetricsUpdate, onEvent]);

  // Start/stop polling
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setState((prev) => ({ ...prev, isConnected: false }));
      onConnectionChange?.(false);
      return;
    }

    // Initial poll
    poll();
    onConnectionChange?.(true);

    // Set up interval
    intervalRef.current = setInterval(poll, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, pollingInterval, poll, onConnectionChange]);

  // Manual refresh
  const refresh = useCallback(() => {
    poll();
  }, [poll]);

  // Clear events
  const clearEvents = useCallback(() => {
    setState((prev) => ({ ...prev, events: [] }));
  }, []);

  return {
    ...state,
    refresh,
    clearEvents,
  };
}

/**
 * Hook pour afficher un indicateur de connexion temps réel
 */
export function useConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [lastPing, setLastPing] = useState<Date | null>(null);

  const updateStatus = useCallback((connected: boolean) => {
    setStatus(connected ? 'connected' : 'disconnected');
    if (connected) {
      setLastPing(new Date());
    }
  }, []);

  return {
    status,
    lastPing,
    updateStatus,
    isConnected: status === 'connected',
  };
}

/**
 * Hook pour simuler des notifications push
 */
export function usePushNotifications(options: {
  enabled?: boolean;
  onNotification?: (notification: { title: string; body: string; type: string }) => void;
} = {}) {
  const { enabled = true, onNotification } = options;
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied' as NotificationPermission;
  }, []);

  const showNotification = useCallback(
    (title: string, body: string, type: string = 'info') => {
      if (!enabled) return;

      // Call the callback for in-app notification
      onNotification?.({ title, body, type });

      // Show browser notification if permitted
      if ('Notification' in window && permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: type,
        });
      }
    },
    [enabled, permission, onNotification]
  );

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: 'Notification' in (typeof window !== 'undefined' ? window : {}),
  };
}

/**
 * Hook pour gérer le statut "live" avec animation
 */
export function useLiveIndicator(isActive: boolean = true) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  return {
    isActive,
    pulse,
    className: isActive
      ? `w-2 h-2 rounded-full ${pulse ? 'bg-green-500' : 'bg-green-400'} transition-colors`
      : 'w-2 h-2 rounded-full bg-gray-400',
  };
}

export default useRealtimeUpdates;
