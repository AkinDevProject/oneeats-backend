import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useAppTheme } from '../contexts/ThemeContext';

interface ThemedStyleProps {
  theme: any;
}

export const useThemedStyles = <T>(
  createStyles: (props: ThemedStyleProps) => T
): T => {
  const { currentTheme } = useAppTheme();

  return useMemo(() => {
    return createStyles({ theme: currentTheme });
  }, [currentTheme, createStyles]);
};

// Hook spécialisé pour StyleSheet
export const useThemedStyleSheet = <T>(
  createStyles: (props: ThemedStyleProps) => T
): T => {
  const { currentTheme } = useAppTheme();

  return useMemo(() => {
    return StyleSheet.create(createStyles({ theme: currentTheme }));
  }, [currentTheme, createStyles]);
};

// Utilitaires pour les couleurs communes
export const useThemeColors = () => {
  const { currentTheme } = useAppTheme();
  
  return useMemo(() => ({
    primary: currentTheme.colors.primary,
    onPrimary: currentTheme.colors.onPrimary,
    primaryContainer: currentTheme.colors.primaryContainer,
    onPrimaryContainer: currentTheme.colors.onPrimaryContainer,
    secondary: currentTheme.colors.secondary,
    onSecondary: currentTheme.colors.onSecondary,
    secondaryContainer: currentTheme.colors.secondaryContainer,
    onSecondaryContainer: currentTheme.colors.onSecondaryContainer,
    surface: currentTheme.colors.surface,
    onSurface: currentTheme.colors.onSurface,
    surfaceVariant: currentTheme.colors.surfaceVariant,
    onSurfaceVariant: currentTheme.colors.onSurfaceVariant,
    background: currentTheme.colors.background,
    onBackground: currentTheme.colors.onBackground,
    error: currentTheme.colors.error,
    onError: currentTheme.colors.onError,
    errorContainer: currentTheme.colors.errorContainer,
    onErrorContainer: currentTheme.colors.onErrorContainer,
  }), [currentTheme]);
};