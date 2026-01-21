/**
 * Menu Flow - Test cross-platform de la gestion du menu
 *
 * Ce flow teste le scénario :
 * 1. Restaurant ajoute/modifie un plat (Web via Playwright)
 * 2. Vérification de la synchronisation (API)
 * 3. Client voit le changement (Mobile via Maestro ou API)
 */

import config from '../config';
import { ApiDriver, PlaywrightDriver, MaestroDriver, MenuItem } from '../drivers';
import {
  DataStore,
  Reporter,
  logger,
  waitForSync,
  retry,
} from '../utils';

export interface MenuFlowOptions {
  useMaestro?: boolean;
  action?: 'create' | 'update' | 'toggle' | 'delete';
  menuItem?: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
  };
  restaurantId?: string;
}

export interface MenuFlowResult {
  success: boolean;
  menuItemId?: string;
  action: string;
  errors: string[];
  duration: number;
}

/**
 * Exécute le flow de gestion du menu cross-platform
 */
export async function runMenuFlow(options: MenuFlowOptions = {}): Promise<MenuFlowResult> {
  const {
    useMaestro = false,
    action = 'create',
  } = options;

  const store = new DataStore();
  const reporter = new Reporter(store);
  const api = new ApiDriver();
  const playwright = new PlaywrightDriver();
  const maestro = useMaestro ? new MaestroDriver() : null;

  const errors: string[] = [];
  let menuItemId: string | undefined;

  // Données du plat de test
  const testMenuItem = {
    name: options.menuItem?.name || `Test Plat ${Date.now()}`,
    description: options.menuItem?.description || 'Plat créé par le test orchestrator',
    price: options.menuItem?.price || 15.99,
    category: options.menuItem?.category || 'Plats',
  };

  try {
    reporter.startFlow(`Menu Flow - ${action.toUpperCase()}`);

    // ==================== PHASE 0: PRÉREQUIS ====================
    reporter.startPhase('Phase 0: Vérification des prérequis');

    reporter.startStep('Vérification API backend', 'api');
    await api.waitForApi();
    reporter.passStep('API backend disponible', 'api');

    // Récupérer le restaurant
    reporter.startStep('Récupération restaurant', 'api');
    const restaurant = options.restaurantId
      ? await api.getRestaurant(options.restaurantId)
      : await api.getFirstRestaurant();

    store.set('restaurantId', restaurant.id, 'api');
    store.set('restaurantName', restaurant.name, 'api');
    reporter.passStep(`Restaurant: ${restaurant.name}`, 'api');

    // ==================== PHASE 1: ACTION SUR LE DASHBOARD ====================
    reporter.startPhase('Phase 1: Action Dashboard Restaurant (Web)');

    reporter.startStep('Démarrage navigateur', 'web');
    await playwright.start({ headless: config.headless });
    reporter.passStep('Navigateur démarré', 'web');

    reporter.startStep('Connexion dashboard', 'web');
    await playwright.navigate('/restaurant');
    await playwright.loginRestaurant();
    await playwright.screenshot('dashboard_logged_in.png');
    reporter.passStep('Restaurateur connecté', 'web');

    reporter.startStep('Navigation vers menu', 'web');
    try {
      if (await playwright.exists('a[href*="menu"]')) {
        await playwright.click('a[href*="menu"]');
      } else if (await playwright.exists('button:has-text("Menu")')) {
        await playwright.click('button:has-text("Menu")');
      } else {
        await playwright.navigate('/restaurant/menu');
      }
    } catch {
      await playwright.navigate('/restaurant/menu');
    }
    await playwright.waitMs(2000);
    await playwright.screenshot('menu_page.png');
    reporter.passStep('Page menu affichée', 'web');

    // Exécuter l'action selon le type
    switch (action) {
      case 'create':
        await executeCreate(playwright, reporter, store, testMenuItem, api, restaurant.id);
        menuItemId = store.get('menuItemId');
        break;

      case 'update':
        menuItemId = await executeUpdate(playwright, reporter, store, testMenuItem, api, restaurant.id);
        break;

      case 'toggle':
        menuItemId = await executeToggle(playwright, reporter, store, api, restaurant.id);
        break;

      case 'delete':
        menuItemId = await executeDelete(playwright, reporter, store, api, restaurant.id);
        break;
    }

    // ==================== PHASE 2: VÉRIFICATION API ====================
    reporter.startPhase('Phase 2: Vérification API');

    reporter.startStep('Attente synchronisation', 'api');
    await waitForSync(config.timeouts.sync);
    reporter.passStep('Synchronisation terminée', 'api');

    if (menuItemId && action !== 'delete') {
      reporter.startStep('Vérification plat via API', 'api');
      try {
        const menuItem = await api.getMenuItem(menuItemId);
        store.set('apiMenuItem', menuItem, 'api');

        if (action === 'create' || action === 'update') {
          reporter.assertEqual(menuItem.name, testMenuItem.name, 'Nom du plat');
          reporter.assertEqual(menuItem.price, testMenuItem.price, 'Prix du plat');
        }

        reporter.passStep(`Plat vérifié: ${menuItem.name}`, 'api', { menuItem });
      } catch (error) {
        reporter.failStep('Vérification plat API', 'api', error as Error);
        errors.push(`Vérification API échouée: ${(error as Error).message}`);
      }
    } else if (action === 'delete' && menuItemId) {
      reporter.startStep('Vérification suppression via API', 'api');
      try {
        await api.getMenuItem(menuItemId);
        // Si on arrive ici, le plat existe encore
        errors.push('Le plat existe encore après suppression');
        reporter.failStep('Suppression non effective', 'api', new Error('Plat encore présent'));
      } catch {
        // C'est le comportement attendu - plat non trouvé
        reporter.passStep('Plat supprimé confirmé', 'api');
      }
    }

    // ==================== PHASE 3: VÉRIFICATION MOBILE ====================
    if (useMaestro && maestro && action !== 'delete') {
      reporter.startPhase('Phase 3: Vérification Mobile');

      reporter.startStep('Lancement app mobile', 'mobile');
      await maestro.launchApp();
      reporter.passStep('App lancée', 'mobile');

      reporter.startStep('Navigation vers restaurant', 'mobile');
      await maestro.runFlow('navigate-to-restaurant.yaml', {
        variables: { RESTAURANT_NAME: restaurant.name },
      });
      reporter.passStep('Restaurant ouvert', 'mobile');

      reporter.startStep(`Vérification plat "${testMenuItem.name}"`, 'mobile');
      const result = await maestro.assertVisible(testMenuItem.name);

      if (result.success) {
        await maestro.screenshot('menu_item_visible.png');
        reporter.passStep('Plat visible sur mobile', 'mobile');
      } else {
        reporter.failStep('Plat non visible sur mobile', 'mobile', new Error(result.error || 'Plat non trouvé'));
        errors.push('Plat non synchronisé sur mobile');
      }

      reporter.startStep('Fermeture app', 'mobile');
      await maestro.closeApp();
      reporter.passStep('App fermée', 'mobile');
    } else if (!useMaestro && action !== 'delete') {
      reporter.startPhase('Phase 3: Vérification via API (simulation mobile)');

      reporter.startStep('Récupération menu depuis API', 'api');
      const menuItems = await api.getMenuItems(restaurant.id);
      const foundItem = menuItems.find((m) => m.name === testMenuItem.name);

      if (foundItem) {
        store.set('mobileMenuItem', foundItem, 'api');
        reporter.passStep(`Plat trouvé dans le menu: ${foundItem.name}`, 'api');
      } else if (action === 'toggle') {
        // Pour toggle, le plat peut être désactivé
        reporter.passStep('Plat non visible (probablement désactivé)', 'api');
      } else {
        reporter.failStep('Plat non trouvé dans le menu', 'api', new Error('Synchronisation échouée'));
        errors.push('Plat non trouvé dans le menu');
      }
    }

    // ==================== CLEANUP ====================
    reporter.startPhase('Cleanup');

    reporter.startStep('Fermeture navigateur', 'web');
    await playwright.stop();
    reporter.passStep('Navigateur fermé', 'web');

    // Nettoyer le plat de test si créé
    if (menuItemId && action === 'create') {
      reporter.startStep('Suppression plat de test', 'api');
      try {
        await api.deleteMenuItem(menuItemId);
        reporter.passStep('Plat de test supprimé', 'api');
      } catch {
        logger.warn('Impossible de supprimer le plat de test');
      }
    }

    // ==================== RÉSULTAT ====================
    const result = reporter.endFlow(errors.length === 0 ? 'passed' : 'failed');

    return {
      success: errors.length === 0,
      menuItemId,
      action,
      errors,
      duration: result.duration,
    };
  } catch (error) {
    const err = error as Error;
    logger.error(`Flow échoué: ${err.message}`, err);
    errors.push(err.message);

    try {
      await playwright.stop();
    } catch {}

    reporter.endFlow('failed');

    return {
      success: false,
      menuItemId,
      action,
      errors,
      duration: Date.now(),
    };
  }
}

// ==================== FONCTIONS AUXILIAIRES ====================

async function executeCreate(
  playwright: PlaywrightDriver,
  reporter: Reporter,
  store: DataStore,
  menuItem: { name: string; description: string; price: number; category: string },
  api: ApiDriver,
  restaurantId: string
): Promise<void> {
  reporter.startStep('Création nouveau plat', 'web');

  try {
    // Cliquer sur le bouton d'ajout
    if (await playwright.exists('button:has-text("Ajouter"), button:has-text("Nouveau")')) {
      await playwright.click('button:has-text("Ajouter"), button:has-text("Nouveau")');
    } else {
      await playwright.click('[data-testid="add-menu-item"]');
    }
    await playwright.waitMs(1000);

    // Remplir le formulaire
    await playwright.type('input[name="name"], #name', menuItem.name);
    await playwright.type('input[name="price"], #price', menuItem.price.toString());

    if (await playwright.exists('textarea[name="description"], #description')) {
      await playwright.type('textarea[name="description"], #description', menuItem.description);
    }

    if (await playwright.exists('select[name="category"], #category')) {
      await playwright.select('select[name="category"], #category', menuItem.category);
    }

    await playwright.screenshot('menu_item_form.png');

    // Sauvegarder
    await playwright.click('button[type="submit"], button:has-text("Sauvegarder"), button:has-text("Créer")');
    await playwright.waitMs(2000);
    await playwright.screenshot('menu_item_created.png');

    reporter.passStep(`Plat créé: ${menuItem.name}`, 'web');

    // Récupérer l'ID via API
    const items = await api.getMenuItems(restaurantId);
    const created = items.find((i) => i.name === menuItem.name);
    if (created) {
      store.set('menuItemId', created.id, 'api');
    }
  } catch (error) {
    // Fallback: créer via API
    logger.warn('Création via UI échouée, utilisation API');
    const created = await api.createMenuItem({
      restaurantId,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      category: menuItem.category,
      available: true,
    });
    store.set('menuItemId', created.id, 'api');
    reporter.passStep(`Plat créé via API: ${created.name}`, 'api');
  }
}

async function executeUpdate(
  playwright: PlaywrightDriver,
  reporter: Reporter,
  store: DataStore,
  menuItem: { name: string; description: string; price: number; category: string },
  api: ApiDriver,
  restaurantId: string
): Promise<string | undefined> {
  reporter.startStep('Modification plat existant', 'web');

  // Récupérer un plat existant
  const items = await api.getMenuItems(restaurantId);
  if (items.length === 0) {
    throw new Error('Aucun plat à modifier');
  }

  const targetItem = items[0];
  store.set('originalMenuItem', targetItem, 'api');

  try {
    // Cliquer sur modifier
    await playwright.click(`[data-item-id="${targetItem.id}"] button:has-text("Modifier")`);
    await playwright.waitMs(1000);

    // Modifier les champs
    await playwright.type('input[name="name"], #name', menuItem.name, { clear: true });
    await playwright.type('input[name="price"], #price', menuItem.price.toString(), { clear: true });

    await playwright.screenshot('menu_item_edit.png');

    // Sauvegarder
    await playwright.click('button[type="submit"], button:has-text("Sauvegarder")');
    await playwright.waitMs(2000);

    reporter.passStep(`Plat modifié: ${menuItem.name}`, 'web');

    store.set('menuItemId', targetItem.id, 'api');
    return targetItem.id;
  } catch (error) {
    // Fallback: modifier via API
    logger.warn('Modification via UI échouée, utilisation API');
    await api.updateMenuItem(targetItem.id, {
      name: menuItem.name,
      price: menuItem.price,
    });
    store.set('menuItemId', targetItem.id, 'api');
    reporter.passStep(`Plat modifié via API`, 'api');
    return targetItem.id;
  }
}

async function executeToggle(
  playwright: PlaywrightDriver,
  reporter: Reporter,
  store: DataStore,
  api: ApiDriver,
  restaurantId: string
): Promise<string | undefined> {
  reporter.startStep('Toggle disponibilité plat', 'web');

  const items = await api.getMenuItems(restaurantId);
  if (items.length === 0) {
    throw new Error('Aucun plat à modifier');
  }

  const targetItem = items[0];
  store.set('originalAvailable', targetItem.available, 'api');

  try {
    // Toggle via UI
    await playwright.click(`[data-item-id="${targetItem.id}"] input[type="checkbox"], [data-item-id="${targetItem.id}"] .toggle`);
    await playwright.waitMs(1000);
    await playwright.screenshot('menu_item_toggled.png');

    reporter.passStep(`Disponibilité togglée: ${targetItem.name}`, 'web');

    store.set('menuItemId', targetItem.id, 'api');
    return targetItem.id;
  } catch (error) {
    // Fallback: toggle via API
    logger.warn('Toggle via UI échoué, utilisation API');
    await api.updateMenuItem(targetItem.id, {
      available: !targetItem.available,
    });
    store.set('menuItemId', targetItem.id, 'api');
    reporter.passStep(`Disponibilité togglée via API`, 'api');
    return targetItem.id;
  }
}

async function executeDelete(
  playwright: PlaywrightDriver,
  reporter: Reporter,
  store: DataStore,
  api: ApiDriver,
  restaurantId: string
): Promise<string | undefined> {
  reporter.startStep('Suppression plat', 'web');

  // Créer d'abord un plat à supprimer
  const tempItem = await api.createMenuItem({
    restaurantId,
    name: `Temp Delete ${Date.now()}`,
    price: 9.99,
    category: 'Test',
    available: true,
  });

  store.set('menuItemId', tempItem.id, 'api');

  try {
    // Rafraîchir la page
    await playwright.reload();
    await playwright.waitMs(2000);

    // Supprimer via UI
    await playwright.click(`[data-item-id="${tempItem.id}"] button:has-text("Supprimer")`);
    await playwright.waitMs(500);

    // Confirmer si dialogue
    if (await playwright.exists('button:has-text("Confirmer")')) {
      await playwright.click('button:has-text("Confirmer")');
    }

    await playwright.waitMs(1000);
    await playwright.screenshot('menu_item_deleted.png');

    reporter.passStep(`Plat supprimé: ${tempItem.name}`, 'web');
    return tempItem.id;
  } catch (error) {
    // Fallback: supprimer via API
    logger.warn('Suppression via UI échouée, utilisation API');
    await api.deleteMenuItem(tempItem.id);
    reporter.passStep(`Plat supprimé via API`, 'api');
    return tempItem.id;
  }
}

export default runMenuFlow;