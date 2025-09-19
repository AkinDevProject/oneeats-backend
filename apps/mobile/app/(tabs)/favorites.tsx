import React, { useState, useEffect, useCallback } from 'react';
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
import { apiService } from '../../src/services/api';
import { ENV } from '../../src/config/env';

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
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les favoris
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      // Appel API réel pour récupérer les favoris
      const favoritesData = await apiService.favorites.getByUserId(ENV.DEV_USER_ID);

      // Transformer les données du backend en format attendu par l'app
      const transformedFavorites: UserFavorite[] = favoritesData.map((fav: any) => ({
        id: fav.id,
        userId: fav.userId,
        restaurantId: fav.restaurantId,
        restaurant: {
          id: fav.restaurantId,
          name: fav.restaurantName || 'Restaurant',
          cuisine: fav.restaurantCuisine || 'Non spécifié',
          rating: fav.restaurantRating || 0,
          reviewCount: fav.restaurantReviewCount || 0,
          deliveryTime: fav.restaurantDeliveryTime || '30-45 min',
          deliveryFee: fav.restaurantDeliveryFee || 2.99,
          isOpen: fav.restaurantIsOpen !== false,
          imageUrl: fav.restaurantImageUrl,
          distance: '-- km', // Distance non fournie par l'API pour l'instant
        },
        createdAt: fav.createdAt,
      }));

      setFavorites(transformedFavorites);

    } catch (err) {
      console.error('Erreur lors du chargement des favoris:', err);
      setError('Impossible de charger vos favoris');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const removeFavorite = async (favoriteId: string, restaurantName: string) => {
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
              // Trouver le restaurant ID correspondant au favori
              const favorite = favorites.find(fav => fav.id === favoriteId);
              if (!favorite) {
                Alert.alert('Erreur', 'Favori non trouvé');
                return;
              }

              // Appel API pour supprimer le favori (utilise restaurant ID comme requis par l'API)
              await apiService.favorites.remove(ENV.DEV_USER_ID, favorite.restaurantId);

              setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
              Alert.alert('Succès', 'Restaurant retiré de vos favoris');
            } catch (err) {
              console.error('Erreur lors de la suppression du favori:', err);
              Alert.alert('Erreur', 'Impossible de retirer ce restaurant des favoris');
            }
          },
        },
      ]
    );
  };

  const navigateToRestaurant = (restaurant: Restaurant) => {
    // Navigation vers la page du restaurant
    router.push(`/restaurant/${restaurant.id}`);
  };

  const renderFavoriteItem = useCallback((favorite: UserFavorite) => {
    const { restaurant } = favorite;

    return (
      <View style={styles.restaurantCard}>
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
              <View style={styles.placeholderImage}>
                <MaterialIcons name="restaurant" size={40} color="#ccc" />
              </View>
            )}
            {!restaurant.isOpen && (
              <View style={styles.closedOverlay}>
                <Text style={styles.closedText}>Fermé</Text>
              </View>
            )}
          </View>

          {/* Informations du restaurant */}
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.cuisine}>{restaurant.cuisine}</Text>

            <View style={styles.statsRow}>
              <View style={styles.rating}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {restaurant.rating} ({restaurant.reviewCount})
                </Text>
              </View>
              {restaurant.distance && (
                <Text style={styles.distance}>{restaurant.distance}</Text>
              )}
            </View>

            <View style={styles.deliveryInfo}>
              <View style={styles.deliveryTime}>
                <MaterialIcons name="access-time" size={14} color="#666" />
                <Text style={styles.deliveryText}>{restaurant.deliveryTime}</Text>
              </View>
              <Text style={styles.deliveryFee}>
                Livraison {restaurant.deliveryFee === 0 ? 'gratuite' : `${restaurant.deliveryFee.toFixed(2)}€`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Bouton de suppression */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFavorite(favorite.id, restaurant.name)}
        >
          <MaterialIcons name="favorite" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  }, [removeFavorite]);

  // Affichage du loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Favoris</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement de vos favoris...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Favoris</Text>
      </View>

      {/* Contenu */}
      {error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadFavorites}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="favorite-border" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptyText}>
            Vous n'avez pas encore ajouté de restaurants à vos favoris.{'\n'}
            Explorez les restaurants et ajoutez vos préférés !
          </Text>
          <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/')}>
            <Text style={styles.exploreText}>Explorer les restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.favoritesCount}>
            {favorites.length} restaurant{favorites.length > 1 ? 's' : ''} favori{favorites.length > 1 ? 's' : ''}
          </Text>

          {favorites.map((favorite) => (
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