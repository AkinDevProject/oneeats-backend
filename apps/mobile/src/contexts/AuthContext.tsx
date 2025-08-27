import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, mockUser } from '../data/mockData';

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

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
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
  };

  const loginGuest = async (email: string): Promise<boolean> => {
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
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
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
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      await saveUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const convertGuestToFullUser = async (name: string, password: string): Promise<boolean> => {
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
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginGuest,
    register,
    logout,
    updateProfile,
    convertGuestToFullUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};