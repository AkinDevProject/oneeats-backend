import { APIRequestContext } from '@playwright/test';

export class ApiHelper {
  constructor(private request: APIRequestContext) {}

  // Restaurants
  async getAllRestaurants() {
    const response = await this.request.get('/restaurants');
    return await response.json();
  }

  async getRestaurant(id: string) {
    const response = await this.request.get(`/restaurants/${id}`);
    return await response.json();
  }

  async getRestaurantMenuItems(restaurantId: string) {
    const response = await this.request.get(`/menu-items/restaurant/${restaurantId}`);
    return await response.json();
  }

  // Menu Items
  async createMenuItem(menuItem: any) {
    const response = await this.request.post('/menu-items', {
      data: menuItem
    });
    return await response.json();
  }

  async updateMenuItem(id: string, updates: any) {
    const response = await this.request.put(`/menu-items/${id}`, {
      data: updates
    });
    return response.ok();
  }

  async deleteMenuItem(id: string) {
    const response = await this.request.delete(`/menu-items/${id}`);
    return response.ok();
  }

  // Orders
  async createOrder(orderData: any) {
    const response = await this.request.post('/orders', {
      data: orderData,
      headers: {
        'User-Id': process.env.TEST_USER_ID || '12345678-1234-1234-1234-123456789012'
      }
    });
    return await response.json();
  }

  async getOrder(id: string) {
    const response = await this.request.get(`/orders/${id}`);
    return await response.json();
  }

  async updateOrderStatus(id: string, status: string) {
    const response = await this.request.put(`/orders/${id}/status`, {
      data: { status }
    });
    return response.ok();
  }

  // Utilitaires
  async waitForOrderStatus(orderId: string, expectedStatus: string, timeoutMs: number = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const order = await this.getOrder(orderId);
      if (order.status === expectedStatus) {
        return order;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    throw new Error(`Order ${orderId} n'a pas atteint le status ${expectedStatus} dans ${timeoutMs}ms`);
  }

  async simulateOrderFlow(orderId: string) {
    console.log(`🔄 Simulation du flow de commande ${orderId}...`);
    
    // EN_ATTENTE → EN_PREPARATION
    await this.updateOrderStatus(orderId, 'EN_PREPARATION');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // EN_PREPARATION → PRETE
    await this.updateOrderStatus(orderId, 'PRETE');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // PRETE → RECUPEREE
    await this.updateOrderStatus(orderId, 'RECUPEREE');
    
    console.log('✅ Flow de commande simulé avec succès');
  }
}