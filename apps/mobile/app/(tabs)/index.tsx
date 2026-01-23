import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { router } from 'expo-router';

// React Native Paper components
import {
  Searchbar,
  Button,
  Chip,
  Surface,
  TouchableRipple,
  IconButton,
  Provider as PaperProvider,
  MD3LightTheme,
} from 'react-native-paper';

import { Restaurant } from '../../src/types';
import { cuisineCategories } from '../../src/config/categories';
import { useRestaurants } from '../../src/hooks/useRestaurants';
import { useFavorites } from '../../src/hooks/useFavorites';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { OptimizedFlatListMemo } from '../../src/components/VirtualizedList';
import { useRenderTime, useOptimizedCallback } from '../../src/hooks/usePerformanceMonitor';

const { width } = Dimensions.get('window');

// Fonction pour créer le thème dynamiquement
const createCustomTheme = (currentTheme: any) => ({
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...currentTheme.colors,
    // Couleurs système
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: currentTheme.colors.primaryContainer,
    shadow: '#000000',
    scrim: '#000000',
    surfaceTint: currentTheme.colors.primary,
  },
});

// Composant mémoïsé pour les restaurants
const RestaurantCard = memo(({ restaurant, onPress, theme }: {
  restaurant: Restaurant;
  onPress: (restaurant: Restaurant) => void;
  theme: any;
}) => {
  const handlePress = useCallback(() => onPress(restaurant), [restaurant, onPress]);
  const { toggleFavorite, checkFavoriteStatus, isLoading } = useFavorites();
  const isFavorite = checkFavoriteStatus(restaurant.id);
  const isQuickPickup = parseInt(restaurant.deliveryTime.split('-')[0]) <= 15;
  const isFreePickup = restaurant.deliveryFee === 0;

  const handleFavoriteToggle = useCallback(async (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleFavorite(restaurant.id);
  }, [restaurant.id, toggleFavorite]);

  return (
    <TouchableRipple
      onPress={handlePress}
      borderless
      style={[cardStyles.card, { backgroundColor: theme.colors.surface }]}
      testID="restaurant-card"
      accessibilityLabel={`Restaurant ${restaurant.name}`}
    >
      <View>
        {/* Grande image en haut */}
        <View style={cardStyles.imageContainer}>
          <Image
            source={{ uri: restaurant.image }}
            style={cardStyles.image}
            resizeMode="cover"
          />

          {/* Overlay fermé */}
          {!restaurant.isOpen && (
            <View style={cardStyles.closedOverlay}>
              <Text style={cardStyles.closedText}>Fermé</Text>
            </View>
          )}

          {/* Badge note en haut à gauche */}
          <View style={cardStyles.ratingBadge}>
            <Text style={cardStyles.ratingText}>⭐ {restaurant.rating}</Text>
          </View>

          {/* Badge populaire */}
          {restaurant.featured && (
            <View style={cardStyles.popularBadge}>
              <Text style={cardStyles.popularText}>🔥 Populaire</Text>
            </View>
          )}

          {/* Bouton favori en haut à droite */}
          <TouchableRipple
            onPress={handleFavoriteToggle}
            disabled={isLoading}
            borderless
            style={cardStyles.favoriteButton}
            testID="favorite-button"
            accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <View style={[
              cardStyles.favoriteCircle,
              { backgroundColor: isFavorite ? '#FFF' : 'rgba(0,0,0,0.5)' }
            ]}>
              <Text style={{ fontSize: 18 }}>
                {isFavorite ? '❤️' : '🤍'}
              </Text>
            </View>
          </TouchableRipple>
        </View>

        {/* Contenu sous l'image */}
        <View style={cardStyles.content}>
          {/* Nom */}
          <Text
            style={[cardStyles.name, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {restaurant.name}
          </Text>

          {/* Cuisine */}
          <Text
            style={[cardStyles.cuisine, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={1}
          >
            {restaurant.cuisine}
          </Text>

          {/* Stats */}
          <View style={cardStyles.statsRow}>
            <Text style={[cardStyles.stat, { color: theme.colors.onSurfaceVariant }]}>
              ⏱️ {restaurant.deliveryTime}
            </Text>
            <Text style={[cardStyles.statDot, { color: theme.colors.onSurfaceVariant }]}>•</Text>
            <Text style={[cardStyles.stat, { color: theme.colors.onSurfaceVariant }]}>
              📍 {restaurant.distance}
            </Text>
          </View>

          {/* Badges contextuels */}
          {(isFreePickup || isQuickPickup) && (
            <View style={cardStyles.badgesRow}>
              {isFreePickup && (
                <View style={cardStyles.badgeGreen}>
                  <Text style={cardStyles.badgeGreenText}>✓ Retrait gratuit</Text>
                </View>
              )}
              {isQuickPickup && (
                <View style={cardStyles.badgeOrange}>
                  <Text style={cardStyles.badgeOrangeText}>⚡ Rapide</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableRipple>
  );
});

// Styles pour la carte restaurant verticale
const cardStyles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    left: 80,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 20,
  },
  favoriteCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 14,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stat: {
    fontSize: 13,
  },
  statDot: {
    marginHorizontal: 8,
    fontSize: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeGreen: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeGreenText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  badgeOrange: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeOrangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
  },
});

RestaurantCard.displayName = 'RestaurantCard';

// Page d'accueil avec design home-design-5
function HomeIndex() {
  useRenderTime('HomeIndex');
  
  // Utiliser le hook pour charger les restaurants depuis l'API
  const { restaurants, loading: isLoading, error: apiError, refetch } = useRestaurants();
  
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  
  // Utiliser le thème global
  const { currentTheme: globalTheme, setSelectedTheme: setGlobalTheme, selectedTheme, themeMetadata } = useAppTheme();
  const customTheme = useMemo(() => createCustomTheme(globalTheme), [globalTheme]);

  // Auth et favoris pour la section favoris sur l'accueil
  const { isAuthenticated, user } = useAuth();
  const { favorites } = useFavorites();

  // Récupérer les restaurants favoris
  const favoriteRestaurants = useMemo(() => {
    if (!isAuthenticated || favorites.length === 0) return [];
    return restaurants.filter(r =>
      favorites.some(f => f.restaurantId === r.id)
    ).slice(0, 5); // Limiter à 5 pour le carousel
  }, [restaurants, favorites, isAuthenticated]);
  
  // Synchroniser avec le thème global quand on change
  const handleThemeChange = useCallback(async (themeKey: string) => {
    await setGlobalTheme(themeKey as any);
  }, [setGlobalTheme]);

  const renderLoadingState = () => (
    <View style={[baseStyles.loadingContainer, { backgroundColor: globalTheme.colors.background }]}>
      <ActivityIndicator size="large" color={globalTheme.colors.primary} />
      <Text style={[baseStyles.loadingText, { color: globalTheme.colors.onSurfaceVariant }]}>
        Chargement des restaurants...
      </Text>
      {apiError && (
        <Text style={[baseStyles.errorText, { color: globalTheme.colors.error }]}>
          Erreur: {apiError}
        </Text>
      )}
    </View>
  );

  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  // Mettre à jour les restaurants filtrés quand les données changent
  useEffect(() => {
    if (restaurants.length > 0) {
      setFilteredRestaurants(restaurants);
    }
  }, [restaurants]);

  const loadRestaurants = useOptimizedCallback(async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (error) {
      console.error('Erreur lors du chargement des restaurants:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch], 'loadRestaurants');

  const applyFilters = useCallback(() => {
    let filtered = [...restaurants];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.cuisine.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilters.includes('open_now')) {
      filtered = filtered.filter(r => r.isOpen);
    }

    if (selectedFilters.includes('high_rated')) {
      filtered = filtered.filter(r => r.rating >= 4.5);
    }

    // Filtre "Rapide" - temps de préparation < 20 min
    if (selectedFilters.includes('quick_pickup')) {
      filtered = filtered.filter(r => {
        const time = parseInt(r.deliveryTime.split('-')[0]);
        return time <= 15;
      });
    }

    // Filtre "Promos" - restaurants avec retrait gratuit (deliveryFee === 0)
    if (selectedFilters.includes('free_pickup')) {
      filtered = filtered.filter(r => r.deliveryFee === 0);
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, selectedCategory, searchQuery, selectedFilters]);

  // useEffect that depends on applyFilters - placed after its definition
  useEffect(() => {
    applyFilters();
  }, [selectedCategory, searchQuery, selectedFilters, restaurants, applyFilters]);

  const onRefresh = useOptimizedCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadRestaurants();
    setRefreshing(false);
  }, [loadRestaurants], 'onRefresh');

  const handleRestaurantPress = useOptimizedCallback((restaurant: Restaurant) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/restaurant/${restaurant.id}` as any);
  }, [], 'handleRestaurantPress');

  const toggleFilter = useCallback((filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  // Fonction pour obtenir la salutation contextuelle
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const renderHeader = () => (
    <Animated.View style={[baseStyles.header, headerAnimatedStyle]}>
      <Surface style={[baseStyles.headerSurface, { backgroundColor: globalTheme.colors.primary }]} elevation={0}>
        <View style={baseStyles.headerContent}>
          <View style={baseStyles.headerText}>
            <Text style={[baseStyles.headerGreeting, { color: '#ffffff' }]}>
              {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </Text>
            <View style={baseStyles.locationRow}>
              <Text style={[baseStyles.headerLocation, { color: 'rgba(255,255,255,0.85)' }]}>
                📍 Paris 11ème
              </Text>
            </View>
          </View>
          <IconButton
            icon="bell-outline"
            size={24}
            iconColor="#ffffff"
            style={baseStyles.notificationButton}
            onPress={() => router.push('/notifications')}
          />
        </View>

        {/* Barre de recherche intégrée dans le header */}
        <View style={baseStyles.headerSearchContainer}>
          <Searchbar
            placeholder="Rechercher un restaurant..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            icon="magnify"
            clearIcon="close"
            style={[baseStyles.headerSearchBar, { backgroundColor: '#ffffff' }]}
            inputStyle={[baseStyles.searchInput, { color: globalTheme.colors.onSurface }]}
            iconColor={globalTheme.colors.onSurfaceVariant}
            placeholderTextColor={globalTheme.colors.onSurfaceVariant}
          />
        </View>
      </Surface>
    </Animated.View>
  );

  // Recherche maintenant intégrée dans le header
  const renderSearch = () => null;

  const renderFilters = () => (
    <View style={baseStyles.filtersSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={baseStyles.filtersContainer}>
          <Chip
            selected={selectedFilters.includes('quick_pickup')}
            onPress={() => toggleFilter('quick_pickup')}
            icon="lightning-bolt"
            style={baseStyles.filterChip}
            selectedColor={customTheme.colors.onPrimaryContainer}
            backgroundColor={selectedFilters.includes('quick_pickup') ? customTheme.colors.primaryContainer : customTheme.colors.surface}
            textStyle={{ color: selectedFilters.includes('quick_pickup') ? customTheme.colors.onPrimaryContainer : customTheme.colors.onSurface }}
            showSelectedOverlay={false}
          >
            ⚡ Rapide
          </Chip>

          <Chip
            selected={selectedFilters.includes('high_rated')}
            onPress={() => toggleFilter('high_rated')}
            icon="star"
            style={baseStyles.filterChip}
            selectedColor={customTheme.colors.onPrimaryContainer}
            backgroundColor={selectedFilters.includes('high_rated') ? customTheme.colors.primaryContainer : customTheme.colors.surface}
            textStyle={{ color: selectedFilters.includes('high_rated') ? customTheme.colors.onPrimaryContainer : customTheme.colors.onSurface }}
            showSelectedOverlay={false}
          >
            ⭐ Top noté
          </Chip>

          <Chip
            selected={selectedFilters.includes('open_now')}
            onPress={() => toggleFilter('open_now')}
            icon="clock-outline"
            style={baseStyles.filterChip}
            selectedColor={customTheme.colors.onPrimaryContainer}
            backgroundColor={selectedFilters.includes('open_now') ? customTheme.colors.primaryContainer : customTheme.colors.surface}
            textStyle={{ color: selectedFilters.includes('open_now') ? customTheme.colors.onPrimaryContainer : customTheme.colors.onSurface }}
            showSelectedOverlay={false}
          >
            Ouvert
          </Chip>

          <Chip
            selected={selectedFilters.includes('free_pickup')}
            onPress={() => toggleFilter('free_pickup')}
            icon="tag-outline"
            style={baseStyles.filterChip}
            selectedColor={customTheme.colors.onPrimaryContainer}
            backgroundColor={selectedFilters.includes('free_pickup') ? customTheme.colors.primaryContainer : customTheme.colors.surface}
            textStyle={{ color: selectedFilters.includes('free_pickup') ? customTheme.colors.onPrimaryContainer : customTheme.colors.onSurface }}
            showSelectedOverlay={false}
          >
            💰 Promos
          </Chip>
        </View>
      </ScrollView>
    </View>
  );

  // Couleurs de fond pour chaque catégorie
  const categoryColors: { [key: string]: string } = {
    all: '#E8F5E9',
    pizza: '#FFF3E0',
    kebab: '#FFEBEE',
    burger: '#FFF8E1',
    brochette: '#FCE4EC',
    tacos: '#FFF3E0',
    sushi: '#E3F2FD',
    healthy: '#E8F5E9',
    dessert: '#F3E5F5',
  };

  // Compteur de restaurants par catégorie
  const getCategoryCount = useCallback((categoryId: string) => {
    if (categoryId === 'all') return restaurants.length;
    return restaurants.filter(r =>
      r.cuisine.toLowerCase() === categoryId.toLowerCase()
    ).length;
  }, [restaurants]);

  const renderCategories = () => (
    <View style={baseStyles.categoriesSection}>
      <Text style={[baseStyles.sectionTitle, dynamicStyles.sectionTitle]}>Catégories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={baseStyles.categoriesScrollContent}
      >
        {cuisineCategories.map((category, index) => {
          const isSelected = selectedCategory === category.id;
          const count = getCategoryCount(category.id);
          const bgColor = categoryColors[category.id] || '#F5F5F5';

          return (
            <Animated.View
              key={category.id}
              entering={FadeIn.delay(index * 50).duration(400)}
            >
              <TouchableRipple
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(category.id);
                }}
                borderless
                style={baseStyles.categoryTouchable}
              >
                <View style={baseStyles.categoryItemContainer}>
                  {/* Cercle avec emoji */}
                  <View
                    style={[
                      baseStyles.categoryCircle,
                      {
                        backgroundColor: isSelected ? globalTheme.colors.primary : bgColor,
                        borderWidth: isSelected ? 0 : 1,
                        borderColor: isSelected ? 'transparent' : '#E0E0E0',
                        transform: [{ scale: isSelected ? 1.1 : 1 }],
                      },
                    ]}
                  >
                    <Text style={[
                      baseStyles.categoryEmojiNew,
                      { opacity: isSelected ? 1 : 0.9 }
                    ]}>
                      {category.icon}
                    </Text>
                  </View>

                  {/* Nom de la catégorie */}
                  <Text
                    style={[
                      baseStyles.categoryNameNew,
                      {
                        color: isSelected
                          ? globalTheme.colors.primary
                          : globalTheme.colors.onSurface,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>

                  {/* Compteur (optionnel) */}
                  {count > 0 && (
                    <Text
                      style={[
                        baseStyles.categoryCount,
                        {
                          color: isSelected
                            ? globalTheme.colors.primary
                            : globalTheme.colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {count}
                    </Text>
                  )}

                  {/* Indicateur de sélection */}
                  {isSelected && (
                    <View
                      style={[
                        baseStyles.categorySelectedIndicator,
                        { backgroundColor: globalTheme.colors.primary }
                      ]}
                    />
                  )}
                </View>
              </TouchableRipple>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );

  // Section favoris (carousel horizontal)
  const renderFavorites = () => {
    if (!isAuthenticated || favoriteRestaurants.length === 0) return null;

    return (
      <View style={baseStyles.favoritesSection}>
        <View style={baseStyles.favoritesSectionHeader}>
          <View>
            <Text style={[baseStyles.sectionTitle, dynamicStyles.sectionTitle, { marginBottom: 0, paddingHorizontal: 0 }]}>
              ❤️ Vos Favoris
            </Text>
            <Text style={[baseStyles.favoritesSubtitle, { color: globalTheme.colors.onSurfaceVariant }]}>
              {favoriteRestaurants.length} restaurant{favoriteRestaurants.length > 1 ? 's' : ''}
            </Text>
          </View>
          <Button
            mode="text"
            onPress={() => router.push('/(tabs)/favorites')}
            textColor={customTheme.colors.primary}
            compact
          >
            Voir tous →
          </Button>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={baseStyles.favoritesCarousel}
        >
          {favoriteRestaurants.map((restaurant) => (
            <TouchableRipple
              key={restaurant.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(`/restaurant/${restaurant.id}` as any);
              }}
              borderless
              style={baseStyles.favoriteCardWrapper}
            >
              <Surface style={[baseStyles.favoriteCard, { backgroundColor: globalTheme.colors.surface }]} elevation={2}>
                <Image
                  source={{ uri: restaurant.image }}
                  style={baseStyles.favoriteCardImage}
                  resizeMode="cover"
                />
                {!restaurant.isOpen && (
                  <View style={baseStyles.favoriteClosedOverlay}>
                    <Text style={baseStyles.favoriteClosedText}>Fermé</Text>
                  </View>
                )}
                <View style={baseStyles.favoriteCardContent}>
                  <Text style={[baseStyles.favoriteCardName, { color: globalTheme.colors.onSurface }]} numberOfLines={1}>
                    {restaurant.name}
                  </Text>
                  <View style={baseStyles.favoriteCardDetails}>
                    <Text style={[baseStyles.favoriteCardRating, { color: globalTheme.colors.onSurfaceVariant }]}>
                      ⭐ {restaurant.rating}
                    </Text>
                    <Text style={[baseStyles.favoriteCardTime, { color: globalTheme.colors.onSurfaceVariant }]}>
                      {restaurant.deliveryTime}
                    </Text>
                  </View>
                </View>
              </Surface>
            </TouchableRipple>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderRestaurant = useCallback((restaurant: Restaurant, index: number) => (
    <Animated.View 
      key={restaurant.id}
      entering={FadeIn.delay(index * 100).duration(600)}
      style={baseStyles.restaurantCard}
    >
      <RestaurantCard
        restaurant={restaurant}
        onPress={handleRestaurantPress}
        theme={customTheme}
      />
    </Animated.View>
  ), [handleRestaurantPress, customTheme]);

  const renderFilterModal = () => {
    if (!filterVisible) return null;
    
    return (
      <View style={baseStyles.modalOverlay}>
        <Surface style={[baseStyles.modalContent, dynamicStyles.modalContent]} elevation={5}>
          <Text style={[baseStyles.modalTitle, dynamicStyles.modalTitle]}>Filtres avancés</Text>
          
          <View style={baseStyles.modalSection}>
            <Text style={[baseStyles.sectionTitle, dynamicStyles.sectionTitle]}>Disponibilité</Text>
            <TouchableRipple onPress={() => toggleFilter('open_now')}>
              <View style={baseStyles.modalItem}>
                <Text>Ouvert maintenant</Text>
                <Chip 
                  selected={selectedFilters.includes('open_now')}
                  backgroundColor={selectedFilters.includes('open_now') ? customTheme.colors.primaryContainer : customTheme.colors.surface}
                  textStyle={{ color: selectedFilters.includes('open_now') ? customTheme.colors.onPrimaryContainer : customTheme.colors.onSurface }}
                >
                  {selectedFilters.includes('open_now') ? 'Activé' : 'Désactivé'}
                </Chip>
              </View>
            </TouchableRipple>
          </View>
          
          <View style={baseStyles.modalSection}>
            <Text style={[baseStyles.sectionTitle, dynamicStyles.sectionTitle]}>Qualité</Text>
            <TouchableRipple onPress={() => toggleFilter('high_rated')}>
              <View style={baseStyles.modalItem}>
                <Text>Très bien noté (4.5+)</Text>
                <Chip 
                  selected={selectedFilters.includes('high_rated')}
                  backgroundColor={selectedFilters.includes('high_rated') ? customTheme.colors.primaryContainer : customTheme.colors.surface}
                  textStyle={{ color: selectedFilters.includes('high_rated') ? customTheme.colors.onPrimaryContainer : customTheme.colors.onSurface }}
                >
                  {selectedFilters.includes('high_rated') ? 'Activé' : 'Désactivé'}
                </Chip>
              </View>
            </TouchableRipple>
          </View>
          
          <View style={baseStyles.modalActions}>
            <Button onPress={() => setFilterVisible(false)}>
              Fermer
            </Button>
          </View>
        </Surface>
      </View>
    );
  };

  const dynamicStyles = getDynamicStyles(customTheme);
  
  return (
    <PaperProvider theme={customTheme} key={selectedTheme}>
      <SafeAreaView style={[baseStyles.container, dynamicStyles.container]}>
        <StatusBar style="dark" backgroundColor={customTheme.colors.background} />
        
        {isLoading ? (
          renderLoadingState()
        ) : (
          <>
            <OptimizedFlatListMemo
              data={filteredRestaurants}
              renderItem={({ item, index }) => renderRestaurant(item, index)}
              estimatedItemSize={350}
              style={baseStyles.restaurantsList}
              contentContainerStyle={{ gap: 16, paddingBottom: 100 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[customTheme.colors.primary]}
                  tintColor={customTheme.colors.primary}
                />
              }
              ListHeaderComponent={
                <View>
                  {renderHeader()}
                  {renderSearch()}
                  {renderFilters()}
                  {renderCategories()}
                  {renderFavorites()}

                  <View style={baseStyles.restaurantsSection}>
                    <View style={baseStyles.sectionHeader}>
                      <View style={baseStyles.sectionTitleRow}>
                        <View style={[baseStyles.sectionIcon, { backgroundColor: globalTheme.colors.primaryContainer }]}>
                          <Text style={{ fontSize: 16 }}>🍽️</Text>
                        </View>
                        <View>
                          <Text style={[baseStyles.sectionTitle, dynamicStyles.sectionTitle, { paddingHorizontal: 0, marginBottom: 0 }]}>
                            Restaurants à proximité
                          </Text>
                          <Text style={[baseStyles.restaurantsCount, { color: globalTheme.colors.onSurfaceVariant }]}>
                            {filteredRestaurants.length} résultat{filteredRestaurants.length > 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />

            {renderFilterModal()}
          </>
        )}
      </SafeAreaView>
    </PaperProvider>
  );
}

// Styles de base (indépendants du thème)
const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  headerSurface: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerText: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 22,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  headerLocation: {
    fontSize: 14,
  },
  notificationButton: {
    margin: 0,
  },
  headerSearchContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  headerSearchBar: {
    borderRadius: 24,
    elevation: 0,
    height: 44,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  filtersSection: {
    marginBottom: 16,
    marginTop: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesScrollContent: {
    paddingHorizontal: 12,
    gap: 4,
  },
  categoryTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryItemContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 72,
  },
  categoryCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryEmojiNew: {
    fontSize: 28,
  },
  categoryNameNew: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 64,
  },
  categoryCount: {
    fontSize: 10,
    marginTop: 2,
  },
  categorySelectedIndicator: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginTop: 6,
  },
  // Styles pour la section favoris
  favoritesSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  favoritesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  favoritesSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  favoritesCarousel: {
    gap: 12,
  },
  favoriteCardWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  favoriteCard: {
    width: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  favoriteCardImage: {
    width: 140,
    height: 90,
  },
  favoriteClosedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteClosedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteCardContent: {
    padding: 8,
  },
  favoriteCardName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  favoriteCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteCardRating: {
    fontSize: 11,
  },
  favoriteCardTime: {
    fontSize: 11,
  },
  restaurantsSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginTop: 8,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantsCount: {
    fontSize: 12,
    marginTop: 2,
  },
  restaurantsList: {
    gap: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    // backgroundColor sera appliqué dynamiquement
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxWidth: '90%',
    width: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    // color sera appliqué dynamiquement
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalActions: {
    alignItems: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});

// Styles dynamiques qui dépendent du thème
const getDynamicStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
  },
  modalTitle: {
    color: theme.colors.onSurface,
  },
});

export default memo(HomeIndex);