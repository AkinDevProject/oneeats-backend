import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  FadeIn,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { Searchbar, Chip, Card, Button } from 'react-native-paper';
import { router } from 'expo-router';

import { mockRestaurants, mockMenuItems, cuisineCategories, Restaurant, MenuItem } from '../../src/data/mockData';

const { width } = Dimensions.get('window');

interface SearchFilters {
  category: string;
  rating: number;
  deliveryTime: string;
  priceRange: string;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    rating: 0,
    deliveryTime: 'all',
    priceRange: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Pizza', 'Sushi', 'Burger', 'Pâtes'
  ]);
  const [popularSearches] = useState<string[]>([
    'Pizza Margherita', 'Sushi Saumon', 'Burger Classic', 'Ramen Tonkotsu'
  ]);

  const headerScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const filtersHeight = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withSpring(1, { damping: 15 });
    contentOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  useEffect(() => {
    filtersHeight.value = withSpring(showFilters ? 1 : 0, { damping: 15 });
  }, [showFilters]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: interpolate(headerScale.value, [0, 1], [0, 1]),
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const filtersAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(filtersHeight.value, [0, 1], [0, 200]),
    opacity: filtersHeight.value,
  }));

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim() && filters.category === 'all' && filters.rating === 0) {
      return { restaurants: [], menuItems: [] };
    }

    let restaurants = mockRestaurants.filter(restaurant => {
      const matchesSearch = searchQuery.trim() === '' || 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || 
        restaurant.cuisine.toLowerCase() === filters.category.toLowerCase();
      
      const matchesRating = filters.rating === 0 || restaurant.rating >= filters.rating;
      
      return matchesSearch && matchesCategory && matchesRating;
    });

    let menuItems = mockMenuItems.filter(item => {
      const matchesSearch = searchQuery.trim() === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });

    return { restaurants, menuItems };
  }, [searchQuery, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const handleRecentSearchPress = (search: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery(search);
  };

  const toggleFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowFilters(!showFilters);
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFilters({
      category: 'all',
      rating: 0,
      deliveryTime: 'all',
      priceRange: 'all',
    });
    setSearchQuery('');
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/restaurant/${restaurant.id}`);
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerBadge}>
            <MaterialIcons name="search" size={16} color="#667eea" />
            <Text style={styles.headerBadgeText}>Recherche</Text>
          </View>
          <Text style={styles.headerTitle}>Trouvez vos plats préférés</Text>
          <Text style={styles.headerSubtitle}>
            Restaurants, plats, cuisines du monde
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Rechercher restaurants, plats..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor="#666"
        placeholderTextColor="#999"
      />
      
      <Pressable 
        style={[
          styles.filterButton,
          showFilters && styles.filterButtonActive
        ]}
        onPress={toggleFilters}
      >
        <MaterialIcons 
          name={showFilters ? "close" : "tune"} 
          size={24} 
          color={showFilters ? "white" : "#667eea"} 
        />
      </Pressable>
    </View>
  );

  const renderFilters = () => (
    <Animated.View style={[styles.filtersContainer, filtersAnimatedStyle]}>
      {/* Category Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Catégorie</Text>
        <View style={styles.filterChips}>
          <Chip
            selected={filters.category === 'all'}
            onPress={() => updateFilter('category', 'all')}
            style={styles.filterChip}
            textStyle={styles.filterChipText}
          >
            Toutes
          </Chip>
          {cuisineCategories.slice(0, 4).map(category => (
            <Chip
              key={category.id}
              selected={filters.category === category.id}
              onPress={() => updateFilter('category', category.id)}
              style={styles.filterChip}
              textStyle={styles.filterChipText}
            >
              {category.name}
            </Chip>
          ))}
        </View>
      </View>

      {/* Rating Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Note minimum</Text>
        <View style={styles.filterChips}>
          {[0, 3, 4, 4.5].map(rating => (
            <Chip
              key={rating}
              selected={filters.rating === rating}
              onPress={() => updateFilter('rating', rating)}
              style={styles.filterChip}
              textStyle={styles.filterChipText}
            >
              {rating === 0 ? 'Toutes' : `${rating}+ ⭐`}
            </Chip>
          ))}
        </View>
      </View>

      <Button
        mode="outlined"
        onPress={clearFilters}
        style={styles.clearButton}
        labelStyle={styles.clearButtonText}
      >
        Effacer les filtres
      </Button>
    </Animated.View>
  );

  const renderRecentSearches = () => {
    if (searchQuery.trim() || recentSearches.length === 0) return null;

    return (
      <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
        <Text style={styles.sectionTitle}>Recherches récentes</Text>
        <View style={styles.searchChips}>
          {recentSearches.map((search, index) => (
            <Animated.View 
              key={search}
              entering={SlideInRight.delay(100 + index * 50).springify()}
            >
              <Pressable
                style={styles.recentSearchChip}
                onPress={() => handleRecentSearchPress(search)}
              >
                <MaterialIcons name="history" size={16} color="#667eea" />
                <Text style={styles.recentSearchText}>{search}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderPopularSearches = () => {
    if (searchQuery.trim()) return null;

    return (
      <Animated.View entering={FadeIn.delay(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>Recherches populaires</Text>
        <View style={styles.searchChips}>
          {popularSearches.map((search, index) => (
            <Animated.View 
              key={search}
              entering={SlideInRight.delay(150 + index * 50).springify()}
            >
              <Pressable
                style={styles.popularSearchChip}
                onPress={() => handleRecentSearchPress(search)}
              >
                <MaterialIcons name="trending-up" size={16} color="#667eea" />
                <Text style={styles.popularSearchText}>{search}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderRestaurantResult = ({ item, index }: { item: Restaurant; index: number }) => (
    <Animated.View 
      entering={FadeIn.delay(200 + index * 100).duration(500)}
      style={styles.resultCard}
    >
      <Pressable
        style={styles.restaurantResult}
        onPress={() => handleRestaurantPress(item)}
      >
        <Card style={styles.resultCardInner}>
          <View style={styles.resultContent}>
            <Image source={{ uri: item.image }} style={styles.resultImage} />
            
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultCuisine}>{item.cuisine}</Text>
              
              <View style={styles.resultDetails}>
                <View style={styles.resultRating}>
                  <MaterialIcons name="star" size={14} color="#FFD700" />
                  <Text style={styles.resultRatingText}>{item.rating}</Text>
                </View>
                
                <Text style={styles.resultTime}>{item.deliveryTime}</Text>
                <Text style={styles.resultDistance}>{item.distance}</Text>
              </View>
            </View>

            {!item.isOpen && (
              <View style={styles.closedIndicator}>
                <Text style={styles.closedText}>Fermé</Text>
              </View>
            )}
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );

  const renderMenuItemResult = ({ item, index }: { item: MenuItem; index: number }) => {
    const restaurant = mockRestaurants.find(r => r.id === item.restaurantId);
    
    return (
      <Animated.View 
        entering={FadeIn.delay(200 + index * 100).duration(500)}
        style={styles.resultCard}
      >
        <Pressable style={styles.menuItemResult}>
          <Card style={styles.resultCardInner}>
            <View style={styles.resultContent}>
              <Image source={{ uri: item.image }} style={styles.resultImage} />
              
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={styles.resultRestaurant}>
                  chez {restaurant?.name}
                </Text>
                
                <Text style={styles.resultPrice}>{item.price.toFixed(2)} €</Text>
              </View>
            </View>
          </Card>
        </Pressable>
      </Animated.View>
    );
  };

  const renderResults = () => {
    if (!searchQuery.trim() && filters.category === 'all') return null;

    const { restaurants, menuItems } = filteredResults;
    const hasResults = restaurants.length > 0 || menuItems.length > 0;

    if (!hasResults) {
      return (
        <Animated.View entering={FadeIn.delay(300)} style={styles.noResults}>
          <MaterialIcons name="search-off" size={64} color="#ccc" />
          <Text style={styles.noResultsTitle}>Aucun résultat</Text>
          <Text style={styles.noResultsText}>
            Essayez de modifier vos critères de recherche
          </Text>
        </Animated.View>
      );
    }

    return (
      <View style={styles.results}>
        {restaurants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Restaurants ({restaurants.length})
            </Text>
            <FlatList
              data={restaurants}
              renderItem={renderRestaurantResult}
              keyExtractor={(item) => `restaurant-${item.id}`}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        )}

        {menuItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Plats ({menuItems.length})
            </Text>
            <FlatList
              data={menuItems}
              renderItem={renderMenuItemResult}
              keyExtractor={(item) => `menu-${item.id}`}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {renderHeader()}
      
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {renderSearchBar()}
        {showFilters && renderFilters()}
        
        <FlatList
          data={[]}
          ListHeaderComponent={() => (
            <>
              {renderRecentSearches()}
              {renderPopularSearches()}
              {renderResults()}
            </>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    height: 160,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 6,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#f1f5f9',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    elevation: 2,
    borderRadius: 25,
  },
  searchInput: {
    fontSize: 16,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filtersContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: '#667eea',
  },
  filterChipText: {
    fontSize: 12,
  },
  clearButton: {
    borderColor: '#e2e8f0',
  },
  clearButtonText: {
    color: '#64748b',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 16,
  },
  searchChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recentSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  recentSearchText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  popularSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  popularSearchText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  results: {
    flex: 1,
  },
  resultCard: {
    marginBottom: 12,
  },
  resultCardInner: {
    elevation: 3,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  restaurantResult: {
    // Styles for restaurant result pressable
  },
  menuItemResult: {
    // Styles for menu item result pressable
  },
  resultContent: {
    flexDirection: 'row',
    padding: 12,
    position: 'relative',
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  resultCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  resultRestaurant: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
    marginBottom: 8,
  },
  resultDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultRatingText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
  resultTime: {
    fontSize: 12,
    color: '#4a5568',
  },
  resultDistance: {
    fontSize: 12,
    color: '#4a5568',
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
  },
  closedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4a5568',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});