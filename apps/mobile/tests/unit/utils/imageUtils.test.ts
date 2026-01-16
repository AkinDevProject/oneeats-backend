/**
 * Tests unitaires pour imageUtils
 */

// Mock du module ENV
jest.mock('../../../src/config/env', () => ({
  ENV: {
    API_URL: 'http://localhost:8080/api'
  }
}));

import { buildImageUrl, buildRestaurantImageUrl, buildMenuItemImageUrl } from '../../../src/utils/imageUtils';

describe('imageUtils', () => {
  describe('buildImageUrl', () => {
    it('should return fallback when imageUrl is null', () => {
      const result = buildImageUrl(null);
      expect(result).toBe('https://via.placeholder.com/400x300');
    });

    it('should return fallback when imageUrl is undefined', () => {
      const result = buildImageUrl(undefined);
      expect(result).toBe('https://via.placeholder.com/400x300');
    });

    it('should return fallback when imageUrl is empty string', () => {
      const result = buildImageUrl('');
      expect(result).toBe('https://via.placeholder.com/400x300');
    });

    it('should return custom fallback when provided', () => {
      const customFallback = 'https://custom-placeholder.com/image.jpg';
      const result = buildImageUrl(null, customFallback);
      expect(result).toBe(customFallback);
    });

    it('should return http URL as-is', () => {
      const httpUrl = 'http://example.com/image.jpg';
      const result = buildImageUrl(httpUrl);
      expect(result).toBe(httpUrl);
    });

    it('should return https URL as-is', () => {
      const httpsUrl = 'https://example.com/image.jpg';
      const result = buildImageUrl(httpsUrl);
      expect(result).toBe(httpsUrl);
    });

    it('should build full URL for /uploads path', () => {
      const result = buildImageUrl('/uploads/restaurants/image.jpg');
      expect(result).toBe('http://localhost:8080/uploads/restaurants/image.jpg');
    });

    it('should build full URL for other relative paths starting with /', () => {
      const result = buildImageUrl('/images/test.jpg');
      expect(result).toBe('http://localhost:8080/images/test.jpg');
    });

    it('should build full URL for filename only', () => {
      const result = buildImageUrl('image.jpg');
      expect(result).toBe('http://localhost:8080/uploads/image.jpg');
    });

    it('should handle path with special characters', () => {
      const result = buildImageUrl('/uploads/restaurants/test%20image.jpg');
      expect(result).toBe('http://localhost:8080/uploads/restaurants/test%20image.jpg');
    });
  });

  describe('buildRestaurantImageUrl', () => {
    it('should return restaurant placeholder for null', () => {
      const result = buildRestaurantImageUrl(null);
      expect(result).toBe('https://via.placeholder.com/400x300');
    });

    it('should return restaurant placeholder for undefined', () => {
      const result = buildRestaurantImageUrl(undefined);
      expect(result).toBe('https://via.placeholder.com/400x300');
    });

    it('should build full URL for relative path', () => {
      const result = buildRestaurantImageUrl('/uploads/restaurants/pizza.jpg');
      expect(result).toBe('http://localhost:8080/uploads/restaurants/pizza.jpg');
    });

    it('should return https URL as-is', () => {
      const url = 'https://cdn.example.com/restaurant.jpg';
      const result = buildRestaurantImageUrl(url);
      expect(result).toBe(url);
    });
  });

  describe('buildMenuItemImageUrl', () => {
    it('should return menu item placeholder for null', () => {
      const result = buildMenuItemImageUrl(null);
      expect(result).toBe('https://via.placeholder.com/300x300');
    });

    it('should return menu item placeholder for undefined', () => {
      const result = buildMenuItemImageUrl(undefined);
      expect(result).toBe('https://via.placeholder.com/300x300');
    });

    it('should build full URL for relative path', () => {
      const result = buildMenuItemImageUrl('/uploads/menu-items/pizza.jpg');
      expect(result).toBe('http://localhost:8080/uploads/menu-items/pizza.jpg');
    });

    it('should return https URL as-is', () => {
      const url = 'https://cdn.example.com/menu-item.jpg';
      const result = buildMenuItemImageUrl(url);
      expect(result).toBe(url);
    });

    it('should handle filename only', () => {
      const result = buildMenuItemImageUrl('burger.jpg');
      expect(result).toBe('http://localhost:8080/uploads/burger.jpg');
    });
  });
});
