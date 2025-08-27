import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  RefreshControl,
  Dimensions,
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
  interpolate,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Card, Chip, Button } from 'react-native-paper';
import { router } from 'expo-router';

import { mockRestaurants, cuisineCategories, Restaurant } from '../../src/data/mockData';
import { useAuth } from '../../src/contexts/AuthContext';
import { useNotification } from '../../src/contexts/NotificationContext';

const { width } = Dimensions.get('window');

const FEATURED_CARD_WIDTH = width * 0.8;
const RESTAURANT_CARD_WIDTH = width * 0.45;

export default function RestaurantsScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { unreadCount } = useNotification();

  const headerScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    loadData();
    animateEntrance();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRestaurants(mockRestaurants);
      setFeaturedRestaurants(mockRestaurants.filter(r => r.featured));
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateEntrance = () => {
    headerScale.value = withSpring(1, { damping: 15 });
    contentOpacity.value = withTiming(1, { duration: 800 });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  };

  const filterRestaurants = (category: string) => {
    setSelectedCategory(category);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (category === 'all') {
      setRestaurants(mockRestaurants);
    } else {
      const filtered = mockRestaurants.filter(r => 
        r.cuisine.toLowerCase() === category.toLowerCase()
      );
      setRestaurants(filtered);
    }
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/restaurant/${restaurant.id}` as any);
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: interpolate(headerScale.value, [0, 1], [0, 1]),
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const renderHeader = () => (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>
                  Bonjour {user?.isGuest ? 'Invité' : user?.name?.split(' ')[0] || 'Ami'} 👋
                </Text>
                <Text style={styles.subtitle}>
                  Que souhaitez-vous manger aujourd'hui ?
                </Text>
              </View>
              
              <Pressable 
                style={styles.notificationButton}
                onPress={() => router.push('/profile')}
              >
                <Ionicons name="notifications" size={24} color="white" />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.searchContainer}>
              <Pressable 
                style={styles.searchButton}
                onPress={() => router.push('/search')}
              >
                <Ionicons name="search" size={20} color="#666" />
                <Text style={styles.searchPlaceholder}>
                  Rechercher un restaurant...
                </Text>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <Text style={styles.sectionTitle}>Catégories</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        <Chip
          key="all"
          selected={selectedCategory === 'all'}
          onPress={() => filterRestaurants('all')}
          style={[
            styles.categoryChip,
            selectedCategory === 'all' && styles.selectedCategoryChip
          ]}
          textStyle={[
            styles.categoryChipText,
            selectedCategory === 'all' && styles.selectedCategoryChipText
          ]}
        >
          Tous
        </Chip>
        
        {cuisineCategories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => filterRestaurants(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategoryChip
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.selectedCategoryChipText
            ]}
          >
            {category.icon} {category.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderFeaturedRestaurant = ({ item, index }: { item: Restaurant; index: number }) => (
    <Animated.View entering={SlideInRight.delay(200 + index * 100).springify()}>
      <Pressable
        style={styles.featuredCard}
        onPress={() => handleRestaurantPress(item)}
      >
        <Card style={styles.featuredCardInner}>
          <View style={styles.featuredImageContainer}>
            <Image source={{ uri: item.image }} style={styles.featuredImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.featuredImageOverlay}
            />
            
            {!item.isOpen && (
              <View style={styles.closedOverlay}>
                <Text style={styles.closedText}>Fermé</Text>
              </View>
            )}
            
            <View style={styles.featuredContent}>
              <Text style={styles.featuredName}>{item.name}</Text>
              <Text style={styles.featuredCuisine}>{item.cuisine}</Text>
              
              <View style={styles.featuredInfo}>
                <View style={styles.infoItem}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.infoText}>{item.rating}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="time" size={16} color="white" />
                  <Text style={styles.infoText}>{item.deliveryTime}</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );

  const renderRestaurant = ({ item, index }: { item: Restaurant; index: number }) => (
    <Animated.View 
      entering={FadeIn.delay(300 + index * 50).duration(500)}
      style={styles.restaurantCardContainer}
    >
      <Pressable
        style={styles.restaurantCard}
        onPress={() => handleRestaurantPress(item)}
      >
        <Card style={styles.restaurantCardInner}>
          <View style={styles.restaurantImageContainer}>
            <Image source={{ uri: item.image }} style={styles.restaurantImage} />
            
            {!item.isOpen && (
              <View style={styles.restaurantClosedOverlay}>
                <Text style={styles.restaurantClosedText}>Fermé</Text>
              </View>
            )}
            
            <View style={styles.restaurantRating}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.restaurantRatingText}>{item.rating}</Text>
            </View>
          </View>
          
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.restaurantCuisine} numberOfLines={1}>
              {item.cuisine}
            </Text>
            
            <View style={styles.restaurantDetails}>
              <Text style={styles.restaurantTime}>{item.deliveryTime}</Text>
              <Text style={styles.restaurantDistance}>{item.distance}</Text>
            </View>
          </View>
        </Card>
      </Pressable>
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
          {renderCategories()}
          
          {/* Featured Restaurants */}
          {featuredRestaurants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>En vedette</Text>
              <FlatList
                data={featuredRestaurants}
                renderItem={renderFeaturedRestaurant}
                keyExtractor={(item) => `featured-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
                snapToInterval={FEATURED_CARD_WIDTH + 16}
                decelerationRate="fast"
              />
            </View>
          )}
          
          {/* All Restaurants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'Tous les restaurants' : 
               cuisineCategories.find(c => c.id === selectedCategory)?.name || 'Restaurants'}
            </Text>
            
            <FlatList
              data={restaurants}
              renderItem={renderRestaurant}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.restaurantRow}
              contentContainerStyle={styles.restaurantsList}
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 200,
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
    justifyContent: 'space-between',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  categoriesSection: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: 'white',
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#667eea',
  },
  categoryChipText: {
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    paddingVertical: 20,
  },
  featuredList: {
    paddingLeft: 20,
    gap: 16,
  },
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
  },
  featuredCardInner: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  featuredImageContainer: {
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  featuredName: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  featuredCuisine: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  featuredInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  restaurantRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  restaurantsList: {
    paddingBottom: 20,
  },
  restaurantCardContainer: {
    width: RESTAURANT_CARD_WIDTH,
  },
  restaurantCard: {
    flex: 1,
  },
  restaurantCardInner: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  restaurantImageContainer: {
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: 120,
  },
  restaurantClosedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantClosedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  restaurantRating: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  restaurantRatingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  restaurantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantTime: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
  restaurantDistance: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
});
