import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, mockUser } from '../data/mockData';
import { ENV } from '../config/env';
import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginGuest: (email: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  convertGuestToFullUser: (name: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = useCallback(async () => {
    try {
      // Si auth désactivé, récupérer l'utilisateur fixe depuis l'API
      if (!ENV.AUTH_ENABLED || ENV.MOCK_AUTH) {
        console.log('🔄 Loading fixed user from API:', ENV.DEV_USER_ID);

        try {
          // Essayer de récupérer l'utilisateur depuis l'API
          const apiUser = await apiService.users.getById(ENV.DEV_USER_ID);
          console.log('✅ User loaded from API:', apiUser);

          // Convertir les données API au format mobile
          const mobileUser: User = {
            id: apiUser.id,
            name: `${apiUser.firstName} ${apiUser.lastName}`,
            email: apiUser.email,
            phone: apiUser.phone || '',
            favoriteRestaurants: [],
            orders: [],
            isGuest: false,
          };

          setUser(mobileUser);
          await AsyncStorage.setItem('user', JSON.stringify(mobileUser));
          setIsLoading(false);
          return;
        } catch (apiError) {
          console.warn('⚠️ Could not load user from API, using fallback:', apiError);

          // Fallback vers un user par défaut si API échoue
          const defaultUser: User = {
            id: ENV.DEV_USER_ID,
            name: 'Utilisateur Mobile',
            email: 'mobile@oneeats.com',
            phone: '+33 6 45 67 89 01',
            favoriteRestaurants: [],
            orders: [],
            isGuest: false,
          };
          setUser(defaultUser);
          await AsyncStorage.setItem('user', JSON.stringify(defaultUser));
          setIsLoading(false);
          return;
        }
      }

      // Mode auth normal
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUser = useCallback(async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // Si auth désactivé, login automatique réussi
      if (!ENV.AUTH_ENABLED || ENV.MOCK_AUTH) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simule délai réseau
        return true; // Login toujours réussi en mode test
      }
      
      // Mock authentication - in real app, call your API
      if (email === mockUser.email && password === 'password123') {
        await saveUser({ ...mockUser, isGuest: false });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [saveUser]);

  const loginGuest = useCallback(async (email: string): Promise<boolean> => {
    try {
      const guestUser: User = {
        id: Math.random().toString(36).substring(7),
        name: 'Utilisateur Invité',
        email,
        favoriteRestaurants: [],
        orders: [],
        isGuest: true,
      };
      await saveUser(guestUser);
      return true;
    } catch (error) {
      console.error('Guest login error:', error);
      return false;
    }
  }, [saveUser]);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Mock registration - in real app, call your API
      const newUser: User = {
        id: Math.random().toString(36).substring(7),
        name,
        email,
        favoriteRestaurants: [],
        orders: [],
        isGuest: false,
      };
      await saveUser(newUser);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }, [saveUser]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      await saveUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  }, [user, saveUser]);

  const convertGuestToFullUser = useCallback(async (name: string, password: string): Promise<boolean> => {
    if (!user || !user.isGuest) return false;

    try {
      const updatedUser: User = {
        ...user,
        name,
        isGuest: false,
      };
      await saveUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Guest conversion error:', error);
      return false;
    }
  }, [user, saveUser]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginGuest,
    register,
    logout,
    updateProfile,
    convertGuestToFullUser,
  }), [user, isLoading, login, loginGuest, register, logout, updateProfile, convertGuestToFullUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};