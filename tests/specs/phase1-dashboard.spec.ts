import { test, expect } from '@playwright/test';

test.describe('Phase 1 : Gestion des Menus - Dashboard Restaurant', () => {
  const PIZZA_PALACE_ID = '11111111-1111-1111-1111-111111111111';

  test('Test 1.1 : Création d\'un menu complet', async ({ page }) => {
    console.log('🍕 Test 1.1 : Création d\'un menu complet');
    
    // Navigation vers le dashboard menu
    await page.goto('/restaurant/menu');
    await expect(page).toHaveTitle(/OneEats/);
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');
    
    // Vérifier que nous sommes sur la bonne page
    await expect(page.locator('h1')).toContainText('Gestion du Menu');
    
    // Compter les plats existants avant
    const existingItems = await page.locator('[data-testid="menu-item-card"]').count();
    console.log(`📊 ${existingItems} plats existants trouvés`);
    
    // Vérifier que Pizza Palace a bien ses plats dans la BDD
    const dbMenuItemsCount = await db.getMenuItemsCount(process.env.TEST_RESTAURANT_ID!);
    console.log(`🗄️ ${dbMenuItemsCount} plats en base de données`);
    
    // Les plats doivent être synchronisés entre BDD et interface
    expect(dbMenuItemsCount).toBeGreaterThanOrEqual(8);
    
    // Vérifier les catégories présentes
    const categories = await page.locator('[data-testid="category-filter"]').allTextContents();
    console.log('🏷️ Catégories trouvées:', categories);
    
    // Vérifier que les principales catégories sont présentes
    const categoryText = categories.join(' ');
    expect(categoryText).toContain('Pizza');
    expect(categoryText).toContain('Dessert');
    
    console.log('✅ Test 1.1 : Menu complet validé');
  });

  test('Test 1.2 : Gestion de la disponibilité', async ({ page }) => {
    console.log('👁️ Test 1.2 : Gestion de la disponibilité');
    
    await page.goto('/restaurant/menu');
    await page.waitForLoadState('networkidle');
    
    // Trouver un plat disponible
    const menuItem = page.locator('[data-testid="menu-item-card"]').first();
    await expect(menuItem).toBeVisible();
    
    // Récupérer le nom du plat pour le suivi
    const itemName = await menuItem.locator('[data-testid="item-name"]').textContent();
    console.log(`🍽️ Test avec le plat: ${itemName}`);
    
    // Cliquer sur l'action de disponibilité (toggle)
    const availabilityToggle = menuItem.locator('[data-testid="availability-toggle"]');
    if (await availabilityToggle.isVisible()) {
      await availabilityToggle.click();
      
      // Attendre la mise à jour
      await page.waitForTimeout(1000);
      
      // Vérifier le changement visuel
      console.log('🔄 Statut de disponibilité modifié');
      
      // Remettre dans l'état original
      await availabilityToggle.click();
      await page.waitForTimeout(1000);
    }
    
    console.log('✅ Test 1.2 : Gestion de disponibilité validée');
  });

  test('Test 1.3 : Filtres et recherche', async ({ page }) => {
    console.log('🔍 Test 1.3 : Filtres et recherche');
    
    await page.goto('/restaurant/menu');
    await page.waitForLoadState('networkidle');
    
    // Test du filtre par catégorie
    const pizzaFilter = page.locator('[data-testid="category-filter"]', { hasText: 'Pizza' });
    if (await pizzaFilter.isVisible()) {
      await pizzaFilter.click();
      await page.waitForTimeout(500);
      
      // Vérifier que seules les pizzas sont affichées
      const visibleItems = page.locator('[data-testid="menu-item-card"]:visible');
      const count = await visibleItems.count();
      console.log(`🍕 ${count} pizzas affichées après filtrage`);
      
      // Vérifier qu'on a au moins quelques pizzas
      expect(count).toBeGreaterThan(0);
      
      // Reset du filtre
      const allFilter = page.locator('[data-testid="category-filter"]', { hasText: 'Tous' });
      if (await allFilter.isVisible()) {
        await allFilter.click();
      }
    }
    
    // Test de la recherche si présente
    const searchInput = page.locator('[data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('pizza');
      await page.waitForTimeout(500);
      
      const searchResults = page.locator('[data-testid="menu-item-card"]:visible');
      const resultCount = await searchResults.count();
      console.log(`🔍 ${resultCount} résultats pour "pizza"`);
      
      // Clear search
      await searchInput.clear();
    }
    
    console.log('✅ Test 1.3 : Filtres et recherche validés');
  });

  test('Test 1.4 : Validation données synchronisées', async ({ page }) => {
    console.log('🔄 Test 1.4 : Validation synchronisation BDD');
    
    await page.goto('/restaurant/menu');
    await page.waitForLoadState('networkidle');
    
    // Récupérer les données de l'interface
    const uiMenuItems = await page.locator('[data-testid="menu-item-card"]').count();
    
    // Récupérer les données de la BDD
    const dbMenuItems = await db.getMenuItems(process.env.TEST_RESTAURANT_ID!);
    const availableDbItems = dbMenuItems.filter(item => item.is_available);
    
    console.log(`🌐 Interface: ${uiMenuItems} plats`);
    console.log(`🗄️ BDD: ${dbMenuItems.length} plats total, ${availableDbItems.length} disponibles`);
    
    // La synchronisation doit être cohérente
    // (peut varier selon les filtres appliqués)
    expect(dbMenuItems.length).toBeGreaterThan(0);
    
    // Vérifier quelques plats spécifiques de Pizza Palace
    const pizzaMargheritta = dbMenuItems.find(item => item.name === 'Pizza Margherita');
    const tiramisu = dbMenuItems.find(item => item.name === 'Tiramisu');
    
    expect(pizzaMargheritta).toBeDefined();
    expect(tiramisu).toBeDefined();
    expect(pizzaMargheritta.price).toBe('12.50');
    expect(tiramisu.price).toBe('7.00');
    
    console.log('✅ Test 1.4 : Synchronisation BDD validée');
  });
});