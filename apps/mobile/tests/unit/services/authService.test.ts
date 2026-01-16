/**
 * Tests unitaires pour authService
 */
import * as SecureStore from 'expo-secure-store';

// Mock du module ENV avant l'import de authService
jest.mock('../../../src/config/env', () => ({
  ENV: {
    KEYCLOAK_URL: 'http://localhost:8180',
    KEYCLOAK_REALM: 'oneeats',
    KEYCLOAK_CLIENT_ID: 'oneeats-mobile',
    APP_SCHEME: 'oneeats',
    AUTH_ENABLED: true,
    MOCK_AUTH: false,
    DEBUG_MODE: false
  }
}));

// Import apres le mock
import authService from '../../../src/services/authService';

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('should return true when access token exists and is valid', async () => {
      const futureExpiry = (Date.now() + 3600000).toString(); // +1 heure

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('valid-access-token')
        .mockResolvedValueOnce(futureExpiry);

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('oneeats_access_token');
    });

    it('should return false when no access token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getAccessToken', () => {
    it('should return token when valid and not expired', async () => {
      const futureExpiry = (Date.now() + 3600000).toString(); // +1 heure

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('valid-token')
        .mockResolvedValueOnce(futureExpiry);

      const token = await authService.getAccessToken();

      expect(token).toBe('valid-token');
    });

    it('should return null when no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null);

      const token = await authService.getAccessToken();

      expect(token).toBeNull();
    });
  });

  describe('getCachedUserInfo', () => {
    it('should return cached user info when available', async () => {
      const cachedUser = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      };

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(cachedUser));

      const userInfo = await authService.getCachedUserInfo();

      expect(userInfo).toEqual(cachedUser);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('oneeats_user_info');
    });

    it('should return null when no cached info', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null);

      const userInfo = await authService.getCachedUserInfo();

      expect(userInfo).toBeNull();
    });

    it('should return null and handle JSON parse error', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('invalid-json');

      const userInfo = await authService.getCachedUserInfo();

      expect(userInfo).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear all stored tokens', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null); // Pour getAccessToken
      (SecureStore.deleteItemAsync as jest.Mock)
        .mockResolvedValue(undefined);

      await authService.logout();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('oneeats_access_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('oneeats_refresh_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('oneeats_token_expiry');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('oneeats_user_info');
    });
  });

  describe('parseToken', () => {
    it('should parse a valid JWT payload', () => {
      // JWT valide avec payload { "sub": "123", "email": "test@example.com" }
      const payload = { sub: '123', email: 'test@example.com' };
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const mockToken = `header.${base64Payload}.signature`;

      const parsed = authService.parseToken(mockToken);

      expect(parsed).toEqual(payload);
    });

    it('should return null for invalid token', () => {
      const parsed = authService.parseToken('invalid-token');

      expect(parsed).toBeNull();
    });

    it('should return null for empty token', () => {
      const parsed = authService.parseToken('');

      expect(parsed).toBeNull();
    });
  });

  describe('getRoles', () => {
    it('should return empty array when no token', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null);

      const roles = await authService.getRoles();

      expect(roles).toEqual([]);
    });
  });
});
