import { Client } from 'pg';

export class DatabaseHelper {
  private client: Client;

  constructor() {
    this.client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'oneeats_dev',
      user: process.env.DB_USER || 'oneeats_user',
      password: process.env.DB_PASSWORD || 'oneeats_pass',
    });
  }

  async connect() {
    await this.client.connect();
    console.log('🔗 Connecté à la base de données');
  }

  async disconnect() {
    await this.client.end();
    console.log('🔌 Déconnecté de la base de données');
  }

  // Vérifications pour les tests
  async restaurantExists(restaurantId: string): Promise<boolean> {
    const result = await this.client.query(
      'SELECT EXISTS(SELECT 1 FROM restaurant WHERE id = $1)',
      [restaurantId]
    );
    return result.rows[0].exists;
  }

  async getMenuItemsCount(restaurantId: string): Promise<number> {
    const result = await this.client.query(
      'SELECT COUNT(*) as count FROM menu_item WHERE restaurant_id = $1',
      [restaurantId]
    );
    return parseInt(result.rows[0].count);
  }

  async getMenuItems(restaurantId: string) {
    const result = await this.client.query(`
      SELECT id, name, description, price, category, is_available 
      FROM menu_item 
      WHERE restaurant_id = $1 
      ORDER BY category, name
    `, [restaurantId]);
    return result.rows;
  }

  async getOrdersCount(status?: string): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM orders';
    let params: any[] = [];
    
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    const result = await this.client.query(query, params);
    return parseInt(result.rows[0].count);
  }

  async getLatestOrder() {
    const result = await this.client.query(`
      SELECT o.*, r.name as restaurant_name
      FROM orders o
      JOIN restaurant r ON o.restaurant_id = r.id
      ORDER BY o.created_at DESC
      LIMIT 1
    `);
    return result.rows[0];
  }

  async resetTestData() {
    // Nettoie les données de test temporaires si nécessaire
    console.log('🧹 Réinitialisation des données de test...');
  }

  // Helper pour attendre des changements dans la DB
  async waitForCondition(
    condition: () => Promise<boolean>, 
    timeoutMs: number = 10000,
    intervalMs: number = 500
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    throw new Error(`Condition non remplie après ${timeoutMs}ms`);
  }
}