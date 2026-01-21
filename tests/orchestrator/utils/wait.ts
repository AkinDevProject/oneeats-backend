/**
 * Utilitaires d'attente et de délai
 */

import config from '../config';
import logger from './logger';

/**
 * Attendre un délai fixe (en millisecondes)
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Attendre la synchronisation entre plateformes
 * Utilisé après une action sur une plateforme avant de vérifier sur une autre
 */
export async function waitForSync(customMs?: number): Promise<void> {
  const delayMs = customMs || config.timeouts.sync;
  logger.sync(`Attente synchronisation (${delayMs}ms)...`);
  await wait(delayMs);
}

/**
 * Attendre qu'une condition soit vraie
 * @param condition - Fonction qui retourne true quand la condition est remplie
 * @param options - Options de timeout et intervalle
 */
export async function waitFor(
  condition: () => Promise<boolean> | boolean,
  options: {
    timeout?: number;
    interval?: number;
    message?: string;
  } = {}
): Promise<void> {
  const { timeout = config.timeouts.default, interval = 500, message = 'condition' } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const result = await condition();
      if (result) {
        return;
      }
    } catch (e) {
      // Ignorer les erreurs, continuer à réessayer
    }
    await wait(interval);
  }

  throw new Error(`Timeout: "${message}" n'a pas été remplie après ${timeout}ms`);
}

/**
 * Attendre qu'un élément soit visible (utilisé avec Playwright)
 */
export async function waitForElement(
  page: any,
  selector: string,
  options: { timeout?: number; visible?: boolean } = {}
): Promise<any> {
  const { timeout = config.timeouts.default, visible = true } = options;

  try {
    const element = await page.waitForSelector(selector, {
      timeout,
      state: visible ? 'visible' : 'attached',
    });
    return element;
  } catch (e) {
    throw new Error(`Element "${selector}" non trouvé après ${timeout}ms`);
  }
}

/**
 * Attendre que l'API retourne un statut spécifique
 */
export async function waitForApiStatus(
  apiCall: () => Promise<any>,
  expectedStatus: string,
  options: { timeout?: number; interval?: number; statusField?: string } = {}
): Promise<any> {
  const {
    timeout = config.timeouts.default,
    interval = 1000,
    statusField = 'status',
  } = options;

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await apiCall();
      if (response[statusField] === expectedStatus) {
        return response;
      }
      logger.info(`Statut actuel: ${response[statusField]}, attendu: ${expectedStatus}`);
    } catch (e) {
      logger.info(`API non disponible, nouvelle tentative...`);
    }
    await wait(interval);
  }

  throw new Error(`Statut "${expectedStatus}" non atteint après ${timeout}ms`);
}

/**
 * Wrapper avec timeout pour n'importe quelle promesse
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(errorMessage || `Opération expirée après ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (e) {
    clearTimeout(timeoutHandle!);
    throw e;
  }
}

export default {
  wait,
  waitForSync,
  waitFor,
  waitForElement,
  waitForApiStatus,
  withTimeout,
};