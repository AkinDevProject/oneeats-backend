/**
 * API Driver - Interface avec le backend REST API
 *
 * Permet d'interagir directement avec l'API pour :
 * - Récupérer des données (commandes, menu, etc.)
 * - Créer des données de test
 * - Vérifier l'état du système
 */

import config from '../config';
import { logger, retry, waitForApiStatus } from '../utils';

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  status: string;
  totalAmount: number;
  createdAt: string;
  specialInstructions?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  isOpen: boolean;
}

export class ApiDriver {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.apiUrl;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Configure un header d'authentification
   */
  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Configure un User-Id header (pour les tests sans auth)
   */
  setUserId(userId: string): void {
    this.headers['User-Id'] = userId;
  }

  /**
   * Effectue une requête HTTP
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      let data: T | undefined;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          // Pas de JSON dans la réponse
        }
      }

      return {
        ok: response.ok,
        status: response.status,
        data,
        error: !response.ok ? `HTTP ${response.status}` : undefined,
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: (error as Error).message,
      };
    }
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Vérifie que l'API est accessible
   */
  async healthCheck(): Promise<boolean> {
    const response = await this.request('GET', '/restaurants');
    return response.ok;
  }

  /**
   * Attend que l'API soit prête
   */
  async waitForApi(timeoutMs: number = 30000): Promise<void> {
    logger.step('Vérification disponibilité API', 'api');

    await retry(
      async () => {
        const isHealthy = await this.healthCheck();
        if (!isHealthy) {
          throw new Error('API non disponible');
        }
      },
      {
        maxAttempts: 10,
        delayMs: 3000,
        onRetry: (attempt) => {
          logger.info(`Tentative ${attempt}/10 - API non disponible...`);
        },
      }
    );

    logger.success('API disponible');
  }

  // ==================== RESTAURANTS ====================

  /**
   * Récupère tous les restaurants
   */
  async getRestaurants(): Promise<Restaurant[]> {
    const response = await this.request<Restaurant[]>('GET', '/restaurants');

    if (!response.ok) {
      throw new Error(`Impossible de récupérer les restaurants: ${response.error}`);
    }

    return response.data || [];
  }

  /**
   * Récupère un restaurant par ID
   */
  async getRestaurant(id: string): Promise<Restaurant> {
    const response = await this.request<Restaurant>('GET', `/restaurants/${id}`);

    if (!response.ok) {
      throw new Error(`Restaurant ${id} non trouvé: ${response.error}`);
    }

    return response.data!;
  }

  /**
   * Récupère le premier restaurant disponible
   */
  async getFirstRestaurant(): Promise<Restaurant> {
    const restaurants = await this.getRestaurants();

    if (restaurants.length === 0) {
      throw new Error('Aucun restaurant disponible');
    }

    return restaurants[0];
  }

  // ==================== MENU ITEMS ====================

  /**
   * Récupère les plats d'un restaurant
   */
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    const response = await this.request<MenuItem[]>(
      'GET',
      `/menu-items/restaurant/${restaurantId}`
    );

    if (!response.ok) {
      throw new Error(`Impossible de récupérer le menu: ${response.error}`);
    }

    return response.data || [];
  }

  /**
   * Récupère un plat par ID
   */
  async getMenuItem(id: string): Promise<MenuItem> {
    const response = await this.request<MenuItem>('GET', `/menu-items/${id}`);

    if (!response.ok) {
      throw new Error(`Plat ${id} non trouvé: ${response.error}`);
    }

    return response.data!;
  }

  /**
   * Crée un nouveau plat (pour les tests)
   */
  async createMenuItem(menuItem: Partial<MenuItem>): Promise<MenuItem> {
    const response = await this.request<MenuItem>('POST', '/menu-items', menuItem);

    if (!response.ok) {
      throw new Error(`Impossible de créer le plat: ${response.error}`);
    }

    return response.data!;
  }

  /**
   * Met à jour un plat
   */
  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const response = await this.request<MenuItem>('PUT', `/menu-items/${id}`, updates);

    if (!response.ok) {
      throw new Error(`Impossible de mettre à jour le plat: ${response.error}`);
    }

    return response.data!;
  }

  /**
   * Supprime un plat
   */
  async deleteMenuItem(id: string): Promise<void> {
    const response = await this.request('DELETE', `/menu-items/${id}`);

    if (!response.ok) {
      throw new Error(`Impossible de supprimer le plat: ${response.error}`);
    }
  }

  // ==================== ORDERS ====================

  /**
   * Crée une commande
   */
  async createOrder(order: {
    restaurantId: string;
    items: { menuItemId: string; quantity: number }[];
    specialInstructions?: string;
  }): Promise<Order> {
    const response = await this.request<Order>('POST', '/orders', order);

    if (!response.ok) {
      throw new Error(`Impossible de créer la commande: ${response.error}`);
    }

    logger.data('orderId', response.data!.id);
    return response.data!;
  }

  /**
   * Récupère une commande par ID
   */
  async getOrder(id: string): Promise<Order> {
    const response = await this.request<Order>('GET', `/orders/${id}`);

    if (!response.ok) {
      throw new Error(`Commande ${id} non trouvée: ${response.error}`);
    }

    return response.data!;
  }

  /**
   * Récupère les commandes d'un restaurant
   */
  async getRestaurantOrders(restaurantId: string): Promise<Order[]> {
    const response = await this.request<Order[]>(
      'GET',
      `/orders/restaurant/${restaurantId}`
    );

    if (!response.ok) {
      throw new Error(`Impossible de récupérer les commandes: ${response.error}`);
    }

    return response.data || [];
  }

  /**
   * Met à jour le statut d'une commande
   */
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const response = await this.request<Order>(
      'PUT',
      `/orders/${orderId}/status`,
      { status }
    );

    if (!response.ok) {
      throw new Error(`Impossible de mettre à jour le statut: ${response.error}`);
    }

    logger.info(`Commande ${orderId}: statut → ${status}`);
    return response.data!;
  }

  /**
   * Attend qu'une commande atteigne un statut
   */
  async waitForOrderStatus(
    orderId: string,
    expectedStatus: string,
    timeoutMs: number = 10000
  ): Promise<Order> {
    logger.sync(`Attente statut "${expectedStatus}" pour commande ${orderId}...`);

    return waitForApiStatus(
      () => this.getOrder(orderId),
      expectedStatus,
      { timeout: timeoutMs, statusField: 'status' }
    );
  }

  /**
   * Récupère la dernière commande créée (pour un user)
   */
  async getLatestOrder(): Promise<Order | null> {
    // Cette méthode suppose qu'on a accès aux commandes via l'API
    // Peut nécessiter un endpoint spécifique
    const response = await this.request<Order[]>('GET', '/orders?limit=1&sort=createdAt:desc');

    if (!response.ok || !response.data || response.data.length === 0) {
      return null;
    }

    return response.data[0];
  }

  /**
   * Vérifie qu'une commande existe avec certains critères
   */
  async orderExists(criteria: {
    id?: string;
    restaurantId?: string;
    status?: string;
  }): Promise<boolean> {
    try {
      if (criteria.id) {
        const order = await this.getOrder(criteria.id);
        if (criteria.status && order.status !== criteria.status) {
          return false;
        }
        if (criteria.restaurantId && order.restaurantId !== criteria.restaurantId) {
          return false;
        }
        return true;
      }

      if (criteria.restaurantId) {
        const orders = await this.getRestaurantOrders(criteria.restaurantId);
        return orders.some(
          (o) => (!criteria.status || o.status === criteria.status)
        );
      }

      return false;
    } catch {
      return false;
    }
  }
}

export default ApiDriver;