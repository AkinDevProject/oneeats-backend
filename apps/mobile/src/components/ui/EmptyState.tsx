import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useAppTheme } from '../../contexts/ThemeContext';

export type EmptyStateVariant = 'cart' | 'orders' | 'favorites' | 'search' | 'error' | 'generic';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const VARIANTS: Record<EmptyStateVariant, {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
}> = {
  cart: {
    icon: 'shopping-cart',
    title: 'Votre panier est vide',
    subtitle: 'Explorez les restaurants et ajoutez vos plats préférés !',
  },
  orders: {
    icon: 'receipt-long',
    title: 'Aucune commande',
    subtitle: 'Vos commandes apparaîtront ici une fois passées.',
  },
  favorites: {
    icon: 'favorite-border',
    title: 'Aucun favori',
    subtitle: 'Ajoutez des restaurants à vos favoris pour les retrouver facilement.',
  },
  search: {
    icon: 'search-off',
    title: 'Aucun résultat',
    subtitle: 'Essayez avec d\'autres mots-clés ou filtres.',
  },
  error: {
    icon: 'error-outline',
    title: 'Une erreur est survenue',
    subtitle: 'Veuillez réessayer ultérieurement.',
  },
  generic: {
    icon: 'inbox',
    title: 'Rien à afficher',
    subtitle: 'Il n\'y a rien ici pour le moment.',
  },
};

export default function EmptyState({
  variant = 'generic',
  title,
  subtitle,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  const { currentTheme } = useAppTheme();
  const config = VARIANTS[variant];

  const displayIcon = icon || config.icon;
  const displayTitle = title || config.title;
  const displaySubtitle = subtitle || config.subtitle;

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.iconContainer}>
        <View style={[styles.iconBackground, { backgroundColor: currentTheme.colors.surfaceVariant }]}>
          <MaterialIcons
            name={displayIcon}
            size={48}
            color={currentTheme.colors.onSurfaceVariant}
          />
        </View>
      </Animated.View>

      <Animated.View entering={SlideInUp.delay(100).duration(400)}>
        <Text style={[styles.title, { color: currentTheme.colors.onSurface }]}>
          {displayTitle}
        </Text>
      </Animated.View>

      <Animated.View entering={SlideInUp.delay(200).duration(400)}>
        <Text style={[styles.subtitle, { color: currentTheme.colors.onSurfaceVariant }]}>
          {displaySubtitle}
        </Text>
      </Animated.View>

      {actionLabel && onAction && (
        <Animated.View entering={SlideInUp.delay(300).duration(400)} style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={onAction}
            style={styles.actionButton}
            buttonColor={currentTheme.colors.primary}
            contentStyle={styles.actionButtonContent}
          >
            {actionLabel}
          </Button>
        </Animated.View>
      )}

      {secondaryActionLabel && onSecondaryAction && (
        <Animated.View entering={SlideInUp.delay(400).duration(400)}>
          <Button
            mode="text"
            onPress={onSecondaryAction}
            textColor={currentTheme.colors.primary}
          >
            {secondaryActionLabel}
          </Button>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionContainer: {
    marginTop: 24,
  },
  actionButton: {
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  actionButtonContent: {
    height: 48,
  },
});
