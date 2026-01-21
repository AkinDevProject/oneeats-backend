/**
 * DataStore - Partage de données entre les étapes et plateformes
 *
 * Permet de stocker et récupérer des données entre les différentes
 * étapes d'un flow cross-platform (ex: orderId créé sur mobile,
 * utilisé ensuite pour vérification sur web)
 */

import * as fs from 'fs';
import * as path from 'path';
import config from '../config';
import logger from './logger';

export interface DataStoreOptions {
  persist?: boolean;
  persistPath?: string;
}

export class DataStore {
  private data: Map<string, any> = new Map();
  private metadata: Map<string, { timestamp: number; platform?: string }> = new Map();
  private persist: boolean;
  private persistPath: string;

  constructor(options: DataStoreOptions = {}) {
    this.persist = options.persist ?? false;
    this.persistPath = options.persistPath ?? path.join(config.reportsDir, 'data-store.json');

    if (this.persist) {
      this.load();
    }
  }

  /**
   * Stocke une valeur
   */
  set<T>(key: string, value: T, platform?: 'mobile' | 'web' | 'api'): void {
    this.data.set(key, value);
    this.metadata.set(key, {
      timestamp: Date.now(),
      platform,
    });

    logger.data(key, value);

    if (this.persist) {
      this.save();
    }
  }

  /**
   * Récupère une valeur
   */
  get<T>(key: string, defaultValue?: T): T {
    if (!this.data.has(key) && defaultValue !== undefined) {
      return defaultValue;
    }
    return this.data.get(key) as T;
  }

  /**
   * Vérifie si une clé existe
   */
  has(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Supprime une clé
   */
  delete(key: string): boolean {
    this.metadata.delete(key);
    const result = this.data.delete(key);

    if (this.persist) {
      this.save();
    }

    return result;
  }

  /**
   * Efface toutes les données
   */
  clear(): void {
    this.data.clear();
    this.metadata.clear();

    if (this.persist) {
      this.save();
    }
  }

  /**
   * Récupère toutes les données
   */
  getAll(): Record<string, any> {
    const result: Record<string, any> = {};
    this.data.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Récupère les métadonnées d'une clé
   */
  getMeta(key: string): { timestamp: number; platform?: string } | undefined {
    return this.metadata.get(key);
  }

  /**
   * Récupère les données créées par une plateforme spécifique
   */
  getByPlatform(platform: 'mobile' | 'web' | 'api'): Record<string, any> {
    const result: Record<string, any> = {};
    this.metadata.forEach((meta, key) => {
      if (meta.platform === platform) {
        result[key] = this.data.get(key);
      }
    });
    return result;
  }

  /**
   * Incrémente une valeur numérique
   */
  increment(key: string, amount: number = 1): number {
    const current = this.get<number>(key, 0);
    const newValue = current + amount;
    this.set(key, newValue);
    return newValue;
  }

  /**
   * Ajoute à un tableau
   */
  push<T>(key: string, value: T): T[] {
    const arr = this.get<T[]>(key, []);
    arr.push(value);
    this.set(key, arr);
    return arr;
  }

  /**
   * Fusionne un objet
   */
  merge<T extends Record<string, any>>(key: string, value: Partial<T>): T {
    const current = this.get<T>(key, {} as T);
    const merged = { ...current, ...value };
    this.set(key, merged);
    return merged;
  }

  /**
   * Sauvegarde sur disque (si persist=true)
   */
  private save(): void {
    try {
      const dir = path.dirname(this.persistPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const saveData = {
        data: Object.fromEntries(this.data),
        metadata: Object.fromEntries(this.metadata),
        savedAt: new Date().toISOString(),
      };

      fs.writeFileSync(this.persistPath, JSON.stringify(saveData, null, 2));
    } catch (e) {
      logger.warn(`Impossible de sauvegarder le data store: ${(e as Error).message}`);
    }
  }

  /**
   * Charge depuis le disque (si persist=true)
   */
  private load(): void {
    try {
      if (fs.existsSync(this.persistPath)) {
        const content = fs.readFileSync(this.persistPath, 'utf-8');
        const saveData = JSON.parse(content);

        this.data = new Map(Object.entries(saveData.data || {}));
        this.metadata = new Map(Object.entries(saveData.metadata || {}));

        logger.info(`Data store chargé depuis ${this.persistPath}`);
      }
    } catch (e) {
      logger.warn(`Impossible de charger le data store: ${(e as Error).message}`);
    }
  }

  /**
   * Export pour le rapport
   */
  toJSON(): Record<string, any> {
    return {
      data: this.getAll(),
      metadata: Object.fromEntries(this.metadata),
    };
  }

  /**
   * Affiche un résumé du store
   */
  summary(): void {
    logger.info(`Data Store: ${this.data.size} entrées`);
    logger.table(this.getAll());
  }
}

// Instance singleton pour utilisation globale
export const globalStore = new DataStore({ persist: true });

export default DataStore;