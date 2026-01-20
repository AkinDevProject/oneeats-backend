/**
 * Tests unitaires pour le hook useWebSocket
 * Teste la logique de connexion, reconnexion, heartbeat et gestion des messages
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';

// Mock WebSocket global
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url: string;
  readyState: number = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  send = jest.fn();
  close = jest.fn((code?: number, reason?: string) => {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ code: code || 1000, reason: reason || '' } as CloseEvent);
    }
  });

  // Simuler une connexion reussie
  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    if (this.onopen) {
      this.onopen({} as Event);
    }
  }

  // Simuler la reception d'un message
  simulateMessage(data: string) {
    if (this.onmessage) {
      this.onmessage({ data } as MessageEvent);
    }
  }

  // Simuler une erreur
  simulateError() {
    if (this.onerror) {
      this.onerror({} as Event);
    }
  }

  // Simuler une fermeture
  simulateClose(code: number = 1000, reason: string = '') {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ code, reason } as CloseEvent);
    }
  }
}

// Variable pour capturer les instances WebSocket creees
let mockWebSocketInstances: MockWebSocket[] = [];
const MockWebSocketConstructor = jest.fn().mockImplementation((url: string) => {
  const instance = new MockWebSocket(url);
  mockWebSocketInstances.push(instance);
  return instance;
});

// @ts-ignore - Mock global WebSocket
global.WebSocket = MockWebSocketConstructor;

// Mock NotificationContext
const mockSendOrderNotification = jest.fn();
jest.mock('../../../src/contexts/NotificationContext', () => ({
  useNotification: () => ({
    sendOrderNotification: mockSendOrderNotification
  })
}));

// Mock ENV
jest.mock('../../../src/config/env', () => ({
  ENV: {
    API_HOST: 'localhost',
    API_PORT: 8080
  }
}));

// Mock AppState
let mockAppStateCallback: ((state: AppStateStatus) => void) | null = null;
jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return {
    ...actualRN,
    AppState: {
      addEventListener: jest.fn((event: string, callback: (state: AppStateStatus) => void) => {
        mockAppStateCallback = callback;
        return { remove: jest.fn() };
      })
    }
  };
});

// Import du hook apres les mocks
import { useWebSocket } from '../../../src/hooks/useWebSocket';

describe('useWebSocket Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockWebSocketInstances = [];
    mockSendOrderNotification.mockClear();
    mockAppStateCallback = null;
  });

  afterEach(() => {
    jest.useRealTimers();
    // Cleanup les instances WebSocket
    mockWebSocketInstances.forEach(ws => {
      if (ws.readyState === MockWebSocket.OPEN) {
        ws.close();
      }
    });
  });

  describe('Connexion Initiale', () => {
    it('devrait se connecter quand un userId est fourni', () => {
      const { result } = renderHook(() => useWebSocket('user-123'));

      expect(MockWebSocketConstructor).toHaveBeenCalledWith(
        'ws://localhost:8080/ws/notifications/user-123'
      );
    });

    it('ne devrait pas se connecter sans userId', () => {
      const { result } = renderHook(() => useWebSocket(null));

      expect(MockWebSocketConstructor).not.toHaveBeenCalled();
      expect(result.current.isConnected).toBe(false);
    });

    it('devrait mettre isConnected a true apres connexion reussie', async () => {
      const { result } = renderHook(() => useWebSocket('user-123'));

      // Simuler connexion reussie
      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.connectionError).toBeNull();
    });

    it('devrait reinitialiser les tentatives de reconnexion apres connexion reussie', async () => {
      const { result } = renderHook(() => useWebSocket('user-123'));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
      });

      expect(result.current.reconnectAttempts).toBe(0);
    });
  });

  describe('Gestion des Messages', () => {
    it('devrait traiter le message de connexion confirme', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { result } = renderHook(() => useWebSocket('user-123'));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
        ws.simulateMessage(JSON.stringify({ type: 'connected' }));
      });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('WebSocket connection confirmed'));
      consoleSpy.mockRestore();
    });

    it('devrait traiter les mises a jour de statut de commande', () => {
      const onOrderUpdate = jest.fn();
      const { result } = renderHook(() => useWebSocket('user-123', onOrderUpdate));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
        ws.simulateMessage(JSON.stringify({
          type: 'order_status_update',
          orderId: 'order-456',
          orderStatus: 'READY',
          title: 'Commande prete',
          message: 'Votre commande est prete'
        }));
      });

      expect(mockSendOrderNotification).toHaveBeenCalledWith(
        'order-456',
        'READY',
        'Restaurant'
      );
      expect(onOrderUpdate).toHaveBeenCalled();
    });

    it('devrait traiter les reponses heartbeat', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { result } = renderHook(() => useWebSocket('user-123'));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
        ws.simulateMessage(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
      });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Heartbeat response received'));
      consoleSpy.mockRestore();
    });

    it('devrait gerer les messages echo', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { result } = renderHook(() => useWebSocket('user-123'));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
        ws.simulateMessage(JSON.stringify({ type: 'echo' }));
      });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Heartbeat response received'));
      consoleSpy.mockRestore();
    });

    it('devrait gerer les messages JSON invalides gracieusement', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useWebSocket('user-123'));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
        ws.simulateMessage('invalid json');
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error parsing WebSocket message'),
        expect.anything()
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Heartbeat', () => {
    it('devrait envoyer des heartbeats periodiquement', () => {
      const { result } = renderHook(() => useWebSocket('user-123'));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
      });

      // Avancer le temps de 30 secondes (HEARTBEAT_INTERVAL)
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"heartbeat"')
      );
    });
  });

  describe('Gestion des Erreurs', () => {
    it('devrait mettre a jour connectionError sur erreur', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { result } = renderHook(() => useWebSocket('user-123'));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateError();
      });

      expect(result.current.connectionError).toBe('Connection error occurred');
      expect(result.current.isConnected).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('Reconnexion Automatique', () => {
    it('devrait tenter de reconnecter apres fermeture anormale', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { result } = renderHook(() => useWebSocket('user-123'));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
      });

      // Simuler une fermeture anormale
      act(() => {
        ws.simulateClose(1006, 'Connection lost');
      });

      expect(result.current.isConnected).toBe(false);

      // Avancer le temps pour la premiere tentative de reconnexion (1 seconde)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Une nouvelle connexion devrait etre tentee
      expect(MockWebSocketConstructor).toHaveBeenCalledTimes(2);
      consoleSpy.mockRestore();
    });

    it('ne devrait pas reconnecter apres fermeture propre (code 1000)', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { result } = renderHook(() => useWebSocket('user-123'));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
      });

      // Simuler une fermeture propre
      act(() => {
        ws.simulateClose(1000, 'Normal closure');
      });

      // Avancer le temps
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Pas de nouvelle tentative de connexion
      expect(MockWebSocketConstructor).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });

    it('devrait utiliser le backoff exponentiel pour les reconnexions', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { result } = renderHook(() => useWebSocket('user-123'));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateClose(1006, 'Connection lost');
      });

      // Premiere tentative apres 1 seconde
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(MockWebSocketConstructor).toHaveBeenCalledTimes(2);

      // Deuxieme echec
      const ws2 = mockWebSocketInstances[1];
      act(() => {
        ws2.simulateClose(1006, 'Connection lost');
      });

      // Deuxieme tentative apres 2 secondes
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(MockWebSocketConstructor).toHaveBeenCalledTimes(3);

      consoleSpy.mockRestore();
    });
  });

  describe('Deconnexion Manuelle', () => {
    it('devrait se deconnecter proprement via disconnect()', () => {
      const { result } = renderHook(() => useWebSocket('user-123'));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
      });

      act(() => {
        result.current.disconnect();
      });

      expect(ws.close).toHaveBeenCalledWith(1000, 'User disconnected');
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('Envoi de Messages', () => {
    it('devrait envoyer un message quand connecte', () => {
      const { result } = renderHook(() => useWebSocket('user-123'));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
      });

      act(() => {
        result.current.sendMessage('test message');
      });

      expect(ws.send).toHaveBeenCalledWith('test message');
    });

    it('ne devrait pas envoyer de message quand deconnecte', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { result } = renderHook(() => useWebSocket('user-123'));

      // Ne pas simuler open, donc deconnecte
      act(() => {
        result.current.sendMessage('test message');
      });

      // Le message ne devrait pas avoir ete envoye
      const ws = mockWebSocketInstances[0];
      expect(ws.send).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Reconnexion Manuelle', () => {
    it('devrait permettre une reconnexion manuelle via reconnect()', () => {
      const { result } = renderHook(() => useWebSocket('user-123'));

      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
        ws.simulateClose(1006, 'Lost connection');
      });

      act(() => {
        result.current.reconnect();
      });

      // Devrait creer une nouvelle connexion
      expect(MockWebSocketConstructor.mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe('Gestion du Cycle de Vie de l\'App', () => {
    it('devrait reconnecter quand l\'app revient au premier plan', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { result } = renderHook(() => useWebSocket('user-123'));

      // Simuler connexion puis deconnexion
      const ws = mockWebSocketInstances[0];
      act(() => {
        ws.simulateOpen();
        ws.simulateClose(1006, 'Lost');
      });

      expect(result.current.isConnected).toBe(false);

      // Simuler l'app qui revient au premier plan
      if (mockAppStateCallback) {
        act(() => {
          mockAppStateCallback!('active');
        });
      }

      // Devrait tenter une reconnexion
      expect(MockWebSocketConstructor.mock.calls.length).toBeGreaterThan(1);
      consoleSpy.mockRestore();
    });
  });

  describe('Valeurs de Retour du Hook', () => {
    it('devrait retourner toutes les proprietes et methodes attendues', () => {
      const { result } = renderHook(() => useWebSocket('user-123'));

      expect(result.current).toHaveProperty('isConnected');
      expect(result.current).toHaveProperty('connectionError');
      expect(result.current).toHaveProperty('reconnectAttempts');
      expect(result.current).toHaveProperty('isReconnecting');
      expect(result.current).toHaveProperty('connect');
      expect(result.current).toHaveProperty('disconnect');
      expect(result.current).toHaveProperty('reconnect');
      expect(result.current).toHaveProperty('sendMessage');

      expect(typeof result.current.connect).toBe('function');
      expect(typeof result.current.disconnect).toBe('function');
      expect(typeof result.current.reconnect).toBe('function');
      expect(typeof result.current.sendMessage).toBe('function');
    });

    it('devrait avoir les valeurs initiales correctes', () => {
      const { result } = renderHook(() => useWebSocket(null));

      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectionError).toBeNull();
      expect(result.current.reconnectAttempts).toBe(0);
      expect(result.current.isReconnecting).toBe(false);
    });
  });
});
