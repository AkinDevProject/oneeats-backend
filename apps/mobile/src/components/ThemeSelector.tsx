import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Surface,
  TouchableRipple,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { useAppTheme, ThemeKey, colorThemes } from '../contexts/ThemeContext';

interface ThemeSelectorProps {
  style?: any;
  onThemeChange?: (themeKey: ThemeKey) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  style, 
  onThemeChange 
}) => {
  const { selectedTheme, setSelectedTheme, themeMetadata, currentTheme } = useAppTheme();

  const handleThemeChange = async (themeKey: ThemeKey) => {
    await setSelectedTheme(themeKey);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onThemeChange?.(themeKey);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: currentTheme.colors.onSurface }]}>
        🎨 Thème de couleur
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.entries(themeMetadata).map(([themeKey, metadata]) => (
          <Surface
            key={themeKey}
            style={[
              styles.themeCard,
              selectedTheme === themeKey && [
                styles.activeThemeCard,
                { borderColor: currentTheme.colors.primary }
              ],
            ]}
            elevation={selectedTheme === themeKey ? 4 : 1}
          >
            <TouchableRipple
              onPress={() => handleThemeChange(themeKey as ThemeKey)}
              style={styles.themeTouchable}
              borderless
            >
              <View style={styles.themeContent}>
                <View style={[
                  styles.colorPreview,
                  { backgroundColor: colorThemes[themeKey as ThemeKey].primary }
                ]} />
                <Text style={styles.themeEmoji}>{metadata.emoji}</Text>
                <Text style={[
                  styles.themeName,
                  { color: currentTheme.colors.onSurface },
                  selectedTheme === themeKey && { color: currentTheme.colors.primary }
                ]} numberOfLines={2}>
                  {metadata.name}
                </Text>
                <Text style={[
                  styles.themeDescription,
                  { color: currentTheme.colors.onSurfaceVariant }
                ]} numberOfLines={1}>
                  {metadata.description}
                </Text>
              </View>
            </TouchableRipple>
          </Surface>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollView: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  themeCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThemeCard: {
    borderWidth: 2,
  },
  themeTouchable: {
    padding: 12,
  },
  themeContent: {
    alignItems: 'center',
    minWidth: 80,
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  themeEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  themeName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  themeDescription: {
    fontSize: 9,
    opacity: 0.7,
    textAlign: 'center',
  },
});