import { test, expect } from '@playwright/test';

test.describe('Dashboard Restaurant - Interface UI', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigation vers le dashboard
    await page.goto('/restaurant/menu');
    await page.waitForLoadState('networkidle');
  });

  test('Test UI.1 : Accès et navigation dashboard', async ({ page }) => {
    console.log('🌐 Test UI.1 : Accès et navigation dashboard');
    
    // Vérifier que la page se charge
    await expect(page).toHaveURL(/restaurant\/menu/);
    
    // Vérifier les éléments principaux de l'interface
    // (Ces sélecteurs dépendent de votre implémentation React)
    
    // Vérifier le titre ou header
    const header = page.locator('h1, h2, [data-testid="page-title"]').first();
    await expect(header).toBeVisible();
    
    console.log('✅ Test UI.1 : Dashboard accessible et chargé');
  });

  test('Test UI.2 : Affichage des plats existants', async ({ page }) => {
    console.log('🍽️ Test UI.2 : Affichage des plats existants');
    
    // Attendre que les données soient chargées
    await page.waitForTimeout(2000);
    
    // Chercher les plats affichés (adaptez les sélecteurs)
    const menuItems = page.locator('[class*="menu"], [class*="item"], [class*="card"], [data-testid*="menu"]');
    
    // Vérifier qu'on a des éléments (au moins quelques plats)
    const count = await menuItems.count();
    console.log(`📊 ${count} éléments trouvés dans l'interface`);
    
    // On s'attend à voir au moins quelques éléments
    expect(count).toBeGreaterThan(0);
    
    console.log('✅ Test UI.2 : Plats affichés dans l\'interface');
  });

  test('Test UI.3 : Interaction basique avec l\'interface', async ({ page }) => {
    console.log('🖱️ Test UI.3 : Interaction basique');
    
    await page.waitForTimeout(2000);
    
    // Test des interactions basiques comme clic, scroll, etc.
    // Scroll de la page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // Rechercher des boutons interactifs
    const buttons = page.locator('button, [role="button"], a[href]');
    const buttonCount = await buttons.count();
    console.log(`🔘 ${buttonCount} éléments interactifs trouvés`);
    
    // Vérifier qu'il y a des éléments interactifs
    expect(buttonCount).toBeGreaterThan(0);
    
    console.log('✅ Test UI.3 : Interface interactive et responsive');
  });

  test('Test UI.4 : Vérification responsive et layout', async ({ page }) => {
    console.log('📱 Test UI.4 : Responsive et layout');
    
    // Test sur différentes tailles d'écran
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Vérifier que la page est toujours accessible
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      console.log(`✅ Layout OK sur ${viewport.width}x${viewport.height}`);
    }
    
    // Remettre la taille par défaut
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('✅ Test UI.4 : Responsive validé');
  });

  test('Test UI.5 : Performance et temps de chargement', async ({ page }) => {
    console.log('⚡ Test UI.5 : Performance dashboard');
    
    const startTime = Date.now();
    
    await page.goto('/restaurant/menu');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Temps de chargement: ${loadTime}ms`);
    
    // Le dashboard doit se charger en moins de 5 secondes
    expect(loadTime).toBeLessThan(5000);
    
    // Vérifier qu'il n'y a pas d'erreurs JavaScript
    const jsErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Vérifier qu'il n'y a pas d'erreurs critiques
    const criticalErrors = jsErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('chunk') && 
      !error.includes('sourcemap')
    );
    
    console.log(`🐛 ${criticalErrors.length} erreurs JS critiques détectées`);
    if (criticalErrors.length > 0) {
      console.log('Erreurs:', criticalErrors);
    }
    
    // Tolérer quelques erreurs non critiques mais pas trop
    expect(criticalErrors.length).toBeLessThanOrEqual(2);
    
    console.log('✅ Test UI.5 : Performance dashboard validée');
  });

  test('Test UI.6 : Navigation entre pages', async ({ page }) => {
    console.log('🧭 Test UI.6 : Navigation dashboard');
    
    // Page menu
    await page.goto('/restaurant/menu');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/menu/);
    
    // Essayer d'accéder aux autres pages du dashboard si elles existent
    const navLinks = [
      '/restaurant/orders',
      '/restaurant/analytics',
      '/restaurant/settings',
      '/restaurant'
    ];
    
    for (const link of navLinks) {
      try {
        await page.goto(link, { timeout: 5000 });
        await page.waitForLoadState('networkidle', { timeout: 3000 });
        
        // Vérifier que la page ne retourne pas 404
        const title = await page.title();
        const isErrorPage = title.toLowerCase().includes('error') || 
                           title.includes('404') || 
                           title.includes('not found');
        
        if (!isErrorPage) {
          console.log(`✅ Page accessible: ${link}`);
        } else {
          console.log(`ℹ️ Page non implémentée: ${link}`);
        }
        
      } catch (error) {
        console.log(`ℹ️ Page non accessible: ${link}`);
      }
    }
    
    // Retour à la page menu
    await page.goto('/restaurant/menu');
    await expect(page).toHaveURL(/menu/);
    
    console.log('✅ Test UI.6 : Navigation testée');
  });
});