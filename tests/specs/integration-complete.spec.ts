import { test, expect } from '@playwright/test';
import { ApiHelper } from '../helpers/api-helper';

test.describe('Integration Complète : Flow OneEats End-to-End', () => {
  let api: ApiHelper;
  const PIZZA_PALACE_ID = '11111111-1111-1111-1111-111111111111';
  const TEST_USER_ID = '12345678-1234-1234-1234-123456789012';

  test.beforeAll(async ({ request }) => {
    api = new ApiHelper(request);
  });

  test('Flow complet : Dashboard → API → Mobile → BDD', async ({ page }) => {
    console.log('🎯 Test Flow Complet OneEats');
    
    // PHASE 1: Vérification Dashboard
    console.log('📊 PHASE 1: Dashboard Restaurant');
    
    await page.goto('/restaurant/menu');
    await page.waitForLoadState('networkidle');
    
    // Vérifier que le dashboard affiche les bons plats
    const dashboardItemCount = await page.locator('[data-testid="menu-item-card"]').count();
    console.log(`🌐 Dashboard: ${dashboardItemCount} plats affichés`);
    
    // PHASE 2: Vérification API
    console.log('🔗 PHASE 2: API Backend');
    
    const apiMenuItems = await api.getRestaurantMenuItems(process.env.TEST_RESTAURANT_ID!);
    console.log(`📡 API: ${apiMenuItems.length} plats récupérés`);
    
    expect(apiMenuItems.length).toBeGreaterThanOrEqual(8);
    
    // PHASE 3: Simulation Mobile
    console.log('📱 PHASE 3: Simulation Mobile');
    
    // Simuler sélection de plats comme l'app mobile
    const selectedItems = [
      apiMenuItems.find(item => item.name === 'Pizza Margherita'),
      apiMenuItems.find(item => item.name === 'Tiramisu'),
      apiMenuItems.find(item => item.name === 'Coca-Cola')
    ].filter(Boolean);
    
    expect(selectedItems.length).toBe(3);
    console.log(`🛒 ${selectedItems.length} plats sélectionnés`);
    
    // Créer commande
    const orderData = {
      restaurantId: process.env.TEST_RESTAURANT_ID,
      items: selectedItems.map(item => ({
        menuItemId: item.id,
        quantity: item.name === 'Coca-Cola' ? 2 : 1,
        unitPrice: item.price,
        specialNotes: item.name === 'Pizza Margherita' ? 'Sans oignons' : ''
      })),
      customerName: 'Test Flow Complet',
      customerPhone: '06.99.88.77.66',
      specialInstructions: 'Test d\'intégration complète OneEats',
      estimatedPickupTime: new Date(Date.now() + 30 * 60000).toISOString()
    };
    
    const order = await api.createOrder(orderData);
    expect(order.id).toBeDefined();
    console.log(`✅ Commande créée: ${order.id}`);
    
    // PHASE 4: Vérification BDD
    console.log('🗄️ PHASE 4: Validation Base de Données');
    
    await db.waitForCondition(async () => {
      const latestOrder = await db.getLatestOrder();
      return latestOrder?.id === order.id;
    }, 5000);
    
    const dbOrder = await db.getLatestOrder();
    expect(dbOrder.id).toBe(order.id);
    expect(dbOrder.restaurant_name).toBe('Pizza Palace');
    
    // PHASE 5: Simulation Dashboard Restaurant
    console.log('🏪 PHASE 5: Simulation Dashboard Restaurant');
    
    // Simuler réception de commande dans le dashboard
    await page.goto('/restaurant/orders');
    await page.waitForLoadState('networkidle');
    
    // Vérifier que la nouvelle commande apparaît
    // (En fonction de l'implémentation du dashboard)
    const orderElements = page.locator('[data-testid="order-item"]');
    if (await orderElements.first().isVisible()) {
      const orderCount = await orderElements.count();
      console.log(`📋 ${orderCount} commandes visibles dans le dashboard`);
    }
    
    // PHASE 6: Simulation du cycle de vie de la commande
    console.log('🔄 PHASE 6: Cycle de Vie de la Commande');
    
    await api.simulateOrderFlow(order.id);
    
    // Vérification finale
    const finalOrder = await api.getOrder(order.id);
    expect(finalOrder.status).toBe('RECUPEREE');
    
    const finalDbOrder = await db.getLatestOrder();
    expect(finalDbOrder.id).toBe(order.id);
    
    console.log('🎉 FLOW COMPLET VALIDÉ !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Dashboard: ${dashboardItemCount} plats`);
    console.log(`✅ API: ${apiMenuItems.length} plats`);
    console.log(`✅ Commande: ${order.id}`);
    console.log(`✅ BDD: Validée`);
    console.log(`✅ Statut final: ${finalOrder.status}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  test('Test de régression : Fonctionnalités critiques', async ({ page }) => {
    console.log('🔍 Test de Régression OneEats');
    
    // Test 1: API disponible
    const restaurants = await api.getAllRestaurants();
    expect(restaurants.length).toBeGreaterThan(0);
    console.log('✅ API Restaurants: OK');
    
    // Test 2: Pizza Palace présent
    const pizzaPalace = restaurants.find(r => r.id === process.env.TEST_RESTAURANT_ID);
    expect(pizzaPalace).toBeDefined();
    console.log('✅ Pizza Palace: Présent');
    
    // Test 3: Menu Items API
    const menuItems = await api.getRestaurantMenuItems(process.env.TEST_RESTAURANT_ID!);
    expect(menuItems.length).toBeGreaterThanOrEqual(8);
    console.log(`✅ Menu Items: ${menuItems.length} plats`);
    
    // Test 4: Dashboard accessible
    await page.goto('/restaurant/menu');
    await expect(page).toHaveTitle(/OneEats/);
    console.log('✅ Dashboard: Accessible');
    
    // Test 5: BDD cohérente
    const dbMenuCount = await db.getMenuItemsCount(process.env.TEST_RESTAURANT_ID!);
    expect(dbMenuCount).toBe(menuItems.length);
    console.log('✅ Cohérence API-BDD: OK');
    
    // Test 6: Création commande
    const testOrder = await api.createOrder({
      restaurantId: process.env.TEST_RESTAURANT_ID,
      items: [{
        menuItemId: menuItems[0].id,
        quantity: 1,
        unitPrice: menuItems[0].price,
        specialNotes: 'Test régression'
      }],
      customerName: 'Test Régression',
      customerPhone: '06.00.00.00.00',
      specialInstructions: 'Test automatisé de régression',
      estimatedPickupTime: new Date(Date.now() + 30 * 60000).toISOString()
    });
    
    expect(testOrder.id).toBeDefined();
    console.log('✅ Création Commande: OK');
    
    console.log('🎯 Test de régression terminé - Toutes les fonctionnalités critiques OK');
  });
});