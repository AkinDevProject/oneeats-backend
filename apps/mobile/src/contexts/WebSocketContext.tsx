import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useOrder } from './OrderContext';
import { ENV } from '../config/env';

interface WebSocketContextType {
  isConnected: boolean;
  connectionError: string | null;
  reconnectAttempts: number;
  isReconnecting: boolean;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  sendMessage: (message: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  // Use the mock user ID for development
  const userId = ENV.MOCK_USER_ID;

  // Get refreshOrders function from OrderContext
  const { refreshOrders } = useOrder();

  const {
    isConnected,
    connectionError,
    reconnectAttempts,
    isReconnecting,
    connect,
    disconnect,
    reconnect,
    sendMessage
  } = useWebSocket(userId, refreshOrders);

  const value: WebSocketContextType = {
    isConnected,
    connectionError,
    reconnectAttempts,
    isReconnecting,
    connect,
    disconnect,
    reconnect,
    sendMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};