import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useAppTheme } from '../contexts/ThemeContext';

interface ThemedTextProps extends TextProps {
  variant?: 
    | 'displayLarge' 
    | 'displayMedium' 
    | 'displaySmall'
    | 'headlineLarge'
    | 'headlineMedium'
    | 'headlineSmall'
    | 'titleLarge'
    | 'titleMedium'
    | 'titleSmall'
    | 'bodyLarge'
    | 'bodyMedium'
    | 'bodySmall'
    | 'labelLarge'
    | 'labelMedium'
    | 'labelSmall';
  color?: 'primary' | 'secondary' | 'error' | 'onSurface' | 'onSurfaceVariant' | 'onBackground' | string;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  variant = 'bodyMedium',
  color = 'onSurface',
  style,
  ...props
}) => {
  const { currentTheme } = useAppTheme();
  
  const getVariantStyle = (variant: string) => {
    switch (variant) {
      case 'displayLarge':
        return { fontSize: 57, fontWeight: '400', lineHeight: 64 };
      case 'displayMedium':
        return { fontSize: 45, fontWeight: '400', lineHeight: 52 };
      case 'displaySmall':
        return { fontSize: 36, fontWeight: '400', lineHeight: 44 };
      case 'headlineLarge':
        return { fontSize: 32, fontWeight: '400', lineHeight: 40 };
      case 'headlineMedium':
        return { fontSize: 28, fontWeight: '400', lineHeight: 36 };
      case 'headlineSmall':
        return { fontSize: 24, fontWeight: '400', lineHeight: 32 };
      case 'titleLarge':
        return { fontSize: 22, fontWeight: '400', lineHeight: 28 };
      case 'titleMedium':
        return { fontSize: 16, fontWeight: '500', lineHeight: 24 };
      case 'titleSmall':
        return { fontSize: 14, fontWeight: '500', lineHeight: 20 };
      case 'bodyLarge':
        return { fontSize: 16, fontWeight: '400', lineHeight: 24 };
      case 'bodyMedium':
        return { fontSize: 14, fontWeight: '400', lineHeight: 20 };
      case 'bodySmall':
        return { fontSize: 12, fontWeight: '400', lineHeight: 16 };
      case 'labelLarge':
        return { fontSize: 14, fontWeight: '500', lineHeight: 20 };
      case 'labelMedium':
        return { fontSize: 12, fontWeight: '500', lineHeight: 16 };
      case 'labelSmall':
        return { fontSize: 11, fontWeight: '500', lineHeight: 16 };
      default:
        return { fontSize: 14, fontWeight: '400', lineHeight: 20 };
    }
  };

  const getTextColor = (color: string) => {
    switch (color) {
      case 'primary':
        return currentTheme.colors.primary;
      case 'secondary':
        return currentTheme.colors.secondary;
      case 'error':
        return currentTheme.colors.error;
      case 'onSurface':
        return currentTheme.colors.onSurface;
      case 'onSurfaceVariant':
        return currentTheme.colors.onSurfaceVariant;
      case 'onBackground':
        return currentTheme.colors.onBackground;
      default:
        // Assume it's a custom color
        return color.startsWith('#') || color.startsWith('rgb') ? color : currentTheme.colors.onSurface;
    }
  };

  const textStyle = [
    getVariantStyle(variant),
    { color: getTextColor(color) },
    style,
  ];

  return <Text style={textStyle} {...props} />;
};