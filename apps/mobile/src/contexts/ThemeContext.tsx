import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MD3LightTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Thème original de home-design-5 (Material You violet)
const originalTheme = {
  primary: '#6750A4',
  primaryContainer: '#EADDFF',
  secondary: '#625B71',
  secondaryContainer: '#E8DEF8',
  tertiary: '#7D5260',
  tertiaryContainer: '#FFD8E4',
  surface: '#FEF7FF',
  surfaceVariant: '#E7E0EC',
  background: '#FEF7FF',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#21005D',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#1D192B',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#31111D',
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454F',
  onError: '#FFFFFF',
  onErrorContainer: '#410002',
  onBackground: '#1C1B1F',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
};

// Système de thèmes pour OneEats
const colorThemes = {
  // Thème original Material You
  original: originalTheme,

  // OneEats Optimized - Thème inspiré de Deliveroo pour les food apps
  oneEatsOptimized: {
    // 🔴 TURQUOISE PRINCIPAL - Couleur signature Deliveroo
    primary: '#00CCBC',              // Turquoise Deliveroo moderne
    primaryContainer: '#FFFFFF',     // Container blanc pur pour header
    
    // 🟠 ORANGE SECONDAIRE - Énergie et rapidité de livraison  
    secondary: '#FF6D00',            // Orange vif pour l'énergie
    secondaryContainer: '#FFF3E0',   // Container orange doux
    
    // 🟡 JAUNE TERTIAIRE - Convivialité et plaisir de manger
    tertiary: '#FFC107',             // Jaune doré appétissant
    tertiaryContainer: '#FFF8E1',    // Container jaune lumineux
    
    // 🤍 SURFACES - Fond blanc cassé élégant
    surface: '#FFFFFF',              // Blanc pur pour header, barre de recherche et cartes
    surfaceVariant: '#FDFDFD',      // Blanc très clair pour les éléments secondaires
    background: '#F8F8F8',          // Fond blanc légèrement grisé
    
    // ❌ ERREURS - Rouge distinct du primary
    error: '#F44336',
    errorContainer: '#FFEBEE',
    
    // 📝 TEXTES - Contraste optimisé style Deliveroo
    onPrimary: '#FFFFFF',            // Blanc sur turquoise
    onPrimaryContainer: '#004D40',   // Turquoise foncé sur container
    onSecondary: '#FFFFFF',          // Blanc sur orange
    onSecondaryContainer: '#E65100',  // Orange foncé sur container
    onTertiary: '#000000',           // Noir sur jaune
    onTertiaryContainer: '#FF8F00',  // Jaune foncé sur container
    onSurface: '#212121',           // Noir pour texte principal (Deliveroo style)
    onSurfaceVariant: '#757575',    // Gris moyen pour texte secondaire
    onError: '#FFFFFF',
    onErrorContainer: '#C62828',
    onBackground: '#212121',        // Texte principal sur background
    
    // 🎨 CONTOURS - Style Deliveroo subtil
    outline: '#E0E0E0',            // Gris clair pour contours
    outlineVariant: '#F5F5F5',     // Gris très clair pour séparations
  },
};

// Métadonnées des thèmes pour l'interface utilisateur
export const themeMetadata = {
  original: { name: 'Material You', emoji: '🟣', description: 'Thème original' },
  oneEatsOptimized: { name: 'OneEats Pro', emoji: '🍽️', description: 'Optimisé food app' },
};

// Types
export type ThemeKey = keyof typeof colorThemes;

interface ThemeContextType {
  selectedTheme: ThemeKey;
  setSelectedTheme: (theme: ThemeKey) => void;
  currentTheme: any;
  colorThemes: typeof colorThemes;
  themeMetadata: typeof themeMetadata;
}

// Fonction pour créer le thème dynamiquement
const createCustomTheme = (selectedTheme: ThemeKey) => ({
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colorThemes[selectedTheme],
    // Couleurs système
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: colorThemes[selectedTheme].primaryContainer,
    shadow: '#000000',
    scrim: '#000000',
    surfaceTint: colorThemes[selectedTheme].primary,
  },
});

// Contexte
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Clé de stockage pour AsyncStorage
const THEME_STORAGE_KEY = '@oneeats_theme';

// Provider
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTheme, setSelectedThemeState] = useState<ThemeKey>('oneEatsOptimized');

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && colorThemes[savedTheme as ThemeKey]) {
          setSelectedThemeState(savedTheme as ThemeKey);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement du thème:', error);
      }
    };

    loadSavedTheme();
  }, []);

  // Fonction pour changer de thème et le sauvegarder
  const setSelectedTheme = async (theme: ThemeKey) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setSelectedThemeState(theme);
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du thème:', error);
      setSelectedThemeState(theme); // Appliquer quand même le thème
    }
  };

  const currentTheme = createCustomTheme(selectedTheme);

  return (
    <ThemeContext.Provider
      value={{
        selectedTheme,
        setSelectedTheme,
        currentTheme,
        colorThemes,
        themeMetadata,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook pour utiliser le thème
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
};

// Export des thèmes pour usage direct
export { colorThemes };