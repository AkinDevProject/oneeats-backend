import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';

// Environment configuration for auth
const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true';
const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';
const DEFAULT_USER_ID = import.meta.env.VITE_DEFAULT_USER_ID || '11111111-1111-1111-1111-111111111111';
const DEFAULT_RESTAURANT_ID = import.meta.env.VITE_DEFAULT_RESTAURANT_ID || '11111111-1111-1111-1111-111111111111';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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

  useEffect(() => {
    // Si auth désactivé, créer un user par défaut pour les tests
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

    // Mode auth normal
    const savedUser = localStorage.getItem('oneeats-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Si auth désactivé, login automatique réussi
    if (!AUTH_ENABLED || MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simule délai réseau
      setIsLoading(false);
      return true; // Login toujours réussi en mode test
    }
    
    // Mode auth réel (sera implémenté en Sprint 3)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'admin@oneeats.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@oneeats.com',
        name: 'Administrateur OneEats',
        role: 'admin',
        createdAt: new Date()
      };
      setUser(adminUser);
      localStorage.setItem('oneeats-user', JSON.stringify(adminUser));
      setIsLoading(false);
      return true;
    }
    
    if (email === 'restaurant@oneeats.com' && password === 'resto123') {
      const restaurantUser: User = {
        id: DEFAULT_USER_ID,
        email: 'restaurant@oneeats.com',
        name: 'Pizza Palace',
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
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('oneeats-user');
  };

  return {
    user,
    login,
    logout,
    isLoading
  };
};

export { AuthContext };