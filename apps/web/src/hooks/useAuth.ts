import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User } from '../types';

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

  // Initialisation au chargement - vérifier session Keycloak
  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await fetchCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('oneeats-user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('oneeats-user');
      }
      setIsLoading(false);
    };

    initAuth();
  }, [fetchCurrentUser]);

  /**
   * Login avec email/password - non supporté avec Keycloak.
   * Utiliser loginWithSSO() qui redirige vers Keycloak.
   */
  const login = async (_email: string, _password: string): Promise<boolean> => {
    // Avec Keycloak, le login direct n'est pas supporté
    // L'utilisateur doit utiliser loginWithSSO()
    console.warn('Direct login not supported. Use loginWithSSO() instead.');
    return false;
  };

  /**
   * Redirige vers Keycloak pour l'authentification SSO.
   * Quarkus gère le flow OIDC et les cookies de session.
   */
  const loginWithSSO = () => {
    // Rediriger vers une page protégée - Quarkus redirigera automatiquement vers Keycloak
    window.location.href = '/restaurant';
  };

  /**
   * Déconnexion - appelle l'endpoint logout de Quarkus qui invalide la session Keycloak
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('oneeats-user');
    // Rediriger vers l'endpoint logout de Quarkus
    window.location.href = `${API_URL}/api/auth/logout`;
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
