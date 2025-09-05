import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types pour les préférences
export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  recommendations: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface DietaryPreferences {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  nutFree: boolean;
  halal: boolean;
  kosher: boolean;
}

export interface PrivacySettings {
  shareLocation: boolean;
  shareUsageData: boolean;
  marketingEmails: boolean;
  profileVisible: boolean;
}

export interface AppSettings {
  language: 'fr' | 'en' | 'es' | 'it';
  currency: 'EUR' | 'USD' | 'GBP';
  distanceUnit: 'km' | 'mi';
  autoLocation: boolean;
  darkMode: 'auto' | 'light' | 'dark';
  notifications: NotificationSettings;
  dietary: DietaryPreferences;
  privacy: PrivacySettings;
}

interface SettingsContextType {
  settings: AppSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  updateDietaryPreferences: (preferences: Partial<DietaryPreferences>) => Promise<void>;
  updatePrivacySettings: (privacy: Partial<PrivacySettings>) => Promise<void>;
  updateAppSettings: (appSettings: Partial<Omit<AppSettings, 'notifications' | 'dietary' | 'privacy'>>) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<boolean>;
}

// Paramètres par défaut
const defaultSettings: AppSettings = {
  language: 'fr',
  currency: 'EUR',
  distanceUnit: 'km',
  autoLocation: true,
  darkMode: 'auto',
  notifications: {
    orderUpdates: true,
    promotions: false,
    recommendations: true,
    sound: true,
    vibration: true,
  },
  dietary: {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    nutFree: false,
    halal: false,
    kosher: false,
  },
  privacy: {
    shareLocation: true,
    shareUsageData: false,
    marketingEmails: false,
    profileVisible: true,
  },
};

const SETTINGS_STORAGE_KEY = '@OneEats:Settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Fusionner avec les paramètres par défaut pour assurer la compatibilité
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      throw error;
    }
  };

  const updateNotificationSettings = async (notificationSettings: Partial<NotificationSettings>) => {
    const newSettings = {
      ...settings,
      notifications: { ...settings.notifications, ...notificationSettings },
    };
    await saveSettings(newSettings);
  };

  const updateDietaryPreferences = async (dietaryPreferences: Partial<DietaryPreferences>) => {
    const newSettings = {
      ...settings,
      dietary: { ...settings.dietary, ...dietaryPreferences },
    };
    await saveSettings(newSettings);
  };

  const updatePrivacySettings = async (privacySettings: Partial<PrivacySettings>) => {
    const newSettings = {
      ...settings,
      privacy: { ...settings.privacy, ...privacySettings },
    };
    await saveSettings(newSettings);
  };

  const updateAppSettings = async (appSettings: Partial<Omit<AppSettings, 'notifications' | 'dietary' | 'privacy'>>) => {
    const newSettings = { ...settings, ...appSettings };
    await saveSettings(newSettings);
  };

  const resetSettings = async () => {
    await saveSettings(defaultSettings);
  };

  const exportSettings = (): string => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = async (settingsJson: string): Promise<boolean> => {
    try {
      const importedSettings = JSON.parse(settingsJson);
      
      // Valider la structure des paramètres importés
      const validatedSettings = { ...defaultSettings, ...importedSettings };
      
      await saveSettings(validatedSettings);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation des paramètres:', error);
      return false;
    }
  };

  const value: SettingsContextType = {
    settings,
    updateNotificationSettings,
    updateDietaryPreferences,
    updatePrivacySettings,
    updateAppSettings,
    resetSettings,
    exportSettings,
    importSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Hook pour obtenir les préférences alimentaires actives
export const useActiveDietaryPreferences = (): string[] => {
  const { settings } = useSettings();
  
  return Object.entries(settings.dietary)
    .filter(([_, active]) => active)
    .map(([preference]) => {
      const labels: { [key: string]: string } = {
        vegetarian: 'Végétarien',
        vegan: 'Végétalien',
        glutenFree: 'Sans gluten',
        dairyFree: 'Sans lactose',
        nutFree: 'Sans noix',
        halal: 'Halal',
        kosher: 'Casher',
      };
      return labels[preference] || preference;
    });
};

// Hook pour vérifier si un plat correspond aux préférences alimentaires
export const useCheckDietaryCompatibility = () => {
  const { settings } = useSettings();
  
  return (itemTags: string[]): boolean => {
    const { dietary } = settings;
    
    // Si l'utilisateur est végétarien et que le plat contient de la viande
    if (dietary.vegetarian && itemTags.includes('meat')) {
      return false;
    }
    
    // Si l'utilisateur est végétalien et que le plat contient des produits animaux
    if (dietary.vegan && (itemTags.includes('meat') || itemTags.includes('dairy') || itemTags.includes('egg'))) {
      return false;
    }
    
    // Si l'utilisateur évite le gluten et que le plat en contient
    if (dietary.glutenFree && itemTags.includes('gluten')) {
      return false;
    }
    
    // Si l'utilisateur évite les produits laitiers et que le plat en contient
    if (dietary.dairyFree && itemTags.includes('dairy')) {
      return false;
    }
    
    // Si l'utilisateur évite les noix et que le plat en contient
    if (dietary.nutFree && itemTags.includes('nuts')) {
      return false;
    }
    
    return true;
  };
};