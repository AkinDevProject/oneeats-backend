import { test, expect } from '@playwright/test';

test.describe('Phase 2 : Tests API Backend', () => {
  const PIZZA_PALACE_ID = '11111111-1111-1111-1111-111111111111';

  test('Test 2.1 : API Restaurants - GET /restaurants', async ({ request }) => {
    console.log('🏪 Test 2.1 : API Restaurants');
    
    const response = await request.get('/restaurants');
    expect(response.ok()).toBeTruthy();
    
    const restaurants = await response.json();
    console.log(`📊 ${restaurants.length} restaurants récupérés`);
    
    expect(restaurants).toBeDefined();
    expect(Array.isArray(restaurants)).toBe(true);
    expect(restaurants.length).toBeGreaterThan(0);
    
    // Vérifier que Pizza Palace est présent
    const pizzaPalace = restaurants.find(r => r.id === PIZZA_PALACE_ID);
    expect(pizzaPalace).toBeDefined();
    expect(pizzaPalace.name).toContain('Pizza Palace');
    
    console.log('✅ Test 2.1 : API Restaurants validée');
  });

  test('Test 2.2 : API Restaurant détails - GET /restaurants/{id}', async ({ request }) => {
    console.log('🔍 Test 2.2 : API Restaurant détails');
    
    const response = await request.get(`/restaurants/${PIZZA_PALACE_ID}`);
    expect(response.ok()).toBeTruthy();
    
    const restaurant = await response.json();
    
    expect(restaurant).toBeDefined();
    expect(restaurant.id).toBe(PIZZA_PALACE_ID);
    expect(restaurant.name).toContain('Pizza Palace');
    
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    console.log('✅ Test 2.2 : Restaurant détails validés');
  });

  test('Test 2.3 : API Menu Items - GET /menu-items/restaurant/{id}', async () => {
    console.log('🍽️ Test 2.3 : API Menu Items');
    
    const menuItems = await api.getRestaurantMenuItems(process.env.TEST_RESTAURANT_ID!);
    
    expect(menuItems).toBeDefined();
    expect(Array.isArray(menuItems)).toBe(true);
    expect(menuItems.length).toBeGreaterThanOrEqual(8);
    
    console.log(`📊 ${menuItems.length} plats récupérés`);
    
    // Vérifier des plats spécifiques
    const pizzaMargheritta = menuItems.find(item => item.name === 'Pizza Margherita');
    const tiramisu = menuItems.find(item => item.name === 'Tiramisu');
    const saladeCesar = menuItems.find(item => item.name === 'Salade César');
    
    expect(pizzaMargheritta).toBeDefined();
    expect(pizzaMargheritta.price).toBe(12.50);
    expect(pizzaMargheritta.category).toBe('Pizza');
    expect(pizzaMargheritta.isAvailable).toBe(true);
    
    expect(tiramisu).toBeDefined();
    expect(tiramisu.price).toBe(7.00);
    expect(tiramisu.category).toBe('Dessert');
    
    expect(saladeCesar).toBeDefined();
    expect(saladeCesar.price).toBe(9.50);
    expect(saladeCesar.category).toBe('Salade');
    
    // Vérifier les catégories
    const categories = [...new Set(menuItems.map(item => item.category))];
    console.log('🏷️ Catégories trouvées:', categories);
    expect(categories).toContain('Pizza');
    expect(categories).toContain('Dessert');
    expect(categories).toContain('Salade');
    
    // Vérifier que certains plats ont des options
    const itemsWithOptions = menuItems.filter(item => item.options && item.options.length > 0);
    console.log(`⚙️ ${itemsWithOptions.length} plats avec options`);
    expect(itemsWithOptions.length).toBeGreaterThan(0);
    
    // Vérifier une option spécifique (Pizza Margherita a des options)
    if (pizzaMargheritta.options && pizzaMargheritta.options.length > 0) {
      const option = pizzaMargheritta.options[0];
      expect(option.name).toBeDefined();
      expect(option.type).toBeDefined();
      expect(Array.isArray(option.choices)).toBe(true);
    }
    
    console.log('✅ Test 2.3 : API Menu Items validée');
  });

  test('Test 2.4 : Cohérence API-BDD', async () => {
    console.log('🔄 Test 2.4 : Cohérence API-BDD');
    
    // Données API
    const apiMenuItems = await api.getRestaurantMenuItems(process.env.TEST_RESTAURANT_ID!);
    
    // Données BDD
    const dbMenuItems = await db.getMenuItems(process.env.TEST_RESTAURANT_ID!);
    
    console.log(`🌐 API: ${apiMenuItems.length} plats`);
    console.log(`🗄️ BDD: ${dbMenuItems.length} plats`);
    
    // Même nombre de plats
    expect(apiMenuItems.length).toBe(dbMenuItems.length);
    
    // Vérifier la cohérence de quelques plats
    for (const apiItem of apiMenuItems.slice(0, 3)) { // Test sur 3 premiers plats
      const dbItem = dbMenuItems.find(db => db.id === apiItem.id);
      expect(dbItem).toBeDefined();
      expect(dbItem.name).toBe(apiItem.name);
      expect(parseFloat(dbItem.price)).toBe(apiItem.price);
      expect(dbItem.category).toBe(apiItem.category);
      expect(dbItem.is_available).toBe(apiItem.isAvailable);
    }
    
    console.log('✅ Test 2.4 : Cohérence API-BDD validée');
  });

  test('Test 2.5 : Performance API', async ({ request }) => {
    console.log('⚡ Test 2.5 : Performance API');
    
    const startTime = Date.now();
    
    // Test performance endpoint restaurants
    const restaurantsResponse = await request.get('/restaurants');
    const restaurantsTime = Date.now() - startTime;
    
    expect(restaurantsResponse.ok()).toBe(true);
    expect(restaurantsTime).toBeLessThan(2000); // Moins de 2 secondes
    console.log(`🏪 GET /restaurants: ${restaurantsTime}ms`);
    
    // Test performance endpoint menu items
    const menuStartTime = Date.now();
    const menuResponse = await request.get(`/menu-items/restaurant/${process.env.TEST_RESTAURANT_ID}`);
    const menuTime = Date.now() - menuStartTime;
    
    expect(menuResponse.ok()).toBe(true);
    expect(menuTime).toBeLessThan(1500); // Moins de 1.5 secondes
    console.log(`🍽️ GET /menu-items: ${menuTime}ms`);
    
    // Test performance endpoint restaurant spécifique
    const restaurantStartTime = Date.now();
    const restaurantResponse = await request.get(`/restaurants/${process.env.TEST_RESTAURANT_ID}`);
    const restaurantTime = Date.now() - restaurantStartTime;
    
    expect(restaurantResponse.ok()).toBe(true);
    expect(restaurantTime).toBeLessThan(1000); // Moins de 1 seconde
    console.log(`🔍 GET /restaurant: ${restaurantTime}ms`);
    
    console.log('✅ Test 2.5 : Performance API validée');
  });
});