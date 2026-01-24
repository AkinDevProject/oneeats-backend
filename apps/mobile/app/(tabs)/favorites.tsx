import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFavorites } from '../../src/hooks/useFavorites';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import EmptyState from '../../src/components/ui/EmptyState';
import { ClosedRestaurantOverlay } from '../../src/components/ClosedRestaurantBanner';

// Interface pour un restaurant
interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  imageUrl?: string;
  isOpen: boolean;
  distance?: string;
}

// Interface pour les favoris utilisateur
interface UserFavorite {
  id: string;
  userId: string;
  restaurantId: string;
  restaurant: Restaurant;
  createdAt: string;
}

export default function Favorites() {
  const { favorites, isLoading, toggleFavorite, refreshFavorites } = useFavorites();
  const { currentTheme } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFavorites();
    setRefreshing(false);
  };

  const removeFavorite = useCallback(async (restaurantId: string, restaurantName: string) => {
    Alert.alert(
      'Retirer des favoris',
      `Voulez-vous retirer "${restaurantName}" de vos favoris ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            try {
              await toggleFavorite(restaurantId);
              Alert.alert('Succès', 'Restaurant retiré de vos favoris');
            } catch (err) {
              console.error('Erreur lors de la suppression du favori:', err);
              Alert.alert('Erreur', 'Impossible de retirer ce restaurant des favoris');
            }
          },
        },
      ]
    );
  }, [toggleFavorite]);

  const navigateToRestaurant = (restaurant: Restaurant) => {
    // Navigation vers la page du restaurant
    router.push(`/restaurant/${restaurant.id}`);
  };

  const renderFavoriteItem = useCallback((favorite: UserFavorite) => {
    const { restaurant } = favorite;

    return (
      <View style={[styles.restaurantCard, { backgroundColor: currentTheme.colors.surface }]}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => navigateToRestaurant(restaurant)}
          activeOpacity={0.7}
        >
          {/* Image du restaurant */}
          <View style={styles.imageContainer}>
            {restaurant.imageUrl ? (
              <Image source={{ uri: restaurant.imageUrl }} style={styles.restaurantImage} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: currentTheme.colors.surfaceVariant }]}>
                <MaterialIcons name="restaurant" size={40} color={currentTheme.colors.onSurfaceVariant} />
              </View>
            )}
            {!restaurant.isOpen && (
              <ClosedRestaurantOverlay compact={true} />
            )}
          </View>

          {/* Informations du restaurant */}
          <View style={styles.restaurantInfo}>
            <Text style={[styles.restaurantName, { color: currentTheme.colors.onSurface }]}>{restaurant.name}</Text>
            <Text style={[styles.cuisine, { color: currentTheme.colors.onSurfaceVariant }]}>{restaurant.cuisine}</Text>

            <View style={styles.statsRow}>
              <View style={styles.rating}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text style={[styles.ratingText, { color: currentTheme.colors.onSurface }]}>
                  {restaurant.rating} ({restaurant.reviewCount})
                </Text>
              </View>
              {restaurant.distance && (
                <Text style={[styles.distance, { color: currentTheme.colors.onSurfaceVariant }]}>{restaurant.distance}</Text>
              )}
            </View>

            <View style={styles.deliveryInfo}>
              <View style={styles.deliveryTime}>
                <MaterialIcons name="access-time" size={14} color={currentTheme.colors.onSurfaceVariant} />
                <Text style={[styles.deliveryText, { color: currentTheme.colors.onSurfaceVariant }]}>{restaurant.deliveryTime}</Text>
              </View>
              <Text style={[styles.deliveryFee, { color: currentTheme.colors.primary }]}>
                Retrait {restaurant.deliveryFee === 0 ? 'gratuit' : `${restaurant.deliveryFee.toFixed(2)}€`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Bouton de suppression */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFavorite(restaurant.id, restaurant.name)}
        >
          <MaterialIcons name="favorite" size={24} color={currentTheme.colors.error} />
        </TouchableOpacity>
      </View>
    );
  }, [removeFavorite, currentTheme]);

  // Transformer les données du contexte en format UserFavorite pour compatibilité
  const transformedFavorites: UserFavorite[] = favorites.map((fav) => ({
    id: fav.id,
    userId: fav.userId,
    restaurantId: fav.restaurantId,
    restaurant: {
      id: fav.restaurantId,
      name: fav.restaurantName,
      cuisine: fav.restaurantCuisine,
      rating: fav.restaurantRating,
      reviewCount: fav.restaurantReviewCount,
      deliveryTime: fav.restaurantDeliveryTime,
      deliveryFee: fav.restaurantDeliveryFee,
      isOpen: fav.restaurantIsOpen,
      imageUrl: fav.restaurantImageUrl,
      distance: '-- km',
    },
    createdAt: fav.createdAt,
  }));

  // Affichage du loading
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <StatusBar style="auto" />
        <View style={[styles.header, { backgroundColor: currentTheme.colors.surface }]}>
          <Text style={[styles.headerTitle, { color: currentTheme.colors.onSurface }]}>Mes Favoris</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.colors.onSurfaceVariant }]}>
            Chargement de vos favoris...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.onSurface }]}>Mes Favoris</Text>
      </View>

      {/* Contenu */}
      {transformedFavorites.length === 0 ? (
        <EmptyState
          variant="favorites"
          actionLabel="Découvrir les restaurants"
          onAction={() => router.push('/(tabs)/')}
        />
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={currentTheme.colors.primary}
              colors={[currentTheme.colors.primary]}
            />
          }
        >
          <Text style={[styles.favoritesCount, { color: currentTheme.colors.onSurfaceVariant }]}>
            {transformedFavorites.length} restaurant{transformedFavorites.length > 1 ? 's' : ''} favori{transformedFavorites.length > 1 ? 's' : ''}
          </Text>

          {transformedFavorites.map((favorite) => (
            <React.Fragment key={favorite.id}>
              {renderFavoriteItem(favorite)}
            </React.Fragment>
          ))}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  favoritesCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  restaurantCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  cuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deliveryTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  deliveryFee: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  // États vides et erreurs
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
});