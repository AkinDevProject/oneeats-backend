/**
 * Hook pour synchroniser automatiquement le token push avec le backend
 * apres l'authentification de l'utilisateur.
 *
 * Usage:
 * Dans un composant parent (ex: App ou layout principal):
 * const { isSyncing, syncNow, error } = usePushTokenSync();
 */
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePushNotifications } from '../contexts/PushNotificationContext';

interface PushTokenSyncState {
  isSyncing: boolean;
  isSynced: boolean;
  error: string | null;
  syncNow: () => Promise<boolean>;
}

export const usePushTokenSync = (): PushTokenSyncState => {
  const { isAuthenticated, user } = useAuth();
  const {
    expoPushToken,
    isRegistered,
    isTokenSynced,
    syncTokenWithBackend,
    clearTokenSync,
  } = usePushNotifications();

  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Synchronise le token push avec le backend
   */
  const syncNow = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('Utilisateur non authentifie');
      return false;
    }

    if (!expoPushToken || !isRegistered) {
      setError('Token push non disponible');
      return false;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const success = await syncTokenWithBackend();
      if (!success) {
        setError('Echec de la synchronisation');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, expoPushToken, isRegistered, syncTokenWithBackend]);

  /**
   * Effet pour synchroniser automatiquement le token quand:
   * - L'utilisateur est authentifie
   * - Un token push est disponible
   * - Le token n'a pas encore ete synchronise
   */
  useEffect(() => {
    const autoSync = async () => {
      // Conditions pour la synchronisation automatique
      if (
        isAuthenticated &&
        user &&
        !user.isGuest &&
        expoPushToken &&
        isRegistered &&
        !isTokenSynced &&
        !isSyncing
      ) {
        console.log('🔄 Auto-sync du token push apres authentification...');
        await syncNow();
      }
    };

    autoSync();
  }, [isAuthenticated, user, expoPushToken, isRegistered, isTokenSynced, isSyncing, syncNow]);

  /**
   * Effet pour nettoyer le token lors de la deconnexion
   */
  useEffect(() => {
    if (!isAuthenticated && isTokenSynced) {
      console.log('🗑️ Nettoyage du token push (deconnexion)...');
      clearTokenSync();
    }
  }, [isAuthenticated, isTokenSynced, clearTokenSync]);

  return {
    isSyncing,
    isSynced: isTokenSynced,
    error,
    syncNow,
  };
};

export default usePushTokenSync;
