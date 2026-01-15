import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User } from '../types';

// Environment configuration for auth
const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true';
const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';
const DEFAULT_USER_ID = import.meta.env.VITE_DEFAULT_USER_ID || '11111111-1111-1111-1111-111111111111';
const DEFAULT_RESTAURANT_ID = import.meta.env.VITE_DEFAULT_RESTAURANT_ID || '11111111-1111-1111-1111-111111111111';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithSSO: () => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Recupere les infos utilisateur depuis le backend.
   * En mode web-app, Quarkus utilise les cookies de session.
   */
  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include', // Important: envoie les cookies de session
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Mapper les données backend vers le format User du frontend
      return {
        id: data.id,
        email: data.email,
        name: data.fullName || `${data.firstName} ${data.lastName}`,
        role: data.roles?.includes('admin') ? 'admin' :
              data.roles?.includes('restaurant') ? 'restaurant' : 'user',
        createdAt: new Date(),
        restaurantId: data.restaurants?.[0]?.restaurantId,
      };
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }, []);

  // Initialisation au chargement
  useEffect(() => {
    const initAuth = async () => {
      // Mode mock pour developpement sans Keycloak
      if (!AUTH_ENABLED || MOCK_AUTH) {
        const defaultUser: User = {
          id: DEFAULT_USER_ID,
          email: 'test@oneeats.com',
          name: 'Test User - Restaurant Owner',
          role: 'restaurant',
          createdAt: new Date(),
          restaurantId: DEFAULT_RESTAURANT_ID
        };
        setUser(defaultUser);
        localStorage.setItem('oneeats-user', JSON.stringify(defaultUser));
        setIsLoading(false);
        return;
      }

      // Mode Keycloak - verifier si deja connecte via cookie de session
      const currentUser = await fetchCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('oneeats-user', JSON.stringify(currentUser));
      }

      setIsLoading(false);
    };

    initAuth();
  }, [fetchCurrentUser]);

  /**
   * Login avec email/password (mode mock uniquement).
   * En mode Keycloak, utiliser loginWithSSO() qui redirige vers Keycloak.
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Mode mock
    if (!AUTH_ENABLED || MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Credentials de test
      if (email === 'jean.dupont@oneats.dev' && password === 'dev123') {
        const adminUser: User = {
          id: '4ffe5398-4599-4c33-98ec-18a96fd9e200',
          email: 'jean.dupont@oneats.dev',
          name: 'Jean Dupont (Dev)',
          role: 'admin',
          createdAt: new Date()
        };
        setUser(adminUser);
        localStorage.setItem('oneeats-user', JSON.stringify(adminUser));
        setIsLoading(false);
        return true;
      }

      if (email === 'luigi@restaurant.com' && password === 'resto123') {
        const restaurantUser: User = {
          id: DEFAULT_USER_ID,
          email: 'luigi@restaurant.com',
          name: 'Luigi - Pizza Palace',
          role: 'restaurant',
          createdAt: new Date(),
          restaurantId: DEFAULT_RESTAURANT_ID
        };
        setUser(restaurantUser);
        localStorage.setItem('oneeats-user', JSON.stringify(restaurantUser));
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    }

    // En mode Keycloak, on ne peut pas faire de login direct ici
    // L'utilisateur doit utiliser loginWithSSO() qui redirige vers Keycloak
    setIsLoading(false);
    return false;
  };

  /**
   * Redirige vers Keycloak pour l'authentification SSO.
   * Quarkus gere le flow OIDC et les cookies de session.
   */
  const loginWithSSO = () => {
    if (!AUTH_ENABLED || MOCK_AUTH) {
      console.warn('SSO login not available in mock mode');
      return;
    }
    // Rediriger vers une page protegee - Quarkus redirigera automatiquement vers Keycloak
    window.location.href = '/restaurant';
  };

  /**
   * Deconnexion - appelle l'endpoint logout de Quarkus qui invalide la session
   */
  const logout = async () => {
    if (!AUTH_ENABLED || MOCK_AUTH) {
      setUser(null);
      localStorage.removeItem('oneeats-user');
      return;
    }

    try {
      // Appeler l'endpoint logout de Quarkus
      window.location.href = `${API_URL}/api/auth/logout`;
    } catch (error) {
      console.error('Logout error:', error);
    }

    setUser(null);
    localStorage.removeItem('oneeats-user');
  };

  return {
    user,
    login,
    loginWithSSO,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };
};

export { AuthContext };
