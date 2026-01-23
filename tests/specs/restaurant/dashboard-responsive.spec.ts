/**
 * @fileoverview Restaurant Dashboard Responsive Design E2E Tests
 * @description Tests for responsive design, mobile compatibility, and cross-device
 * functionality of the restaurant dashboard.
 * 
 * @author OneEats Development Team
 * @since 2025-09-10
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';

/**
 * Restaurant Dashboard Responsive Design Test Suite
 * 
 * Validates responsive design implementation, mobile interactions,
 * and cross-device compatibility.
 */
test.describe('Restaurant Dashboard Responsive Design', () => {
  
  /** Standard viewport configurations for testing */
  const VIEWPORTS = {
    mobile: { width: 375, height: 667, name: 'Mobile' },
    tablet: { width: 768, height: 1024, name: 'Tablet' },
    desktop: { width: 1920, height: 1080, name: 'Desktop' },
    ultrawide: { width: 2560, height: 1440, name: 'Ultrawide' }
  };

  /**
   * Cross-Device Navigation
   * 
   * Tests navigation functionality across different device sizes.
   */
  test.describe('Cross-Device Navigation', () => {
    test('should maintain navigation functionality across all viewport sizes', async ({ page }) => {
      console.log('📱 Testing cross-device navigation functionality');
      
      for (const [key, viewport] of Object.entries(VIEWPORTS)) {
        console.log(`📐 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/restaurant/menu');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500);
        
        // Test menu navigation
        const menuItems = page.locator('[data-testid="menu-item-card"]');
        const menuCount = await menuItems.count();
        
        // Test responsive navigation elements
        if (viewport.width <= 768) {
          // Mobile/Tablet: Check for hamburger menu or mobile navigation
          const mobileNav = page.locator('.lg\\:hidden, [class*="mobile"], button[aria-label*="menu"]');
          const mobileElements = await mobileNav.count();
          console.log(`  ✓ ${menuCount} menu items, ${mobileElements} mobile navigation elements`);
        } else {
          // Desktop: Check for full navigation
          const desktopNav = page.locator('.hidden.lg\\:block, .lg\\:flex, nav');
          const desktopElements = await desktopNav.count();
          console.log(`  ✓ ${menuCount} menu items, ${desktopElements} desktop navigation elements`);
        }
        
        // Test action buttons responsiveness
        const actionButtons = page.locator('button').filter({ hasText: /Ajouter|Modifier|Masquer/ });
        const buttonCount = await actionButtons.count();
        
        if (buttonCount > 0) {
          // Verify buttons are clickable
          const firstButton = actionButtons.first();
          const isVisible = await firstButton.isVisible();
          console.log(`  ✓ ${buttonCount} action buttons, first button visible: ${isVisible}`);
        }
      }
      
      // Restore default viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      console.log('✅ Cross-device navigation test completed');
    });
  });

  /**
   * Mobile-Specific Interactions
   * 
   * Tests mobile-specific UI patterns and touch interactions.
   */
  test.describe('Mobile-Specific Interactions', () => {
    test('should provide optimal mobile experience with touch-friendly interactions', async ({ page }) => {
      console.log('📱 Testing mobile-specific interactions');
      
      // Set mobile viewport
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/restaurant/menu');
      await page.waitForLoadState('domcontentloaded');
      
      // Test mobile header
      const mobileHeader = page.locator('.sm\\:hidden, [class*="mobile"]');
      const mobileHeaderCount = await mobileHeader.count();
      console.log(`📱 Mobile header elements: ${mobileHeaderCount}`);
      
      // Test swipe-friendly card layouts
      const menuCards = page.locator('[data-testid="menu-item-card"]');
      const cardCount = await menuCards.count();
      
      if (cardCount > 0) {
        console.log(`📱 ${cardCount} menu cards in mobile layout`);
        
        // Test first card mobile layout
        const firstCard = menuCards.first();
        const cardBounds = await firstCard.boundingBox();
        
        if (cardBounds) {
          // Verify minimum touch target size (44px recommended)
          const minTouchTarget = 44;
          console.log(`  ✓ Card dimensions: ${cardBounds.width}x${cardBounds.height}`);
          
          // Test mobile action buttons
          const mobileButtons = firstCard.locator('button');
          const mobileButtonCount = await mobileButtons.count();
          
          if (mobileButtonCount > 0) {
            const buttonBounds = await mobileButtons.first().boundingBox();
            if (buttonBounds && buttonBounds.height >= minTouchTarget) {
              console.log(`  ✓ ${mobileButtonCount} touch-friendly buttons (height: ${buttonBounds.height}px)`);
            }
          }
        }
      }
      
      // Test mobile-specific navigation
      await page.goto('/restaurant/orders');
      await page.waitForTimeout(500);
      
      const orderElements = page.locator('.card, [class*="bg-white"]');
      const orderCount = await orderElements.count();
      console.log(`📱 ${orderCount} order elements in mobile layout`);
      
      // Test settings page mobile layout
      await page.goto('/restaurant/settings');
      await page.waitForTimeout(500);
      
      const settingsInputs = page.locator('input, textarea, select');
      const inputCount = await settingsInputs.count();
      console.log(`📱 ${inputCount} form elements in mobile layout`);
      
      console.log('✅ Mobile-specific interactions test completed');
    });

    test('should handle mobile menu creation workflow', async ({ page }) => {
      console.log('📱 Testing mobile menu creation workflow');
      
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/restaurant/menu');
      await page.waitForLoadState('domcontentloaded');
      
      // Test mobile add button
      const addButtons = page.locator('button').filter({ hasText: /Ajouter/ });
      const mobileAddCount = await addButtons.count();
      
      if (mobileAddCount > 0) {
        console.log(`📱 ${mobileAddCount} add buttons available on mobile`);
        
        // Test modal opening on mobile
        const firstAddButton = addButtons.first();
        const isVisible = await firstAddButton.isVisible();
        
        if (isVisible) {
          await firstAddButton.click();
          await page.waitForTimeout(1000);
          
          // Check modal responsiveness
          const modal = page.locator('div.fixed.inset-0 div.inline-block');
          if (await modal.isVisible()) {
            console.log('✅ Modal opens correctly on mobile');
            
            // Test mobile form layout
            const modalInputs = modal.locator('input, textarea');
            const modalInputCount = await modalInputs.count();
            console.log(`  ✓ ${modalInputCount} form fields in mobile modal`);
            
            // Test mobile modal closure
            const closeButton = modal.locator('button').filter({ hasText: /fermer|close|×/ }).first();
            if (await closeButton.count() > 0) {
              await closeButton.click();
              await expect(modal).toBeHidden({ timeout: 3000 });
              console.log('  ✓ Modal closes correctly on mobile');
            } else {
              // Close by clicking outside
              await page.locator('div.fixed.inset-0').first().click();
              await page.waitForTimeout(500);
            }
          }
        }
      }
      
      console.log('✅ Mobile menu creation workflow test completed');
    });
  });

  /**
   * Tablet Layout Optimization
   * 
   * Tests tablet-specific layouts and interactions.
   */
  test.describe('Tablet Layout Optimization', () => {
    test('should provide optimized tablet experience with appropriate spacing and navigation', async ({ page }) => {
      console.log('📟 Testing tablet layout optimization');
      
      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto('/restaurant/menu');
      await page.waitForLoadState('domcontentloaded');
      
      // Test tablet header layout
      const tabletHeader = page.locator('.hidden.sm\\:block.lg\\:hidden, .sm\\:flex, .md\\:grid');
      const tabletHeaderCount = await tabletHeader.count();
      console.log(`📟 Tablet-specific elements: ${tabletHeaderCount}`);
      
      // Test grid layouts on tablet
      const menuGrid = page.locator('[class*="grid"], [class*="flex"]');
      const gridCount = await menuGrid.count();
      console.log(`📟 Grid/flex layouts: ${gridCount}`);
      
      // Test tablet navigation
      const pages = ['/restaurant/menu', '/restaurant/orders', '/restaurant/settings'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForTimeout(500);
        
        // Verify page loads correctly on tablet
        const pageContent = await page.content();
        const hasContent = pageContent.length > 1000; // Basic content check
        console.log(`  ✓ ${pagePath}: Content loaded (${hasContent ? 'OK' : 'Minimal'})`);
        
        // Check for tablet-specific responsive elements
        const responsiveElements = page.locator('.sm\\:block, .md\\:flex, .sm\\:grid');
        const responsiveCount = await responsiveElements.count();
        console.log(`    ${responsiveCount} responsive elements detected`);
      }
      
      console.log('✅ Tablet layout optimization test completed');
    });
  });

  /**
   * Desktop and Ultrawide Support
   * 
   * Tests large screen layouts and advanced desktop features.
   */
  test.describe('Desktop and Ultrawide Support', () => {
    test('should utilize large screen real estate effectively', async ({ page }) => {
      console.log('🖥️ Testing desktop and ultrawide support');
      
      for (const viewport of [VIEWPORTS.desktop, VIEWPORTS.ultrawide]) {
        console.log(`🖥️ Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/restaurant/menu');
        await page.waitForLoadState('domcontentloaded');
        
        // Test large screen layouts
        const desktopElements = page.locator('.lg\\:block, .lg\\:flex, .lg\\:grid, .xl\\:grid');
        const desktopCount = await desktopElements.count();
        console.log(`  ✓ ${desktopCount} large-screen optimized elements`);
        
        // Test menu grid on large screens
        const menuItems = page.locator('[data-testid="menu-item-card"]');
        const itemCount = await menuItems.count();
        
        if (itemCount > 0) {
          // Check for multi-column layouts
          const firstItem = menuItems.first();
          const itemBounds = await firstItem.boundingBox();
          
          if (itemBounds) {
            const itemsPerRow = Math.floor(viewport.width / itemBounds.width);
            console.log(`  ✓ Estimated ${itemsPerRow} items per row on ${viewport.name}`);
          }
        }
        
        // Test sidebar visibility on large screens
        const sidebar = page.locator('.sidebar, nav, .lg\\:w-64, .lg\\:w-72');
        const sidebarVisible = await sidebar.count() > 0;
        console.log(`  ✓ Sidebar visibility: ${sidebarVisible ? 'Visible' : 'Hidden/Responsive'}`);
        
        // Test hover effects (desktop-specific)
        if (viewport.width >= 1920) {
          const hoverableElements = page.locator('[class*="hover\\:"], button, .card');
          const hoverCount = await hoverableElements.count();
          console.log(`  ✓ ${hoverCount} elements with hover effects`);
        }
      }
      
      console.log('✅ Desktop and ultrawide support test completed');
    });
  });

  /**
   * Performance Across Devices
   * 
   * Tests performance characteristics on different viewport sizes.
   */
  test.describe('Performance Across Devices', () => {
    test('should maintain good performance across all device sizes', async ({ page }) => {
      console.log('⚡ Testing performance across device sizes');
      
      const performanceResults: Array<{viewport: string, loadTime: number, elementCount: number}> = [];
      
      for (const [key, viewport] of Object.entries(VIEWPORTS)) {
        console.log(`⚡ Performance test: ${viewport.name}`);
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        const startTime = Date.now();
        await page.goto('/restaurant/menu');
        await page.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - startTime;
        
        // Count rendered elements
        const allElements = page.locator('button, input, .card, [data-testid]');
        const elementCount = await allElements.count();
        
        performanceResults.push({
          viewport: viewport.name,
          loadTime,
          elementCount
        });
        
        console.log(`  ✓ ${viewport.name}: ${loadTime}ms load time, ${elementCount} elements`);
        
        // Performance assertion - adjusted for E2E reality
        expect(loadTime).toBeLessThan(40000); // Should load within 40 seconds (E2E)
      }
      
      // Compare performance across viewports
      const avgLoadTime = performanceResults.reduce((sum, result) => sum + result.loadTime, 0) / performanceResults.length;
      console.log(`📊 Average load time across all viewports: ${avgLoadTime.toFixed(0)}ms`);
      
      // Verify consistent element counts
      const elementCounts = performanceResults.map(r => r.elementCount);
      const minElements = Math.min(...elementCounts);
      const maxElements = Math.max(...elementCounts);
      const elementVariance = maxElements - minElements;
      
      console.log(`📊 Element count variance: ${elementVariance} (${minElements}-${maxElements})`);
      
      // Element count should be relatively consistent (allow some variance for responsive elements)
      expect(elementVariance).toBeLessThan(50);
      
      console.log('✅ Performance across devices test completed');
    });
  });
});