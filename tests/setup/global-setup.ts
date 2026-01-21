import { FullConfig } from '@playwright/test';
import { DatabaseHelper } from '../helpers/database-helper';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Démarrage des tests OneEats E2E...');

  // TEMPORAIRE: Skip vérification DB directe
  console.log('🔄 Vérification via API au lieu de connexion DB directe...');

  // Vérification que Quarkus + Quinoa sont démarrés
  console.log('🌐 Vérification Quarkus + Quinoa...');

  // Utiliser fetch natif pour les vérifications (pas besoin de navigateur)
  try {
    // Test API backend
    console.log('🔗 Test API backend...');
    const apiResponse = await fetch('http://localhost:8080/api/restaurants');
    if (!apiResponse.ok) {
      throw new Error('❌ Quarkus backend non accessible sur :8080\n' +
                     '   Assurez-vous que Quarkus est démarré depuis IntelliJ');
    }
    console.log('✅ API backend OK (:8080/api)');

    // Vérifier que Pizza Palace existe via API
    const restaurants = await apiResponse.json() as Array<{ id: string }>;
    const pizzaPalace = restaurants.find(r => r.id === '11111111-1111-1111-1111-111111111111');
    if (!pizzaPalace) {
      throw new Error('❌ Restaurant Pizza Palace introuvable via API!');
    }
    console.log('✅ Pizza Palace trouvé via API');

    // Vérifier les menu items
    const menuResponse = await fetch('http://localhost:8080/api/menu-items/restaurant/11111111-1111-1111-1111-111111111111');
    if (menuResponse.ok) {
      const menuItems = await menuResponse.json() as Array<unknown>;
      console.log(`✅ ${menuItems.length} plats trouvés pour Pizza Palace via API`);
    }

    // Test dashboard Quinoa (vérification HTTP simple)
    console.log('🌐 Test dashboard Quinoa...');
    const dashboardResponse = await fetch('http://localhost:8080/restaurant/menu');
    if (dashboardResponse.ok) {
      console.log('✅ Dashboard Quinoa OK (:8080/restaurant)');
    } else {
      console.log('⚠️ Dashboard Quinoa retourne status:', dashboardResponse.status);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification des services:', error);
    console.log('\n📋 INSTRUCTIONS:');
    console.log('   1. Ouvrir IntelliJ IDEA');
    console.log('   2. Lancer Quarkus en mode dev');
    console.log('   3. Quinoa servira automatiquement le frontend');
    console.log('   4. Vérifier http://localhost:8080 dans le navigateur');
    throw error;
  }

  console.log('🎯 Setup terminé - Prêt pour les tests!');
}

export default globalSetup;