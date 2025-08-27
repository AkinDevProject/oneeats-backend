import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
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
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Clock,
  MapPin,
  Plus,
  Minus,
  ShoppingCart,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/src/contexts/CartContext';
import { mockRestaurants, mockMenuItems, MenuItem, Restaurant } from '@/src/data/mockData';
import RNAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

const RestaurantDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToCart, getItemQuantity } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [restaurantMenu, setRestaurantMenu] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customizations, setCustomizations] = useState<string>('');

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
    addToCart(item);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleItemPress = (item: MenuItem) => {
    setSelectedItem(item);
    setModalVisible(true);
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

  return (
    <View style={styles.container}>
      <RNAnimated.ScrollView
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <RNAnimated.View style={[styles.header, headerAnimatedStyle]}>
          <Image source={{ uri: restaurant.image }} style={styles.headerImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          <View style={styles.headerContent}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <View style={styles.restaurantInfo}>
              <View style={styles.infoItem}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.infoText}>{restaurant.rating}</Text>
              </View>
              <View style={styles.infoItem}>
                <Clock size={16} color="#666" />
                <Text style={styles.infoText}>{restaurant.deliveryTime}</Text>
              </View>
              <View style={styles.infoItem}>
                <MapPin size={16} color="#666" />
                <Text style={styles.infoText}>{restaurant.distance}</Text>
              </View>
            </View>
            <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
          </View>
        </RNAnimated.View>

        <Surface style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Menu</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categories.map((category) => (
              <Chip
                key={category}
                mode={selectedCategory === category ? 'flat' : 'outlined'}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={styles.categoryChip}
              >
                {category === 'all' ? 'Tout' : category.charAt(0).toUpperCase() + category.slice(1)}
              </Chip>
            ))}
          </ScrollView>

          <View style={styles.menuItems}>
            {filteredMenu.map((item) => {
              const quantity = getItemQuantity(item.id);
              return (
                <Card key={item.id} style={styles.menuItem} onPress={() => handleItemPress(item)}>
                  <Card.Content style={styles.menuItemContent}>
                    <View style={styles.menuItemInfo}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      <Text style={styles.menuItemDescription}>{item.description}</Text>
                      <Text style={styles.menuItemPrice}>{item.price}€</Text>
                      {item.isPopular && (
                        <Badge style={styles.popularBadge}>Populaire</Badge>
                      )}
                    </View>
                    <View style={styles.menuItemImageContainer}>
                      <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                      {quantity > 0 ? (
                        <Surface style={styles.quantityControls}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleAddToCart({ ...item, quantity: -1 })}
                          >
                            <Minus size={16} color="#E53E3E" />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{quantity}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleAddToCart(item)}
                          >
                            <Plus size={16} color="#38A169" />
                          </TouchableOpacity>
                        </Surface>
                      ) : (
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => handleAddToCart(item)}
                        >
                          <Plus size={16} color="white" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        </Surface>
      </RNAnimated.ScrollView>

      <RNAnimated.View style={[styles.topBar, topBarAnimatedStyle, { paddingTop: insets.top }]}>
        <BlurView intensity={80} style={styles.topBarBlur}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{restaurant.name}</Text>
          <View style={styles.topBarActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleFavoriteToggle}>
              <Heart
                size={24}
                color={isFavorite ? "#E53E3E" : "white"}
                fill={isFavorite ? "#E53E3E" : "transparent"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={24} color="white" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </RNAnimated.View>

      <View style={styles.floatingHeader}>
        <TouchableOpacity style={styles.backButtonFloating} onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.floatingActions}>
          <TouchableOpacity style={styles.actionButtonFloating} onPress={handleFavoriteToggle}>
            <Heart
              size={24}
              color={isFavorite ? "#E53E3E" : "white"}
              fill={isFavorite ? "#E53E3E" : "transparent"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonFloating}>
            <Share2 size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {totalCartItems > 0 && (
        <RNAnimated.View style={[styles.cartButton, cartButtonAnimatedStyle]}>
          <Button
            mode="contained"
            onPress={() => router.push('/cart')}
            style={styles.cartButtonInner}
            labelStyle={styles.cartButtonText}
          >
            <ShoppingCart size={20} color="white" />
            {`  Panier (${totalCartItems})`}
          </Button>
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
                <Text style={styles.modalPrice}>{selectedItem.price}€</Text>

                <Divider style={styles.modalDivider} />

                <Text style={styles.customizationTitle}>Personnalisation</Text>
                <Text style={styles.customizationDescription}>
                  Ajoutez des instructions spéciales pour ce plat
                </Text>

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
                    onPress={() => {
                      handleAddToCart(selectedItem);
                      setModalVisible(false);
                    }}
                    style={styles.modalAddButton}
                  >
                    Ajouter {selectedItem.price}€
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
    backgroundColor: '#f5f5f5',
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
    height: 100,
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  restaurantInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
  },
  restaurantDescription: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  topBarBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginHorizontal: 16,
  },
  topBarActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  floatingActions: {
    flexDirection: 'row',
  },
  actionButtonFloating: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
  menuContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryChip: {
    marginRight: 8,
  },
  menuItems: {
    gap: 16,
  },
  menuItem: {
    marginBottom: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    padding: 16,
  },
  menuItemInfo: {
    flex: 1,
    paddingRight: 16,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53E3E',
    marginBottom: 8,
  },
  popularBadge: {
    backgroundColor: '#E53E3E',
    alignSelf: 'flex-start',
  },
  menuItemImageContainer: {
    position: 'relative',
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#E53E3E',
    borderRadius: 16,
    padding: 8,
  },
  quantityControls: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    marginHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  cartButtonInner: {
    backgroundColor: '#E53E3E',
    borderRadius: 25,
    paddingVertical: 4,
  },
  cartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E53E3E',
    marginBottom: 16,
  },
  modalDivider: {
    marginVertical: 16,
  },
  customizationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  customizationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: '#E53E3E',
  },
});

export default RestaurantDetailScreen;
