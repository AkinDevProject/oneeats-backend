import { useCallback, useEffect, useState } from 'react';
import { useNetwork } from '../contexts/NetworkContext';
import cacheService from '../services/cacheService';

interface UseOfflineResult {
  isOnline: boolean;
  isOfflineMode: boolean;
  hasCache: boolean;
  lastSync: Date | null;
  cacheSize: string;
  clearCache: () => Promise<void>;
  checkNetwork: () => Promise<boolean>;
}

/**
 * Hook pour gérer le mode hors connexion
 * Fournit des informations sur l'état réseau et le cache
 */
export const useOffline = (): UseOfflineResult => {
  const { isOnline, checkNetwork } = useNetwork();
  const [hasCache, setHasCache] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [cacheSize, setCacheSize] = useState<string>('N/A');

  /**
   * Charger les informations du cache
   */
  const loadCacheInfo = useCallback(async () => {
    const hasCachedData = await cacheService.hasCache();
    setHasCache(hasCachedData);

    const syncDate = await cacheService.getLastSync();
    setLastSync(syncDate);

    const size = await cacheService.getCacheSize();
    setCacheSize(size);
  }, []);

  /**
   * Vider le cache
   */
  const clearCache = useCallback(async () => {
    await cacheService.clearAll();
    await loadCacheInfo();
  }, [loadCacheInfo]);

  useEffect(() => {
    loadCacheInfo();
  }, [loadCacheInfo]);

  return {
    isOnline,
    isOfflineMode: !isOnline && hasCache,
    hasCache,
    lastSync,
    cacheSize,
    clearCache,
    checkNetwork,
  };
};

export default useOffline;
