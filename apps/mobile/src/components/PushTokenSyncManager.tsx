/**
 * Composant invisible qui gere la synchronisation automatique
 * du token push avec le backend apres authentification.
 *
 * Ce composant doit etre place a l'interieur de AuthProvider
 * et PushNotificationProvider dans l'arbre de composants.
 */
import React, { useEffect } from 'react';
import { usePushTokenSync } from '../hooks/usePushTokenSync';

interface PushTokenSyncManagerProps {
  children: React.ReactNode;
}

export const PushTokenSyncManager: React.FC<PushTokenSyncManagerProps> = ({ children }) => {
  const { isSyncing, isSynced, error } = usePushTokenSync();

  // Log pour le debug en developpement
  useEffect(() => {
    if (__DEV__) {
      if (isSyncing) {
        console.log('📤 Synchronisation du token push en cours...');
      } else if (isSynced) {
        console.log('✅ Token push synchronise avec le backend');
      } else if (error) {
        console.warn('⚠️ Erreur sync token push:', error);
      }
    }
  }, [isSyncing, isSynced, error]);

  // Ce composant ne rend rien de visible, il gere juste la logique
  return <>{children}</>;
};

export default PushTokenSyncManager;
