import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Nettoyage après tests...');
  
  // Ici on pourrait nettoyer des données de test temporaires
  // Pour l'instant, on garde les données pour inspection manuelle
  
  console.log('✅ Nettoyage terminé');
}

export default globalTeardown;