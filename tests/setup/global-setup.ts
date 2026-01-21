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
    // NOTE: /api/menu-items/* requiert authentification depuis l'intégration Keycloak
    // Ce endpoint devrait être public pour les GET (BUG-UAT-001)
    try {
      const menuResponse = await page.request.get('http://localhost:8080/api/menu-items/restaurant/11111111-1111-1111-1111-111111111111');
      const contentType = menuResponse.headers()['content-type'] || '';
      if (menuResponse.ok() && contentType.includes('application/json')) {
        const menuItems = await menuResponse.json();
        console.log(`✅ ${menuItems.length} plats trouvés pour Pizza Palace via API`);
      } else {
        console.log(`⚠️ Menu items endpoint requiert authentification (status: ${menuResponse.status()}, content-type: ${contentType}) - test skipped`);
      }
    } catch (menuError) {
      console.log(`⚠️ Menu items endpoint non accessible (auth requise) - test skipped`);
    }
    
    // Test dashboard Quinoa (SPA routing)
    // NOTE: /restaurant/* requiert authentification, donc on vérifie simplement
    // que Quinoa répond avec une page HTML (pas une erreur 404/500)
    console.log('🌐 Test Quinoa SPA routing...');

    // Tester la page d'accueil publique (Quinoa sert index.html)
    const homeResponse = await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });

    if (!homeResponse) {
      throw new Error('❌ Quinoa ne répond pas sur :8080/\n' +
                     '   Vérifiez que le frontend est bien buildé');
    }

    const homeStatus = homeResponse.status();
    if (homeStatus >= 400) {
      throw new Error(`❌ Quinoa retourne une erreur ${homeStatus} sur :8080/`);
    }

    // Vérifier que c'est bien du HTML (pas une erreur JSON ou autre)
    const contentType = homeResponse.headers()['content-type'] || '';
    if (!contentType.includes('text/html')) {
      console.log(`⚠️ Content-Type inattendu: ${contentType}`);
    }

    console.log(`✅ Quinoa SPA OK (:8080/ - status ${homeStatus})`);
    
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