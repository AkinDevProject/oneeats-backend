/**
 * MSW Handlers pour mocker les appels API
 */
import { http, HttpResponse } from 'msw';
import { mockRestaurants, mockMenuItems, mockOrders, mockApiUser, getMenuItemsByRestaurant } from './data';

const API_BASE_URL = 'http://192.168.1.111:8080/api';

export const handlers = [
  // Restaurants
  http.get(`${API_BASE_URL}/restaurants`, () => {
    return HttpResponse.json(mockRestaurants.map(r => ({
      id: r.id,
      name: r.name,
      imageUrl: r.image,
      cuisineType: r.cuisine,
      rating: r.rating,
      isOpen: r.isOpen,
      description: r.description
    })));
  }),

  http.get(`${API_BASE_URL}/restaurants/:id`, ({ params }) => {
    const { id } = params;
    const restaurant = mockRestaurants.find(r => r.id === id);

    if (!restaurant) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({
      id: restaurant.id,
      name: restaurant.name,
      imageUrl: restaurant.image,
      cuisineType: restaurant.cuisine,
      rating: restaurant.rating,
      isOpen: restaurant.isOpen,
      description: restaurant.description
    });
  }),

  // Menu Items
  http.get(`${API_BASE_URL}/menu-items`, () => {
    return HttpResponse.json(mockMenuItems.map(item => ({
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.image,
      category: item.category,
      popular: item.popular,
      available: item.available,
      options: item.options
    })));
  }),

  http.get(`${API_BASE_URL}/menu-items/:id`, ({ params }) => {
    const { id } = params;
    const item = mockMenuItems.find(i => i.id === id);

    if (!item) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.image,
      category: item.category,
      popular: item.popular,
      available: item.available,
      options: item.options
    });
  }),

  http.get(`${API_BASE_URL}/menu-items/restaurant/:restaurantId`, ({ params }) => {
    const { restaurantId } = params;
    const items = getMenuItemsByRestaurant(restaurantId as string);

    return HttpResponse.json(items.map(item => ({
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.image,
      category: item.category,
      popular: item.popular,
      available: item.available,
      options: item.options
    })));
  }),

  // Orders
  http.get(`${API_BASE_URL}/orders`, ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    // Retourne les commandes formatees pour l'API
    return HttpResponse.json(mockOrders.map(order => ({
      id: order.id,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurant.name,
      userId: userId || 'test-user',
      status: order.status.toUpperCase(),
      totalAmount: order.total,
      createdAt: order.orderTime.toISOString(),
      estimatedPickupTime: order.pickupTime.toISOString(),
      specialInstructions: order.customerNotes,
      items: order.items.map(item => ({
        id: item.id,
        menuItemId: item.menuItem.id,
        menuItemName: item.menuItem.name,
        unitPrice: item.menuItem.price,
        quantity: item.quantity,
        subtotal: item.totalPrice,
        specialNotes: item.specialInstructions
      }))
    })));
  }),

  http.get(`${API_BASE_URL}/orders/:id`, ({ params }) => {
    const { id } = params;
    const order = mockOrders.find(o => o.id === id);

    if (!order) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({
      id: order.id,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurant.name,
      status: order.status.toUpperCase(),
      totalAmount: order.total,
      createdAt: order.orderTime.toISOString(),
      estimatedPickupTime: order.pickupTime.toISOString(),
      specialInstructions: order.customerNotes,
      items: order.items.map(item => ({
        id: item.id,
        menuItemId: item.menuItem.id,
        menuItemName: item.menuItem.name,
        unitPrice: item.menuItem.price,
        quantity: item.quantity,
        subtotal: item.totalPrice
      }))
    });
  }),

  http.post(`${API_BASE_URL}/orders`, async ({ request }) => {
    const body = await request.json() as any;

    const newOrder = {
      id: `order-${Date.now()}`,
      orderNumber: `ORD-${Math.floor(Math.random() * 10000)}`,
      restaurantId: body.restaurantId,
      restaurantName: 'Restaurant Test',
      userId: body.userId,
      status: 'PENDING',
      totalAmount: body.totalAmount,
      createdAt: new Date().toISOString(),
      estimatedPickupTime: new Date(Date.now() + 25 * 60000).toISOString(),
      estimatedPreparationTime: 25,
      specialInstructions: body.specialInstructions,
      items: body.items.map((item: any, index: number) => ({
        id: `item-${index}`,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.unitPrice * item.quantity,
        specialNotes: item.specialNotes
      }))
    };

    return HttpResponse.json(newOrder, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/orders/:id/status`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;

    return HttpResponse.json({
      id,
      status: body.status,
      updatedAt: new Date().toISOString()
    });
  }),

  // Users
  http.get(`${API_BASE_URL}/users/:id`, ({ params }) => {
    const { id } = params;

    // Retourne l'utilisateur de test par defaut
    return HttpResponse.json({
      ...mockApiUser,
      id
    });
  }),

  // Favorites
  http.get(`${API_BASE_URL}/users/:userId/favorites`, ({ params }) => {
    return HttpResponse.json([
      { restaurantId: 'resto-1', addedAt: new Date().toISOString() },
      { restaurantId: 'resto-2', addedAt: new Date().toISOString() }
    ]);
  }),

  http.post(`${API_BASE_URL}/users/:userId/favorites/:restaurantId`, ({ params }) => {
    return HttpResponse.json({ success: true });
  }),

  http.delete(`${API_BASE_URL}/users/:userId/favorites/:restaurantId`, ({ params }) => {
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE_URL}/users/:userId/favorites/:restaurantId`, ({ params }) => {
    return HttpResponse.json({ isFavorite: true });
  }),

  http.put(`${API_BASE_URL}/users/:userId/favorites/:restaurantId/toggle`, ({ params }) => {
    return HttpResponse.json({ isFavorite: true });
  }),

  // Health check
  http.get(`${API_BASE_URL}/q/health`, () => {
    return HttpResponse.json({ status: 'UP' });
  })
];

export default handlers;
