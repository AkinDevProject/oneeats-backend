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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { router } from 'expo-router';

// React Native Paper components (simplified for compatibility)
import {
  Searchbar,
  Card,
  Button,
  Chip,
  Badge,
  Surface,
  TouchableRipple,
  FAB,
  IconButton,
  Avatar,
  Provider as PaperProvider,
  MD3LightTheme,
} from 'react-native-paper';

import { cuisineCategories, Restaurant } from '../../src/data/mockData';
import { useRestaurants } from '../../src/hooks/useRestaurants';
import { useFavorites } from '../../src/hooks/useFavorites';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import OptimizedImage from '../../src/components/OptimizedImage';
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
  const [isFavorite, setIsFavorite] = useState(false);

  // Vérifier le statut favori au montage du composant
  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkFavoriteStatus(restaurant.id);
      setIsFavorite(status);
    };
    checkStatus();
  }, [restaurant.id, checkFavoriteStatus]);

  const handleFavoriteToggle = useCallback(async (e: any) => {
    e.stopPropagation(); // Empêcher la navigation vers le restaurant
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newStatus = await toggleFavorite(restaurant.id);
    setIsFavorite(newStatus);
  }, [restaurant.id, toggleFavorite]);

  return (
    <Card style={[baseStyles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <TouchableRipple onPress={handlePress} borderless>
        <View>
          <Image
            source={{ uri: restaurant.image }}
            style={baseStyles.cardCover}
            resizeMode="cover"
          />

          {!restaurant.isOpen && (
            <View style={baseStyles.closedOverlay}>
              <Surface style={[baseStyles.closedSurface, { backgroundColor: theme.colors.errorContainer }]} elevation={2}>
                <Text style={[baseStyles.closedText, { color: theme.colors.onErrorContainer }]}>Fermé</Text>
              </Surface>
            </View>
          )}

          <View style={baseStyles.cardBadges}>
            <Badge style={[baseStyles.ratingBadge, { backgroundColor: theme.colors.surface }]}>
              <Text style={{ color: theme.colors.onSurface, fontSize: 12, fontWeight: '600' }}>
                ⭐ {restaurant.rating}
              </Text>
            </Badge>
            {restaurant.featured && (
              <Badge style={[baseStyles.featuredBadge, { backgroundColor: theme.colors.tertiaryContainer }]}>
                <Text style={{ color: theme.colors.onTertiaryContainer, fontSize: 12, fontWeight: '600' }}>
                  ⚡ Populaire
                </Text>
              </Badge>
            )}
          </View>

          {/* Icône cœur pour les favoris */}
          <View style={baseStyles.favoriteButton}>
            <IconButton
              icon={isFavorite ? "heart" : "heart-outline"}
              size={24}
              iconColor={isFavorite ? "#FF4444" : "#FFFFFF"}
              style={[
                baseStyles.favoriteIcon,
                {
                  backgroundColor: isFavorite ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)',
                }
              ]}
              onPress={handleFavoriteToggle}
              disabled={isLoading}
            />
          </View>
          
          <Card.Content style={baseStyles.cardContent}>
            <Text style={[baseStyles.restaurantName, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {restaurant.name}
            </Text>
            <Text style={[baseStyles.restaurantCuisine, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
              {restaurant.cuisine}
            </Text>
            
            <View style={baseStyles.restaurantDetails}>
              <View style={baseStyles.detailItem}>
                <Text style={baseStyles.detailIcon}>🕐</Text>
                <Text style={[baseStyles.detailText, { color: theme.colors.onSurfaceVariant }]}>{restaurant.deliveryTime}</Text>
              </View>
              <View style={baseStyles.detailItem}>
                <Text style={baseStyles.detailIcon}>📍</Text>
                <Text style={[baseStyles.detailText, { color: theme.colors.onSurfaceVariant }]}>{restaurant.distance}</Text>
              </View>
            </View>
          </Card.Content>
          
          <Card.Actions style={baseStyles.cardActions}>
            <Chip 
              icon="walk" 
              compact 
              style={baseStyles.pickupChip}
              backgroundColor={theme.colors.secondaryContainer}
              textStyle={{ color: theme.colors.onSecondaryContainer }}
            >
              À emporter
            </Chip>
            <Button
              mode="contained"
              onPress={handlePress}
              style={baseStyles.viewButton}
              buttonColor={theme.colors.primaryContainer}
              textColor={theme.colors.onPrimaryContainer}
            >
              Voir le menu
            </Button>
          </Card.Actions>
        </View>
      </TouchableRipple>
    </Card>
  );
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

  const renderHeader = () => (
    <Animated.View style={[baseStyles.header, headerAnimatedStyle]}>
      <Surface style={[baseStyles.headerSurface, { backgroundColor: globalTheme.colors.surface }]} elevation={2}>
        <View style={baseStyles.headerContent}>
          <Avatar.Icon 
            size={48} 
            icon="silverware-fork-knife" 
            style={[baseStyles.headerIcon, dynamicStyles.headerIcon]}
          />
          <View style={baseStyles.headerText}>
            <Text style={[baseStyles.headerTitle, dynamicStyles.headerTitle]}>OneEats</Text>
            <Text style={[baseStyles.headerSubtitle, dynamicStyles.headerSubtitle]}>
              Découvrez {filteredRestaurants.length} restaurants
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[
              baseStyles.headerSubtitle,
              dynamicStyles.headerSubtitle,
              {
                fontSize: 10,
                marginRight: 4,
              }
            ]}>
              {themeMetadata[selectedTheme]?.emoji} {themeMetadata[selectedTheme]?.name.split(' ')[0]}
            </Text>
            <IconButton
              icon="palette"
              size={24}
              iconColor={customTheme.colors.primary}
              onPress={() => router.push('/designs/design-selector')}
            />
          </View>
        </View>
      </Surface>
    </Animated.View>
  );

  const renderSearch = () => (
    <View style={baseStyles.searchSection}>
      <Searchbar
        placeholder="Rechercher restaurants, plats..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        icon="magnify"
        clearIcon="close"
        style={[baseStyles.searchBar, { backgroundColor: customTheme.colors.surface }]}
        inputStyle={[baseStyles.searchInput, { color: customTheme.colors.onSurface }]}
        iconColor={customTheme.colors.primary}
        rippleColor={customTheme.colors.primaryContainer}
        placeholderTextColor={customTheme.colors.onSurfaceVariant}
      />
    </View>
  );

  const renderFilters = () => (
    <View style={baseStyles.filtersSection}>
      <View style={baseStyles.filtersHeader}>
        <Text style={[baseStyles.filtersTitle, dynamicStyles.filtersTitle]}>Filtres rapides</Text>
        <Button
          mode="text"
          onPress={() => setFilterVisible(true)}
          textColor={customTheme.colors.primary}
        >
          Tous les filtres
        </Button>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={baseStyles.filtersContainer}>
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
            Ouvert maintenant
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
            Très bien noté
          </Chip>
          
          <Chip
            selected={selectedFilters.includes('fast_delivery')}
            onPress={() => toggleFilter('fast_delivery')}
            icon="lightning-bolt"
            style={baseStyles.filterChip}
            selectedColor={customTheme.colors.onPrimaryContainer}
            backgroundColor={selectedFilters.includes('fast_delivery') ? customTheme.colors.primaryContainer : customTheme.colors.surface}
            textStyle={{ color: selectedFilters.includes('fast_delivery') ? customTheme.colors.onPrimaryContainer : customTheme.colors.onSurface }}
            showSelectedOverlay={false}
          >
            Livraison rapide
          </Chip>
        </View>
      </ScrollView>
    </View>
  );

  const renderCategories = () => (
    <View style={baseStyles.categoriesSection}>
      <Text style={[baseStyles.sectionTitle, dynamicStyles.sectionTitle]}>Catégories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={baseStyles.categoriesContainer}>
          <Surface
            style={[
              baseStyles.categoryCard,
              selectedCategory === 'all' && [baseStyles.activeCategoryCard, dynamicStyles.activeCategoryCard]
            ]}
            elevation={selectedCategory === 'all' ? 3 : 1}
          >
            <TouchableRipple
              onPress={() => setSelectedCategory('all')}
              style={baseStyles.categoryTouchable}
              borderless
            >
              <View style={baseStyles.categoryContent}>
                <Avatar.Icon 
                  size={40} 
                  icon="silverware-variant" 
                  style={[
                    baseStyles.categoryIcon,
                    dynamicStyles.categoryIcon,
                    selectedCategory === 'all' && [baseStyles.activeCategoryIcon, dynamicStyles.activeCategoryIcon]
                  ]}
                />
                <Text style={[
                  baseStyles.categoryName,
                  dynamicStyles.categoryName,
                  selectedCategory === 'all' && [baseStyles.activeCategoryName, dynamicStyles.activeCategoryName]
                ]}>
                  Tous
                </Text>
              </View>
            </TouchableRipple>
          </Surface>
          
          {cuisineCategories.map((category) => (
            <Surface
              key={category.id}
              style={[
                baseStyles.categoryCard,
                selectedCategory === category.id && [baseStyles.activeCategoryCard, dynamicStyles.activeCategoryCard]
              ]}
              elevation={selectedCategory === category.id ? 3 : 1}
            >
              <TouchableRipple
                onPress={() => setSelectedCategory(category.id)}
                style={baseStyles.categoryTouchable}
                borderless
              >
                <View style={baseStyles.categoryContent}>
                  <Text style={baseStyles.categoryEmoji}>{category.icon}</Text>
                  <Text style={[
                    baseStyles.categoryName,
                    dynamicStyles.categoryName,
                    selectedCategory === category.id && [baseStyles.activeCategoryName, dynamicStyles.activeCategoryName]
                  ]}>
                    {category.name}
                  </Text>
                </View>
              </TouchableRipple>
            </Surface>
          ))}
        </View>
      </ScrollView>
    </View>
  );

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

                  <View style={baseStyles.restaurantsSection}>
                    <Text style={[baseStyles.sectionTitle, dynamicStyles.sectionTitle]}>
                      Restaurants recommandés ({filteredRestaurants.length})
                    </Text>
                  </View>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />

            {renderFilterModal()}

            <FAB
              icon="tune"
              style={[baseStyles.fab, dynamicStyles.fab]}
              onPress={() => setFilterVisible(true)}
              color={customTheme.colors.onPrimary}
            />
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
    marginBottom: 16,
  },
  headerSurface: {
    margin: 16,
    borderRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerIcon: {
    // backgroundColor sera appliqué dynamiquement
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    // color sera appliqué dynamiquement
  },
  headerSubtitle: {
    fontSize: 14,
    // color sera appliqué dynamiquement
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
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '600',
    // color sera appliqué dynamiquement
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    // color sera appliqué dynamiquement
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 8,
  },
  activeCategoryCard: {
    // backgroundColor sera appliqué dynamiquement
  },
  categoryTouchable: {
    padding: 16,
  },
  categoryContent: {
    alignItems: 'center',
    minWidth: 80,
  },
  categoryIcon: {
    // backgroundColor sera appliqué dynamiquement
  },
  activeCategoryIcon: {
    // backgroundColor sera appliqué dynamiquement
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    // color sera appliqué dynamiquement
    textAlign: 'center',
  },
  activeCategoryName: {
    // color sera appliqué dynamiquement
  },
  restaurantsSection: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  restaurantsList: {
    gap: 16,
  },
  restaurantCard: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardCover: {
    height: 200,
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 160,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedSurface: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    // backgroundColor sera appliqué dynamiquement
  },
  closedText: {
    // color sera appliqué dynamiquement
    fontWeight: '600',
  },
  cardBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingBadge: {
    // backgroundColor sera appliqué dynamiquement
  },
  featuredBadge: {
    // backgroundColor sera appliqué dynamiquement
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  favoriteIcon: {
    margin: 0,
    borderRadius: 20,
    width: 40,
    height: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardContent: {
    paddingTop: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    // color sera appliqué dynamiquement
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    // color sera appliqué dynamiquement
    marginBottom: 12,
  },
  restaurantDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailIcon: {
    fontSize: 14,
  },
  detailText: {
    fontSize: 13,
    // color sera appliqué dynamiquement
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pickupChip: {
    // backgroundColor sera appliqué dynamiquement
  },
  viewButton: {
    borderRadius: 20,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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
  headerIcon: {
    backgroundColor: theme.colors.primaryContainer,
  },
  headerTitle: {
    color: theme.colors.onSurface,
  },
  headerSubtitle: {
    color: theme.colors.onSurfaceVariant,
  },
  filtersTitle: {
    color: theme.colors.onSurface,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
  },
  activeCategoryCard: {
    backgroundColor: theme.colors.primaryContainer,
  },
  categoryIcon: {
    backgroundColor: theme.colors.surface,
  },
  activeCategoryIcon: {
    backgroundColor: theme.colors.primary,
  },
  categoryName: {
    color: theme.colors.onSurface,
  },
  activeCategoryName: {
    color: theme.colors.onPrimaryContainer,
  },
  closedSurface: {
    backgroundColor: theme.colors.errorContainer,
  },
  closedText: {
    color: theme.colors.onErrorContainer,
  },
  ratingBadge: {
    backgroundColor: theme.colors.surface,
  },
  featuredBadge: {
    backgroundColor: theme.colors.tertiaryContainer,
  },
  restaurantName: {
    color: theme.colors.onSurface,
  },
  restaurantCuisine: {
    color: theme.colors.onSurfaceVariant,
  },
  detailText: {
    color: theme.colors.onSurfaceVariant,
  },
  pickupChip: {
    backgroundColor: theme.colors.secondaryContainer,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
  },
  modalTitle: {
    color: theme.colors.onSurface,
  },
  fab: {
    backgroundColor: theme.colors.primary,
  },
});

export default memo(HomeIndex);