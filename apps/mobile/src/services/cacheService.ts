import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés de cache
const CACHE_KEYS = {
  RESTAURANTS: '@oneeats_restaurants',
  MENU_ITEMS: '@oneeats_menu_items_',
  ORDERS: '@oneeats_orders',
  FAVORITES: '@oneeats_favorites',
  LAST_SYNC: '@oneeats_last_sync',
} as const;

// Durée de validité du cache (24 heures)
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

interface CachedData<T> {
  data: T;
  timestamp: number;
  version: string;
}

const CACHE_VERSION = '1.0';

class CacheService {
  /**
   * Sauvegarde des données dans le cache
   */
  private async set<T>(key: string, data: T): Promise<void> {
    try {
      const cachedData: CachedData<T> = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      await AsyncStorage.setItem(key, JSON.stringify(cachedData));
      console.log(`💾 Cache saved: ${key}`);
    } catch (error) {
      console.error(`❌ Cache save error for ${key}:`, error);
    }
  }

  /**
   * Récupération des données du cache
   */
  private async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (!jsonValue) return null;

      const cachedData: CachedData<T> = JSON.parse(jsonValue);

      // Vérifier la version du cache
      if (cachedData.version !== CACHE_VERSION) {
        console.log(`🔄 Cache version mismatch for ${key}, clearing...`);
        await AsyncStorage.removeItem(key);
        return null;
      }

      // Vérifier si le cache a expiré
      if (Date.now() - cachedData.timestamp > CACHE_EXPIRY_MS) {
        console.log(`⏰ Cache expired for ${key}`);
        return null;
      }

      console.log(`📦 Cache hit: ${key}`);
      return cachedData.data;
    } catch (error) {
      console.error(`❌ Cache read error for ${key}:`, error);
      return null;
    }
  }

  /**
   * Restaurants
   */
  async saveRestaurants(restaurants: any[]): Promise<void> {
    await this.set(CACHE_KEYS.RESTAURANTS, restaurants);
  }

  async getRestaurants(): Promise<any[] | null> {
    return this.get<any[]>(CACHE_KEYS.RESTAURANTS);
  }

  /**
   * Menu items par restaurant
   */
  async saveMenuItems(restaurantId: string, menuItems: any[]): Promise<void> {
    await this.set(`${CACHE_KEYS.MENU_ITEMS}${restaurantId}`, menuItems);
  }

  async getMenuItems(restaurantId: string): Promise<any[] | null> {
    return this.get<any[]>(`${CACHE_KEYS.MENU_ITEMS}${restaurantId}`);
  }

  /**
   * Commandes utilisateur
   */
  async saveOrders(orders: any[]): Promise<void> {
    await this.set(CACHE_KEYS.ORDERS, orders);
  }

  async getOrders(): Promise<any[] | null> {
    return this.get<any[]>(CACHE_KEYS.ORDERS);
  }

  /**
   * Favoris utilisateur
   */
  async saveFavorites(favorites: any[]): Promise<void> {
    await this.set(CACHE_KEYS.FAVORITES, favorites);
  }

  async getFavorites(): Promise<any[] | null> {
    return this.get<any[]>(CACHE_KEYS.FAVORITES);
  }

  /**
   * Dernière synchronisation
   */
  async getLastSync(): Promise<Date | null> {
    const timestamp = await this.get<number>(CACHE_KEYS.LAST_SYNC);
    return timestamp ? new Date(timestamp) : null;
  }

  async updateLastSync(): Promise<void> {
    await this.set(CACHE_KEYS.LAST_SYNC, Date.now());
  }

  /**
   * Vider tout le cache
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const oneEatsKeys = keys.filter(key => key.startsWith('@oneeats_'));
      await AsyncStorage.multiRemove(oneEatsKeys);
      console.log('🗑️ Cache cleared');
    } catch (error) {
      console.error('❌ Cache clear error:', error);
    }
  }

  /**
   * Vérifier si des données sont en cache
   */
  async hasCache(): Promise<boolean> {
    const restaurants = await this.getRestaurants();
    return restaurants !== null && restaurants.length > 0;
  }

  /**
   * Obtenir la taille approximative du cache
   */
  async getCacheSize(): Promise<string> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const oneEatsKeys = keys.filter(key => key.startsWith('@oneeats_'));
      let totalSize = 0;

      for (const key of oneEatsKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      // Convertir en unité lisible
      if (totalSize < 1024) {
        return `${totalSize} B`;
      } else if (totalSize < 1024 * 1024) {
        return `${(totalSize / 1024).toFixed(2)} KB`;
      } else {
        return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
      }
    } catch (error) {
      return 'N/A';
    }
  }
}

export const cacheService = new CacheService();
export default cacheService;
