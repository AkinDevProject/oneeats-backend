/**
 * Utilitaire de retry avec backoff exponentiel
 */

import config from '../config';
import logger from './logger';
import { wait } from './wait';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Exécute une fonction avec retry automatique
 *
 * @param fn - Fonction à exécuter
 * @param options - Options de retry
 * @returns Le résultat de la fonction
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = config.retry.maxAttempts,
    delayMs = config.retry.delayMs,
    backoffMultiplier = config.retry.backoffMultiplier,
    onRetry,
    shouldRetry = () => true,
  } = options;

  let lastError: Error | undefined;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Vérifier si on doit réessayer
      if (!shouldRetry(lastError)) {
        throw lastError;
      }

      // Si c'était la dernière tentative, lancer l'erreur
      if (attempt === maxAttempts) {
        break;
      }

      // Callback de retry
      if (onRetry) {
        onRetry(attempt, lastError);
      } else {
        logger.warn(`Tentative ${attempt}/${maxAttempts} échouée: ${lastError.message}`);
      }

      // Attendre avant de réessayer (avec backoff)
      await wait(currentDelay);
      currentDelay = Math.floor(currentDelay * backoffMultiplier);
    }
  }

  throw new Error(
    `Échec après ${maxAttempts} tentatives. Dernière erreur: ${lastError?.message}`
  );
}

/**
 * Retry simple avec nombre fixe de tentatives et délai fixe
 */
export async function retrySimple<T>(
  fn: () => Promise<T>,
  attempts: number,
  delayMs: number
): Promise<T> {
  return retry(fn, {
    maxAttempts: attempts,
    delayMs,
    backoffMultiplier: 1, // Pas de backoff
  });
}

/**
 * Retry jusqu'à ce qu'une condition soit vraie
 */
export async function retryUntil<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  options: RetryOptions & { conditionName?: string } = {}
): Promise<T> {
  const { conditionName = 'condition', ...retryOptions } = options;

  return retry(async () => {
    const result = await fn();
    if (!condition(result)) {
      throw new Error(`${conditionName} non satisfaite`);
    }
    return result;
  }, {
    ...retryOptions,
    shouldRetry: (error) => {
      // Réessayer uniquement si c'est notre erreur de condition
      return error.message.includes('non satisfaite');
    },
  });
}

/**
 * Exécute plusieurs fonctions en parallèle avec retry individuel
 */
export async function retryAll<T>(
  fns: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<T[]> {
  return Promise.all(fns.map((fn) => retry(fn, options)));
}

/**
 * Retry avec circuit breaker
 * Après un certain nombre d'échecs consécutifs, arrête temporairement les tentatives
 */
export class RetryWithCircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private isOpen: boolean = false;

  constructor(
    private failureThreshold: number = 5,
    private resetTimeMs: number = 30000
  ) {}

  async execute<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
    // Vérifier si le circuit est ouvert
    if (this.isOpen) {
      if (Date.now() - this.lastFailureTime > this.resetTimeMs) {
        // Réinitialiser le circuit
        this.isOpen = false;
        this.failures = 0;
        logger.info('Circuit breaker réinitialisé');
      } else {
        throw new Error('Circuit breaker ouvert - service temporairement indisponible');
      }
    }

    try {
      const result = await retry(fn, options);
      // Succès - réinitialiser les compteurs
      this.failures = 0;
      return result;
    } catch (error) {
      // Échec - incrémenter le compteur
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.failureThreshold) {
        this.isOpen = true;
        logger.error(`Circuit breaker ouvert après ${this.failures} échecs`);
      }

      throw error;
    }
  }

  reset(): void {
    this.isOpen = false;
    this.failures = 0;
  }

  getStatus(): { isOpen: boolean; failures: number } {
    return { isOpen: this.isOpen, failures: this.failures };
  }
}

export default {
  retry,
  retrySimple,
  retryUntil,
  retryAll,
  RetryWithCircuitBreaker,
};