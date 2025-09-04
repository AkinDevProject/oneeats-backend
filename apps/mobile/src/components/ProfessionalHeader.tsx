import React, { useEffect } from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { useAppTheme } from '../contexts/ThemeContext';

interface ProfessionalHeaderProps {
  title: string;
  subtitle?: string;
  hideAutoTitle?: boolean;
}

/**
 * Composant header professionnel pour remplacer les titres auto-générés
 * Masque les titres "menu/[id]" et "restaurant/[id]" non professionnels
 */
export const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({
  title,
  subtitle,
  hideAutoTitle = true,
}) => {
  const { currentTheme } = useAppTheme();

  useEffect(() => {
    if (hideAutoTitle && Platform.OS === 'web') {
      // Hide the auto-generated h1 title on web
      const timer = setTimeout(() => {
        const autoTitle = document.querySelector('h1[aria-level="1"][role="heading"]');
        if (autoTitle) {
          autoTitle.style.display = 'none';
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [hideAutoTitle]);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.surface }]}>
      <Text style={[styles.title, { color: currentTheme.colors.onSurface }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
});