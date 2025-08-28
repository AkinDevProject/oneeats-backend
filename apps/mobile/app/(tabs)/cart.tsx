import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
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
  SlideOutRight,
  ZoomIn,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Button, TextInput, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as yup from 'yup';

import { useCart } from '../../src/contexts/CartContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useOrder } from '../../src/contexts/OrderContext';
import { useNotification } from '../../src/contexts/NotificationContext';
import { CartItem, mockRestaurants } from '../../src/data/mockData';

const promoSchema = yup.object({
  promoCode: yup.string(),
  specialInstructions: yup.string().max(200, 'Instructions trop longues'),
});

interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
}

const validPromoCodes: PromoCode[] = [
  { code: 'DELISH20', discount: 20, type: 'percentage', description: '20% de réduction' },
  { code: 'WELCOME10', discount: 10, type: 'fixed', description: '10€ de réduction' },
  { code: 'FIRST5', discount: 5, type: 'fixed', description: '5€ de réduction' },
];

// Trending searches from Liste Organisée design
const TRENDING_ITEMS = [
  { name: 'Pizza Margherita', popularity: '2.3k commandes' },
  { name: 'Burger Classique', popularity: '1.8k commandes' },
  { name: 'Sushi Saumon', popularity: '1.5k commandes' },
  { name: 'Pad Thaï', popularity: '1.2k commandes' },
];

export default function CartScreen() {
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showTrending, setShowTrending] = useState(true);

  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, createOrder } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addOrder } = useOrder();
  const { sendOrderNotification } = useNotification();

  const headerScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const checkoutScale = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withSpring(1, { damping: 15 });
    contentOpacity.value = withTiming(1, { duration: 800 });
    checkoutScale.value = withSpring(1, { damping: 15, mass: 0.8 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: interpolate(headerScale.value, [0, 1], [0, 1]),
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const checkoutAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkoutScale.value }],
    opacity: interpolate(checkoutScale.value, [0, 1], [0, 1]),
  }));

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Supprimer l\'article',
      'Êtes-vous sûr de vouloir supprimer cet article du panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => removeItem(itemId) },
      ]
    );
  };

  const applyPromoCode = (code: string) => {
    const promo = validPromoCodes.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (promo) {
      setAppliedPromo(promo);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Code invalide', 'Ce code promo n\'est pas valide ou a expiré.');
      return false;
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    
    if (appliedPromo.type === 'percentage') {
      return totalPrice * (appliedPromo.discount / 100);
    } else {
      return Math.min(appliedPromo.discount, totalPrice);
    }
  };

  const deliveryFee = 2.99;
  const discount = calculateDiscount();
  const finalTotal = Math.max(0, totalPrice + deliveryFee - discount);

  const handleCheckout = async (values: { promoCode: string; specialInstructions: string }) => {
    if (!items.length) return;

    if (!isAuthenticated) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour passer commande.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/auth' as any) },
        ]
      );
      return;
    }

    setIsCheckingOut(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const restaurantId = items[0]?.menuItem.restaurantId;
      if (!restaurantId) throw new Error('Restaurant ID not found');

      const order = await createOrder(restaurantId, values.specialInstructions);
      if (!order) throw new Error('Failed to create order');

      addOrder(order);
      await sendOrderNotification(order.id, 'pending', order.restaurant.name);
      router.push(`/order/${order.id}`);
      
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la commande.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Liste Organisée Style Header
  const renderHeader = () => (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Mon Panier</Text>
              <Text style={styles.headerSubtitle}>
                {totalItems} article{totalItems > 1 ? 's' : ''} • {totalPrice.toFixed(2)} €
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                Alert.alert(
                  'Vider le panier',
                  'Êtes-vous sûr de vouloir vider votre panier ?',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Vider', style: 'destructive', onPress: clearCart },
                  ]
                );
              }}
            >
              <MaterialIcons name="clear-all" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  // Trending Section (Liste Organisée Style)
  const renderTrendingSection = () => {
    if (!showTrending) return null;
    
    return (
      <Animated.View 
        entering={FadeIn.delay(200)}
        style={styles.trendingSection}
      >
        <View style={styles.trendingHeader}>
          <MaterialIcons name="trending-up" size={20} color="#667eea" />
          <Text style={styles.trendingTitle}>Articles populaires</Text>
          <TouchableOpacity onPress={() => setShowTrending(false)}>
            <MaterialIcons name="close" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
        <Text style={styles.trendingSubtitle}>
          Ces plats sont très demandés aujourd'hui !
        </Text>
        <View style={styles.trendingTags}>
          {TRENDING_ITEMS.map((item, index) => (
            <View key={index} style={styles.trendingTag}>
              <Text style={styles.trendingTagText}>{item.name}</Text>
              <Text style={styles.trendingTagPopularity}>{item.popularity}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => {
    const restaurant = mockRestaurants.find(r => r.id === item.menuItem.restaurantId);
    
    return (
      <Animated.View
        entering={SlideInRight.delay(200 + index * 100).springify()}
        exiting={SlideOutRight.springify()}
        style={styles.cartItem}
      >
        <View style={styles.cartItemCard}>
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.cartItemGradient}
          >
            <View style={styles.cartItemContent}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: item.menuItem.image }} 
                  style={styles.cartItemImage}
                  resizeMode="cover"
                />
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityBadgeText}>{item.quantity}</Text>
                </View>
              </View>

              <View style={styles.cartItemInfo}>
                <View style={styles.cartItemHeader}>
                  <View style={styles.cartItemTitleContainer}>
                    <Text style={styles.cartItemName} numberOfLines={2}>
                      {item.menuItem.name}
                    </Text>
                    <View style={styles.restaurantRow}>
                      <MaterialIcons name="restaurant" size={14} color="#9ca3af" />
                      <Text style={styles.cartItemRestaurant} numberOfLines={1}>
                        {restaurant?.name}
                      </Text>
                    </View>
                    {item.specialInstructions && (
                      <View style={styles.instructionsRow}>
                        <MaterialIcons name="note" size={14} color="#6b7280" />
                        <Text style={styles.specialInstructions} numberOfLines={2}>
                          {item.specialInstructions}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.cartItemFooter}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.unitPrice}>
                      {item.menuItem.price.toFixed(2)} € × {item.quantity}
                    </Text>
                    <Text style={styles.cartItemPrice}>
                      {(item.menuItem.price * item.quantity).toFixed(2)} €
                    </Text>
                  </View>

                  <View style={styles.itemActions}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={[styles.quantityButton, { backgroundColor: '#f3f4f6' }]}
                        onPress={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <MaterialIcons name="remove" size={18} color="#6b7280" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.quantityButton, { backgroundColor: '#667eea' }]}
                        onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <MaterialIcons name="add" size={18} color="white" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyCart = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.emptyCart}>
      <LinearGradient
        colors={['#f8fafc', '#ffffff']}
        style={styles.emptyCartGradient}
      >
        <View style={styles.emptyCartContent}>
          <View style={styles.emptyCartIconContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.emptyCartIconGradient}
            >
              <MaterialIcons name="shopping-cart" size={60} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.emptyCartTitle}>Votre panier est vide</Text>
          <Text style={styles.emptyCartText}>
            Découvrez nos délicieux restaurants et ajoutez vos plats préférés !
          </Text>
          
          {/* Trending Section for Empty Cart */}
          <View style={styles.emptyTrendingSection}>
            <Text style={styles.emptyTrendingTitle}>🔥 Tendances du moment</Text>
            <Text style={styles.emptyTrendingSubtitle}>
              Ces plats sont très populaires aujourd'hui
            </Text>
            <View style={styles.trendingTags}>
              {TRENDING_ITEMS.slice(0, 4).map((item, index) => (
                <View key={index} style={styles.trendingTag}>
                  <Text style={styles.trendingTagText}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.emptyCartButton}
            onPress={() => router.push('/(tabs)/')}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.emptyCartButtonGradient}
            >
              <MaterialIcons name="restaurant" size={20} color="white" />
              <Text style={styles.emptyCartButtonText}>Explorer les restaurants</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderCheckoutSection = () => (
    <Animated.View style={[styles.checkoutSection, checkoutAnimatedStyle]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.98)']}
        style={styles.checkoutBackground}
      >
        <ScrollView 
          style={styles.checkoutScroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.checkoutHeader}>
            <MaterialIcons name="receipt-long" size={24} color="#667eea" />
            <Text style={styles.checkoutTitle}>Récapitulatif</Text>
          </View>
        
          <Formik
            initialValues={{ promoCode: '', specialInstructions: '' }}
            validationSchema={promoSchema}
            onSubmit={handleCheckout}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <View style={styles.checkoutContent}>
                {/* Quick Summary */}
                <View style={styles.quickSummary}>
                  <View style={styles.summaryItem}>
                    <MaterialIcons name="shopping-bag" size={20} color="#667eea" />
                    <Text style={styles.summaryText}>{totalItems} articles</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <MaterialIcons name="access-time" size={20} color="#667eea" />
                    <Text style={styles.summaryText}>25-35 min</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <MaterialIcons name="location-on" size={20} color="#667eea" />
                    <Text style={styles.summaryText}>Livraison</Text>
                  </View>
                </View>

                {/* Promo Code Section */}
                <View style={styles.promoSection}>
                  <View style={styles.sectionHeader}>
                    <MaterialIcons name="local-offer" size={20} color="#667eea" />
                    <Text style={styles.sectionTitle}>Code promo</Text>
                  </View>
                  {!appliedPromo ? (
                    <View style={styles.promoInputContainer}>
                      <TextInput
                        mode="outlined"
                        placeholder="DELISH20, WELCOME10..."
                        value={values.promoCode}
                        onChangeText={handleChange('promoCode')}
                        style={styles.promoInput}
                        outlineStyle={styles.promoInputOutline}
                        contentStyle={styles.promoInputContent}
                        right={
                          <TextInput.Icon 
                            icon="ticket-percent" 
                            iconColor="#667eea"
                            onPress={() => {
                              if (values.promoCode.trim()) {
                                applyPromoCode(values.promoCode);
                              }
                            }}
                          />
                        }
                      />
                    </View>
                  ) : (
                    <View style={styles.appliedPromo}>
                      <View style={styles.appliedPromoInfo}>
                        <MaterialIcons name="check-circle" size={20} color="#10b981" />
                        <Text style={styles.appliedPromoText}>
                          {appliedPromo.code} - {appliedPromo.description}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={removePromoCode}>
                        <MaterialIcons name="close" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Special Instructions */}
                <View style={styles.instructionsSection}>
                  <View style={styles.sectionHeader}>
                    <MaterialIcons name="note-add" size={20} color="#667eea" />
                    <Text style={styles.sectionTitle}>Instructions spéciales</Text>
                  </View>
                  <TextInput
                    mode="outlined"
                    placeholder="Allergies, préférences de cuisson..."
                    value={values.specialInstructions}
                    onChangeText={handleChange('specialInstructions')}
                    multiline
                    numberOfLines={3}
                    style={styles.instructionsInput}
                    outlineStyle={styles.instructionsInputOutline}
                    error={touched.specialInstructions && !!errors.specialInstructions}
                  />
                  {touched.specialInstructions && errors.specialInstructions && (
                    <Text style={styles.errorText}>{errors.specialInstructions}</Text>
                  )}
                </View>

                {/* Price Breakdown Card */}
                <View style={styles.priceCard}>
                  <LinearGradient
                    colors={['#f8fafc', '#ffffff']}
                    style={styles.priceCardGradient}
                  >
                    <Text style={styles.priceCardTitle}>Détail de la commande</Text>
                    
                    <View style={styles.priceBreakdown}>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Sous-total ({totalItems} articles)</Text>
                        <Text style={styles.priceValue}>{totalPrice.toFixed(2)} €</Text>
                      </View>
                      
                      <View style={styles.priceRow}>
                        <View style={styles.priceRowLeft}>
                          <MaterialIcons name="delivery-dining" size={16} color="#6b7280" />
                          <Text style={styles.priceLabel}>Frais de livraison</Text>
                        </View>
                        <Text style={styles.priceValue}>{deliveryFee.toFixed(2)} €</Text>
                      </View>

                      {discount > 0 && (
                        <View style={styles.priceRow}>
                          <View style={styles.priceRowLeft}>
                            <MaterialIcons name="local-offer" size={16} color="#10b981" />
                            <Text style={[styles.priceLabel, styles.discountLabel]}>
                              Réduction ({appliedPromo?.code})
                            </Text>
                          </View>
                          <Text style={[styles.priceValue, styles.discountValue]}>
                            -{discount.toFixed(2)} €
                          </Text>
                        </View>
                      )}

                      <View style={styles.totalDivider} />
                      
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total à payer</Text>
                        <Text style={styles.totalValue}>{finalTotal.toFixed(2)} €</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                {/* Checkout Button */}
                <TouchableOpacity
                  style={[styles.checkoutButton, (isCheckingOut || items.length === 0) && styles.checkoutButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isCheckingOut || items.length === 0}
                >
                  <LinearGradient
                    colors={isCheckingOut || items.length === 0 ? ['#9ca3af', '#9ca3af'] : ['#667eea', '#764ba2']}
                    style={styles.checkoutButtonGradient}
                  >
                    {isCheckingOut ? (
                      <View style={styles.checkoutButtonContent}>
                        <Text style={styles.checkoutButtonText}>Traitement en cours...</Text>
                      </View>
                    ) : (
                      <View style={styles.checkoutButtonContent}>
                        <MaterialIcons name="payment" size={24} color="white" />
                        <Text style={styles.checkoutButtonText}>Commander • {finalTotal.toFixed(2)} €</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Security Notice */}
                <View style={styles.securityNotice}>
                  <MaterialIcons name="verified-user" size={16} color="#10b981" />
                  <Text style={styles.securityText}>Paiement sécurisé SSL</Text>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </LinearGradient>
    </Animated.View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        {renderHeader()}
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          {renderTrendingSection()}
          {renderEmptyCart()}
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {renderHeader()}
      
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <FlatList
          data={items}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cartList}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          ListHeaderComponent={renderTrendingSection}
        />
      </Animated.View>

      {renderCheckoutSection()}
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#f1f5f9',
    paddingTop: 4,
  },

  // Trending Section (Liste Organisée Style)
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
    marginBottom: 8,
    gap: 8,
  },
  trendingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  trendingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trendingTagText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  trendingTagPopularity: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },

  cartList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 450,
  },
  itemSeparator: {
    height: 16,
  },
  cartItem: {
    marginHorizontal: 4,
  },
  cartItemCard: {
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cartItemGradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cartItemContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  cartItemImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },
  quantityBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  quantityBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  cartItemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cartItemHeader: {
    flex: 1,
  },
  cartItemTitleContainer: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 20,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  cartItemRestaurant: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  instructionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 4,
  },
  specialInstructions: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 16,
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  priceContainer: {
    flex: 1,
  },
  unitPrice: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#667eea',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty Cart
  emptyCart: {
    flex: 1,
    margin: 20,
  },
  emptyCartGradient: {
    flex: 1,
    borderRadius: 24,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyCartIconContainer: {
    marginBottom: 32,
  },
  emptyCartIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyTrendingSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  emptyTrendingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyTrendingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyCartButton: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  emptyCartButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  emptyCartButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },

  // Checkout Section
  checkoutSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '65%',
  },
  checkoutBackground: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },
  checkoutScroll: {
    flex: 1,
  },
  checkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  checkoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  checkoutContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  quickSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4c51bf',
  },
  promoSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  promoInputContainer: {
    marginBottom: 8,
  },
  promoInput: {
    backgroundColor: 'white',
    fontSize: 14,
  },
  promoInputOutline: {
    borderRadius: 16,
    borderColor: '#e5e7eb',
  },
  promoInputContent: {
    paddingRight: 50,
  },
  appliedPromo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  appliedPromoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  appliedPromoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
  },
  instructionsSection: {
    marginBottom: 24,
  },
  instructionsInput: {
    backgroundColor: 'white',
    fontSize: 14,
  },
  instructionsInputOutline: {
    borderRadius: 16,
    borderColor: '#e5e7eb',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 6,
    marginLeft: 4,
  },
  priceCard: {
    borderRadius: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  priceCardGradient: {
    padding: 20,
    borderRadius: 20,
  },
  priceCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  priceBreakdown: {
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  discountLabel: {
    color: '#10b981',
  },
  discountValue: {
    color: '#10b981',
  },
  totalDivider: {
    backgroundColor: '#e5e7eb',
    height: 1,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 22,
    color: '#667eea',
    fontWeight: '800',
  },
  checkoutButton: {
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkoutButtonDisabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
  checkoutButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  checkoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  securityNotice: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
});