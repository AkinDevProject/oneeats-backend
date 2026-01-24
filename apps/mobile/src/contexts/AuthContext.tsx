import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { ENV } from '../config/env';
import apiService from '../services/api';
import authService, { KeycloakUserInfo } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithSSO: (provider?: string) => Promise<boolean>;
  loginGuest: (email: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  convertGuestToFullUser: (name: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Convertit les infos Keycloak vers le format User mobile
 */
const mapKeycloakUserToMobileUser = (keycloakUser: KeycloakUserInfo): User => {
  return {
    id: keycloakUser.sub,
    name: keycloakUser.name || `${keycloakUser.given_name || ''} ${keycloakUser.family_name || ''}`.trim() || keycloakUser.preferred_username,
    email: keycloakUser.email,
    phone: '',
    favoriteRestaurants: [],
    orders: [],
    isGuest: false,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = useCallback(async () => {
    try {
      // Mode mock pour developpement sans Keycloak
      if (!ENV.AUTH_ENABLED || ENV.MOCK_AUTH) {
        console.log('🔄 Loading fixed user from API (mock mode):', ENV.DEV_USER_ID);

        try {
          // Essayer de recuperer l'utilisateur depuis l'API
          const apiUser = await apiService.users.getById(ENV.DEV_USER_ID);
          console.log('✅ User loaded from API:', apiUser);

          // Convertir les donnees API au format mobile
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

          // Fallback vers un user par defaut si API echoue
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

      // Mode Keycloak - verifier si deja authentifie
      console.log('🔐 Checking existing authentication...');
      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        // Recuperer les infos utilisateur depuis Keycloak
        let keycloakUser = await authService.getCachedUserInfo();
        if (!keycloakUser) {
          keycloakUser = await authService.getUserInfo();
        }

        if (keycloakUser) {
          const mobileUser = mapKeycloakUserToMobileUser(keycloakUser);
          setUser(mobileUser);
          await AsyncStorage.setItem('user', JSON.stringify(mobileUser));
          console.log('✅ User restored from Keycloak session');
        }
      } else {
        // Pas de session Keycloak, verifier AsyncStorage (guest users)
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          // Seulement restaurer les guest users
          if (parsedUser.isGuest) {
            setUser(parsedUser);
            console.log('✅ Guest user restored from storage');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading user:', error);
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

  /**
   * Login avec email/password via API backend → Keycloak
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // Si auth desactivee, login automatique reussi (mode mock)
      if (!ENV.AUTH_ENABLED || ENV.MOCK_AUTH) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simule delai reseau
        const mockUser: User = {
          id: Math.random().toString(36).substring(7),
          name: 'Mock User',
          email,
          favoriteRestaurants: [],
          orders: [],
          isGuest: false,
        };
        await saveUser(mockUser);
        return true;
      }

      // Mode Keycloak - utiliser l'API backend pour authentifier
      console.log('🔐 Starting credential login for:', email);
      const tokens = await authService.loginWithCredentials(email, password);

      if (tokens) {
        // Recuperer les infos utilisateur apres login
        const keycloakUser = await authService.getUserInfo();

        if (keycloakUser) {
          const mobileUser = mapKeycloakUserToMobileUser(keycloakUser);
          await saveUser(mobileUser);
          console.log('✅ Credential login successful');
          return true;
        }

        // Fallback: creer un user local avec l'email
        const newUser: User = {
          id: Math.random().toString(36).substring(7),
          name: email.split('@')[0],
          email,
          favoriteRestaurants: [],
          orders: [],
          isGuest: false,
        };
        await saveUser(newUser);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw pour permettre au composant de gerer l'erreur specifique
    }
  }, [saveUser]);

  /**
   * Login via Keycloak SSO
   * @param provider - Optional identity provider hint (e.g., 'google', 'apple')
   */
  const loginWithSSO = useCallback(async (provider?: string): Promise<boolean> => {
    try {
      if (!ENV.AUTH_ENABLED || ENV.MOCK_AUTH) {
        console.warn('SSO login not available in mock mode');
        // En mode mock, simuler un login reussi pour les tests
        const mockUser: User = {
          id: Math.random().toString(36).substring(7),
          name: provider ? `User via ${provider}` : 'SSO User',
          email: `${provider || 'sso'}@example.com`,
          favoriteRestaurants: [],
          orders: [],
        };
        await saveUser(mockUser);
        return true;
      }

      console.log(`🔐 Starting SSO login${provider ? ` with ${provider}` : ''}...`);
      const tokens = await authService.login(provider);

      if (tokens) {
        // Recuperer les infos utilisateur
        const keycloakUser = await authService.getUserInfo();

        if (keycloakUser) {
          const mobileUser = mapKeycloakUserToMobileUser(keycloakUser);
          await saveUser(mobileUser);
          console.log('✅ SSO login successful');
          return true;
        }
      }

      console.log('❌ SSO login failed');
      return false;
    } catch (error) {
      console.error('SSO login error:', error);
      return false;
    }
  }, [saveUser]);

  const loginGuest = useCallback(async (email: string): Promise<boolean> => {
    try {
      const guestUser: User = {
        id: Math.random().toString(36).substring(7),
        name: 'Utilisateur Invite',
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
      // En mode mock, creer un utilisateur local
      if (!ENV.AUTH_ENABLED || ENV.MOCK_AUTH) {
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
      }

      // En mode Keycloak, utiliser l'API backend pour creer l'utilisateur
      console.log('📝 Registering user via backend API...');

      // Separer le nom en prenom et nom de famille
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(' ') || '';

      const tokens = await authService.registerWithCredentials(
        firstName,
        lastName,
        email,
        password
      );

      if (tokens) {
        // Recuperer les infos utilisateur apres inscription
        const keycloakUser = await authService.getUserInfo();

        if (keycloakUser) {
          const mobileUser = mapKeycloakUserToMobileUser(keycloakUser);
          await saveUser(mobileUser);
          console.log('✅ Registration successful');
          return true;
        }

        // Fallback: creer un user local avec les infos fournies
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
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // Re-throw pour permettre au composant de gerer l'erreur specifique
    }
  }, [saveUser]);

  const logout = useCallback(async () => {
    try {
      // Si Keycloak est actif, deconnecter du SSO
      if (ENV.AUTH_ENABLED && !ENV.MOCK_AUTH) {
        await authService.logout();
      }

      await AsyncStorage.removeItem('user');
      setUser(null);
      console.log('✅ Logout successful');
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
      // En mode Keycloak, rediriger vers SSO pour creer un vrai compte
      if (ENV.AUTH_ENABLED && !ENV.MOCK_AUTH) {
        console.log('Converting guest to full user via SSO...');
        return await loginWithSSO();
      }

      // En mode mock, simplement mettre a jour le user local
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
  }, [user, saveUser, loginWithSSO]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithSSO,
    loginGuest,
    register,
    logout,
    updateProfile,
    convertGuestToFullUser,
  }), [user, isLoading, login, loginWithSSO, loginGuest, register, logout, updateProfile, convertGuestToFullUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
