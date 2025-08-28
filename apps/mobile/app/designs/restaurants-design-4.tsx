import React, { useState, useEffect } from 'react';
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
  SlideInRight,
  ZoomIn,
  BounceIn,
} from 'react-native-reanimated';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

import { mockRestaurants, cuisineCategories, Restaurant } from '../../src/data/mockData';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCart } from '../../src/contexts/CartContext';

const { width, height } = Dimensions.get('window');

const KIOSK_COLORS = {
  primary: '#ffcc02', // McDonald's yellow
  secondary: '#da020e', // McDonald's red
  background: '#f5f5f5',
  cardBg: '#ffffff',
  text: '#292b2c',
  textLight: '#6c757d',
  success: '#27ae60',
  warning: '#f39c12',
};

const ORDER_STEPS = [
  { id: 'restaurant', title: 'Choisir Restaurant', icon: 'restaurant', completed: false },
  { id: 'menu', title: 'Sélectionner Plats', icon: 'restaurant-menu', completed: false },
  { id: 'review', title: 'Valider Commande', icon: 'receipt', completed: false },
  { id: 'payment', title: 'Paiement', icon: 'payment', completed: false },
];

const RESTAURANT_CATEGORIES = [
  { 
    id: 'fast-food', 
    name: 'Fast Food', 
    icon: '🍔', 
    color: '#e74c3c',
    restaurants: ['McDonald\'s', 'Burger King', 'KFC']
  },
  { 
    id: 'pizza', 
    name: 'Pizzas', 
    icon: '🍕', 
    color: '#e67e22',
    restaurants: ['Domino\'s', 'Pizza Hut', 'Papa John\'s']
  },
  { 
    id: 'asian', 
    name: 'Asiatique', 
    icon: '🍜', 
    color: '#f39c12',
    restaurants: ['Panda Express', 'Wok to Walk', 'Sushi Shop']
  },
  { 
    id: 'healthy', 
    name: 'Healthy', 
    icon: '🥗', 
    color: '#27ae60',
    restaurants: ['Sweetgreen', 'Chipotle', 'Subway']
  },
  { 
    id: 'dessert', 
    name: 'Desserts', 
    icon: '🍰', 
    color: '#9b59b6',
    restaurants: ['Häagen-Dazs', 'Ben & Jerry\'s', 'Cold Stone']
  },
  { 
    id: 'coffee', 
    name: 'Café', 
    icon: '☕', 
    color: '#795548',
    restaurants: ['Starbucks', 'Costa Coffee', 'Tim Hortons']
  },
];

export default function RestaurantsDesign4() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [showWelcome, setShowWelcome] = useState(true);
  const [orderProgress, setOrderProgress] = useState(ORDER_STEPS);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();
  const { totalItems, totalPrice } = useCart();

  const pulseAnimation = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    // Welcome screen auto-dismiss
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Animate progress bar
    progressWidth.value = withTiming((currentStep / ORDER_STEPS.length) * 100);
    
    // Pulse animation for current step
    pulseAnimation.value = withSpring(1.1, { damping: 2 }, () => {
      pulseAnimation.value = withSpring(1);
    });
  }, [currentStep]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Filter restaurants by category
    const filtered = mockRestaurants.filter(restaurant => {
      const category = RESTAURANT_CATEGORIES.find(cat => cat.id === categoryId);
      return category?.restaurants.some(name => 
        restaurant.name.toLowerCase().includes(name.toLowerCase().split(' ')[0])
      );
    });
    
    setRestaurants(filtered.length > 0 ? filtered : mockRestaurants.slice(0, 6));
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentStep(1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Update progress
    const updatedSteps = [...orderProgress];
    updatedSteps[0].completed = true;
    setOrderProgress(updatedSteps);
    
    // Navigate to restaurant menu
    router.push(`/restaurant/${restaurant.id}` as any);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const renderWelcomeModal = () => (
    <Modal
      visible={showWelcome}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.welcomeOverlay}>
        <Animated.View 
          entering={ZoomIn.duration(600)}
          style={styles.welcomeModal}
        >
          <LinearGradient
            colors={[KIOSK_COLORS.primary, '#fff8dc']}
            style={styles.welcomeGradient}
          >
            <View style={styles.welcomeContent}>
              <Animated.View entering={BounceIn.delay(300)}>
                <FontAwesome5 name="utensils" size={64} color={KIOSK_COLORS.secondary} />
              </Animated.View>
              
              <Text style={styles.welcomeTitle}>Bienvenue chez OneEats !</Text>
              <Text style={styles.welcomeSubtitle}>
                Commandez facilement vos plats préférés
              </Text>
              
              <View style={styles.welcomeFeatures}>
                <View style={styles.welcomeFeature}>
                  <MaterialIcons name="flash-on" size={20} color={KIOSK_COLORS.success} />
                  <Text style={styles.welcomeFeatureText}>Commande rapide</Text>
                </View>
                <View style={styles.welcomeFeature}>
                  <MaterialIcons name="payment" size={20} color={KIOSK_COLORS.success} />
                  <Text style={styles.welcomeFeatureText}>Paiement sécurisé</Text>
                </View>
                <View style={styles.welcomeFeature}>
                  <MaterialIcons name="delivery-dining" size={20} color={KIOSK_COLORS.success} />
                  <Text style={styles.welcomeFeatureText}>Livraison rapide</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => setShowWelcome(false)}
              >
                <LinearGradient
                  colors={[KIOSK_COLORS.secondary, '#ff6b6b']}
                  style={styles.startButtonGradient}
                >
                  <Text style={styles.startButtonText}>Commencer ma commande</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressTitle}>Étape {currentStep + 1} sur {ORDER_STEPS.length}</Text>
      
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
      </View>
      
      <View style={styles.progressSteps}>
        {ORDER_STEPS.map((step, index) => (
          <Animated.View
            key={step.id}
            style={[
              styles.progressStep,
              index === currentStep && pulseAnimatedStyle,
              {
                backgroundColor: index <= currentStep ? KIOSK_COLORS.success : '#e9ecef',
              }
            ]}
          >
            <MaterialIcons 
              name={step.icon as any} 
              size={16} 
              color={index <= currentStep ? 'white' : KIOSK_COLORS.textLight} 
            />
          </Animated.View>
        ))}
      </View>
      
      <Text style={styles.currentStepText}>
        {ORDER_STEPS[currentStep]?.title}
      </Text>
    </View>
  );

  const renderTopBanner = () => (
    <View style={styles.topBanner}>
      <LinearGradient
        colors={[KIOSK_COLORS.primary, '#fff8dc']}
        style={styles.bannerGradient}
      >
        <View style={styles.bannerContent}>
          <View style={styles.bannerLeft}>
            <FontAwesome5 name="fire" size={16} color={KIOSK_COLORS.secondary} />
            <Text style={styles.bannerText}>Offre spéciale : -20% sur votre première commande !</Text>
          </View>
          <TouchableOpacity style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>Profiter</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderCategoryGrid = () => (
    <View style={styles.categorySection}>
      <Text style={styles.sectionTitle}>Que souhaitez-vous manger ?</Text>
      <Text style={styles.sectionSubtitle}>Choisissez une catégorie pour commencer</Text>
      
      <View style={styles.categoryGrid}>
        {RESTAURANT_CATEGORIES.map((category, index) => (
          <Animated.View 
            key={category.id}
            entering={FadeIn.delay(index * 100)}
          >
            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardSelected,
                { borderColor: category.color }
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <LinearGradient
                colors={
                  selectedCategory === category.id 
                    ? [category.color, `${category.color}CC`]
                    : ['#ffffff', '#f8f9fa']
                }
                style={styles.categoryGradient}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === category.id && styles.categoryNameSelected
                ]}>
                  {category.name}
                </Text>
                <Text style={[
                  styles.categoryCount,
                  selectedCategory === category.id && styles.categoryCountSelected
                ]}>
                  {category.restaurants.length} restaurants
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderRestaurantsGrid = () => {
    if (!selectedCategory) return null;

    return (
      <View style={styles.restaurantsSection}>
        <Text style={styles.sectionTitle}>Restaurants disponibles</Text>
        
        <FlatList
          data={restaurants}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View 
              entering={SlideInRight.delay(index * 100)}
              style={styles.restaurantCardContainer}
            >
              <TouchableOpacity
                style={styles.restaurantCard}
                onPress={() => handleRestaurantSelect(item)}
              >
                <View style={styles.restaurantImageContainer}>
                  <Image source={{ uri: item.image }} style={styles.restaurantImage} />
                  
                  {/* Status Badge */}
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.isOpen ? KIOSK_COLORS.success : KIOSK_COLORS.warning }
                  ]}>
                    <MaterialIcons 
                      name={item.isOpen ? "access-time" : "schedule"} 
                      size={12} 
                      color="white" 
                    />
                    <Text style={styles.statusText}>
                      {item.isOpen ? 'Ouvert' : 'Fermé'}
                    </Text>
                  </View>
                  
                  {/* Quick Order Button */}
                  <TouchableOpacity style={styles.quickOrderBtn}>
                    <LinearGradient
                      colors={[KIOSK_COLORS.secondary, '#ff6b6b']}
                      style={styles.quickOrderGradient}
                    >
                      <MaterialIcons name="add-shopping-cart" size={16} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  
                  <View style={styles.restaurantMeta}>
                    <View style={styles.ratingContainer}>
                      <MaterialIcons name="star" size={14} color={KIOSK_COLORS.primary} />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
                  </View>
                  
                  <View style={styles.restaurantFooter}>
                    <Text style={styles.cuisineType}>{item.cuisine}</Text>
                    <View style={styles.deliveryInfo}>
                      <MaterialIcons name="delivery-dining" size={12} color={KIOSK_COLORS.success} />
                      <Text style={styles.deliveryFee}>2,99€</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
          keyExtractor={(item, index) => `restaurant-${item.id}-${index}`}
          columnWrapperStyle={styles.restaurantRow}
          contentContainerStyle={styles.restaurantsList}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[KIOSK_COLORS.primary]}
            />
          }
        />
      </View>
    );
  };

  const renderBottomActions = () => (
    <View style={styles.bottomActions}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(248,249,250,0.98)']}
        style={styles.bottomGradient}
      >
        <View style={styles.actionsContent}>
          {/* Cart Summary */}
          {totalItems > 0 && (
            <TouchableOpacity 
              style={styles.cartSummary}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <View style={styles.cartInfo}>
                <MaterialIcons name="shopping-cart" size={20} color={KIOSK_COLORS.text} />
                <Text style={styles.cartText}>
                  {totalItems} article{totalItems > 1 ? 's' : ''} • {totalPrice.toFixed(2)}€
                </Text>
              </View>
              <MaterialIcons name="arrow-forward" size={20} color={KIOSK_COLORS.text} />
            </TouchableOpacity>
          )}
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {currentStep > 0 && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
              >
                <MaterialIcons name="arrow-back" size={20} color={KIOSK_COLORS.text} />
                <Text style={styles.backButtonText}>Retour</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.helpButton}>
              <MaterialIcons name="help" size={20} color={KIOSK_COLORS.primary} />
              <Text style={styles.helpButtonText}>Aide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={KIOSK_COLORS.background} />
      
      {renderWelcomeModal()}
      {renderTopBanner()}
      {renderProgressBar()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCategoryGrid()}
        {renderRestaurantsGrid()}
      </ScrollView>
      
      {renderBottomActions()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KIOSK_COLORS.background,
  },
  
  // Welcome Modal
  welcomeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeModal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
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
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: KIOSK_COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: KIOSK_COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  welcomeFeatures: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  welcomeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  welcomeFeatureText: {
    fontSize: 14,
    color: KIOSK_COLORS.text,
    fontWeight: '500',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: KIOSK_COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  
  // Top Banner
  topBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  bannerGradient: {
    padding: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: KIOSK_COLORS.text,
    flex: 1,
  },
  bannerButton: {
    backgroundColor: KIOSK_COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bannerButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  
  // Progress Bar
  progressContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: KIOSK_COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: KIOSK_COLORS.success,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: KIOSK_COLORS.textLight,
    textAlign: 'center',
  },
  
  // Main Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  
  // Category Section
  categorySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: KIOSK_COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: KIOSK_COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
  },
  categoryCardSelected: {
    elevation: 6,
    shadowOpacity: 0.2,
  },
  categoryGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: KIOSK_COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: 'white',
  },
  categoryCount: {
    fontSize: 12,
    color: KIOSK_COLORS.textLight,
    fontWeight: '500',
  },
  categoryCountSelected: {
    color: 'rgba(255,255,255,0.9)',
  },
  
  // Restaurants Section
  restaurantsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  restaurantsList: {
    paddingTop: 16,
  },
  restaurantRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  restaurantCardContainer: {
    width: (width - 52) / 2,
  },
  restaurantCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  restaurantImageContainer: {
    height: 120,
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  quickOrderBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickOrderGradient: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '700',
    color: KIOSK_COLORS.text,
    marginBottom: 6,
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: KIOSK_COLORS.text,
  },
  deliveryTime: {
    fontSize: 12,
    color: KIOSK_COLORS.textLight,
    fontWeight: '500',
  },
  restaurantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cuisineType: {
    fontSize: 11,
    color: KIOSK_COLORS.textLight,
    fontWeight: '500',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  deliveryFee: {
    fontSize: 11,
    color: KIOSK_COLORS.success,
    fontWeight: '600',
  },
  
  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 120,
  },
  bottomGradient: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  actionsContent: {
    gap: 12,
  },
  cartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartText: {
    fontSize: 14,
    fontWeight: '600',
    color: KIOSK_COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: KIOSK_COLORS.text,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: KIOSK_COLORS.primary,
    minWidth: 80,
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: KIOSK_COLORS.primary,
  },
});