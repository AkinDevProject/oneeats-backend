import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Surface,
  Button,
  Card,
  Badge,
  IconButton,
  Chip,
  FAB,
} from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
} from 'react-native-reanimated';

import { useCart } from '../../src/contexts/CartContext';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { mockRestaurants, mockMenuItems, MenuItem, Restaurant } from '../../src/data/mockData';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 280;

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, getItemQuantity, updateQuantity, removeItem, items } = useCart();
  const { currentTheme } = useAppTheme();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRestaurantData();
  }, [id]);

  const loadRestaurantData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const foundRestaurant = mockRestaurants.find(r => r.id === id);
      if (foundRestaurant) {
        setRestaurant(foundRestaurant);
        const menu = mockMenuItems.filter(item => item.restaurantId === id);
        setMenuItems(menu);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du restaurant:', error);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.colors.onSurfaceVariant }]}>
            Chargement du restaurant...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={60} color={currentTheme.colors.onSurfaceVariant} />
          <Text style={[styles.errorText, { color: currentTheme.colors.onSurface }]}>
            Restaurant non trouvé
          </Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            buttonColor={currentTheme.colors.primary}
          >
            Retour
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    addItem(item);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleItemPress = (item: MenuItem) => {
    if (item.options && item.options.length > 0) {
      router.push(`/menu/${item.id}` as any);
    } else {
      handleAddToCart(item);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Image source={{ uri: restaurant.image }} style={styles.headerImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.headerGradient}
      />
      <View style={styles.headerContent}>
        <View style={[styles.statusBadge, { backgroundColor: currentTheme.colors.surfaceVariant }]}>
          <MaterialIcons 
            name={restaurant.isOpen ? "schedule" : "schedule"} 
            size={14} 
            color={restaurant.isOpen ? currentTheme.colors.primary : currentTheme.colors.error} 
          />
          <Text style={[styles.statusText, { color: restaurant.isOpen ? currentTheme.colors.primary : currentTheme.colors.error }]}>
            {restaurant.isOpen ? 'Ouvert' : 'Fermé'}
          </Text>
        </View>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        <View style={styles.restaurantInfo}>
          <View style={styles.infoItem}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.infoText}>{restaurant.rating}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="access-time" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.infoText}>{restaurant.deliveryTime}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="local-shipping" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.infoText}>{restaurant.deliveryFee}€</Text>
          </View>
        </View>
      </View>
      
      {/* Bouton retour amélioré */}
      <View style={styles.backButtonContainer}>
        <Surface style={[styles.backButton, { backgroundColor: currentTheme.colors.surface }]} elevation={3}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={currentTheme.colors.onSurface}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.back();
            }}
          />
        </Surface>
      </View>
    </View>
  );


  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              category === selectedCategory && { backgroundColor: currentTheme.colors.primary }
            ]}
          >
            <Text style={[
              styles.categoryText,
              { color: category === selectedCategory ? currentTheme.colors.onPrimary : currentTheme.colors.onSurfaceVariant }
            ]}>
              {category === 'all' ? 'Tout' : category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMenuItem = (item: MenuItem, index: number) => {
    const quantity = getItemQuantity(item.id);
    
    return (
      <Animated.View
        key={item.id}
        entering={FadeIn.delay(100 + index * 50)}
        style={styles.menuItemContainer}
      >
        <TouchableOpacity onPress={() => handleItemPress(item)}>
          <Card style={[styles.menuItem, { backgroundColor: currentTheme.colors.surface }]}>
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemInfo}>
                <Text style={[styles.menuItemName, { color: currentTheme.colors.onSurface }]}>
                  {item.name}
                </Text>
                <Text 
                  style={[styles.menuItemDescription, { color: currentTheme.colors.onSurfaceVariant }]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
                <View style={styles.menuItemFooter}>
                  <Text style={[styles.menuItemPrice, { color: currentTheme.colors.primary }]}>
                    {item.price.toFixed(2)}€
                  </Text>
                  {item.isPopular && (
                    <Badge
                      size={20}
                      style={[styles.popularBadge, { backgroundColor: currentTheme.colors.tertiaryContainer }]}
                    >
                      <Text style={[styles.popularText, { color: currentTheme.colors.tertiary }]}>
                        🔥 Populaire
                      </Text>
                    </Badge>
                  )}
                </View>
                {item.options && item.options.length > 0 && (
                  <Text style={[styles.customizableText, { color: currentTheme.colors.onSurfaceVariant }]}>
                    ⚙️ Personnalisable
                  </Text>
                )}
              </View>
              
              <View style={styles.menuItemImageSection}>
                <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                
                {quantity > 0 ? (
                  <View style={[styles.quantityControls, { backgroundColor: currentTheme.colors.surface }]}>
                    <TouchableOpacity
                      style={[styles.quantityButton, { backgroundColor: currentTheme.colors.errorContainer }]}
                      onPress={() => {
                        const currentQuantity = getItemQuantity(item.id);
                        if (currentQuantity > 1) {
                          const cartItem = items.find(cartItem => cartItem.menuItem.id === item.id);
                          if (cartItem) {
                            updateQuantity(cartItem.id, currentQuantity - 1);
                          }
                        } else {
                          const cartItem = items.find(cartItem => cartItem.menuItem.id === item.id);
                          if (cartItem) {
                            removeItem(cartItem.id);
                          }
                        }
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <MaterialIcons name="remove" size={16} color={currentTheme.colors.error} />
                    </TouchableOpacity>
                    <Text style={[styles.quantityText, { color: currentTheme.colors.onSurface }]}>
                      {quantity}
                    </Text>
                    <TouchableOpacity
                      style={[styles.quantityButton, { backgroundColor: currentTheme.colors.primary }]}
                      onPress={() => handleAddToCart(item)}
                    >
                      <MaterialIcons name="add" size={16} color={currentTheme.colors.onPrimary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: currentTheme.colors.primary }]}
                    onPress={() => handleAddToCart(item)}
                  >
                    <MaterialIcons name="add" size={20} color={currentTheme.colors.onPrimary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar style="light" />
      
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        
        <View style={[styles.menuContainer, { backgroundColor: currentTheme.colors.background }]}>
          <View style={styles.menuHeader}>
            <MaterialIcons name="restaurant-menu" size={24} color={currentTheme.colors.primary} />
            <Text style={[styles.menuTitle, { color: currentTheme.colors.onSurface }]}>
              Notre Menu ({filteredItems.length} plats)
            </Text>
          </View>
          
          {renderCategories()}
          
          <View style={styles.menuList}>
            {filteredItems.map((item, index) => renderMenuItem(item, index))}
          </View>
          
          {/* Espace en bas pour éviter que le dernier item soit caché */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Bouton flottant pour aller au panier */}
      {items.length > 0 && (
        <FAB
          icon="cart"
          label={`Panier (${items.reduce((sum, item) => sum + item.quantity, 0)})`}
          style={[styles.fab, { backgroundColor: currentTheme.colors.primary }]}
          color={currentTheme.colors.onPrimary}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/(tabs)/cart');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
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
  
  // Header
  header: {
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  restaurantInfo: {
    flexDirection: 'row',
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
  
  // Menu Container
  menuContainer: {
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    flex: 1,
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  
  // Categories
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesContainer: {
    paddingHorizontal: 4,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Menu Items
  menuList: {
    gap: 16,
  },
  menuItemContainer: {
    marginHorizontal: 4,
  },
  menuItem: {
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  menuItemInfo: {
    flex: 1,
    gap: 4,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  menuItemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  menuItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  popularBadge: {
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
  },
  customizableText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  
  // Menu Item Image and Actions
  menuItemImageSection: {
    position: 'relative',
    alignItems: 'center',
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  quantityControls: {
    position: 'absolute',
    bottom: -8,
    right: -12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 4,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});