/**
 * Tests unitaires pour apiService
 */

// Mock des modules avant les imports
jest.mock('../../../src/config/env', () => ({
  ENV: {
    API_URL: 'http://localhost:8080/api',
    API_TIMEOUT: 10000,
    AUTH_ENABLED: false,
    MOCK_AUTH: true,
    DEBUG_MODE: false,
    DEV_USER_ID: 'test-user-id'
  }
}));

jest.mock('../../../src/services/authService', () => ({
  default: {
    getAccessToken: jest.fn().mockResolvedValue(null),
    getCachedUserInfo: jest.fn().mockResolvedValue(null),
    getUserInfo: jest.fn().mockResolvedValue(null),
    refreshTokens: jest.fn().mockResolvedValue(null)
  }
}));

// Import apres les mocks
import apiService from '../../../src/services/api';
import { mockRestaurants, mockMenuItems } from '../../mocks/data';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('apiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('restaurants', () => {
    describe('getAll', () => {
      it('should fetch all restaurants', async () => {
        const apiResponse = mockRestaurants.map(r => ({
          id: r.id,
          name: r.name,
          imageUrl: r.image,
          cuisineType: r.cuisine,
          rating: r.rating,
          isOpen: r.isOpen
        }));

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(apiResponse)
        });

        const result = await apiService.restaurants.getAll();

        expect(result).toEqual(apiResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/restaurants',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            })
          })
        );
      });

      it('should handle network error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(apiService.restaurants.getAll()).rejects.toThrow('Network error');
      });
    });

    describe('getById', () => {
      it('should fetch restaurant by id', async () => {
        const restaurant = mockRestaurants[0];
        const apiResponse = {
          id: restaurant.id,
          name: restaurant.name,
          imageUrl: restaurant.image
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(apiResponse)
        });

        const result = await apiService.restaurants.getById('resto-1');

        expect(result).toEqual(apiResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/restaurants/resto-1',
          expect.any(Object)
        );
      });

      it('should handle 404 error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        });

        await expect(apiService.restaurants.getById('invalid-id'))
          .rejects.toThrow('API Error: 404 Not Found');
      });
    });

    describe('getMenuItems', () => {
      it('should fetch menu items for a restaurant', async () => {
        const items = mockMenuItems.filter(i => i.restaurantId === 'resto-1');

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(items)
        });

        const result = await apiService.restaurants.getMenuItems('resto-1');

        expect(result).toEqual(items);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/menu-items/restaurant/resto-1',
          expect.any(Object)
        );
      });
    });
  });

  describe('menuItems', () => {
    describe('getAll', () => {
      it('should fetch all menu items', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockMenuItems)
        });

        const result = await apiService.menuItems.getAll();

        expect(result).toEqual(mockMenuItems);
      });
    });

    describe('getById', () => {
      it('should fetch menu item by id', async () => {
        const item = mockMenuItems[0];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(item)
        });

        const result = await apiService.menuItems.getById('item-1');

        expect(result).toEqual(item);
      });
    });

    describe('getByRestaurant', () => {
      it('should fetch menu items by restaurant', async () => {
        const items = mockMenuItems.filter(i => i.restaurantId === 'resto-1');

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(items)
        });

        const result = await apiService.menuItems.getByRestaurant('resto-1');

        expect(result).toEqual(items);
      });
    });
  });

  describe('orders', () => {
    describe('create', () => {
      it('should create a new order', async () => {
        const orderData = {
          restaurantId: 'resto-1',
          totalAmount: 25.99,
          items: [
            { menuItemId: 'item-1', menuItemName: 'Pizza', unitPrice: 12.99, quantity: 2 }
          ]
        };

        const createdOrder = {
          id: 'new-order-1',
          orderNumber: 'ORD-1234',
          ...orderData,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: () => Promise.resolve(createdOrder)
        });

        const result = await apiService.orders.create(orderData);

        expect(result).toEqual(createdOrder);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/orders',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(orderData)
          })
        );
      });
    });

    describe('getByUserId', () => {
      it('should fetch orders by user id', async () => {
        const orders = [{ id: 'order-1', status: 'PENDING' }];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(orders)
        });

        const result = await apiService.orders.getByUserId('user-1');

        expect(result).toEqual(orders);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/orders?userId=user-1',
          expect.any(Object)
        );
      });

      it('should use DEV_USER_ID when no userId provided', async () => {
        const orders = [{ id: 'order-1', status: 'PENDING' }];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(orders)
        });

        await apiService.orders.getByUserId();

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/orders?userId=test-user-id',
          expect.any(Object)
        );
      });
    });

    describe('getById', () => {
      it('should fetch order by id', async () => {
        const order = { id: 'order-1', status: 'PREPARING' };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(order)
        });

        const result = await apiService.orders.getById('order-1');

        expect(result).toEqual(order);
      });
    });

    describe('updateStatus', () => {
      it('should update order status', async () => {
        const response = { id: 'order-1', status: 'READY' };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(response)
        });

        const result = await apiService.orders.updateStatus('order-1', 'READY');

        expect(result).toEqual(response);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/orders/order-1/status',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ status: 'READY' })
          })
        );
      });
    });
  });

  describe('users', () => {
    describe('getById', () => {
      it('should fetch user by id', async () => {
        const user = { id: 'user-1', firstName: 'Test', lastName: 'User', email: 'test@example.com' };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(user)
        });

        const result = await apiService.users.getById('user-1');

        expect(result).toEqual(user);
      });
    });
  });

  describe('favorites', () => {
    describe('getByUserId', () => {
      it('should fetch user favorites', async () => {
        const favorites = [{ restaurantId: 'resto-1' }, { restaurantId: 'resto-2' }];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(favorites)
        });

        const result = await apiService.favorites.getByUserId('user-1');

        expect(result).toEqual(favorites);
      });
    });

    describe('add', () => {
      it('should add restaurant to favorites', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true })
        });

        await apiService.favorites.add('user-1', 'resto-1');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/users/user-1/favorites/resto-1',
          expect.objectContaining({ method: 'POST' })
        );
      });
    });

    describe('remove', () => {
      it('should remove restaurant from favorites', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true })
        });

        await apiService.favorites.remove('user-1', 'resto-1');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/users/user-1/favorites/resto-1',
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });

    describe('toggle', () => {
      it('should toggle favorite status', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ isFavorite: true })
        });

        const result = await apiService.favorites.toggle('user-1', 'resto-1');

        expect(result).toEqual({ isFavorite: true });
      });
    });
  });

  describe('health', () => {
    describe('check', () => {
      it('should return health status', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ status: 'UP' })
        });

        const result = await apiService.health.check();

        expect(result).toEqual({ status: 'UP' });
      });
    });
  });

  describe('error handling', () => {
    it('should handle timeout', async () => {
      mockFetch.mockImplementationOnce(() =>
        new Promise((_, reject) => {
          const error = new Error('Request timeout');
          error.name = 'AbortError';
          reject(error);
        })
      );

      await expect(apiService.restaurants.getAll())
        .rejects.toThrow('Request timeout');
    });

    it('should handle server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(apiService.restaurants.getAll())
        .rejects.toThrow('API Error: 500 Internal Server Error');
    });
  });
});
