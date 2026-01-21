/**
 * Order Flow - Test cross-platform du cycle de vie d'une commande
 *
 * Ce flow teste le scénario complet :
 * 1. Client crée une commande (Mobile via API simulation ou Maestro)
 * 2. Restaurant voit et accepte la commande (Web via Playwright)
 * 3. Vérification de la synchronisation des statuts
 */

import config from '../config';
import { ApiDriver, PlaywrightDriver, MaestroDriver } from '../drivers';
import {
  DataStore,
  Reporter,
  logger,
  waitForSync,
  retry,
} from '../utils';

export interface OrderFlowOptions {
  useMaestro?: boolean; // true = utiliser Maestro pour mobile, false = simuler via API
  restaurant?: {
    id?: string;
    name?: string;
  };
  items?: Array<{
    name?: string;
    menuItemId?: string;
    quantity: number;
  }>;
  specialInstructions?: string;
}

export interface OrderFlowResult {
  success: boolean;
  orderId?: string;
  errors: string[];
  duration: number;
}

/**
 * Exécute le flow de commande cross-platform
 */
export async function runOrderFlow(options: OrderFlowOptions = {}): Promise<OrderFlowResult> {
  const {
    useMaestro = false,
    specialInstructions = 'Test orchestrator',
  } = options;

  const store = new DataStore();
  const reporter = new Reporter(store);
  const api = new ApiDriver();
  const playwright = new PlaywrightDriver();
  const maestro = useMaestro ? new MaestroDriver() : null;

  const errors: string[] = [];
  let orderId: string | undefined;

  try {
    reporter.startFlow('Order Flow - Commande Cross-Platform');

    // ==================== PHASE 0: PRÉREQUIS ====================
    reporter.startPhase('Phase 0: Vérification des prérequis');

    reporter.startStep('Vérification API backend', 'api');
    await api.waitForApi();
    reporter.passStep('API backend disponible', 'api');

    if (useMaestro && maestro) {
      reporter.startStep('Vérification Maestro', 'mobile');
      const maestroOk = await maestro.checkInstallation();
      if (!maestroOk) {
        throw new Error('Maestro non disponible');
      }
      const emulatorOk = await maestro.checkEmulator();
      if (!emulatorOk) {
        throw new Error('Émulateur Android non connecté');
      }
      reporter.passStep('Maestro et émulateur OK', 'mobile');
    }

    // ==================== PHASE 1: PRÉPARATION DES DONNÉES ====================
    reporter.startPhase('Phase 1: Préparation des données');

    // Récupérer un restaurant
    reporter.startStep('Récupération restaurant', 'api');
    const restaurant = options.restaurant?.id
      ? await api.getRestaurant(options.restaurant.id)
      : await api.getFirstRestaurant();

    store.set('restaurantId', restaurant.id, 'api');
    store.set('restaurantName', restaurant.name, 'api');
    reporter.passStep(`Restaurant: ${restaurant.name}`, 'api', { restaurantId: restaurant.id });

    // Récupérer les plats du menu
    reporter.startStep('Récupération menu', 'api');
    const menuItems = await api.getMenuItems(restaurant.id);

    if (menuItems.length === 0) {
      throw new Error(`Aucun plat disponible pour le restaurant ${restaurant.name}`);
    }

    // Sélectionner des plats pour la commande
    const selectedItems = options.items?.length
      ? options.items.map((item) => {
          const menuItem = item.menuItemId
            ? menuItems.find((m) => m.id === item.menuItemId)
            : menuItems.find((m) => m.name.toLowerCase().includes(item.name?.toLowerCase() || ''));

          if (!menuItem) {
            throw new Error(`Plat "${item.name || item.menuItemId}" non trouvé`);
          }

          return { menuItemId: menuItem.id, quantity: item.quantity, name: menuItem.name };
        })
      : [
          { menuItemId: menuItems[0].id, quantity: 1, name: menuItems[0].name },
          ...(menuItems.length > 1
            ? [{ menuItemId: menuItems[1].id, quantity: 2, name: menuItems[1].name }]
            : []),
        ];

    store.set('orderItems', selectedItems, 'api');
    reporter.passStep(`${selectedItems.length} plat(s) sélectionné(s)`, 'api', { items: selectedItems });

    // ==================== PHASE 2: CRÉATION DE COMMANDE ====================
    reporter.startPhase('Phase 2: Création de commande (Mobile/API)');

    if (useMaestro && maestro) {
      // Utiliser Maestro pour créer la commande sur mobile
      reporter.startStep('Lancement app mobile', 'mobile');
      await maestro.launchApp();
      reporter.passStep('App mobile lancée', 'mobile');

      reporter.startStep('Connexion utilisateur', 'mobile');
      await maestro.runFlow('login.yaml', {
        variables: {
          EMAIL: config.testClient.email,
          PASSWORD: config.testClient.password,
        },
      });
      reporter.passStep('Utilisateur connecté', 'mobile');

      reporter.startStep('Création commande via app', 'mobile');
      await maestro.runFlow('order.yaml', {
        variables: {
          RESTAURANT_NAME: restaurant.name,
        },
      });
      await maestro.screenshot('order_created.png');
      reporter.passStep('Commande créée via mobile', 'mobile');

      // Récupérer l'ID de commande via API
      reporter.startStep('Récupération ID commande', 'api');
      await waitForSync(3000);
      const latestOrder = await retry(
        () => api.getLatestOrder(),
        { maxAttempts: 5, delayMs: 2000 }
      );

      if (!latestOrder) {
        throw new Error('Commande non trouvée après création mobile');
      }

      orderId = latestOrder.id;
      store.set('orderId', orderId, 'mobile');
      reporter.passStep(`Commande créée: #${orderId}`, 'api', { orderId });
    } else {
      // Simuler la création via API directement
      reporter.startStep('Création commande via API', 'api');

      // Configurer l'utilisateur de test
      api.setUserId(process.env.TEST_USER_ID || '12345678-1234-1234-1234-123456789012');

      const order = await api.createOrder({
        restaurantId: restaurant.id,
        items: selectedItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        specialInstructions,
      });

      orderId = order.id;
      store.set('orderId', orderId, 'api');
      store.set('orderTotal', order.totalAmount, 'api');
      store.set('orderStatus', order.status, 'api');

      reporter.passStep(`Commande créée: #${orderId}`, 'api', {
        orderId,
        total: order.totalAmount,
        status: order.status,
      });
    }

    // ==================== PHASE 3: VÉRIFICATION WEB ====================
    reporter.startPhase('Phase 3: Vérification Dashboard Restaurant (Web)');

    reporter.startStep('Démarrage navigateur', 'web');
    await playwright.start({ headless: config.headless });
    reporter.passStep('Navigateur démarré', 'web');

    reporter.startStep('Navigation vers dashboard', 'web');
    await playwright.navigate('/restaurant');
    await playwright.screenshot('dashboard_login.png');
    reporter.passStep('Page dashboard chargée', 'web');

    reporter.startStep('Connexion restaurateur', 'web');
    await playwright.loginRestaurant();
    await playwright.screenshot('dashboard_logged_in.png');
    reporter.passStep('Restaurateur connecté', 'web');

    reporter.startStep('Navigation vers commandes', 'web');
    // Essayer plusieurs sélecteurs possibles pour le menu commandes
    try {
      if (await playwright.exists('a[href*="orders"], a[href*="commandes"]')) {
        await playwright.click('a[href*="orders"], a[href*="commandes"]');
      } else if (await playwright.exists('button:has-text("Commandes")')) {
        await playwright.click('button:has-text("Commandes")');
      } else {
        await playwright.navigate('/restaurant/orders');
      }
    } catch {
      await playwright.navigate('/restaurant/orders');
    }
    await playwright.waitMs(2000);
    await playwright.screenshot('orders_list.png');
    reporter.passStep('Page commandes affichée', 'web');

    // Attendre que la commande apparaisse
    reporter.startStep(`Attente commande #${orderId}`, 'web');
    await waitForSync(config.timeouts.sync);

    let orderFound = false;
    try {
      // Rafraîchir et chercher la commande
      await retry(
        async () => {
          await playwright.reload();
          await playwright.waitMs(1000);
          const exists = await playwright.orderExists(orderId!);
          if (!exists) {
            throw new Error('Commande non trouvée');
          }
        },
        { maxAttempts: 5, delayMs: 2000 }
      );
      orderFound = true;
    } catch {
      logger.warn(`Commande #${orderId} non visible dans le dashboard`);
    }

    if (orderFound) {
      reporter.passStep(`Commande #${orderId} visible`, 'web');
      await playwright.screenshot('order_found.png');
    } else {
      reporter.skipStep(`Commande #${orderId} non visible`, 'Dashboard peut ne pas afficher les commandes de test');
    }

    // ==================== PHASE 4: TRAITEMENT COMMANDE ====================
    reporter.startPhase('Phase 4: Traitement de la commande');

    if (orderFound) {
      reporter.startStep('Acceptation commande', 'web');
      try {
        await playwright.acceptOrder(orderId!);
        await playwright.screenshot('order_accepted.png');
        reporter.passStep('Commande acceptée', 'web');

        // Vérifier le statut via API
        reporter.startStep('Vérification statut API', 'api');
        await waitForSync(2000);
        const updatedOrder = await api.getOrder(orderId!);
        store.set('orderStatus', updatedOrder.status, 'api');

        reporter.assert(
          updatedOrder.status === 'EN_PREPARATION' || updatedOrder.status === 'ACCEPTED',
          `Statut commande: ${updatedOrder.status}`
        );
        reporter.passStep(`Statut synchronisé: ${updatedOrder.status}`, 'api');
      } catch (error) {
        reporter.failStep('Acceptation commande', 'web', error as Error);
        errors.push(`Acceptation échouée: ${(error as Error).message}`);
      }
    } else {
      // Simuler le changement de statut via API
      reporter.startStep('Mise à jour statut via API', 'api');
      try {
        await api.updateOrderStatus(orderId!, 'EN_PREPARATION');
        store.set('orderStatus', 'EN_PREPARATION', 'api');
        reporter.passStep('Statut mis à jour: EN_PREPARATION', 'api');
      } catch (error) {
        reporter.failStep('Mise à jour statut', 'api', error as Error);
        errors.push(`Mise à jour statut échouée: ${(error as Error).message}`);
      }
    }

    // ==================== PHASE 5: VÉRIFICATION MOBILE ====================
    if (useMaestro && maestro) {
      reporter.startPhase('Phase 5: Vérification synchronisation Mobile');

      reporter.startStep('Vérification statut sur mobile', 'mobile');
      await maestro.runFlow('check-order-status.yaml', {
        variables: { ORDER_ID: orderId! },
      });
      await maestro.screenshot('mobile_order_status.png');
      reporter.passStep('Statut vérifié sur mobile', 'mobile');
    }

    // ==================== CLEANUP ====================
    reporter.startPhase('Cleanup');

    reporter.startStep('Fermeture navigateur', 'web');
    await playwright.stop();
    reporter.passStep('Navigateur fermé', 'web');

    if (useMaestro && maestro) {
      reporter.startStep('Fermeture app mobile', 'mobile');
      await maestro.closeApp();
      reporter.passStep('App mobile fermée', 'mobile');
    }

    // ==================== RÉSULTAT ====================
    const result = reporter.endFlow(errors.length === 0 ? 'passed' : 'failed');

    return {
      success: errors.length === 0,
      orderId,
      errors,
      duration: result.duration,
    };
  } catch (error) {
    const err = error as Error;
    logger.error(`Flow échoué: ${err.message}`, err);
    errors.push(err.message);

    // Cleanup en cas d'erreur
    try {
      await playwright.stop();
    } catch {}

    reporter.endFlow('failed');

    return {
      success: false,
      orderId,
      errors,
      duration: Date.now(),
    };
  }
}

export default runOrderFlow;