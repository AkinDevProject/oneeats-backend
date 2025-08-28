import React, { useState, useEffect, useRef } from 'react';
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
  SectionList,
  Animated as RNAnimated,
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
  SlideInLeft,
} from 'react-native-reanimated';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { mockRestaurants, cuisineCategories, Restaurant } from '../../src/data/mockData';
import { useAuth } from '../../src/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const QUICK_FILTERS = [
  { id: 'popular', label: 'Populaire', color: '#ef4444' },
  { id: 'nearby', label: 'Près de moi', color: '#3b82f6' },
  { id: 'fast', label: 'Livraison rapide', color: '#10b981' },
  { id: 'offers', label: 'Promotions', color: '#f59e0b' },
];

const TRENDING_SEARCHES = [
  'Pizza', 'Burger', 'Sushi', 'Indien', 'Chinois', 'Kebab'
];

export default function RestaurantsDesign2() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [sectionsData, setSectionsData] = useState<any[]>([]);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('popular');
  const [refreshing, setRefreshing] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [showTrendingSearch, setShowTrendingSearch] = useState(true);

  const { user } = useAuth();
  const categoryScrollRef = useRef<ScrollView>(null);
  const headerOpacity = useSharedValue(1);
  const contentTranslateY = useSharedValue(0);

  useEffect(() => {
    organizeBySections();
    animateEntrance();
  }, [restaurants, selectedQuickFilter]);

  const animateEntrance = () => {
    headerOpacity.value = withSpring(1);
    contentTranslateY.value = withTiming(0, { duration: 800 });
  };

  const organizeBySections = () => {
    let filteredRestaurants = [...restaurants];
    
    // Apply quick filter
    switch (selectedQuickFilter) {
      case 'popular':
        filteredRestaurants = filteredRestaurants.filter(r => r.rating >= 4.3);
        break;
      case 'nearby':
        filteredRestaurants = filteredRestaurants.filter(r => parseFloat(r.distance) <= 2);
        break;
      case 'fast':
        filteredRestaurants = filteredRestaurants.filter(r => parseInt(r.deliveryTime) <= 25);
        break;
      case 'offers':
        filteredRestaurants = filteredRestaurants.filter(r => r.featured);
        break;
    }

    const sections = [];
    
    // Add featured section if applicable
    const featuredRestaurants = filteredRestaurants.filter(r => r.featured);
    if (featuredRestaurants.length > 0 && selectedQuickFilter === 'popular') {
      sections.push({
        title: '⭐ Recommandés pour vous',
        data: [{ type: 'featured', restaurants: featuredRestaurants }],
        type: 'featured'
      });
    }

    // Group by cuisine type
    const cuisineGroups = cuisineCategories.reduce((acc: any, category) => {
      const categoryRestaurants = filteredRestaurants.filter(
        r => r.cuisine.toLowerCase() === category.id.toLowerCase()
      );
      
      if (categoryRestaurants.length > 0) {
        acc.push({
          title: `${category.icon} ${category.name}`,
          data: categoryRestaurants,
          type: 'cuisine'
        });
      }
      return acc;
    }, []);

    // Add mixed category for remaining restaurants
    const categorizedRestaurantIds = new Set();
    cuisineGroups.forEach((group: any) => {
      group.data.forEach((r: Restaurant) => categorizedRestaurantIds.add(r.id));
    });

    const uncategorizedRestaurants = filteredRestaurants.filter(
      r => !categorizedRestaurantIds.has(r.id)
    );

    if (uncategorizedRestaurants.length > 0) {
      sections.push({
        title: '🍽️ Autres restaurants',
        data: uncategorizedRestaurants,
        type: 'cuisine'
      });
    }

    setSectionsData([...sections, ...cuisineGroups]);
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

  const scrollToCategorySection = (index: number) => {
    setCurrentCategoryIndex(index);
    // Implementation would scroll to specific section
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const renderFloatingCategoryNav = () => (
    <View style={styles.floatingNav}>
      <BlurView intensity={80} style={styles.floatingNavBlur}>
        <ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.floatingNavContent}
        >
          {sectionsData.map((section, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.floatingNavItem,
                currentCategoryIndex === index && styles.floatingNavItemActive
              ]}
              onPress={() => scrollToCategorySection(index)}
            >
              <Text style={[
                styles.floatingNavText,
                currentCategoryIndex === index && styles.floatingNavTextActive
              ]}>
                {section.title.replace(/[⭐🍽️]/g, '').trim()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BlurView>
    </View>
  );

  const renderTrendingSearches = () => {
    if (!showTrendingSearch) return null;
    
    return (
      <Animated.View 
        entering={FadeIn.delay(200)}
        style={styles.trendingSection}
      >
        <View style={styles.trendingHeader}>
          <MaterialIcons name="trending-up" size={20} color="#667eea" />
          <Text style={styles.trendingTitle}>Recherches tendances</Text>
          <TouchableOpacity onPress={() => setShowTrendingSearch(false)}>
            <MaterialIcons name="close" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
        <View style={styles.trendingTags}>
          {TRENDING_SEARCHES.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.trendingTag}
              onPress={() => {
                // Handle trending search
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.trendingTagText}>{search}</Text>
              <MaterialIcons name="search" size={14} color="#667eea" />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderQuickFilters = () => (
    <View style={styles.quickFiltersSection}>
      <Text style={styles.quickFiltersTitle}>Filtres rapides</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickFiltersContainer}
      >
        {QUICK_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.quickFilterChip,
              { borderColor: filter.color },
              selectedQuickFilter === filter.id && { backgroundColor: filter.color }
            ]}
            onPress={() => setSelectedQuickFilter(filter.id)}
          >
            <Text style={[
              styles.quickFilterText,
              { color: selectedQuickFilter === filter.id ? 'white' : filter.color }
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFeaturedRestaurants = ({ restaurants }: { restaurants: Restaurant[] }) => (
    <View style={styles.featuredContainer}>
      <FlatList
        data={restaurants}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={SlideInLeft.delay(index * 100)}>
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => handleRestaurantPress(item)}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.featuredGradient}
              >
                <Image source={{ uri: item.image }} style={styles.featuredImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.featuredOverlay}
                >
                  <View style={styles.featuredContent}>
                    <View style={styles.featuredBadge}>
                      <MaterialIcons name="star" size={16} color="#fbbf24" />
                      <Text style={styles.featuredRating}>{item.rating}</Text>
                    </View>
                    <Text style={styles.featuredName}>{item.name}</Text>
                    <Text style={styles.featuredCuisine}>{item.cuisine}</Text>
                    <View style={styles.featuredInfo}>
                      <Text style={styles.featuredTime}>{item.deliveryTime}</Text>
                      <Text style={styles.featuredDistance}>{item.distance}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
        keyExtractor={(item, index) => `featured-${item.id}-${index}`}
        contentContainerStyle={styles.featuredList}
        snapToInterval={width * 0.75 + 16}
        decelerationRate="fast"
      />
    </View>
  );

  const renderRestaurantItem = ({ item, index }: { item: Restaurant; index: number }) => (
    <Animated.View 
      entering={FadeIn.delay(index * 50)}
      style={styles.restaurantItem}
    >
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => handleRestaurantPress(item)}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.restaurantGradient}
        >
          <View style={styles.restaurantImageContainer}>
            <Image source={{ uri: item.image }} style={styles.restaurantImage} />
            
            {!item.isOpen && (
              <View style={styles.closedBadge}>
                <Text style={styles.closedText}>Fermé</Text>
              </View>
            )}
            
            <View style={styles.deliveryBadge}>
              <MaterialIcons name="delivery-dining" size={16} color="#10b981" />
              <Text style={styles.deliveryText}>Livraison</Text>
            </View>
          </View>
          
          <View style={styles.restaurantDetails}>
            <View style={styles.restaurantHeader}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={16} color="#fbbf24" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
            
            <Text style={styles.restaurantCuisine}>{item.cuisine}</Text>
            
            <View style={styles.restaurantMeta}>
              <View style={styles.metaItem}>
                <MaterialIcons name="access-time" size={14} color="#6b7280" />
                <Text style={styles.metaText}>{item.deliveryTime}</Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="location-on" size={14} color="#6b7280" />
                <Text style={styles.metaText}>{item.distance}</Text>
              </View>
            </View>
            
            <View style={styles.restaurantFooter}>
              <Text style={styles.deliveryFee}>Livraison 2.99€</Text>
              <TouchableOpacity style={styles.favoriteBtn}>
                <MaterialIcons name="favorite-border" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>
        {section.type === 'featured' ? section.data[0].restaurants.length : section.data.length} restaurant{(section.type === 'featured' ? section.data[0].restaurants.length : section.data.length) > 1 ? 's' : ''}
      </Text>
    </View>
  );

  const renderSectionItem = ({ item, index, section }: { item: any; index: number; section: any }) => {
    if (section.type === 'featured') {
      return renderFeaturedRestaurants(item);
    }
    return renderRestaurantItem({ item, index });
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.welcomeSection}>
              <Text style={styles.greeting}>
                Découvrez
              </Text>
              <Text style={styles.subtitle}>
                Les meilleurs restaurants près de vous
              </Text>
            </View>
            
            <TouchableOpacity style={styles.searchButton}>
              <MaterialIcons name="search" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {renderHeader()}
      {renderFloatingCategoryNav()}
      
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <SectionList
          sections={sectionsData}
          renderItem={renderSectionItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item, index) => `${item.id || 'section'}-${index}`}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <View>
              {renderTrendingSearches()}
              {renderQuickFilters()}
            </View>
          }
          contentContainerStyle={styles.listContent}
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
    height: 120,
    zIndex: 1000,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    flex: 1,
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
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingNav: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    zIndex: 999,
    height: 50,
  },
  floatingNavBlur: {
    flex: 1,
  },
  floatingNavContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    height: 50,
  },
  floatingNavItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    justifyContent: 'center',
  },
  floatingNavItemActive: {
    backgroundColor: '#667eea',
  },
  floatingNavText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  floatingNavTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    marginTop: 50, // Account for floating nav
  },
  listContent: {
    paddingBottom: 20,
  },
  trendingSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  trendingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  trendingTagText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  quickFiltersSection: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  quickFiltersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  quickFiltersContainer: {
    gap: 12,
  },
  quickFilterChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'white',
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  sectionCount: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  featuredContainer: {
    paddingVertical: 8,
  },
  featuredList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  featuredCard: {
    width: width * 0.75,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredGradient: {
    flex: 1,
    position: 'relative',
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredContent: {
    alignItems: 'flex-start',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    gap: 4,
  },
  featuredRating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  featuredName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  featuredCuisine: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  featuredInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  featuredTime: {
    fontSize: 13,
    color: 'white',
    fontWeight: '500',
  },
  featuredDistance: {
    fontSize: 13,
    color: 'white',
    fontWeight: '500',
  },
  restaurantItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  restaurantCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  restaurantGradient: {
    flexDirection: 'row',
    padding: 16,
  },
  restaurantImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 16,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  closedBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  closedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  deliveryText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  restaurantDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  restaurantName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  restaurantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryFee: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  favoriteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});