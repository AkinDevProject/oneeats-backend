import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  Text,
  Surface,
  Card,
  Button,
  Chip,
  Badge,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../src/contexts/CartContext';
import { mockRestaurants, mockMenuItems, MenuItem, Restaurant, CartItemOption } from '../../src/data/mockData';
import { MenuItemOptions } from '../../components/MenuItemOptions';
import RNAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

const RestaurantDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem, getItemQuantity } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [restaurantMenu, setRestaurantMenu] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customizations, setCustomizations] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<CartItemOption[]>([]);
  const [quantity, setQuantity] = useState(1);

  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const cartButtonScale = useSharedValue(1);

  useEffect(() => {
    if (id) {
      const foundRestaurant = mockRestaurants.find((r) => r.id === id);
      if (foundRestaurant) {
        setRestaurant(foundRestaurant);
        const menu = mockMenuItems.filter((item) => item.restaurantId === id);
        setRestaurantMenu(menu);
      }
    }
  }, [id]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      headerOpacity.value = interpolate(
        scrollY.value,
        [0, HEADER_HEIGHT - 100],
        [1, 0]
      );
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HEADER_HEIGHT],
          [0, -HEADER_HEIGHT / 2]
        ),
      },
    ],
  }));

  const topBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HEADER_HEIGHT - 100], [0, 1]),
  }));

  const cartButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartButtonScale.value }],
  }));

  const categories = ['all', ...Array.from(new Set(restaurantMenu.map((item) => item.category)))];

  const filteredMenu = selectedCategory === 'all'
    ? restaurantMenu
    : restaurantMenu.filter((item) => item.category === selectedCategory);

  const totalCartItems = restaurantMenu.reduce((total, item) => {
    return total + getItemQuantity(item.id);
  }, 0);

  const handleAddToCart = (item: MenuItem) => {
    cartButtonScale.value = withSpring(1.2, { duration: 150 }, () => {
      cartButtonScale.value = withSpring(1);
    });
    addItem(item);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Catégories simplifiées pour MVP
  const MENU_CATEGORIES = [
    { name: 'Entrées', icon: 'restaurant-menu' },
    { name: 'Plats', icon: 'dining' },
    { name: 'Desserts', icon: 'cake' },
    { name: 'Boissons', icon: 'local-drink' },
  ];

  const getMenuBySection = () => {
    const sections = [];
    
    // Popular items section
    const popularItems = restaurantMenu.filter(item => item.isPopular);
    if (popularItems.length > 0) {
      sections.push({
        title: "⭐ Les plus populaires",
        subtitle: "Les plats préférés de nos clients",
        data: popularItems
      });
    }

    // Group by category
    categories.filter(cat => cat !== 'all').forEach(category => {
      const categoryItems = restaurantMenu.filter(item => item.category === category);
      if (categoryItems.length > 0) {
        sections.push({
          title: category.charAt(0).toUpperCase() + category.slice(1),
          subtitle: `${categoryItems.length} plat${categoryItems.length > 1 ? 's' : ''}`,
          data: categoryItems
        });
      }
    });

    return sections;
  };

  const handleItemPress = (item: MenuItem) => {
    setSelectedItem(item);
    setSelectedOptions([]);
    setQuantity(1);
    setModalVisible(true);
  };

  const calculateTotalPrice = (): number => {
    if (!selectedItem) return 0;
    
    let basePrice = selectedItem.price;
    let optionsPrice = 0;
    
    selectedOptions.forEach(option => {
      option.choices.forEach(choice => {
        optionsPrice += choice.price;
      });
    });
    
    return (basePrice + optionsPrice) * quantity;
  };

  const handleAddToCartWithOptions = () => {
    if (!selectedItem) return;
    
    const totalPrice = calculateTotalPrice();
    
    // Add item with options to cart
    addItem({
      ...selectedItem,
      options: selectedOptions,
      totalPrice,
      quantity,
    });
    
    setModalVisible(false);
    setSelectedOptions([]);
    setQuantity(1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  if (!restaurant) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Restaurant non trouvé</Text>
      </View>
    );
  }

  // Liste Organisée Style Header
  const renderHeader = () => (
    <RNAnimated.View style={[styles.header, headerAnimatedStyle]}>
      <Image source={{ uri: restaurant.image }} style={styles.headerImage} />
      <LinearGradient
        colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.8)']}
        style={styles.gradient}
      />
      <View style={styles.headerContent}>
        <View style={styles.restaurantBadge}>
          <MaterialIcons name="restaurant" size={16} color="#667eea" />
          <Text style={styles.restaurantBadgeText}>Restaurant</Text>
        </View>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        <View style={styles.restaurantInfo}>
          <View style={styles.infoItem}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.infoText}>{restaurant.rating}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="schedule" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.infoText}>Préparation: {restaurant.deliveryTime}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="location-on" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.infoText}>{restaurant.distance}</Text>
          </View>
        </View>
        <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
      </View>
    </RNAnimated.View>
  );

  // Liste Organisée Style Quick Filters
  const renderQuickFilters = () => (
    <RNAnimated.View entering={FadeIn.delay(200)} style={styles.quickFiltersSection}>
      <View style={styles.quickFiltersHeader}>
        <MaterialIcons name="tune" size={20} color="#667eea" />
        <Text style={styles.quickFiltersTitle}>Filtres rapides</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFiltersContainer}>
        {MENU_CATEGORIES.map((category, index) => (
          <TouchableOpacity key={index} style={styles.quickFilter}>
            <MaterialIcons name={category.icon as any} size={20} color="#667eea" />
            <Text style={styles.quickFilterText}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </RNAnimated.View>
  );

  // Liste Organisée Style Menu Section
  const renderMenuSection = ({ title, subtitle, data }: { title: string; subtitle: string; data: MenuItem[] }) => (
    <View style={styles.menuSection}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {data.map((item, index) => renderMenuItem(item, index))}
    </View>
  );

  const renderMenuItem = (item: MenuItem, index: number) => {
    const quantity = getItemQuantity(item.id);
    
    return (
      <RNAnimated.View
        key={item.id}
        entering={SlideInRight.delay(100 + index * 50).springify()}
        style={styles.menuItem}
      >
        <TouchableOpacity onPress={() => handleItemPress(item)}>
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.menuItemGradient}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemDescription} numberOfLines={2}>{item.description}</Text>
                <View style={styles.menuItemFooter}>
                  <Text style={styles.menuItemPrice}>{item.price.toFixed(2)} €</Text>
                  {item.isPopular && (
                    <View style={styles.popularBadge}>
                      <MaterialIcons name="local-fire-department" size={14} color="#ff6b35" />
                      <Text style={styles.popularBadgeText}>Populaire</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.menuItemImageContainer}>
                <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                {quantity > 0 ? (
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={[styles.quantityButton, styles.quantityButtonMinus]}
                      onPress={() => handleAddToCart({ ...item, quantity: -1 })}
                    >
                      <MaterialIcons name="remove" size={16} color="#ef4444" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity
                      style={[styles.quantityButton, styles.quantityButtonPlus]}
                      onPress={() => handleAddToCart(item)}
                    >
                      <MaterialIcons name="add" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddToCart(item)}
                  >
                    <MaterialIcons name="add" size={18} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </RNAnimated.View>
    );
  };

  return (
    <View style={styles.container}>
      <RNAnimated.ScrollView
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        <Surface style={styles.menuContainer}>
          {renderQuickFilters()}
          
          <View style={styles.menuTitle}>
            <MaterialIcons name="restaurant-menu" size={24} color="#667eea" />
            <Text style={styles.menuTitleText}>Notre Menu</Text>
          </View>

          {getMenuBySection().map((section, index) => (
            <View key={index}>
              {renderMenuSection(section)}
            </View>
          ))}
        </Surface>
      </RNAnimated.ScrollView>

      {/* Liste Organisée Style Floating Header */}
      <RNAnimated.View style={[styles.topBar, topBarAnimatedStyle, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['rgba(102, 126, 234, 0.95)', 'rgba(118, 75, 162, 0.95)']}
          style={styles.topBarGradient}
        >
          <BlurView intensity={20} style={styles.topBarBlur}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>{restaurant.name}</Text>
            <View style={styles.topBarActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleFavoriteToggle}>
                <MaterialIcons 
                  name={isFavorite ? "favorite" : "favorite-border"}
                  size={24} 
                  color={isFavorite ? "#ff6b6b" : "white"}
                />
              </TouchableOpacity>
            </View>
          </BlurView>
        </LinearGradient>
      </RNAnimated.View>

      <View style={styles.floatingHeader}>
        <TouchableOpacity style={styles.backButtonFloating} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.floatingActions}>
          <TouchableOpacity style={styles.actionButtonFloating} onPress={handleFavoriteToggle}>
            <MaterialIcons 
              name={isFavorite ? "favorite" : "favorite-border"}
              size={24} 
              color={isFavorite ? "#ff6b6b" : "white"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {totalCartItems > 0 && (
        <RNAnimated.View style={[styles.cartButton, cartButtonAnimatedStyle]}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/cart' as any)}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.cartButtonGradient}
            >
              <MaterialIcons name="shopping-cart" size={20} color="white" />
              <Text style={styles.cartButtonText}>Panier ({totalCartItems})</Text>
            </LinearGradient>
          </TouchableOpacity>
        </RNAnimated.View>
      )}

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          {selectedItem && (
            <Surface style={styles.modalContent}>
              <Image source={{ uri: selectedItem.image }} style={styles.modalImage} />
              <View style={styles.modalInfo}>
                <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                <Text style={styles.modalDescription}>{selectedItem.description}</Text>
                <Text style={styles.modalPrice}>{selectedItem.price.toFixed(2)}€</Text>

                <Divider style={styles.modalDivider} />

                {/* Message MVP - Personnalisation à l'emporter */}
                <View style={styles.mvpNotice}>
                  <MaterialIcons name="info" size={20} color="#667eea" />
                  <Text style={styles.mvpNoticeText}>
                    La personnalisation se fera lors de la récupération
                  </Text>
                </View>
                <Divider style={styles.modalDivider} />

                {/* Contrôles de quantité */}
                <View style={styles.quantitySection}>
                  <Text style={styles.customizationTitle}>Quantité</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={[styles.quantityButton, styles.quantityButtonMinus]}
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <MaterialIcons name="remove" size={20} color="#ef4444" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity
                      style={[styles.quantityButton, styles.quantityButtonPlus]}
                      onPress={() => setQuantity(quantity + 1)}
                    >
                      <MaterialIcons name="add" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setModalVisible(false)}
                    style={styles.modalCancelButton}
                  >
                    Annuler
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleAddToCartWithOptions}
                    style={styles.modalAddButton}
                  >
                    Ajouter {calculateTotalPrice().toFixed(2)}€
                  </Button>
                </View>
              </View>
            </Surface>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  restaurantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  restaurantBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  restaurantName: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  restaurantInfo: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  restaurantDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    lineHeight: 22,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  topBarGradient: {
    flex: 1,
  },
  topBarBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginHorizontal: 16,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
  },
  backButtonFloating: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  floatingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonFloating: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  menuContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    backgroundColor: '#f1f5f9',
  },

  // Quick Filters Section (Liste Organisée Style)
  quickFiltersSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  quickFiltersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  quickFiltersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  quickFiltersContainer: {
    flexDirection: 'row',
  },
  quickFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    gap: 8,
    position: 'relative',
  },
  quickFilterPopular: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: '#667eea',
    borderWidth: 1,
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  quickFilterTextPopular: {
    color: '#667eea',
    fontWeight: '600',
  },
  popularDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b35',
  },

  menuTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  menuTitleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
  },

  // Menu Sections (Liste Organisée Style)
  menuSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },

  menuItem: {
    borderRadius: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  menuItemGradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuItemContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  menuItemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 24,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#667eea',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff6b35',
  },
  menuItemImageContainer: {
    position: 'relative',
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#667eea',
    borderRadius: 20,
    padding: 10,
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  quantityControls: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonMinus: {
    backgroundColor: '#fef2f2',
  },
  quantityButtonPlus: {
    backgroundColor: '#667eea',
  },
  quantityText: {
    marginHorizontal: 12,
    fontWeight: '700',
    fontSize: 16,
    color: '#1f2937',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cartButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    gap: 8,
  },
  cartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    backgroundColor: 'white',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalInfo: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 22,
  },
  modalPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#667eea',
    marginBottom: 16,
  },
  modalDivider: {
    marginVertical: 16,
    backgroundColor: '#e5e7eb',
  },
  customizationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  customizationDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  quantitySection: {
    marginBottom: 20,
  },
  mvpNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  mvpNoticeText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    borderColor: '#e5e7eb',
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: '#667eea',
  },
});

export default RestaurantDetailScreen;
