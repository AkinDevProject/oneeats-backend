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
  Animated as RNAnimated,
  PanGestureHandler,
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
  SlideInUp,
  ZoomIn,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

import { mockRestaurants, cuisineCategories, Restaurant } from '../../src/data/mockData';
import { useAuth } from '../../src/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const HERO_CARD_WIDTH = width * 0.85;
const STORY_CARD_WIDTH = 80;
const CATEGORY_CARD_WIDTH = width * 0.28;
const RESTAURANT_CARD_WIDTH = width * 0.7;

const STORIES = [
  { id: '1', title: 'Nouveautés', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', gradient: ['#667eea', '#764ba2'] },
  { id: '2', title: 'Pizza Party', image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763d51', gradient: ['#f093fb', '#f5576c'] },
  { id: '3', title: 'Healthy', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', gradient: ['#4facfe', '#00f2fe'] },
  { id: '4', title: 'Fast Food', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add', gradient: ['#43e97b', '#38f9d7'] },
  { id: '5', title: 'Desserts', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307', gradient: ['#fa709a', '#fee140'] },
];

const MOOD_CATEGORIES = [
  { id: 'comfort', title: 'Comfort Food', icon: '🍲', color: '#f59e0b' },
  { id: 'fresh', title: 'Fresh & Light', icon: '🥗', color: '#10b981' },
  { id: 'indulgent', title: 'Indulgent', icon: '🍰', color: '#ef4444' },
  { id: 'exotic', title: 'Exotic', icon: '🌶️', color: '#8b5cf6' },
];

export default function RestaurantsDesign3() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('comfort');
  const [refreshing, setRefreshing] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [showWeather, setShowWeather] = useState(true);

  const { user } = useAuth();
  const scrollY = useSharedValue(0);
  const headerHeight = useSharedValue(300);
  const storyProgress = useSharedValue(0);

  useEffect(() => {
    loadData();
    startStoryProgress();
  }, []);

  const loadData = () => {
    setFeaturedRestaurants(mockRestaurants.filter(r => r.featured));
  };

  const startStoryProgress = () => {
    // Auto-advance stories every 3 seconds
    const interval = setInterval(() => {
      setActiveStoryIndex(prev => (prev + 1) % STORIES.length);
    }, 3000);

    return () => clearInterval(interval);
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

  const handleStoryPress = (storyIndex: number) => {
    setActiveStoryIndex(storyIndex);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const scrollHandler = useAnimatedGestureHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 200],
      [1, 0.3]
    );
    
    const scale = interpolate(
      scrollY.value,
      [0, 200],
      [1, 0.8]
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const floatingHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [150, 250],
      [0, 1]
    );

    return {
      opacity,
    };
  });

  const renderWeatherCard = () => {
    if (!showWeather) return null;
    
    return (
      <Animated.View 
        entering={FadeIn.delay(300)}
        style={styles.weatherCard}
      >
        <LinearGradient
          colors={['#fbbf24', '#f59e0b']}
          style={styles.weatherGradient}
        >
          <View style={styles.weatherContent}>
            <View style={styles.weatherLeft}>
              <Text style={styles.weatherTitle}>Parfait pour un repas</Text>
              <Text style={styles.weatherTemp}>22°C ☀️</Text>
            </View>
            <TouchableOpacity 
              style={styles.weatherClose}
              onPress={() => setShowWeather(false)}
            >
              <MaterialIcons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderStories = () => (
    <View style={styles.storiesSection}>
      <Text style={styles.storiesTitle}>Découvrir</Text>
      <FlatList
        data={STORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.storyCard}
            onPress={() => handleStoryPress(index)}
          >
            <LinearGradient
              colors={item.gradient}
              style={styles.storyGradient}
            >
              <Image source={{ uri: item.image }} style={styles.storyImage} />
              <View style={styles.storyOverlay}>
                <Text style={styles.storyTitle}>{item.title}</Text>
              </View>
              {activeStoryIndex === index && (
                <View style={styles.storyIndicator}>
                  <LinearGradient
                    colors={['#ffffff', 'rgba(255,255,255,0.8)']}
                    style={styles.storyIndicatorGradient}
                  />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.storiesList}
      />
    </View>
  );

  const renderMoodSelector = () => (
    <View style={styles.moodSection}>
      <Text style={styles.moodTitle}>Comment vous sentez-vous ?</Text>
      <View style={styles.moodGrid}>
        {MOOD_CATEGORIES.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodCard,
              selectedMood === mood.id && styles.moodCardActive
            ]}
            onPress={() => setSelectedMood(mood.id)}
          >
            <LinearGradient
              colors={selectedMood === mood.id 
                ? [mood.color, `${mood.color}CC`] 
                : ['#ffffff', '#f8fafc']
              }
              style={styles.moodGradient}
            >
              <Text style={styles.moodIcon}>{mood.icon}</Text>
              <Text style={[
                styles.moodText,
                selectedMood === mood.id && styles.moodTextActive
              ]}>
                {mood.title}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderHeroCarousel = () => (
    <View style={styles.heroSection}>
      <FlatList
        data={featuredRestaurants}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={HERO_CARD_WIDTH + 20}
        decelerationRate="fast"
        renderItem={({ item, index }) => (
          <Animated.View entering={SlideInUp.delay(index * 100)}>
            <TouchableOpacity
              style={styles.heroCard}
              onPress={() => handleRestaurantPress(item)}
            >
              <View style={styles.heroImageContainer}>
                <Image source={{ uri: item.image }} style={styles.heroImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.heroOverlay}
                />
                
                {/* Floating Elements */}
                <View style={styles.heroFloatingElements}>
                  <View style={styles.heroRatingBadge}>
                    <MaterialIcons name="star" size={16} color="#fbbf24" />
                    <Text style={styles.heroRating}>{item.rating}</Text>
                  </View>
                  
                  <View style={styles.heroTimeBadge}>
                    <MaterialIcons name="access-time" size={14} color="#10b981" />
                    <Text style={styles.heroTime}>{item.deliveryTime}</Text>
                  </View>
                </View>

                <View style={styles.heroContent}>
                  <View style={styles.heroCuisineBadge}>
                    <Text style={styles.heroCuisineText}>{item.cuisine}</Text>
                  </View>
                  
                  <Text style={styles.heroTitle}>{item.name}</Text>
                  <Text style={styles.heroSubtitle}>{item.description}</Text>
                  
                  <View style={styles.heroActions}>
                    <TouchableOpacity style={styles.heroOrderBtn}>
                      <MaterialIcons name="shopping-cart" size={18} color="white" />
                      <Text style={styles.heroOrderText}>Commander</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.heroFavoriteBtn}>
                      <MaterialIcons name="favorite-border" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
        keyExtractor={(item, index) => `hero-${item.id}-${index}`}
        contentContainerStyle={styles.heroList}
      />
    </View>
  );

  const renderCuisineCarousels = () => (
    <View style={styles.cuisineSection}>
      {cuisineCategories.slice(0, 3).map((category, categoryIndex) => {
        const categoryRestaurants = restaurants.filter(
          r => r.cuisine.toLowerCase() === category.id.toLowerCase()
        );

        if (categoryRestaurants.length === 0) return null;

        return (
          <Animated.View 
            key={category.id}
            entering={FadeIn.delay(categoryIndex * 200)}
            style={styles.cuisineCarousel}
          >
            <View style={styles.cuisineHeader}>
              <View style={styles.cuisineTitleContainer}>
                <Text style={styles.cuisineIcon}>{category.icon}</Text>
                <Text style={styles.cuisineTitle}>{category.name}</Text>
              </View>
              <TouchableOpacity style={styles.seeAllBtn}>
                <Text style={styles.seeAllText}>Voir tout</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#667eea" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={categoryRestaurants}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <Animated.View entering={ZoomIn.delay(index * 50)}>
                  <TouchableOpacity
                    style={styles.cuisineRestaurantCard}
                    onPress={() => handleRestaurantPress(item)}
                  >
                    <View style={styles.cuisineRestaurantImageContainer}>
                      <Image 
                        source={{ uri: item.image }} 
                        style={styles.cuisineRestaurantImage} 
                      />
                      
                      {/* Status Indicator */}
                      <View style={[
                        styles.statusIndicator,
                        { backgroundColor: item.isOpen ? '#10b981' : '#ef4444' }
                      ]}>
                        <View style={styles.statusDot} />
                      </View>
                      
                      {/* Quick Action */}
                      <TouchableOpacity style={styles.quickAddBtn}>
                        <MaterialIcons name="add" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.cuisineRestaurantInfo}>
                      <Text style={styles.cuisineRestaurantName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      
                      <View style={styles.cuisineRestaurantMeta}>
                        <View style={styles.ratingContainer}>
                          <MaterialIcons name="star" size={12} color="#fbbf24" />
                          <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                        <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
                      </View>
                      
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>À partir de 12€</Text>
                        <Text style={styles.deliveryFeeText}>+2.99€ livraison</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )}
              keyExtractor={(item, index) => `${category.id}-${item.id}-${index}`}
              contentContainerStyle={styles.cuisineRestaurantsList}
              snapToInterval={RESTAURANT_CARD_WIDTH + 16}
              decelerationRate="fast"
            />
          </Animated.View>
        );
      })}
    </View>
  );

  const renderFloatingHeader = () => (
    <Animated.View style={[styles.floatingHeader, floatingHeaderStyle]}>
      <BlurView intensity={80} style={styles.floatingHeaderBlur}>
        <View style={styles.floatingHeaderContent}>
          <Text style={styles.floatingHeaderTitle}>Restaurants</Text>
          <TouchableOpacity style={styles.floatingSearchBtn}>
            <MaterialIcons name="search" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );

  const renderMainHeader = () => (
    <Animated.View style={[styles.mainHeader, headerAnimatedStyle]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  style={styles.avatar}
                >
                  <MaterialIcons name="person" size={28} color="white" />
                </LinearGradient>
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.welcomeText}>Salut {user?.name?.split(' ')[0] || 'Ami'} 👋</Text>
                <Text style={styles.locationText}>📍 Paris, France</Text>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationBtn}>
                <MaterialIcons name="notifications" size={24} color="white" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#9ca3af" />
            <Text style={styles.searchPlaceholder}>Que voulez-vous manger ?</Text>
            <MaterialIcons name="tune" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {renderMainHeader()}
      {renderFloatingHeader()}
      
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          {renderWeatherCard()}
          {renderStories()}
          {renderMoodSelector()}
          {renderHeroCarousel()}
          {renderCuisineCarousels()}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  mainHeader: {
    height: 160,
    zIndex: 1000,
  },
  headerGradient: {
    flex: 1,
    paddingTop: 10,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '500',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 999,
  },
  floatingHeaderBlur: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  floatingHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  floatingHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  floatingSearchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  weatherCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  weatherGradient: {
    padding: 16,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherLeft: {
    flex: 1,
  },
  weatherTitle: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    marginBottom: 4,
  },
  weatherTemp: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
  },
  weatherClose: {
    padding: 4,
  },
  storiesSection: {
    paddingVertical: 24,
  },
  storiesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  storiesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  storyCard: {
    width: STORY_CARD_WIDTH,
    height: STORY_CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  storyGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  storyOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  storyTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  storyIndicator: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  storyIndicatorGradient: {
    flex: 1,
  },
  moodSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  moodTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  moodCard: {
    width: CATEGORY_CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  moodCardActive: {
    elevation: 4,
  },
  moodGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  moodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
  },
  moodTextActive: {
    color: 'white',
  },
  heroSection: {
    paddingVertical: 24,
  },
  heroList: {
    paddingHorizontal: 16,
    gap: 20,
  },
  heroCard: {
    width: HERO_CARD_WIDTH,
  },
  heroImageContainer: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroFloatingElements: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  heroRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  heroTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  heroTime: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  heroContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroCuisineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  heroCuisineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
  },
  heroOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flex: 1,
  },
  heroOrderText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  heroFavoriteBtn: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cuisineSection: {
    paddingBottom: 20,
  },
  cuisineCarousel: {
    marginBottom: 32,
  },
  cuisineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cuisineTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cuisineIcon: {
    fontSize: 20,
  },
  cuisineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  cuisineRestaurantsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  cuisineRestaurantCard: {
    width: RESTAURANT_CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cuisineRestaurantImageContainer: {
    height: 160,
    position: 'relative',
  },
  cuisineRestaurantImage: {
    width: '100%',
    height: '100%',
  },
  statusIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  quickAddBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    backgroundColor: '#667eea',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cuisineRestaurantInfo: {
    padding: 16,
  },
  cuisineRestaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  cuisineRestaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  deliveryTime: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  deliveryFeeText: {
    fontSize: 12,
    color: '#6b7280',
  },
});