import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';

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
    const savedUser = localStorage.getItem('delishgo-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'admin@delishgo.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@delishgo.com',
        name: 'Administrateur',
        role: 'admin',
        createdAt: new Date()
      };
      setUser(adminUser);
      localStorage.setItem('delishgo-user', JSON.stringify(adminUser));
      setIsLoading(false);
      return true;
    }
    
    if (email === 'luigi@restaurant.com' && password === 'resto123') {
      const restaurantUser: User = {
        id: 'resto-1',
        email: 'luigi@restaurant.com',
        name: 'Luigi Restaurant',
        role: 'restaurant',
        createdAt: new Date()
      };
      setUser(restaurantUser);
      localStorage.setItem('delishgo-user', JSON.stringify(restaurantUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('delishgo-user');
  };

  return {
    user,
    login,
    logout,
    isLoading
  };
};

export { AuthContext };