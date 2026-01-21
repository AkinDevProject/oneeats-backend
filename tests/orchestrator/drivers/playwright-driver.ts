/**
 * Playwright Driver - Interface avec Playwright pour les tests web
 *
 * Permet de contrôler un navigateur pour tester le dashboard restaurant.
 */

import { chromium, Browser, BrowserContext, Page, Locator } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import config from '../config';
import { logger, wait, waitFor, retry } from '../utils';

export interface PlaywrightOptions {
  headless?: boolean;
  slowMo?: number;
  viewport?: { width: number; height: number };
}

export class PlaywrightDriver {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private screenshotsDir: string;

  constructor() {
    this.screenshotsDir = config.screenshotsDir;

    // Créer le répertoire de screenshots si nécessaire
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  /**
   * Démarre le navigateur
   */
  async start(options: PlaywrightOptions = {}): Promise<void> {
    const {
      headless = config.headless,
      slowMo = 0,
      viewport = { width: 1280, height: 720 },
    } = options;

    logger.step('Démarrage navigateur Playwright', 'web');

    this.browser = await chromium.launch({
      headless,
      slowMo,
    });

    this.context = await this.browser.newContext({
      viewport,
      locale: 'fr-FR',
    });

    this.page = await this.context.newPage();

    // Intercepter les erreurs console
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        logger.warn(`Console error: ${msg.text()}`);
      }
    });

    logger.success('Navigateur démarré');
  }

  /**
   * Ferme le navigateur
   */
  async stop(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      logger.info('Navigateur fermé');
    }
  }

  /**
   * Récupère la page courante
   */
  getPage(): Page {
    if (!this.page) {
      throw new Error('Navigateur non démarré. Appelez start() d\'abord.');
    }
    return this.page;
  }

  // ==================== NAVIGATION ====================

  /**
   * Navigue vers une URL
   */
  async navigate(url: string): Promise<void> {
    const page = this.getPage();

    // Si l'URL est relative, ajouter le baseUrl
    const fullUrl = url.startsWith('http') ? url : `${config.baseUrl}${url}`;

    logger.step(`Navigation: ${fullUrl}`, 'web');

    await page.goto(fullUrl, {
      waitUntil: 'networkidle',
      timeout: config.timeouts.navigation,
    });

    logger.success(`Page chargée: ${page.url()}`);
  }

  /**
   * Recharge la page
   */
  async reload(): Promise<void> {
    const page = this.getPage();
    await page.reload({ waitUntil: 'networkidle' });
  }

  /**
   * Retourne à la page précédente
   */
  async goBack(): Promise<void> {
    const page = this.getPage();
    await page.goBack();
  }

  /**
   * Récupère l'URL courante
   */
  getCurrentUrl(): string {
    return this.getPage().url();
  }

  // ==================== INTERACTIONS ====================

  /**
   * Clique sur un élément
   */
  async click(selector: string): Promise<void> {
    const page = this.getPage();
    logger.info(`Click: ${selector}`);

    await page.click(selector, {
      timeout: config.timeouts.default,
    });
  }

  /**
   * Double-clique sur un élément
   */
  async doubleClick(selector: string): Promise<void> {
    const page = this.getPage();
    await page.dblclick(selector);
  }

  /**
   * Saisit du texte dans un champ
   */
  async type(selector: string, text: string, options: { clear?: boolean } = {}): Promise<void> {
    const page = this.getPage();
    logger.info(`Type "${text}" dans ${selector}`);

    if (options.clear) {
      await page.fill(selector, '');
    }

    await page.fill(selector, text);
  }

  /**
   * Appuie sur une touche
   */
  async press(key: string): Promise<void> {
    const page = this.getPage();
    await page.keyboard.press(key);
  }

  /**
   * Sélectionne une option dans un select
   */
  async select(selector: string, value: string): Promise<void> {
    const page = this.getPage();
    await page.selectOption(selector, value);
  }

  /**
   * Coche/décoche une checkbox
   */
  async check(selector: string, checked: boolean = true): Promise<void> {
    const page = this.getPage();
    if (checked) {
      await page.check(selector);
    } else {
      await page.uncheck(selector);
    }
  }

  /**
   * Hover sur un élément
   */
  async hover(selector: string): Promise<void> {
    const page = this.getPage();
    await page.hover(selector);
  }

  // ==================== ATTENTE ====================

  /**
   * Attend qu'un élément soit visible
   */
  async waitForSelector(selector: string, options: { visible?: boolean; timeout?: number } = {}): Promise<Locator> {
    const page = this.getPage();
    const { visible = true, timeout = config.timeouts.default } = options;

    const locator = page.locator(selector);
    await locator.waitFor({
      state: visible ? 'visible' : 'attached',
      timeout,
    });

    return locator;
  }

  /**
   * Attend qu'un élément disparaisse
   */
  async waitForHidden(selector: string, timeout?: number): Promise<void> {
    const page = this.getPage();
    await page.locator(selector).waitFor({
      state: 'hidden',
      timeout: timeout || config.timeouts.default,
    });
  }

  /**
   * Attend que la navigation soit terminée
   */
  async waitForNavigation(): Promise<void> {
    const page = this.getPage();
    await page.waitForLoadState('networkidle');
  }

  /**
   * Attend un certain temps
   */
  async waitMs(ms: number): Promise<void> {
    await wait(ms);
  }

  // ==================== EXTRACTION ====================

  /**
   * Récupère le texte d'un élément
   */
  async getText(selector: string): Promise<string> {
    const page = this.getPage();
    return await page.locator(selector).textContent() || '';
  }

  /**
   * Récupère la valeur d'un input
   */
  async getValue(selector: string): Promise<string> {
    const page = this.getPage();
    return await page.locator(selector).inputValue();
  }

  /**
   * Récupère un attribut
   */
  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    const page = this.getPage();
    return await page.locator(selector).getAttribute(attribute);
  }

  /**
   * Compte le nombre d'éléments
   */
  async count(selector: string): Promise<number> {
    const page = this.getPage();
    return await page.locator(selector).count();
  }

  /**
   * Récupère tous les textes d'éléments correspondants
   */
  async getAllTexts(selector: string): Promise<string[]> {
    const page = this.getPage();
    return await page.locator(selector).allTextContents();
  }

  // ==================== ASSERTIONS ====================

  /**
   * Vérifie qu'un élément est visible
   */
  async isVisible(selector: string): Promise<boolean> {
    const page = this.getPage();
    return await page.locator(selector).isVisible();
  }

  /**
   * Vérifie qu'un élément existe
   */
  async exists(selector: string): Promise<boolean> {
    const page = this.getPage();
    const count = await page.locator(selector).count();
    return count > 0;
  }

  /**
   * Vérifie qu'un élément contient un texte
   */
  async containsText(selector: string, text: string): Promise<boolean> {
    const content = await this.getText(selector);
    return content.includes(text);
  }

  /**
   * Assertion: élément visible
   */
  async assertVisible(selector: string, message?: string): Promise<void> {
    const visible = await this.isVisible(selector);
    if (!visible) {
      throw new Error(message || `Element "${selector}" n'est pas visible`);
    }
    logger.success(message || `Element visible: ${selector}`);
  }

  /**
   * Assertion: texte présent
   */
  async assertText(selector: string, expectedText: string): Promise<void> {
    const actualText = await this.getText(selector);
    if (!actualText.includes(expectedText)) {
      throw new Error(`Texte attendu "${expectedText}" non trouvé dans "${actualText}"`);
    }
    logger.success(`Texte vérifié: "${expectedText}"`);
  }

  // ==================== SCREENSHOTS ====================

  /**
   * Prend une capture d'écran
   */
  async screenshot(name?: string): Promise<string> {
    const page = this.getPage();
    const filename = name || `screenshot_${Date.now()}.png`;
    const filepath = path.join(this.screenshotsDir, filename);

    await page.screenshot({ path: filepath, fullPage: true });
    logger.screenshot(filepath);

    return filepath;
  }

  /**
   * Capture d'écran d'un élément spécifique
   */
  async screenshotElement(selector: string, name?: string): Promise<string> {
    const page = this.getPage();
    const filename = name || `element_${Date.now()}.png`;
    const filepath = path.join(this.screenshotsDir, filename);

    await page.locator(selector).screenshot({ path: filepath });
    logger.screenshot(filepath);

    return filepath;
  }

  // ==================== AUTHENTIFICATION ====================

  /**
   * Se connecte au dashboard restaurant
   */
  async loginRestaurant(email?: string, password?: string): Promise<void> {
    const credentials = {
      email: email || config.testRestaurant.email,
      password: password || config.testRestaurant.password,
    };

    logger.step('Connexion dashboard restaurant', 'web');

    // Naviguer vers la page de login si nécessaire
    if (!this.getCurrentUrl().includes('/restaurant')) {
      await this.navigate('/restaurant');
    }

    // Attendre que le formulaire de login soit visible
    // (peut être Keycloak ou formulaire local)
    try {
      // Essayer le formulaire Keycloak
      await this.waitForSelector('#username', { timeout: 5000 });
      await this.type('#username', credentials.email);
      await this.type('#password', credentials.password);
      await this.click('#kc-login');
    } catch {
      // Essayer le formulaire local
      try {
        await this.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 });
        await this.type('input[type="email"], input[name="email"]', credentials.email);
        await this.type('input[type="password"], input[name="password"]', credentials.password);
        await this.click('button[type="submit"]');
      } catch {
        logger.warn('Formulaire de connexion non trouvé - peut-être déjà connecté');
      }
    }

    // Attendre la redirection vers le dashboard
    await this.waitForNavigation();
    logger.success('Connexion réussie');
  }

  /**
   * Se déconnecte
   */
  async logout(): Promise<void> {
    // Chercher un bouton de déconnexion
    try {
      if (await this.exists('[data-testid="logout"]')) {
        await this.click('[data-testid="logout"]');
      } else if (await this.exists('button:has-text("Déconnexion")')) {
        await this.click('button:has-text("Déconnexion")');
      }
      await this.waitForNavigation();
      logger.success('Déconnexion réussie');
    } catch {
      logger.warn('Bouton de déconnexion non trouvé');
    }
  }

  // ==================== UTILITAIRES SPÉCIFIQUES ====================

  /**
   * Vérifie qu'une commande est visible dans la liste
   */
  async orderExists(orderId: string): Promise<boolean> {
    return await this.exists(`[data-order-id="${orderId}"], tr:has-text("${orderId}")`);
  }

  /**
   * Attend qu'une commande apparaisse
   */
  async waitForOrder(orderId: string, timeoutMs: number = 10000): Promise<void> {
    logger.sync(`Attente commande ${orderId} dans le dashboard...`);

    await waitFor(
      () => this.orderExists(orderId),
      {
        timeout: timeoutMs,
        interval: 1000,
        message: `Commande ${orderId} visible`,
      }
    );

    logger.success(`Commande ${orderId} trouvée dans le dashboard`);
  }

  /**
   * Accepte une commande
   */
  async acceptOrder(orderId: string): Promise<void> {
    const selector = `[data-order-id="${orderId}"] button:has-text("Accepter"), tr:has-text("${orderId}") button:has-text("Accepter")`;
    await this.click(selector);
    await this.waitMs(1000);
    logger.success(`Commande ${orderId} acceptée`);
  }

  /**
   * Marque une commande comme prête
   */
  async markOrderReady(orderId: string): Promise<void> {
    const selector = `[data-order-id="${orderId}"] button:has-text("Prête"), tr:has-text("${orderId}") button:has-text("Prête")`;
    await this.click(selector);
    await this.waitMs(1000);
    logger.success(`Commande ${orderId} marquée prête`);
  }
}

export default PlaywrightDriver;