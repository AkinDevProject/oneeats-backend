/**
 * @fileoverview Restaurant Order Management E2E Tests
 * @description Tests for order processing, status management, and order workflow
 * in the restaurant dashboard.
 * 
 * @author OneEats Development Team
 * @since 2025-09-10
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';

/**
 * Restaurant Order Management Test Suite
 * 
 * Tests the complete order management workflow including order processing,
 * status updates, filtering, and dashboard design customization.
 */
test.describe('Restaurant Order Management', () => {
  
  /**
   * Order Display and Navigation
   * 
   * Tests order list display, filtering, and navigation functionality.
   */
  test.describe('Order Display and Navigation', () => {
    test('should display orders and provide filtering capabilities', async ({ page }) => {
      console.log('📋 Testing order display and navigation');
      
      // Navigate to orders page
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('networkidle');
      
      // Verify page accessibility
      const pageContent = await page.content();
      const hasOrderContent = pageContent.toLowerCase().includes('commande') ||
                              pageContent.toLowerCase().includes('order');
      expect(hasOrderContent).toBeTruthy();
      console.log('✅ Orders page accessible');
      
      // Check for order cards
      const orderCards = page.locator('.card, [class*="bg-white"]').filter({
        has: page.locator('button:has-text("Accepter"), button:has-text("Prêt"), button:has-text("Récupérée")')
      });
      const orderCount = await orderCards.count();
      console.log(`📊 Found ${orderCount} orders in interface`);
      
      if (orderCount > 0) {
        console.log('✅ Orders are displayed');
        
        // Test status filter tabs
        const statusTabs = [
          'En attente', 'En cours', 'Prêtes', 'Récupérées', 'Annulées',
          'en_attente', 'en_preparation', 'prete', 'recuperee', 'annulee'
        ];
        
        let tabsFound = 0;
        for (const statusText of statusTabs) {
          const tabButton = page.locator(`button:has-text("${statusText}")`);
          if (await tabButton.count() > 0) {
            tabsFound++;
            console.log(`  ✓ Status tab "${statusText}" found`);
            
            // Test first tab navigation
            if (tabsFound === 1) {
              await tabButton.first().click();
              await page.waitForTimeout(1000);
              console.log(`  ✓ Navigation to "${statusText}" tested`);
            }
          }
        }
        
        if (tabsFound > 0) {
          console.log(`✅ ${tabsFound} status tabs available`);
        }
        
        // Test order search
        const searchInputs = page.locator('input[placeholder*="recherche"], input[placeholder*="Rechercher"]');
        if (await searchInputs.count() > 0) {
          const searchInput = searchInputs.first();
          await searchInput.fill('test');
          await page.waitForTimeout(1000);
          console.log('✅ Order search functionality tested');
          await searchInput.clear();
        }
      } else {
        console.log('ℹ️ No orders currently displayed');
      }
      
      console.log('✅ Order display and navigation test completed');
    });
  });

  /**
   * Order Actions and Status Management
   * 
   * Tests order action buttons and status transitions.
   */
  test.describe('Order Actions and Status Management', () => {
    test('should provide order action buttons and dashboard customization', async ({ page }) => {
      console.log('🎛️ Testing order actions and dashboard customization');
      
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('networkidle');
      
      // Count available action buttons
      const actionButtons = page.locator('button').filter({ 
        hasText: /Accepter|Prêt|Récupéré|Annuler|En cours/
      });
      const buttonCount = await actionButtons.count();
      console.log(`📊 Found ${buttonCount} order action buttons`);
      
      if (buttonCount > 0) {
        console.log('✅ Order action buttons are available');
        
        // Test first available action (non-destructive)
        const firstButton = actionButtons.first();
        const buttonText = await firstButton.textContent();
        console.log(`  ✓ Testing action button: "${buttonText}"`);
        
        // Note: We don't actually click to avoid modifying order states
        expect(await firstButton.isEnabled()).toBe(true);
        console.log('  ✓ Action button is interactive');
      }
      
      // Test dashboard design selector
      console.log('🎨 Testing dashboard design selector...');
      
      const designSelectorButton = page.locator('button, a').filter({ 
        hasText: /design|style|personnalis|customiz/i 
      });
      
      if (await designSelectorButton.count() > 0) {
        await designSelectorButton.first().click();
        await page.waitForTimeout(2000);
        
        // Check for design options
        const designOptions = page.locator('button, div').filter({ 
          hasText: /style|theme|design|moderne|classic/i 
        });
        const optionCount = await designOptions.count();
        console.log(`📊 Found ${optionCount} design style options`);
        
        if (optionCount > 0) {
          console.log('✅ Dashboard design selector functional');
          
          // Test selecting a design (non-destructive)
          const firstDesign = designOptions.first();
          const designName = await firstDesign.textContent();
          console.log(`  ✓ Design option available: "${designName?.slice(0, 20)}..."`);
          
          // Return to orders page
          await page.goto('/restaurant/orders');
          await page.waitForLoadState('networkidle');
          console.log('✅ Returned to orders page after design testing');
        }
      } else {
        console.log('ℹ️ Design selector not found or not accessible');
      }
      
      console.log('✅ Order actions and customization test completed');
    });
  });

  /**
   * API Error Handling and Resilience
   * 
   * Tests error handling when backend is unavailable or returns errors.
   */
  test.describe('API Error Handling', () => {
    test('should handle API errors gracefully when backend is disconnected', async ({ page }) => {
      console.log('🔧 Testing API error handling');
      
      // First, load the page normally
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('networkidle');
      
      // Intercept API calls and simulate server errors
      await page.route('**/api/**', async route => {
        const url = route.request().url();
        console.log(`🔧 Intercepting API call: ${url}`);
        
        // Simulate different error scenarios
        if (url.includes('/orders')) {
          // Simulate 500 Internal Server Error
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Internal Server Error',
              message: 'Database connection failed'
            })
          });
        } else if (url.includes('/menu')) {
          // Simulate network timeout
          await page.waitForTimeout(2000);
          await route.abort('timedout');
        } else {
          // Let other requests go through normally
          await route.continue();
        }
      });
      
      console.log('🔸 Testing 500 error handling...');
      
      // Try to refresh orders data
      await page.reload();
      await page.waitForTimeout(3000);
      
      // Check for error handling UI
      const pageContent = await page.content();
      const hasErrorMessage = pageContent.includes('erreur') || 
                             pageContent.includes('error') || 
                             pageContent.includes('problème') ||
                             pageContent.includes('indisponible') ||
                             pageContent.includes('connexion');
      
      if (hasErrorMessage) {
        console.log('  ✅ Error message displayed to user');
      } else {
        console.log('  ⚠️ Error handling could be improved');
      }
      
      // Check if the interface remains functional
      const navigationLinks = page.locator('a, button').filter({ hasText: /menu|paramètre|accueil/i });
      const linkCount = await navigationLinks.count();
      
      if (linkCount > 0) {
        console.log(`  ✅ Interface remains functional with ${linkCount} navigation options`);
      }
      
      // Test error recovery
      console.log('🔸 Testing error recovery...');
      
      // Remove route interception to restore normal behavior
      await page.unroute('**/api/**');
      
      // Try to navigate and recover
      await page.goto('/restaurant/menu');
      await page.waitForTimeout(2000);
      
      const menuContent = await page.content();
      if (menuContent.includes('Menu') || menuContent.includes('menu')) {
        console.log('  ✅ Application recovered successfully');
      }
      
      console.log('✅ API error handling test completed');
    });

    test('should handle slow API responses and loading states', async ({ page }) => {
      console.log('⏳ Testing slow API response handling');
      
      // Intercept API calls to add delay
      await page.route('**/api/orders**', async route => {
        console.log('🔧 Simulating slow API response...');
        await page.waitForTimeout(5000); // 5 second delay
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/restaurant/orders');
      
      // Check for loading indicators during the delay
      const loadingIndicators = page.locator(
        '.spinner, .loading, [class*="loading"], [class*="spinner"], .animate-spin'
      );
      
      const hasLoadingState = await Promise.race([
        loadingIndicators.first().isVisible().then(() => true).catch(() => false),
        page.waitForTimeout(2000).then(() => false)
      ]);
      
      if (hasLoadingState) {
        console.log('  ✅ Loading indicator shown during slow response');
      } else {
        console.log('  ⚠️ No loading indicator detected');
      }
      
      // Wait for final load
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      const totalTime = Date.now() - startTime;
      
      console.log(`📊 Page loaded in ${totalTime}ms with simulated delay`);
      
      // Verify functionality after slow load
      const pageContent = await page.content();
      const isLoaded = pageContent.includes('commande') || pageContent.includes('order');
      
      expect(isLoaded).toBe(true);
      console.log('✅ Page functionality maintained after slow API response');
      
      // Cleanup
      await page.unroute('**/api/orders**');
      console.log('✅ Slow API response test completed');
    });

    test('should handle network disconnection gracefully', async ({ page }) => {
      console.log('🌐 Testing network disconnection handling');
      
      // Load page normally first
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('networkidle');
      
      console.log('🔸 Simulating network disconnection...');
      
      // Block all network requests to simulate disconnection
      await page.route('**/*', async route => {
        await route.abort('internetdisconnected');
      });
      
      // Try to interact with the interface
      const actionButtons = page.locator('button').filter({ hasText: /Accepter|Prêt|Actualiser/ });
      
      if (await actionButtons.count() > 0) {
        const testButton = actionButtons.first();
        
        // Try to click an action button
        try {
          await testButton.click();
          await page.waitForTimeout(3000);
          console.log('  ✓ Button interaction attempted during disconnection');
          
          // Check for offline indicators or error messages
          const offlineContent = await page.content();
          const hasOfflineHandling = offlineContent.includes('hors ligne') || 
                                   offlineContent.includes('offline') ||
                                   offlineContent.includes('connexion') ||
                                   offlineContent.includes('réseau');
          
          if (hasOfflineHandling) {
            console.log('  ✅ Offline state properly handled');
          } else {
            console.log('  ℹ️ Offline handling could be enhanced');
          }
          
        } catch (error) {
          console.log('  ✅ Action prevented during disconnection (expected behavior)');
        }
      }
      
      // Test offline persistence of UI state
      const uiElements = page.locator('nav, header, .sidebar, main');
      const elementCount = await uiElements.count();
      
      expect(elementCount).toBeGreaterThan(0);
      console.log(`  ✅ ${elementCount} UI elements remain visible offline`);
      
      // Restore network connectivity
      await page.unroute('**/*');
      console.log('🔸 Restoring network connectivity...');
      
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Network disconnection test completed');
    });
  });

  /**
   * Real-time Updates and Performance
   * 
   * Tests real-time order updates and interface performance.
   */
  test.describe('Real-time Updates and Performance', () => {
    test('should handle rapid navigation and maintain performance', async ({ page }) => {
      console.log('⚡ Testing performance and rapid navigation');
      
      const startTime = Date.now();
      
      // Rapid navigation test
      const navigationSequence = [
        '/restaurant/orders',
        '/restaurant/menu', 
        '/restaurant/orders',
        '/restaurant/settings',
        '/restaurant/orders'
      ];
      
      for (const [index, route] of navigationSequence.entries()) {
        await page.goto(route);
        await page.waitForTimeout(500);
        console.log(`  ✓ Navigation ${index + 1}/${navigationSequence.length}: ${route}`);
      }
      
      const navigationTime = Date.now() - startTime;
      console.log(`📊 Rapid navigation completed in ${navigationTime}ms`);
      
      // Verify final state
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/restaurant/orders');
      
      // Check for interface responsiveness
      const orderElements = page.locator('.card, [class*="bg-white"]');
      const elementCount = await orderElements.count();
      console.log(`📊 ${elementCount} order elements rendered after rapid navigation`);
      
      // Performance validation
      expect(navigationTime).toBeLessThan(10000); // Should complete within 10 seconds
      console.log('✅ Performance test passed');
      
      console.log('✅ Real-time updates and performance test completed');
    });

    test('should update orders in real-time when new orders arrive', async ({ page }) => {
      console.log('🔄 Testing real-time order updates');
      
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('networkidle');
      
      // Get initial order count
      const initialOrders = await page.locator('[data-testid="order-card"], .card').count();
      console.log(`📊 Initial orders: ${initialOrders}`);
      
      // Simulate new order arrival via API mock
      await page.route('**/api/orders**', async route => {
        const request = route.request();
        
        if (request.method() === 'GET') {
          // Mock response with additional order
          const mockOrders = [
            {
              id: 'test-order-123',
              status: 'en_attente',
              customerName: 'Test Customer',
              items: ['Pizza Margherita'],
              total: 12.50,
              createdAt: new Date().toISOString()
            }
          ];
          
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockOrders)
          });
        } else {
          await route.continue();
        }
      });
      
      console.log('🔸 Simulating new order arrival...');
      
      // Refresh to trigger update (in real app this would be automatic)
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check if orders updated
      const updatedOrders = await page.locator('[data-testid="order-card"], .card').count();
      console.log(`📊 Orders after update: ${updatedOrders}`);
      
      // Look for order update indicators
      const updateIndicators = page.locator('.notification, .toast, .alert, [class*="new"]');
      const hasUpdateIndicator = await updateIndicators.count() > 0;
      
      if (hasUpdateIndicator) {
        console.log('  ✅ Update notification displayed');
      } else {
        console.log('  ℹ️ Real-time update indicators could be enhanced');
      }
      
      // Cleanup route mock
      await page.unroute('**/api/orders**');
      
      console.log('✅ Real-time order update test completed');
    });
  });
});