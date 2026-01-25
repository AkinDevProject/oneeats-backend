import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

/**
 * Profil utilisateur depuis PostgreSQL (source de verite)
 */
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string; email?: string; phone?: string }) => Promise<boolean>;
  fullName: string;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charge le profil utilisateur depuis l'API backend (PostgreSQL)
   */
  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setUserProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profile = await apiService.users.getMe();
      setUserProfile(profile);
      console.log('✅ User profile loaded from PostgreSQL:', profile);
    } catch (err) {
      console.error('❌ Failed to load user profile:', err);
      setError('Impossible de charger le profil utilisateur');
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Met a jour le profil utilisateur via l'API backend
   */
  const updateProfile = useCallback(async (data: { firstName?: string; lastName?: string; email?: string; phone?: string }): Promise<boolean> => {
    if (!userProfile) {
      return false;
    }

    try {
      const updatedProfile = await apiService.users.update(userProfile.id, data);
      setUserProfile(updatedProfile);
      console.log('✅ User profile updated:', updatedProfile);
      return true;
    } catch (err) {
      console.error('❌ Failed to update user profile:', err);
      setError('Impossible de mettre a jour le profil');
      return false;
    }
  }, [userProfile]);

  /**
   * Nom complet de l'utilisateur (depuis PostgreSQL ou fallback Keycloak)
   */
  const fullName = useMemo(() => {
    if (userProfile) {
      return `${userProfile.firstName} ${userProfile.lastName}`.trim();
    }
    return user?.name || 'Utilisateur';
  }, [userProfile, user]);

  // Charger le profil quand l'utilisateur se connecte
  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    } else {
      setUserProfile(null);
    }
  }, [isAuthenticated, refreshProfile]);

  const value = useMemo<UserProfileContextType>(() => ({
    userProfile,
    isLoading,
    error,
    refreshProfile,
    updateProfile,
    fullName,
  }), [userProfile, isLoading, error, refreshProfile, updateProfile, fullName]);

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
