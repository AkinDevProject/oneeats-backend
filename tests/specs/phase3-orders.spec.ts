import { test, expect } from '@playwright/test';
import { ApiHelper } from '../helpers/api-helper';

test.describe('Phase 3 : Tests Commandes API (Backend)', () => {
  let api: ApiHelper;
  const PIZZA_PALACE_ID = '11111111-1111-1111-1111-111111111111';
  const TEST_USER_ID = '12345678-1234-1234-1234-123456789012';

  test.beforeAll(async ({ request }) => {
    api = new ApiHelper(request);
  });

  test('Test 3.1 : Test API commandes complète', async () => {
    console.log('🔗 Test 3.1 : Test API commandes complète');
    
    // Étape 1: Récupérer le menu (comme le ferait l'app mobile)
    const menuItems = await api.getRestaurantMenuItems(process.env.TEST_RESTAURANT_ID!);
    expect(menuItems.length).toBeGreaterThan(0);
    
    // Étape 2: Sélectionner des plats pour la commande
    const pizzaMargheritta = menuItems.find(item => item.name === 'Pizza Margherita');
    const tiramisu = menuItems.find(item => item.name === 'Tiramisu');
    const coca = menuItems.find(item => item.name === 'Coca-Cola');
    
    expect(pizzaMargheritta).toBeDefined();
    expect(tiramisu).toBeDefined();
    expect(coca).toBeDefined();
    
    // Étape 3: Créer la commande
    const orderData = {
      restaurantId: process.env.TEST_RESTAURANT_ID,
      items: [
        {
          menuItemId: pizzaMargheritta.id,
          quantity: 1,
          unitPrice: pizzaMargheritta.price,
          specialNotes: 'Sans oignons'
        },
        {
          menuItemId: tiramisu.id,
          quantity: 1,
          unitPrice: tiramisu.price,
          specialNotes: ''
        },
        {
          menuItemId: coca.id,
          quantity: 2,
          unitPrice: coca.price,
          specialNotes: ''
        }
      ],
      customerName: 'Jean Testeur E2E',
      customerPhone: '06.12.34.56.78',
      specialInstructions: 'Test automatisé - commande E2E',
      estimatedPickupTime: new Date(Date.now() + 30 * 60000).toISOString() // +30 minutes
    };
    
    console.log('🛒 Création de la commande...');
    const createdOrder = await api.createOrder(orderData);
    
    expect(createdOrder).toBeDefined();
    expect(createdOrder.id).toBeDefined();
    expect(createdOrder.status).toBe('EN_ATTENTE');
    expect(createdOrder.restaurantId).toBe(process.env.TEST_RESTAURANT_ID);
    
    // Calculer le total attendu
    const expectedTotal = pizzaMargheritta.price + tiramisu.price + (coca.price * 2);
    expect(createdOrder.totalAmount).toBe(expectedTotal);
    
    console.log(`✅ Commande créée: ${createdOrder.id} - Total: ${createdOrder.totalAmount}€`);
    
    // Étape 4: Vérifier que la commande est en BDD
    await db.waitForCondition(async () => {
      const dbOrdersCount = await db.getOrdersCount('EN_ATTENTE');
      return dbOrdersCount > 0;
    }, 5000);
    
    const latestOrder = await db.getLatestOrder();
    expect(latestOrder.id).toBe(createdOrder.id);
    expect(latestOrder.restaurant_name).toBe('Pizza Palace');
    
    console.log('✅ Test 3.1 : Commande mobile simulée avec succès');
    return createdOrder.id;
  });

  test('Test 3.2 : Simulation cycle de vie complet d\'une commande', async () => {
    console.log('🔄 Test 3.2 : Cycle de vie complet d\'une commande');
    
    // Créer une nouvelle commande pour ce test
    const menuItems = await api.getRestaurantMenuItems(process.env.TEST_RESTAURANT_ID!);
    const pizza4Fromages = menuItems.find(item => item.name === 'Pizza 4 Fromages');
    expect(pizza4Fromages).toBeDefined();
    
    const orderData = {
      restaurantId: process.env.TEST_RESTAURANT_ID,
      items: [{
        menuItemId: pizza4Fromages.id,
        quantity: 1,
        unitPrice: pizza4Fromages.price,
        specialNotes: 'Test cycle de vie'
      }],
      customerName: 'Test Cycle Vie',
      customerPhone: '06.98.76.54.32',
      specialInstructions: 'Test automatisé cycle de vie',
      estimatedPickupTime: new Date(Date.now() + 25 * 60000).toISOString()
    };
    
    console.log('🛒 Création commande pour test cycle de vie...');
    const order = await api.createOrder(orderData);
    expect(order.status).toBe('EN_ATTENTE');
    
    // Simuler les changements de statut
    console.log('🔄 Simulation du cycle de vie...');
    
    // EN_ATTENTE → EN_PREPARATION
    await api.updateOrderStatus(order.id, 'EN_PREPARATION');
    let updatedOrder = await api.waitForOrderStatus(order.id, 'EN_PREPARATION', 5000);
    expect(updatedOrder.status).toBe('EN_PREPARATION');
    console.log('✅ Statut: EN_PREPARATION');
    
    // EN_PREPARATION → PRETE  
    await api.updateOrderStatus(order.id, 'PRETE');
    updatedOrder = await api.waitForOrderStatus(order.id, 'PRETE', 5000);
    expect(updatedOrder.status).toBe('PRETE');
    console.log('✅ Statut: PRETE');
    
    // PRETE → RECUPEREE
    await api.updateOrderStatus(order.id, 'RECUPEREE');
    updatedOrder = await api.waitForOrderStatus(order.id, 'RECUPEREE', 5000);
    expect(updatedOrder.status).toBe('RECUPEREE');
    console.log('✅ Statut: RECUPEREE');
    
    // Vérifier la persistance en BDD
    const dbOrder = await db.getLatestOrder();
    expect(dbOrder.id).toBe(order.id);
    
    console.log('✅ Test 3.2 : Cycle de vie complet validé');
  });

  test('Test 3.3 : Validation données commande en BDD', async () => {
    console.log('🗄️ Test 3.3 : Validation données commande en BDD');
    
    // Créer une commande avec des détails spécifiques pour validation
    const menuItems = await api.getRestaurantMenuItems(process.env.TEST_RESTAURANT_ID!);
    const saladeCesar = menuItems.find(item => item.name === 'Salade César');
    const cocaCola = menuItems.find(item => item.name === 'Coca-Cola');
    
    const specificOrderData = {
      restaurantId: process.env.TEST_RESTAURANT_ID,
      items: [
        {
          menuItemId: saladeCesar.id,
          quantity: 1,
          unitPrice: saladeCesar.price,
          specialNotes: 'Sans croûtons'
        },
        {
          menuItemId: cocaCola.id,
          quantity: 3,
          unitPrice: cocaCola.price,
          specialNotes: 'Bien frais'
        }
      ],
      customerName: 'Marie Test BDD',
      customerPhone: '06.11.22.33.44',
      specialInstructions: 'Livraison validation BDD',
      estimatedPickupTime: new Date(Date.now() + 20 * 60000).toISOString()
    };
    
    const order = await api.createOrder(specificOrderData);
    console.log(`📝 Commande créée pour validation BDD: ${order.id}`);
    
    // Attendre que la commande soit persistée
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Requête directe BDD pour validation complète
    const dbValidation = await db.client.query(`
      SELECT 
        o.*,
        oi.menu_item_id,
        oi.quantity,
        oi.unit_price,
        oi.special_notes
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      ORDER BY oi.created_at
    `, [order.id]);
    
    expect(dbValidation.rows.length).toBeGreaterThan(0);
    
    const orderRow = dbValidation.rows[0];
    expect(orderRow.order_number).toBeDefined();
    expect(orderRow.restaurant_id).toBe(process.env.TEST_RESTAURANT_ID);
    expect(orderRow.status).toBe('EN_ATTENTE');
    expect(parseFloat(orderRow.total_amount)).toBe(saladeCesar.price + (cocaCola.price * 3));
    expect(orderRow.special_instructions).toBe('Livraison validation BDD');
    
    // Vérifier les items de la commande
    const orderItems = dbValidation.rows;
    expect(orderItems).toHaveLength(2); // 2 types d'items
    
    const saladItem = orderItems.find(item => item.menu_item_id === saladeCesar.id);
    const colaItem = orderItems.find(item => item.menu_item_id === cocaCola.id);
    
    expect(saladItem).toBeDefined();
    expect(saladItem.quantity).toBe(1);
    expect(saladItem.special_notes).toBe('Sans croûtons');
    
    expect(colaItem).toBeDefined();
    expect(colaItem.quantity).toBe(3);
    expect(colaItem.special_notes).toBe('Bien frais');
    
    console.log('✅ Test 3.3 : Validation BDD complète');
  });

  test('Test 3.4 : Test charge et performance commandes', async () => {
    console.log('⚡ Test 3.4 : Performance commandes');
    
    const menuItems = await api.getRestaurantMenuItems(process.env.TEST_RESTAURANT_ID!);
    const pizzaPepperoni = menuItems.find(item => item.name === 'Pizza Pepperoni');
    
    const orderData = {
      restaurantId: process.env.TEST_RESTAURANT_ID,
      items: [{
        menuItemId: pizzaPepperoni.id,
        quantity: 1,
        unitPrice: pizzaPepperoni.price,
        specialNotes: 'Test performance'
      }],
      customerName: 'Test Performance',
      customerPhone: '06.55.66.77.88',
      specialInstructions: 'Test charge',
      estimatedPickupTime: new Date(Date.now() + 35 * 60000).toISOString()
    };
    
    // Test temps de création de commande
    const startTime = Date.now();
    const order = await api.createOrder(orderData);
    const creationTime = Date.now() - startTime;
    
    expect(creationTime).toBeLessThan(3000); // Moins de 3 secondes
    console.log(`⏱️ Temps création commande: ${creationTime}ms`);
    
    // Test temps de récupération
    const fetchStartTime = Date.now();
    const fetchedOrder = await api.getOrder(order.id);
    const fetchTime = Date.now() - fetchStartTime;
    
    expect(fetchTime).toBeLessThan(1000); // Moins de 1 seconde
    console.log(`⏱️ Temps récupération commande: ${fetchTime}ms`);
    
    // Test temps de mise à jour statut
    const updateStartTime = Date.now();
    await api.updateOrderStatus(order.id, 'EN_PREPARATION');
    const updateTime = Date.now() - updateStartTime;
    
    expect(updateTime).toBeLessThan(2000); // Moins de 2 secondes
    console.log(`⏱️ Temps mise à jour statut: ${updateTime}ms`);
    
    console.log('✅ Test 3.4 : Performance commandes validée');
  });
});