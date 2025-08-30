import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { mockRestaurants, cuisineCategories, Restaurant } from '../../src/data/mockData';
import { useAuth } from '../../src/contexts/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with proper spacing

const SORT_OPTIONS = [
  { id: 'rating', label: 'Note', icon: 'star' },
  { id: 'time', label: 'Temps', icon: 'access-time' },
  { id: 'distance', label: 'Distance', icon: 'location-on' },
];

const FILTER_OPTIONS = [
  { id: 'open_now', label: 'Ouvert maintenant', icon: 'schedule' },
  { id: 'fast_delivery', label: 'Livraison rapide', icon: 'flash-on' },
  { id: 'top_rated', label: 'Bien noté', icon: 'thumb-up' },
];

export default function RestaurantsHome() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('rating');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuth();

  const headerScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const filtersHeight = useSharedValue(0);

  useEffect(() => {
    animateEntrance();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [selectedCategory, selectedSort, activeFilters, searchQuery, restaurants]);

  const animateEntrance = () => {
    headerScale.value = withSpring(1, { damping: 15 });
    contentOpacity.value = withTiming(1, { duration: 800 });
  };

  const applyFiltersAndSort = () => {
    let filtered = [...restaurants];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.cuisine.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Active filters
    activeFilters.forEach(filter => {
      switch (filter) {
        case 'open_now':
          filtered = filtered.filter(r => r.isOpen);
          break;
        case 'fast_delivery':
          filtered = filtered.filter(r => parseInt(r.deliveryTime) <= 30);
          break;
        case 'top_rated':
          filtered = filtered.filter(r => r.rating >= 4.5);
          break;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'rating':
          return b.rating - a.rating;
        case 'time':
          return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        default:
          return 0;
      }
    });

    setFilteredRestaurants(filtered);
  };

  const toggleFilter = (filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const toggleFiltersPanel = () => {
    setShowFilters(!showFilters);
    filtersHeight.value = withSpring(showFilters ? 0 : 120);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/restaurant/${restaurant.id}` as any);
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerScale.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const filtersAnimatedStyle = useAnimatedStyle(() => ({
    height: filtersHeight.value,
    opacity: filtersHeight.value / 120,
  }));

  const renderSearchAndFilters = () => (
    <View style={styles.searchSection}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher restaurants, cuisines..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="clear" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter and Sort Controls */}
      <View style={styles.controlsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortContainer}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortChip,
                selectedSort === option.id && styles.activeSortChip
              ]}
              onPress={() => setSelectedSort(option.id)}
            >
              <MaterialIcons 
                name={option.icon as any} 
                size={16} 
                color={selectedSort === option.id ? 'white' : '#667eea'} 
              />
              <Text style={[
                styles.sortText,
                selectedSort === option.id && styles.activeSortText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.filterButton, activeFilters.length > 0 && styles.activeFilterButton]}
          onPress={toggleFiltersPanel}
        >
          <MaterialIcons 
            name="tune" 
            size={20} 
            color={activeFilters.length > 0 ? 'white' : '#667eea'} 
          />
          {activeFilters.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilters.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Expandable Filters */}
      <Animated.View style={[styles.filtersPanel, filtersAnimatedStyle]}>
        <Text style={styles.filtersPanelTitle}>Filtres</Text>
        <View style={styles.filtersGrid}>
          {FILTER_OPTIONS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                activeFilters.includes(filter.id) && styles.activeFilterChip
              ]}
              onPress={() => toggleFilter(filter.id)}
            >
              <MaterialIcons 
                name={filter.icon as any} 
                size={16} 
                color={activeFilters.includes(filter.id) ? 'white' : '#667eea'} 
              />
              <Text style={[
                styles.filterText,
                activeFilters.includes(filter.id) && styles.activeFilterText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryCard,
            selectedCategory === 'all' && styles.activeCategoryCard
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <LinearGradient
            colors={selectedCategory === 'all' ? ['#667eea', '#764ba2'] : ['#f8fafc', '#ffffff']}
            style={styles.categoryGradient}
          >
            <Text style={styles.categoryIcon}>🍽️</Text>
            <Text style={[
              styles.categoryName,
              selectedCategory === 'all' && styles.activeCategoryName
            ]}>
              Tous
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {cuisineCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && styles.activeCategoryCard
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <LinearGradient
              colors={selectedCategory === category.id ? ['#667eea', '#764ba2'] : ['#f8fafc', '#ffffff']}
              style={styles.categoryGradient}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryName,
                selectedCategory === category.id && styles.activeCategoryName
              ]}>
                {category.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderRestaurant = ({ item, index }: { item: Restaurant; index: number }) => (
    <Animated.View 
      entering={FadeIn.delay(index * 100).duration(600)}
      style={styles.restaurantCard}
    >
      <TouchableOpacity
        style={styles.restaurantCardInner}
        onPress={() => handleRestaurantPress(item)}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.restaurantGradient}
        >
          {/* Image Section */}
          <View style={styles.imageSection}>
            <Image source={{ uri: item.image }} style={styles.restaurantImage} />
            
            {/* Status Overlay */}
            {!item.isOpen && (
              <View style={styles.closedOverlay}>
                <Text style={styles.closedText}>Fermé</Text>
              </View>
            )}
            
            {/* Rating Badge */}
            <View style={styles.ratingBadge}>
              <MaterialIcons name="star" size={14} color="#fbbf24" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>

            {/* Favorite Button */}
            <TouchableOpacity style={styles.favoriteButton}>
              <MaterialIcons name="favorite-border" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.restaurantCuisine} numberOfLines={1}>
              {item.cuisine}
            </Text>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <MaterialIcons name="access-time" size={14} color="#6b7280" />
                <Text style={styles.detailText}>{item.deliveryTime}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="location-on" size={14} color="#6b7280" />
                <Text style={styles.detailText}>{item.distance}</Text>
              </View>
            </View>
            
            {/* Delivery Fee */}
            <View style={styles.deliveryFee}>
              <Text style={styles.deliveryText}>Livraison 2.99€</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.welcomeSection}>
                <Text style={styles.greeting}>
                  Découvrez les meilleurs restaurants
                </Text>
                <Text style={styles.subtitle}>
                  {filteredRestaurants.length} restaurants disponibles
                </Text>
              </View>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {renderHeader()}
      
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderSearchAndFilters()}
          {renderCategories()}
          
          {/* Results Section */}
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {selectedCategory === 'all' ? 'Tous les restaurants' : 
                 cuisineCategories.find(c => c.id === selectedCategory)?.name || 'Restaurants'}
              </Text>
              <Text style={styles.resultsCount}>
                {filteredRestaurants.length} trouvé{filteredRestaurants.length > 1 ? 's' : ''}
              </Text>
            </View>
            
            <FlatList
              data={filteredRestaurants}
              renderItem={renderRestaurant}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.restaurantRow}
              contentContainerStyle={styles.restaurantsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </ScrollView>
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
    height: 140,
  },
  headerGradient: {
    flex: 1,
  },
  headerBlur: {
    flex: 1,
    paddingTop: 20,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#f1f5f9',
    paddingTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sortContainer: {
    flex: 1,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeSortChip: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
  },
  activeSortText: {
    color: 'white',
  },
  filterButton: {
    width: 44,
    height: 36,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterButton: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 16,
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  filtersPanel: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    overflow: 'hidden',
  },
  filtersPanelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  activeFilterChip: {
    backgroundColor: '#667eea',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
  },
  activeFilterText: {
    color: 'white',
  },
  categoriesSection: {
    paddingVertical: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  activeCategoryCard: {
    elevation: 4,
  },
  categoryGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
  },
  activeCategoryName: {
    color: 'white',
  },
  resultsSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  restaurantRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  restaurantsList: {
    paddingBottom: 20,
  },
  restaurantCard: {
    width: CARD_WIDTH,
  },
  restaurantCardInner: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  restaurantGradient: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
    height: 140,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  deliveryFee: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deliveryText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600',
  },
});