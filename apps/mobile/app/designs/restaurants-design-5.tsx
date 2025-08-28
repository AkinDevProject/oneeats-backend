import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  ScrollView,
  Modal,
  SectionList,
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
  SlideInLeft,
  ZoomIn,
  BounceIn,
} from 'react-native-reanimated';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

import { mockRestaurants, cuisineCategories, Restaurant } from '../../src/data/mockData';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCart } from '../../src/contexts/CartContext';

const { width, height } = Dimensions.get('window');

// McDonald's colors with modern touches
const THEME = {
  primary: '#ffcc02', // McDonald's yellow
  secondary: '#da020e', // McDonald's red
  success: '#27ae60',
  background: '#f8f9fb',
  cardBg: '#ffffff',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  accent: '#3498db',
  warning: '#f39c12',
};

const QUICK_FILTERS = [
  { id: 'popular', label: 'Populaire', icon: 'local-fire-department', color: THEME.secondary },
  { id: 'nearby', label: 'Près de moi', icon: 'location-on', color: THEME.accent },
  { id: 'fast', label: 'Rapide', icon: 'flash-on', color: THEME.success },
  { id: 'offers', label: 'Promotions', icon: 'local-offer', color: THEME.primary },
];

const TRENDING_SEARCHES = [
  { term: 'Pizza Margherita', count: '2.3k recherches' },
  { term: 'Burger Classique', count: '1.8k recherches' },
  { term: 'Sushi Saumon', count: '1.5k recherches' },
  { term: 'Pad Thaï', count: '1.2k recherches' },
];

export default function RestaurantsDesign5() {
  const [sectionsData, setSectionsData] = useState<any[]>([]);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('popular');
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [showProgress, setShowProgress] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);

  const { user } = useAuth();
  const { totalItems, totalPrice } = useCart();

  const sectionListRef = useRef<SectionList>(null);
  const progressOpacity = useSharedValue(1);
  const welcomeScale = useSharedValue(0);
  const floatingNavOffset = useSharedValue(0);

  useEffect(() => {
    organizeBySections();
    
    // Welcome animation
    welcomeScale.value = withSpring(1);
    
    // Auto-dismiss welcome after 4s
    const timer = setTimeout(() => {
      setShowWelcome(false);
      setShowProgress(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [selectedQuickFilter]);

  useEffect(() => {
    if (showProgress) {
      progressOpacity.value = withTiming(1);
      // Auto-hide progress after 8s
      setTimeout(() => {
        progressOpacity.value = withTiming(0);
        setShowProgress(false);
      }, 8000);
    }
  }, [showProgress]);

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
    
    // Add featured section (McDonald's style highlight)
    const featuredRestaurants = filteredRestaurants.filter(r => r.featured);
    if (featuredRestaurants.length > 0) {
      sections.push({
        title: '🔥 Recommandés pour vous',
        subtitle: 'Les favorites du moment',
        data: [{ type: 'featured', restaurants: featuredRestaurants }],
        type: 'featured',
        color: THEME.secondary
      });
    }

    // Add trending section (kiosk style)
    sections.push({
      title: '📈 Tendances',
      subtitle: 'Ce que les autres commandent',
      data: [{ type: 'trending', searches: TRENDING_SEARCHES }],
      type: 'trending',
      color: THEME.primary
    });

    // Group by cuisine (organized list style)
    const cuisineGroups = cuisineCategories.reduce((acc: any, category) => {
      const categoryRestaurants = filteredRestaurants.filter(
        r => r.cuisine.toLowerCase() === category.id.toLowerCase()
      );
      
      if (categoryRestaurants.length > 0) {
        acc.push({
          title: `${category.icon} ${category.name}`,
          subtitle: `${categoryRestaurants.length} restaurants disponibles`,
          data: categoryRestaurants,
          type: 'cuisine',
          color: THEME.accent
        });
      }
      return acc;
    }, []);

    setSectionsData([...sections, ...cuisineGroups]);
  };

  const handleQuickFilterChange = (filterId: string) => {
    setSelectedQuickFilter(filterId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Show progress again when filter changes
    setShowProgress(true);
    progressOpacity.value = withTiming(1);
  };

  const scrollToSection = (index: number) => {
    setCurrentSection(index);
    sectionListRef.current?.scrollToLocation({
      sectionIndex: index,
      itemIndex: 0,
      animated: true,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push(`/restaurant/${restaurant.id}` as any);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
    transform: [{ translateY: interpolate(progressOpacity.value, [0, 1], [-50, 0]) }],
  }));

  const welcomeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: welcomeScale.value }],
    opacity: welcomeScale.value,
  }));

  const renderWelcomeModal = () => (
    <Modal
      visible={showWelcome}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.welcomeOverlay}>
        <Animated.View style={[styles.welcomeModal, welcomeAnimatedStyle]}>
          <LinearGradient
            colors={[THEME.primary, '#fff8dc', 'white']}
            style={styles.welcomeGradient}
          >
            <View style={styles.welcomeContent}>
              {/* McDonald's style branding */}
              <Animated.View entering={BounceIn.delay(300)} style={styles.welcomeIcon}>
                <LinearGradient
                  colors={[THEME.secondary, '#ff6b6b']}
                  style={styles.welcomeIconGradient}
                >
                  <FontAwesome5 name="hamburger" size={40} color="white" />
                </LinearGradient>
              </Animated.View>
              
              <Text style={styles.welcomeTitle}>Bienvenue chez OneEats !</Text>
              <Text style={styles.welcomeSubtitle}>
                Découvrez et commandez vos plats préférés en quelques clics
              </Text>
              
              {/* Features with kiosk style */}
              <View style={styles.welcomeFeatures}>
                <View style={styles.welcomeFeature}>
                  <View style={[styles.featureIcon, { backgroundColor: THEME.success }]}>
                    <MaterialIcons name="flash-on" size={16} color="white" />
                  </View>
                  <Text style={styles.welcomeFeatureText}>Commande express</Text>
                </View>
                <View style={styles.welcomeFeature}>
                  <View style={[styles.featureIcon, { backgroundColor: THEME.accent }]}>
                    <MaterialIcons name="restaurant" size={16} color="white" />
                  </View>
                  <Text style={styles.welcomeFeatureText}>500+ restaurants</Text>
                </View>
                <View style={styles.welcomeFeature}>
                  <View style={[styles.featureIcon, { backgroundColor: THEME.warning }]}>
                    <MaterialIcons name="delivery-dining" size={16} color="white" />
                  </View>
                  <Text style={styles.welcomeFeatureText}>Livraison 25min</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderProgressHeader = () => (
    <Animated.View style={[styles.progressHeader, progressAnimatedStyle]}>
      <LinearGradient
        colors={[THEME.primary, '#fff8dc']}
        style={styles.progressGradient}
      >
        <View style={styles.progressContent}>
          <View style={styles.progressInfo}>
            <MaterialIcons name="explore" size={20} color={THEME.text} />
            <Text style={styles.progressText}>
              Explorez • {sectionsData.length} sections • {restaurants.length} restaurants
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.progressClose}
            onPress={() => {
              progressOpacity.value = withTiming(0);
              setShowProgress(false);
            }}
          >
            <MaterialIcons name="close" size={18} color={THEME.textLight} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderFloatingNavigation = () => (
    <View style={styles.floatingNav}>
      <BlurView intensity={80} style={styles.floatingNavBlur}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.floatingNavContent}
        >
          {sectionsData.map((section, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.floatingNavItem,
                currentSection === index && styles.floatingNavItemActive
              ]}
              onPress={() => scrollToSection(index)}
            >
              <Text style={[
                styles.floatingNavText,
                currentSection === index && styles.floatingNavTextActive
              ]}>
                {section.title.replace(/[🔥📈🍕🍔🍜🥗🍰☕]/g, '').trim()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BlurView>
    </View>
  );

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
              { 
                backgroundColor: selectedQuickFilter === filter.id ? filter.color : 'white',
                borderColor: filter.color
              }
            ]}
            onPress={() => handleQuickFilterChange(filter.id)}
          >
            <MaterialIcons 
              name={filter.icon as any} 
              size={18} 
              color={selectedQuickFilter === filter.id ? 'white' : filter.color} 
            />
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
          <Animated.View entering={SlideInRight.delay(index * 100)}>
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => handleRestaurantPress(item)}
            >
              <LinearGradient
                colors={[THEME.secondary, '#ff6b6b']}
                style={styles.featuredGradient}
              >
                <Image source={{ uri: item.image }} style={styles.featuredImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.featuredOverlay}
                >
                  <View style={styles.featuredContent}>
                    {/* Kiosk-style rating badge */}
                    <View style={styles.featuredBadge}>
                      <MaterialIcons name="star" size={16} color={THEME.primary} />
                      <Text style={styles.featuredRating}>{item.rating}</Text>
                    </View>
                    
                    <Text style={styles.featuredName}>{item.name}</Text>
                    <Text style={styles.featuredCuisine}>{item.cuisine}</Text>
                    
                    <View style={styles.featuredInfo}>
                      <View style={styles.featuredInfoItem}>
                        <MaterialIcons name="access-time" size={14} color="white" />
                        <Text style={styles.featuredInfoText}>{item.deliveryTime}</Text>
                      </View>
                      <View style={styles.featuredInfoItem}>
                        <MaterialIcons name="location-on" size={14} color="white" />
                        <Text style={styles.featuredInfoText}>{item.distance}</Text>
                      </View>
                    </View>
                    
                    {/* McDonald's style order button */}
                    <TouchableOpacity style={styles.featuredOrderBtn}>
                      <LinearGradient
                        colors={[THEME.primary, '#fff8dc']}
                        style={styles.featuredOrderGradient}
                      >
                        <MaterialIcons name="add-shopping-cart" size={16} color={THEME.text} />
                        <Text style={styles.featuredOrderText}>Commander</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
        keyExtractor={(item, index) => `featured-${item.id}-${index}`}
        contentContainerStyle={styles.featuredList}
        snapToInterval={width * 0.8 + 16}
        decelerationRate="fast"
      />
    </View>
  );

  const renderTrendingSearches = ({ searches }: { searches: any[] }) => (
    <View style={styles.trendingContainer}>
      <View style={styles.trendingGrid}>
        {searches.map((search, index) => (
          <Animated.View 
            key={index}
            entering={FadeIn.delay(index * 100)}
            style={styles.trendingItem}
          >
            <TouchableOpacity style={styles.trendingCard}>
              <LinearGradient
                colors={['white', '#f8f9fa']}
                style={styles.trendingGradient}
              >
                <View style={styles.trendingIcon}>
                  <MaterialIcons name="trending-up" size={20} color={THEME.success} />
                </View>
                <Text style={styles.trendingTerm}>{search.term}</Text>
                <Text style={styles.trendingCount}>{search.count}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderRestaurantItem = ({ item, index }: { item: Restaurant; index: number }) => (
    <Animated.View entering={SlideInLeft.delay(index * 50)}>
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => handleRestaurantPress(item)}
      >
        <LinearGradient
          colors={['white', '#f8fafc']}
          style={styles.restaurantGradient}
        >
          <View style={styles.restaurantImageContainer}>
            <Image source={{ uri: item.image }} style={styles.restaurantImage} />
            
            {/* McDonald's style status indicator */}
            <View style={[
              styles.statusIndicator,
              { backgroundColor: item.isOpen ? THEME.success : THEME.warning }
            ]}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {item.isOpen ? 'OUVERT' : 'FERMÉ'}
              </Text>
            </View>
            
            {/* Quick add button (kiosk style) */}
            <TouchableOpacity style={styles.quickAddBtn}>
              <LinearGradient
                colors={[THEME.primary, '#fff8dc']}
                style={styles.quickAddGradient}
              >
                <MaterialIcons name="add" size={18} color={THEME.text} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.restaurantInfo}>
            <View style={styles.restaurantHeader}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={16} color={THEME.primary} />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
            
            <Text style={styles.restaurantCuisine}>{item.cuisine}</Text>
            
            <View style={styles.restaurantMeta}>
              <View style={styles.metaItem}>
                <MaterialIcons name="access-time" size={14} color={THEME.textLight} />
                <Text style={styles.metaText}>{item.deliveryTime}</Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="location-on" size={14} color={THEME.textLight} />
                <Text style={styles.metaText}>{item.distance}</Text>
              </View>
            </View>
            
            <View style={styles.restaurantFooter}>
              <View style={styles.deliveryInfo}>
                <MaterialIcons name="delivery-dining" size={14} color={THEME.success} />
                <Text style={styles.deliveryFee}>Livraison 2.99€</Text>
              </View>
              <TouchableOpacity style={styles.favoriteBtn}>
                <MaterialIcons name="favorite-border" size={18} color={THEME.secondary} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeader}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(248,249,250,0.95)']}
        style={styles.sectionHeaderGradient}
      >
        <View style={styles.sectionHeaderContent}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
          </View>
          
          {section.type === 'cuisine' && (
            <View style={styles.sectionCount}>
              <Text style={styles.sectionCountText}>
                {section.data.length}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const renderSectionItem = ({ item, index, section }: { item: any; index: number; section: any }) => {
    if (section.type === 'featured') {
      return renderFeaturedRestaurants(item);
    }
    if (section.type === 'trending') {
      return renderTrendingSearches(item);
    }
    return renderRestaurantItem({ item, index });
  };

  const renderMainHeader = () => (
    <View style={styles.mainHeader}>
      <LinearGradient
        colors={[THEME.primary, '#fff8dc', 'white']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[THEME.secondary, '#ff6b6b']}
                  style={styles.avatar}
                >
                  <MaterialIcons name="person" size={24} color="white" />
                </LinearGradient>
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>
                  Salut {user?.name?.split(' ')[0] || 'Ami'} ! 👋
                </Text>
                <Text style={styles.location}>📍 Près de vous</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.helpButton}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.helpGradient}
              >
                <MaterialIcons name="help-outline" size={20} color={THEME.text} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderBottomCart = () => {
    if (totalItems === 0) return null;
    
    return (
      <View style={styles.bottomCart}>
        <LinearGradient
          colors={[THEME.secondary, '#ff6b6b']}
          style={styles.cartGradient}
        >
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <View style={styles.cartLeft}>
              <MaterialIcons name="shopping-cart" size={20} color="white" />
              <Text style={styles.cartText}>
                {totalItems} article{totalItems > 1 ? 's' : ''}
              </Text>
            </View>
            
            <View style={styles.cartRight}>
              <Text style={styles.cartPrice}>{totalPrice.toFixed(2)} €</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={THEME.background} />
      
      {renderWelcomeModal()}
      {renderMainHeader()}
      {showProgress && renderProgressHeader()}
      {renderFloatingNavigation()}
      
      <View style={styles.content}>
        {renderQuickFilters()}
        
        <SectionList
          ref={sectionListRef}
          sections={sectionsData}
          renderItem={renderSectionItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item, index) => `${item.id || 'section'}-${index}`}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          onViewableItemsChanged={({ viewableItems }) => {
            if (viewableItems.length > 0) {
              const sectionIndex = viewableItems[0].section ? 
                sectionsData.findIndex(s => s === viewableItems[0].section) : 0;
              setCurrentSection(Math.max(0, sectionIndex));
            }
          }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[THEME.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      </View>
      
      {renderBottomCart()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  
  // Welcome Modal (McDonald's style)
  welcomeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeModal: {
    width: '90%',
    maxWidth: 380,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  welcomeGradient: {
    padding: 32,
    alignItems: 'center',
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeIcon: {
    marginBottom: 16,
  },
  welcomeIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: THEME.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  welcomeFeatures: {
    alignItems: 'center',
    gap: 12,
  },
  welcomeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeFeatureText: {
    fontSize: 14,
    color: THEME.text,
    fontWeight: '600',
  },
  
  // Main Header (Kiosk style)
  mainHeader: {
    height: 100,
  },
  headerGradient: {
    flex: 1,
    paddingTop: 10,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
    color: THEME.textLight,
    fontWeight: '500',
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  helpGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Progress Header (McDonald's feedback style)
  progressHeader: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  progressGradient: {
    padding: 12,
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.text,
    flex: 1,
  },
  progressClose: {
    padding: 4,
  },
  
  // Floating Navigation (Organized list style)
  floatingNav: {
    height: 50,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  floatingNavBlur: {
    flex: 1,
  },
  floatingNavContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    height: 50,
    gap: 8,
  },
  floatingNavItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
  },
  floatingNavItemActive: {
    backgroundColor: THEME.primary,
  },
  floatingNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
  },
  floatingNavTextActive: {
    color: THEME.text,
  },
  
  // Content
  content: {
    flex: 1,
    marginTop: 8,
  },
  
  // Quick Filters (McDonald's style)
  quickFiltersSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  quickFiltersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 12,
  },
  quickFiltersContainer: {
    gap: 12,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    gap: 8,
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Section Headers
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  sectionHeaderGradient: {
    padding: 16,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: THEME.textLight,
    fontWeight: '500',
  },
  sectionCount: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.text,
  },
  
  // Featured Restaurants
  featuredContainer: {
    paddingVertical: 8,
  },
  featuredList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  featuredCard: {
    width: width * 0.8,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  featuredGradient: {
    flex: 1,
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
    fontWeight: '700',
    color: THEME.text,
  },
  featuredName: {
    fontSize: 18,
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
    marginBottom: 12,
  },
  featuredInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredInfoText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '500',
  },
  featuredOrderBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuredOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  featuredOrderText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
  },
  
  // Trending Section
  trendingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  trendingItem: {
    width: (width - 56) / 2,
  },
  trendingCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  trendingGradient: {
    padding: 12,
    alignItems: 'center',
    minHeight: 80,
  },
  trendingIcon: {
    marginBottom: 8,
  },
  trendingTerm: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  trendingCount: {
    fontSize: 11,
    color: THEME.textLight,
    textAlign: 'center',
  },
  
  // Restaurant Cards (List organized style)
  restaurantCard: {
    marginHorizontal: 16,
    marginVertical: 8,
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
  statusIndicator: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
  },
  statusText: {
    fontSize: 8,
    color: 'white',
    fontWeight: '700',
  },
  quickAddBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickAddGradient: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantInfo: {
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
    color: THEME.text,
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
    color: THEME.text,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: THEME.textLight,
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
    color: THEME.textLight,
    fontWeight: '500',
  },
  restaurantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryFee: {
    fontSize: 12,
    color: THEME.success,
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
  
  // Bottom Cart (McDonald's style)
  bottomCart: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: THEME.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cartGradient: {
    padding: 16,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  cartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  
  // List Content
  listContent: {
    paddingBottom: 120,
  },
});