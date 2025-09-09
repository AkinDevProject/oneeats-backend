import { chromium, FullConfig } from '@playwright/test';
import { DatabaseHelper } from '../helpers/database-helper';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Démarrage des tests OneEats E2E...');
  
  // TEMPORAIRE: Skip vérification DB directe
  console.log('🔄 Vérification via API au lieu de connexion DB directe...');
  
  // Vérification que Quarkus + Quinoa sont démarrés
  console.log('🌐 Vérification Quarkus + Quinoa...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test API backend
    console.log('🔗 Test API backend...');
    const apiResponse = await page.request.get('http://localhost:8080/api/restaurants');
    if (!apiResponse.ok()) {
      throw new Error('❌ Quarkus backend non accessible sur :8080\n' +
                     '   Assurez-vous que Quarkus est démarré depuis IntelliJ');
    }
    console.log('✅ API backend OK (:8080/api)');
    
    // Vérifier que Pizza Palace existe via API
    const restaurants = await apiResponse.json();
    const pizzaPalace = restaurants.find(r => r.id === '11111111-1111-1111-1111-111111111111');
    if (!pizzaPalace) {
      throw new Error('❌ Restaurant Pizza Palace introuvable via API!');
    }
    console.log('✅ Pizza Palace trouvé via API');
    
    // Vérifier les menu items
    const menuResponse = await page.request.get('http://localhost:8080/api/menu-items/restaurant/11111111-1111-1111-1111-111111111111');
    if (menuResponse.ok()) {
      const menuItems = await menuResponse.json();
      console.log(`✅ ${menuItems.length} plats trouvés pour Pizza Palace via API`);
    }
    
    // Test dashboard Quinoa
    console.log('🌐 Test dashboard Quinoa...');
    await page.goto('http://localhost:8080/restaurant/menu', { waitUntil: 'networkidle' });
    console.log('✅ Dashboard Quinoa OK (:8080/restaurant)');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des services:', error);
    console.log('\n📋 INSTRUCTIONS:');
    console.log('   1. Ouvrir IntelliJ IDEA');
    console.log('   2. Lancer Quarkus en mode dev');
    console.log('   3. Quinoa servira automatiquement le frontend');
    console.log('   4. Vérifier http://localhost:8080 dans le navigateur');
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
  
  console.log('🎯 Setup terminé - Prêt pour les tests!');
}

export default globalSetup;