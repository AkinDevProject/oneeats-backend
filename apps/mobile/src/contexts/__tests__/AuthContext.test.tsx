import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../AuthContext';
import { mockUser } from '../../data/mockData';

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Initial state', () => {
    it('should have initial state with no user and loading true', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should load user from AsyncStorage on mount', async () => {
      const userData = JSON.stringify({ ...mockUser, isGuest: false });
      mockAsyncStorage.getItem.mockResolvedValueOnce(userData);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual({ ...mockUser, isGuest: false });
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Login functionality', () => {
    it('should login with valid credentials', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: boolean;
      await act(async () => {
        loginResult = await result.current.login(mockUser.email, 'password123');
      });

      expect(loginResult).toBe(true);
      expect(result.current.user).toEqual({ ...mockUser, isGuest: false });
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({ ...mockUser, isGuest: false })
      );
    });

    it('should fail login with invalid credentials', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: boolean;
      await act(async () => {
        loginResult = await result.current.login('wrong@email.com', 'wrongpassword');
      });

      expect(loginResult).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Guest login functionality', () => {
    it('should create guest user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const guestEmail = 'guest@test.com';
      let loginResult: boolean;
      await act(async () => {
        loginResult = await result.current.loginGuest(guestEmail);
      });

      expect(loginResult).toBe(true);
      expect(result.current.user).toEqual(
        expect.objectContaining({
          name: 'Utilisateur Invité',
          email: guestEmail,
          isGuest: true,
          favoriteRestaurants: [],
          orders: [],
        })
      );
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Registration functionality', () => {
    it('should register new user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newUserData = {
        name: 'New User',
        email: 'newuser@test.com',
        password: 'password123',
      };

      let registerResult: boolean;
      await act(async () => {
        registerResult = await result.current.register(
          newUserData.name,
          newUserData.email,
          newUserData.password
        );
      });

      expect(registerResult).toBe(true);
      expect(result.current.user).toEqual(
        expect.objectContaining({
          name: newUserData.name,
          email: newUserData.email,
          isGuest: false,
          favoriteRestaurants: [],
          orders: [],
        })
      );
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Logout functionality', () => {
    it('should logout user and clear storage', async () => {
      // Setup user first
      const userData = JSON.stringify({ ...mockUser, isGuest: false });
      mockAsyncStorage.getItem.mockResolvedValueOnce(userData);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual({ ...mockUser, isGuest: false });
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Profile update functionality', () => {
    it('should update user profile', async () => {
      // Setup user first
      const userData = JSON.stringify({ ...mockUser, isGuest: false });
      mockAsyncStorage.getItem.mockResolvedValueOnce(userData);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual({ ...mockUser, isGuest: false });
      });

      const updates = { name: 'Updated Name' };
      await act(async () => {
        await result.current.updateProfile(updates);
      });

      expect(result.current.user).toEqual(
        expect.objectContaining({
          ...mockUser,
          name: 'Updated Name',
          isGuest: false,
        })
      );
    });

    it('should not update profile if no user is logged in', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { name: 'Updated Name' };
      await act(async () => {
        await result.current.updateProfile(updates);
      });

      expect(result.current.user).toBeNull();
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Guest to full user conversion', () => {
    it('should convert guest user to full user', async () => {
      // Setup guest user first
      const guestUser = { ...mockUser, isGuest: true };
      const userData = JSON.stringify(guestUser);
      mockAsyncStorage.getItem.mockResolvedValueOnce(userData);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(guestUser);
      });

      const newName = 'Converted User';
      const newPassword = 'newpassword123';
      let conversionResult: boolean;
      await act(async () => {
        conversionResult = await result.current.convertGuestToFullUser(newName, newPassword);
      });

      expect(conversionResult).toBe(true);
      expect(result.current.user).toEqual(
        expect.objectContaining({
          ...guestUser,
          name: newName,
          isGuest: false,
        })
      );
    });

    it('should not convert non-guest user', async () => {
      // Setup regular user first
      const regularUser = { ...mockUser, isGuest: false };
      const userData = JSON.stringify(regularUser);
      mockAsyncStorage.getItem.mockResolvedValueOnce(userData);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(regularUser);
      });

      let conversionResult: boolean;
      await act(async () => {
        conversionResult = await result.current.convertGuestToFullUser('New Name', 'password');
      });

      expect(conversionResult).toBe(false);
      expect(result.current.user).toEqual(regularUser);
    });
  });

  describe('Error handling and validation', () => {
    it('should handle AsyncStorage errors during user load', async () => {
      const mockError = new Error('AsyncStorage failed');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockAsyncStorage.getItem.mockImplementation(() => {
        throw mockError;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.user).toBeNull();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error loading user:', mockError);
      consoleSpy.mockRestore();
    });

    it('should validate email format during registration', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const invalidEmailData = {
        name: 'Test User',
        email: 'invalid-email',
        phone: '+1234567890',
        password: 'password123'
      };

      await act(async () => {
        const success = await result.current.register(
          invalidEmailData.name,
          invalidEmailData.email,
          invalidEmailData.phone,
          invalidEmailData.password
        );
        expect(success).toBe(false);
      });

      expect(result.current.user).toBeNull();
    });

    it('should handle registration errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockAsyncStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const success = await result.current.register('Test', 'test@test.com', '+1234567890', 'password');
        expect(success).toBe(false);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error during registration:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle login errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockAsyncStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const success = await result.current.login('test@test.com', 'password');
        expect(success).toBe(false);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error during login:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle profile update errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // First login a user
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'user') {
          return Promise.resolve(JSON.stringify(mockUser));
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Mock storage error for update
      mockAsyncStorage.setItem.mockImplementation(() => {
        throw new Error('Update failed');
      });

      const updateData = { name: 'Updated Name' };

      await act(async () => {
        const success = await result.current.updateProfile(updateData);
        expect(success).toBe(false);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error updating profile:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});