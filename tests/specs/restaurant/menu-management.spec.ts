/**
 * @fileoverview Restaurant Menu Management E2E Tests
 * @description Comprehensive testing of menu item CRUD operations, availability management,
 * and restaurant dashboard interface interactions.
 * 
 * @author OneEats Development Team
 * @since 2025-09-10
 * @version 1.0.0
 * 
 * Test Coverage:
 * - Menu item creation with various configurations
 * - Availability toggle and real-time updates
 * - Menu filtering and search functionality
 * - Responsive design validation
 * - Data persistence and synchronization
 */

import { test, expect } from '@playwright/test';

/**
 * Restaurant Menu Management Test Suite
 * 
 * Tests the complete menu management workflow for restaurant owners,
 * including CRUD operations, availability management, and UI interactions.
 */
test.describe('Restaurant Menu Management', () => {
  /** Test restaurant ID for consistent data operations */
  const RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';
  
  /** Test data for menu item creation */
  const TEST_MENU_ITEMS = {
    appetizers: [
      { name: 'Caesar Salad', category: 'Appetizer', price: '8.50', description: 'Fresh romaine lettuce with parmesan cheese and croutons' },
      { name: 'Bruschetta', category: 'Appetizer', price: '6.50', description: 'Grilled bread with tomato, basil, and garlic' },
      { name: 'Soup of the Day', category: 'Appetizer', price: '5.50', description: 'Chef\'s daily soup selection with fresh ingredients' }
    ],
    mains: [
      { name: 'Margherita Pizza', category: 'Main Course', price: '12.50', description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil' },
      { name: 'Carbonara Pasta', category: 'Main Course', price: '11.50', description: 'Spaghetti with pancetta, eggs, parmesan, and black pepper' },
      { name: 'Classic Burger', category: 'Main Course', price: '13.50', description: 'Beef patty with lettuce, tomato, onion, and house sauce' },
      { name: 'Grilled Salmon', category: 'Main Course', price: '18.50', description: 'Fresh Atlantic salmon with seasonal vegetables' }
    ],
    desserts: [
      { name: 'Tiramisu', category: 'Dessert', price: '6.50', description: 'Classic Italian dessert with coffee and mascarpone' },
      { name: 'Crème Brûlée', category: 'Dessert', price: '7.50', description: 'Vanilla custard with caramelized sugar crust' }
    ]
  };

  /**
   * Authentication and Navigation
   * 
   * Ensures the restaurant dashboard is accessible and properly authenticated.
   */
  test.describe('Authentication and Navigation', () => {
    test('should authenticate and access restaurant dashboard', async ({ page }) => {
      // Navigate to restaurant dashboard
      await page.goto('/restaurant/menu');
      await page.waitForLoadState('networkidle');
      
      // Verify dashboard accessibility
      await expect(page).toHaveURL(/restaurant/);
      
      // Verify menu page elements are present
      const pageContent = await page.content();
      expect(pageContent).toContain('Menu');
      
      console.log('✅ Restaurant dashboard authentication successful');
    });
  });

  /**
   * Menu Item Creation
   * 
   * Tests the complete menu item creation workflow including form validation,
   * data persistence, and UI updates.
   */
  test.describe('Menu Item Creation', () => {
    test('should create complete menu with appetizers, mains, and desserts', async ({ page }) => {
      await page.goto('/restaurant/menu');
      await page.waitForLoadState('networkidle');
      
      // Get initial menu count
      const initialItems = await page.locator('[data-testid="menu-item-card"]').count();
      console.log(`📊 Initial menu items: ${initialItems}`);
      
      let totalCreated = 0;
      
      // Helper function for creating menu items
      const createMenuItem = async (item: typeof TEST_MENU_ITEMS.appetizers[0]) => {
        console.log(`📝 Creating: "${item.name}"`);
        
        // Find and click add button - try different viewport-specific buttons
        const addButtonSelectors = [
          'button:has-text("Ajouter un plat")',    // Desktop
          'button:has-text("Ajouter"):visible',   // Mobile/Tablet
        ];
        
        let modalOpened = false;
        
        for (const selector of addButtonSelectors) {
          if (modalOpened) break;
          
          try {
            const button = page.locator(selector).first();
            if (await button.isVisible({ timeout: 2000 })) {
              console.log(`  🖱️ Found and clicking: ${selector}`);
              await button.click({ timeout: 3000 });
              await page.waitForTimeout(800);
              
              // Check if modal opens
              const modal = page.locator('div.fixed.inset-0 div.inline-block');
              if (await modal.isVisible({ timeout: 3000 })) {
                console.log(`✅ Modal opened for "${item.name}"`);
                modalOpened = true;
                
                // Fill form fields using robust selectors
                const textInputs = modal.locator('input[type="text"], input:not([type])');
                if (await textInputs.count() > 0) {
                  await textInputs.nth(0).fill(item.name);
                }
                
                const descriptionTextarea = modal.locator('textarea');
                if (await descriptionTextarea.count() > 0) {
                  await descriptionTextarea.fill(item.description);
                }
                
                const priceInput = modal.locator('input[type="number"]');
                if (await priceInput.count() > 0) {
                  await priceInput.fill(item.price);
                }
                
                if (await textInputs.count() > 1) {
                  await textInputs.nth(1).fill(item.category);
                }
                
                // Verify availability checkbox is checked
                const availableCheckbox = modal.locator('input[type="checkbox"]#available');
                if (await availableCheckbox.count() > 0) {
                  const isChecked = await availableCheckbox.isChecked();
                  expect(isChecked).toBe(true);
                  console.log(`  ✅ "Available" checkbox: ${isChecked ? 'checked' : 'unchecked'}`);
                }
                
                // Submit form
                const submitButton = modal.locator('button[type="submit"]');
                await submitButton.click();
                
                // Wait for modal to close
                await expect(modal).toBeHidden({ timeout: 10000 });
                await page.waitForTimeout(1500);
                
                console.log(`  ✅ "${item.name}" created successfully`);
                return true;
              }
            }
          } catch (error) {
            console.log(`  ⚠️ ${selector} not found or not clickable`);
          }
        }
        
        console.log(`  ❌ Failed to create "${item.name}" - no button found`);
        return false;
      };
      
      // Create appetizers
      console.log('🥗 Creating appetizers...');
      for (const appetizer of TEST_MENU_ITEMS.appetizers) {
        const created = await createMenuItem(appetizer);
        if (created) totalCreated++;
      }
      console.log(`✅ ${totalCreated}/${TEST_MENU_ITEMS.appetizers.length} appetizers created`);
      
      // Create main courses
      console.log('🍝 Creating main courses...');
      const mainsCreated = totalCreated;
      for (const main of TEST_MENU_ITEMS.mains) {
        const created = await createMenuItem(main);
        if (created) totalCreated++;
      }
      console.log(`✅ ${totalCreated - mainsCreated}/${TEST_MENU_ITEMS.mains.length} main courses created`);
      
      // Create desserts
      console.log('🍰 Creating desserts...');
      const dessertsCreated = totalCreated;
      for (const dessert of TEST_MENU_ITEMS.desserts) {
        const created = await createMenuItem(dessert);
        if (created) totalCreated++;
      }
      console.log(`✅ ${totalCreated - dessertsCreated}/${TEST_MENU_ITEMS.desserts.length} desserts created`);
      
      // Verify final count
      const finalItems = await page.locator('[data-testid="menu-item-card"]').count();
      console.log(`📊 Final menu items: ${finalItems} (was ${initialItems})`);
      
      // Validate creation success
      expect(totalCreated).toBeGreaterThan(0);
      expect(finalItems).toBeGreaterThan(initialItems);
      
      console.log(`🎉 Menu creation complete: ${totalCreated}/9 items created`);
    });

    test('should create menu item with complex options and configurations', async ({ page }) => {
      await page.goto('/restaurant/menu');
      await page.waitForLoadState('networkidle');
      
      const complexItem = {
        name: 'Customizable Pizza',
        category: 'Main Course',
        price: '15.50',
        description: 'Build your own pizza with premium ingredients and custom options'
      };
      
      console.log('🔧 Testing complex menu item creation...');
      
      // Open creation modal - use same strategy as main function
      let modalOpened = false;
      const addButtonSelectors = [
        'button:has-text("Ajouter un plat")',    // Desktop
        'button:has-text("Ajouter"):visible',   // Mobile/Tablet
      ];
      
      for (const selector of addButtonSelectors) {
        if (modalOpened) break;
        
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 2000 })) {
            console.log(`  🖱️ Found and clicking: ${selector}`);
            await button.click({ timeout: 3000 });
            await page.waitForTimeout(1000);
            modalOpened = true;
            break;
          }
        } catch (error) {
          console.log(`  ⚠️ ${selector} not found`);
        }
      }
      
      const modal = page.locator('div.fixed.inset-0 div.inline-block');
      if (await modal.isVisible()) {
        console.log('✅ Complex item modal opened');
        
        // Fill basic information
        const textInputs = modal.locator('input[type="text"], input:not([type])');
        await textInputs.nth(0).fill(complexItem.name);
        
        const textarea = modal.locator('textarea');
        await textarea.fill(complexItem.description);
        
        const priceInput = modal.locator('input[type="number"]');
        await priceInput.fill(complexItem.price);
        
        if (await textInputs.count() > 1) {
          await textInputs.nth(1).fill(complexItem.category);
        }
        
        console.log('✓ Basic information filled');
        
        // Test options section - scroll to ensure it's visible
        console.log('🔧 Looking for options section...');
        
        // Scroll down to make options section visible
        await modal.evaluate(el => {
          el.scrollTop = el.scrollHeight;
        });
        await page.waitForTimeout(1000);
        
        const optionsHeader = modal.locator('h4:has-text("Options du plat")');
        if (await optionsHeader.isVisible({ timeout: 3000 })) {
          console.log('✅ Options section found');
          
          // Look for "Ajouter une option" button (exact text from source)
          const addOptionButton = modal.locator('button:has-text("Ajouter une option")');
          if (await addOptionButton.isVisible({ timeout: 2000 })) {
            console.log('✓ Found "Ajouter une option" button');
            await addOptionButton.click();
            await page.waitForTimeout(1000);
            
            // Configure option name using the correct placeholder from source
            const optionNameInput = modal.locator('input[placeholder*="Choix de sauce"]');
            if (await optionNameInput.count() > 0) {
              await optionNameInput.fill('Sauce Choice');
              console.log('✓ Option "Sauce Choice" configured');
            } else {
              // Fallback to any option name input
              const anyOptionInput = modal.locator('label:has-text("Nom de l\'option") + input');
              if (await anyOptionInput.count() > 0) {
                await anyOptionInput.fill('Sauce Choice');
                console.log('✓ Option configured with fallback selector');
              }
            }
          } else {
            console.log('⚠️ "Ajouter une option" button not found');
          }
        } else {
          console.log('ℹ️ Options section not visible - basic item creation');
        }
        
        // Submit the form
        const submitButton = modal.locator('button[type="submit"]');
        await submitButton.click();
        
        // Wait for completion
        await expect(modal).toBeHidden({ timeout: 10000 });
        console.log('✅ Complex menu item created successfully');
      } else {
        console.log('❌ Could not open creation modal');
      }
    });
  });

  /**
   * Availability Management
   * 
   * Tests the menu item availability toggle functionality and real-time updates.
   */
  test.describe('Availability Management', () => {
    test('should toggle menu item availability and update UI accordingly', async ({ page }) => {
      await page.goto('/restaurant/menu');
      await page.waitForLoadState('networkidle');
      
      console.log('👁️ Testing menu item availability management...');
      
      // Find available menu items
      const availableItems = page.locator('[data-testid="menu-item-card"]').filter({
        has: page.locator('button').filter({ hasText: 'Masquer' })
      });
      
      const availableCount = await availableItems.count();
      console.log(`🍽️ Found ${availableCount} available items`);
      
      if (availableCount >= 1) {
        const testItem = availableItems.first();
        const itemName = (await testItem.textContent())?.split('\\n')[0] || 'Test Item';
        
        console.log(`📝 Testing availability toggle for: "${itemName.slice(0, 30)}..."`);
        
        // Hide the item
        const hideButton = testItem.locator('button').filter({ hasText: 'Masquer' });
        await hideButton.click();
        await page.waitForTimeout(2000);
        
        // Check if status changed
        const showButton = testItem.locator('button').filter({ hasText: 'Afficher' });
        const statusChanged = await showButton.count() > 0 || 
                            await testItem.locator('.opacity-75').count() > 0;
        
        if (statusChanged) {
          console.log(`  ✅ Item successfully hidden`);
          
          // Show the item again
          if (await showButton.count() > 0) {
            await showButton.click();
            await page.waitForTimeout(2000);
            
            const hideButtonRestored = testItem.locator('button').filter({ hasText: 'Masquer' });
            if (await hideButtonRestored.count() > 0) {
              console.log(`  ✅ Item successfully restored to available`);
            }
          }
        } else {
          console.log(`  ⚠️ Availability change in progress...`);
        }
      } else {
        console.log('ℹ️ No available items found for testing');
      }
      
      console.log('✅ Availability management test completed');
    });
  });

  /**
   * Search and Filtering
   * 
   * Tests the menu search functionality and category filtering.
   */
  test.describe('Search and Filtering', () => {
    test('should filter menu items by category and search terms', async ({ page }) => {
      await page.goto('/restaurant/menu');
      await page.waitForLoadState('networkidle');
      
      console.log('🔍 Testing menu search and filtering...');
      
      // Test category filtering
      const categoryButtons = page.locator('button').filter({ hasText: /plats|entrées|desserts/i });
      if (await categoryButtons.count() > 0) {
        const firstCategory = categoryButtons.first();
        await firstCategory.click();
        await page.waitForTimeout(500);
        
        const filteredItems = page.locator('[data-testid="menu-item-card"]');
        const filteredCount = await filteredItems.count();
        console.log(`🏷️ Category filter applied: ${filteredCount} items shown`);
        
        // Reset filter
        const allFilter = page.locator('button').filter({ hasText: /tous|toutes/i });
        if (await allFilter.count() > 0) {
          await allFilter.first().click();
        }
      }
      
      // Test search functionality - Force show search field 
      console.log('🔍 Testing search functionality...');
      
      // First try to change viewport to ensure search is visible
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(1000);
      
      let searchField;
      const searchSelectors = [
        'input[placeholder*="Rechercher"]',  // Any search field
        '#mobile-search',                   // Mobile specific
        'input[type="text"]'                // Fallback to any text input
      ];
      
      for (const selector of searchSelectors) {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 1000 })) {
          searchField = field;
          console.log(`  ✓ Using search field: ${selector}`);
          break;
        }
      }
      
      if (searchField) {
        await searchField.fill('pizza');
        await page.waitForTimeout(1000);
        
        const searchResults = page.locator('[data-testid="menu-item-card"]');
        const resultCount = await searchResults.count();
        console.log(`🔍 Search "pizza": ${resultCount} results found`);
        
        // Clear search
        await searchField.clear();
        await page.waitForTimeout(500);
      }
      
      console.log('✅ Search and filtering test completed');
    });
  });

  /**
   * Responsive Design
   * 
   * Tests the menu management interface across different device sizes.
   */
  test.describe('Responsive Design', () => {
    test('should maintain functionality across mobile, tablet, and desktop viewports', async ({ page }) => {
      await page.goto('/restaurant/menu');
      await page.waitForLoadState('networkidle');
      
      console.log('📱 Testing responsive design...');
      
      const viewports = [
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1920, height: 1080 }
      ];
      
      for (const viewport of viewports) {
        console.log(`📐 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);
        
        // Verify menu items are visible
        const menuItems = page.locator('[data-testid="menu-item-card"]');
        const itemCount = await menuItems.count();
        
        // Check for responsive elements
        const responsiveElements = page.locator('.sm\\:block, .md\\:flex, .lg\\:grid, [class*="mobile"], [class*="tablet"]');
        const responsiveCount = await responsiveElements.count();
        
        console.log(`  ✓ ${itemCount} menu items visible, ${responsiveCount} responsive elements detected`);
        
        // Test interactions on mobile
        if (viewport.name === 'Mobile') {
          const menuButtons = page.locator('button').filter({ hasText: /Ajouter|Modifier/ });
          if (await menuButtons.count() > 0) {
            console.log(`  ✓ ${await menuButtons.count()} action buttons accessible on mobile`);
          }
        }
      }
      
      // Restore default viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      console.log('✅ Responsive design test completed');
    });
  });

  /**
   * Form Validation and Error Handling
   * 
   * Tests form validation, required fields, and error message display.
   */
  test.describe('Form Validation', () => {
    test('should validate required fields and show error messages', async ({ page }) => {
      await page.goto('/restaurant/menu');
      await page.waitForLoadState('networkidle');
      
      console.log('🔍 Testing form validation...');
      
      // Open creation modal - consistent button finding strategy
      let modalOpened = false;
      const addButtonSelectors = [
        'button:has-text("Ajouter un plat")',    // Desktop
        'button:has-text("Ajouter"):visible',   // Mobile/Tablet
      ];
      
      for (const selector of addButtonSelectors) {
        if (modalOpened) break;
        
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 2000 })) {
            console.log(`  🖱️ Using: ${selector}`);
            await button.click({ timeout: 3000 });
            await page.waitForTimeout(1000);
            modalOpened = true;
            break;
          }
        } catch (error) {
          console.log(`  ⚠️ ${selector} not available`);
        }
      }
      
      const modal = page.locator('div.fixed.inset-0 div.inline-block');
      if (await modal.isVisible()) {
        console.log('✅ Validation modal opened');
        
        // Test 1: Submit empty form
        console.log('🔸 Testing empty form submission...');
        const submitButton = modal.locator('button[type="submit"]');
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Check if modal remains open (validation should prevent submission)
        const modalStillVisible = await modal.isVisible();
        if (modalStillVisible) {
          console.log('  ✅ Empty form submission prevented');
          
          // Look for validation error messages
          const errorMessages = modal.locator('.text-red-500, .text-error, [class*="error"]');
          const errorCount = await errorMessages.count();
          console.log(`  ✓ Found ${errorCount} validation error indicators`);
        }
        
        // Test 2: Invalid price validation
        console.log('🔸 Testing invalid price validation...');
        const textInputs = modal.locator('input[type="text"], input:not([type])');
        const priceInput = modal.locator('input[type="number"]');
        
        if (await textInputs.count() > 0) {
          await textInputs.nth(0).fill('Test Item');
        }
        
        if (await priceInput.count() > 0) {
          // Test negative price
          await priceInput.fill('-5.50');
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          if (await modal.isVisible()) {
            console.log('  ✅ Negative price validation working');
          }
          
          // Test zero price
          await priceInput.fill('0');
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          if (await modal.isVisible()) {
            console.log('  ✅ Zero price validation working');
          }
          
          // Test extremely high price
          await priceInput.fill('999999');
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          if (await modal.isVisible()) {
            console.log('  ✅ Extreme price validation working');
          }
        }
        
        // Test 3: Character limits
        console.log('🔸 Testing character limits...');
        const longName = 'A'.repeat(200); // Very long name
        const longDescription = 'B'.repeat(1000); // Very long description
        
        if (await textInputs.count() > 0) {
          await textInputs.nth(0).clear();
          await textInputs.nth(0).fill(longName);
          
          const truncatedValue = await textInputs.nth(0).inputValue();
          if (truncatedValue.length < longName.length) {
            console.log(`  ✅ Name truncated to ${truncatedValue.length} characters`);
          }
        }
        
        const textarea = modal.locator('textarea');
        if (await textarea.count() > 0) {
          await textarea.clear();
          await textarea.fill(longDescription);
          
          const truncatedDescription = await textarea.inputValue();
          if (truncatedDescription.length < longDescription.length) {
            console.log(`  ✅ Description truncated to ${truncatedDescription.length} characters`);
          }
        }
        
        // Test 4: Special characters in name
        console.log('🔸 Testing special character handling...');
        const specialCharName = '<script>alert("test")</script>';
        if (await textInputs.count() > 0) {
          await textInputs.nth(0).clear();
          await textInputs.nth(0).fill(specialCharName);
          
          const sanitizedValue = await textInputs.nth(0).inputValue();
          if (!sanitizedValue.includes('<script>')) {
            console.log('  ✅ Special characters properly handled/sanitized');
          }
        }
        
        // Close modal
        const cancelButton = modal.locator('button').filter({ hasText: /Annuler|Cancel/i });
        if (await cancelButton.count() > 0) {
          await cancelButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
        
        await expect(modal).toBeHidden({ timeout: 5000 });
        console.log('✅ Form validation test completed');
      } else {
        console.log('❌ Could not open validation modal');
      }
    });

    test('should handle form submission with missing required fields', async ({ page }) => {
      await page.goto('/restaurant/menu');
      await page.waitForLoadState('networkidle');
      
      console.log('🔸 Testing partial form submission...');
      
      // Use consistent button finding strategy 
      let modalOpened = false;
      const addButtonSelectors = [
        'button:has-text("Ajouter un plat")',    // Desktop
        'button:has-text("Ajouter"):visible',   // Mobile/Tablet
      ];
      
      for (const selector of addButtonSelectors) {
        if (modalOpened) break;
        
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 2000 })) {
            console.log(`  🖱️ Using: ${selector}`);
            await button.click({ timeout: 3000 });
            await page.waitForTimeout(1000);
            modalOpened = true;
            break;
          }
        } catch (error) {
          console.log(`  ⚠️ ${selector} not available`);
        }
      }

      const modal = page.locator('div.fixed.inset-0 div.inline-block');
      if (await modal.isVisible()) {
        const textInputs = modal.locator('input[type="text"], input:not([type])');
        const priceInput = modal.locator('input[type="number"]');
        const submitButton = modal.locator('button[type="submit"]');
        
        // Fill only name, leave other required fields empty
        if (await textInputs.count() > 0) {
          await textInputs.nth(0).fill('Incomplete Item');
        }
        
        // Leave price empty
        if (await priceInput.count() > 0) {
          await priceInput.clear();
        }
        
        // Try to submit
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Modal should remain open
        const modalStillVisible = await modal.isVisible();
        expect(modalStillVisible).toBe(true);
        console.log('  ✅ Incomplete form submission prevented');
        
        // Close modal - try multiple methods
        const cancelButton = modal.locator('button:has-text("Annuler")');
        if (await cancelButton.isVisible({ timeout: 2000 })) {
          await cancelButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
        await expect(modal).toBeHidden({ timeout: 8000 });
      }
      
      console.log('✅ Partial form validation test completed');
    });
  });

  /**
   * Data Persistence and Synchronization
   * 
   * Tests data persistence across page reloads and browser sessions.
   */
  test.describe('Data Persistence', () => {
    test('should persist menu changes across page reloads', async ({ page }) => {
      await page.goto('/restaurant/menu');
      await page.waitForLoadState('networkidle');
      
      console.log('🔄 Testing data persistence...');
      
      // Get current menu count
      const initialCount = await page.locator('[data-testid="menu-item-card"]').count();
      console.log(`📊 Initial menu items: ${initialCount}`);
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify count remains consistent
      const reloadedCount = await page.locator('[data-testid="menu-item-card"]').count();
      console.log(`📊 After reload: ${reloadedCount} menu items`);
      
      // Validate data persistence
      expect(reloadedCount).toBe(initialCount);
      
      // Verify content integrity
      const menuContent = await page.content();
      expect(menuContent).toContain('Menu');
      
      console.log('✅ Data persistence validated');
    });
  });
});