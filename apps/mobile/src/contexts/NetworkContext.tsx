import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { ENV } from '../config/env';

// Logger conditionnel - silencieux en production
const logger = {
  info: (message: string) => __DEV__ && console.log(message),
  debug: (message: string) => __DEV__ && ENV.DEBUG_MODE && console.log(message),
};

interface NetworkContextType {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  checkNetwork: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  /**
   * Vérification du statut réseau via une requête légère
   */
  const checkNetwork = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      // Tenter une requête vers le backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Le health check Quarkus est à /q/health (pas sous /api)
      // On extrait la base URL sans le /api
      const baseUrl = ENV.API_URL.replace(/\/api$/, '');
      const response = await fetch(`${baseUrl}/q/health`, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const online = response.ok;
      setIsOnline(online);
      setLastChecked(new Date());

      logger.debug(online ? '🌐 Network: Online' : '📴 Network: Server unreachable');

      return online;
    } catch {
      // Erreur réseau attendue (offline, timeout, serveur inaccessible)
      // Pas de log d'erreur - c'est un comportement normal géré par l'UI
      logger.debug('📴 Network: Offline or server unreachable');
      setIsOnline(false);
      setLastChecked(new Date());
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Vérification au démarrage et lors du retour à l'app
   */
  useEffect(() => {
    // Vérification initiale
    checkNetwork();

    // Vérification lors du retour à l'app
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkNetwork();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Vérification périodique (toutes les 30 secondes)
    const interval = setInterval(checkNetwork, 30000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [checkNetwork]);

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        isChecking,
        lastChecked,
        checkNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export default NetworkContext;
